export type BlogLocale = "en" | "vi";

export const BLOG_TOPICS = [
  "systems",
  "frontend",
  "performance",
  "tooling",
  "growth",
] as const;

export type BlogTopic = (typeof BLOG_TOPICS)[number];

export type BlogLevel = "Starter" | "Intermediate" | "Advanced";

export interface BlogHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Shared, locale-independent fields from content/posts/<slug>/meta.yaml */
export interface BlogPostMeta {
  topic: BlogTopic;
  /** ISO date, e.g. "2026-04-26" */
  date: string;
  level?: BlogLevel;
  tags?: string[];
  image?: string;
}

export interface BlogPost {
  slug: string;
  locale: BlogLocale;
  title: string;
  excerpt: string;
  topic: BlogTopic;
  date: string;
  readingTime: number;
  image?: string;
  level?: BlogLevel;
  tags: string[];
  /** MDX source of the body */
  body: string;
  /** Plain-text body (prose only), used for text-to-speech */
  content: string;
}

/** Lightweight shape sent to client components (search, archive grid) */
export interface BlogPostSummary {
  slug: string;
  title: string;
  excerpt: string;
  topic: BlogTopic;
  date: string;
  readingTime: number;
  level?: BlogLevel;
  tags: string[];
}
