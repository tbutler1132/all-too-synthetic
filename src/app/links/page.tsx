import type { Metadata } from "next";
import Link from "next/link";

import styles from "./page.module.css";

type SocialLink = {
  label: string;
  href: string;
  description?: string;
};

const socialLinks: SocialLink[] = [
  {
    label: "Email",
    href: "mailto:tbutler1132@gmail.com",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/alltoosynthetic",
  },
  {
    label: "X",
    href: "https://x.com/alltoosynthetic",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@alltoosynthetic",
  },
  {
    label: "SoundCloud",
    href: "https://soundcloud.com/alltoosynthetic",
  },
  {
    label: "GitHub",
    href: "https://github.com/tbutler1132",
  },
];

export const metadata: Metadata = {
  title: "Links",
  description: "Connect across the internet.",
};

export default function LinksPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Connect</p>
        <h1 className={styles.heading}>Profiles</h1>
        <p className={styles.subheading}>Various profiles on the internet.</p>
      </header>

      <main>
        <ul className={styles.linksList}>
          {socialLinks.map((link) => (
            <li key={link.href} className={styles.linkCard}>
              <Link
                href={link.href}
                className={styles.linkAnchor}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.linkLabel}>{link.label}</span>
                {link.description ? (
                  <span className={styles.linkDescription}>
                    {link.description}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
