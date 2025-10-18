import Link from "next/link";
import { groq } from "next-sanity";
import type { Metadata } from "next";
import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";

import { client } from "@/sanity/lib/client";

import styles from "./page.module.css";

type PostListItem = {
  _id: string;
  title: string;
  slug?: { current?: string | null } | null;
  publishedAt?: string | null;
  body?: PortableTextBlock[] | null;
};

const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...20] {
    _id,
    title,
    slug,
    publishedAt,
    body
  }
`;

export const metadata: Metadata = {
  title: "Sanity Blog",
  description: "Latest posts from the Sanity-powered blog.",
};

export const revalidate = 120;

function isPortableTextSpan(
  value: unknown
): value is PortableTextSpan & { text: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "_type" in value &&
    (value as PortableTextSpan)._type === "span" &&
    "text" in value &&
    typeof (value as { text?: unknown }).text === "string"
  );
}

function blocksToPlainText(blocks: PortableTextBlock[] = []) {
  return blocks
    .map((block) => {
      if (block._type !== "block" || !Array.isArray(block.children)) {
        return "";
      }

      return block.children
        .filter(isPortableTextSpan)
        .map((child) => child.text)
        .join("");
    })
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value?: string | null) {
  if (!value) return null;

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

function buildExcerpt(body?: PortableTextBlock[] | null) {
  const text = blocksToPlainText(body ?? []);

  if (!text) return null;

  return text.length > 200 ? `${text.slice(0, 197).trimEnd()}…` : text;
}

async function getPosts() {
  return client.fetch<PostListItem[]>(postsQuery);
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>ALL TOO SYNTHETIC</p>
        <h1 className={styles.heading}>Communication</h1>
        <p className={styles.subheading}>Published communication</p>
      </header>

      <main className={styles.main}>
        {posts.length === 0 ? (
          <p className={styles.emptyState}>No posts yet. Check back soon.</p>
        ) : (
          <ul className={styles.posts}>
            {posts.map((post) => {
              const slug = post.slug?.current;
              if (!slug) return null;

              const href = `/post/${slug}`;
              const publishedAt = formatDate(post.publishedAt);
              const excerpt = buildExcerpt(post.body);

              return (
                <li key={post._id} className={styles.postCard}>
                  <article>
                    <p className={styles.postMeta}>
                      {publishedAt ? (
                        <span>{publishedAt}</span>
                      ) : (
                        <span>Draft</span>
                      )}
                    </p>
                    <h2 className={styles.postTitle}>
                      <Link href={href}>{post.title}</Link>
                    </h2>
                    {excerpt ? (
                      <p className={styles.postExcerpt}>{excerpt}</p>
                    ) : null}
                    <div className={styles.postAction}>
                      <Link href={href} className={styles.readMore}>
                        Read post →
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
