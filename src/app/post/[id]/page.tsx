import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { groq } from "next-sanity";
import { PortableText } from "next-sanity";
import type { PortableTextComponents } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";
import type { Metadata } from "next";

import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

import styles from "./page.module.css";

type SanityImageWithAlt = SanityImageSource & { alt?: string | null };
type PostCategory = { _id: string; title?: string | null };

type Post = {
  _id: string;
  title: string;
  slug?: { current?: string | null } | null;
  body?: PortableTextBlock[] | null;
  publishedAt?: string | null;
  mainImage?: SanityImageWithAlt | null;
  author?: {
    _id: string;
    name?: string | null;
    image?: SanityImageWithAlt | null;
  } | null;
  categories?: PostCategory[] | null;
};

const postQuery = groq`
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    body,
    publishedAt,
    mainImage,
    author->{_id, name, image},
    categories[]->{_id, title}
  }
`;

const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`;

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) return null;

      const image = value as SanityImageWithAlt;
      const imageUrl = urlFor(image).width(1200).fit("max").url();

      return (
        <figure className={styles.inlineImage}>
          <Image
            src={imageUrl}
            alt={image.alt ?? ""}
            width={1200}
            height={675}
          />
          {image.alt ? <figcaption>{image.alt}</figcaption> : null}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }) => {
      const href: string | undefined = value?.href;

      if (!href) return children;

      const isExternal = href.startsWith("http");

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className={styles.link}
        >
          {children}
        </a>
      );
    },
  },
};

function isPortableTextSpan(value: unknown): value is PortableTextSpan & { text: string } {
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

async function getPost(slug: string) {
  if (!slug) return null;

  return client.fetch<Post | null>(postQuery, { slug });
}

function formatDate(value?: string | null) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function getDescription(body?: PortableTextBlock[] | null) {
  const plainText = blocksToPlainText(body ?? []);

  if (!plainText) return undefined;

  return plainText.length > 160
    ? `${plainText.slice(0, 157).trimEnd()}…`
    : plainText;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(postSlugsQuery);

  return slugs.map((slug) => ({ id: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {};
  }

  const description = getDescription(post.body);
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(630).fit("crop").url()
    : undefined;
  const tags = (post.categories ?? [])
    .map((category) => category?.title ?? null)
    .filter((title): title is string => Boolean(title));

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      tags,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const publishedDate = formatDate(post.publishedAt);
  const heroImageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1600).height(900).fit("crop").url()
    : undefined;
  const categories =
    post.categories
      ?.map((category) => category?.title ?? null)
      .filter((title): title is string => Boolean(title)) ?? [];

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <nav className={styles.breadcrumbs}>
          <Link className={styles.backLink} href="/">
            ← Home
          </Link>
          <Link className={styles.backLink} href="/posts">
            Browse posts
          </Link>
        </nav>
        <div className={styles.meta}>
          {categories.length ? (
            <ul className={styles.categories}>
              {categories.map((category) => (
                <li key={category}>{category}</li>
              ))}
            </ul>
          ) : null}
          <div className={styles.metaDetail}>
            {publishedDate ? <span>{publishedDate}</span> : null}
            {post.author?.name ? (
              <span className={styles.author}>By {post.author.name}</span>
            ) : null}
          </div>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
      </header>

      {heroImageUrl ? (
        <div className={styles.hero}>
          <Image
            src={heroImageUrl}
            alt={post.mainImage?.alt ?? `${post.title} cover image`}
            width={1600}
            height={900}
            priority
          />
        </div>
      ) : null}

      <div className={styles.body}>
        <PortableText value={post.body ?? []} components={portableTextComponents} />
      </div>
    </article>
  );
}
