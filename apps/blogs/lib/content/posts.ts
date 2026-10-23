import fs from "node:fs";
import path from "node:path";
import { readYaml, splitFrontmatter, toIsoDate } from "./frontmatter";
import {
  BLOG_TOPICS,
  type BlogLocale,
  type BlogPost,
  type BlogPostMeta,
  type BlogPostSummary,
  type BlogTopic,
} from "./types";

/*
 * Posts live in content/posts/<slug>/:
 *   meta.yaml   shared fields (topic, date, level, tags, image)
 *   en.mdx      English title/excerpt frontmatter + body
 *   vi.mdx      Vietnamese; falls back to en.mdx when missing
 * Server-only (reads the filesystem). Client components import from ./types and ./text.
 */

export type {
  BlogHeading,
  BlogLevel,
  BlogLocale,
  BlogPost,
  BlogPostSummary,
  BlogTopic,
} from "./types";
export { BLOG_TOPICS } from "./types";
export { formatPostDate, isBlogLocale, slugify } from "./text";

/** Default location when running inside apps/blogs. Other apps pass their own path. */
export const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const WORDS_PER_MINUTE = 220;

interface LocaleFrontmatter {
  title: string;
  excerpt: string;
}

/** Prose only: drops code, JSX tags and markdown syntax (for TTS and word counts). */
export function mdxToPlainText(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*(?:[-*>]|\d+\.)\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\\([{}])/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/\s+/g, " ")
    .trim();
}

function readPost(slug: string, locale: BlogLocale, postsDir: string): BlogPost | undefined {
  const dir = path.join(postsDir, slug);
  const metaFile = path.join(dir, "meta.yaml");
  if (!fs.existsSync(metaFile)) return undefined;

  const file = [locale, "en"]
    .map((loc) => path.join(dir, `${loc}.mdx`))
    .find((candidate) => fs.existsSync(candidate));
  if (!file) return undefined;

  const meta = readYaml<BlogPostMeta & { date: string | Date }>(fs.readFileSync(metaFile, "utf8"));
  const { data, body } = splitFrontmatter<LocaleFrontmatter>(fs.readFileSync(file, "utf8"));
  const content = mdxToPlainText(body);

  return {
    slug,
    locale,
    title: data.title,
    excerpt: data.excerpt,
    topic: meta.topic,
    date: toIsoDate(meta.date),
    level: meta.level,
    tags: meta.tags ?? [],
    image: meta.image,
    readingTime: Math.max(1, Math.round(content.split(/\s+/).length / WORDS_PER_MINUTE)),
    body,
    content,
  };
}

const cache = new Map<string, { version: number; posts: BlogPost[] }>();

/** Latest mtime under content/posts: edits invalidate the cache without a restart. */
function contentVersion(postsDir: string) {
  let latest = 0;
  for (const slug of getAllSlugs(postsDir)) {
    const dir = path.join(postsDir, slug);
    for (const file of fs.readdirSync(dir)) {
      latest = Math.max(latest, fs.statSync(path.join(dir, file)).mtimeMs);
    }
  }
  return latest;
}

function byNewest(a: { date: string }, b: { date: string }) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export function getAllSlugs(postsDir: string = POSTS_DIR): string[] {
  return fs
    .readdirSync(postsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

/**
 * All posts for a locale, newest first. `postsDir` lets other apps in the monorepo
 * (e.g. apps/me) read this blog's content without depending on their own cwd.
 */
export function getAllPosts(locale: BlogLocale = "en", postsDir: string = POSTS_DIR): BlogPost[] {
  const key = `${postsDir}:${locale}`;
  const version = contentVersion(postsDir);
  const cached = cache.get(key);
  if (cached?.version === version) return cached.posts;

  const posts = getAllSlugs(postsDir)
    .map((slug) => readPost(slug, locale, postsDir))
    .filter((post): post is BlogPost => post !== undefined)
    .sort(byNewest);
  cache.set(key, { version, posts });
  return posts;
}

export function toSummary(post: BlogPost): BlogPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    topic: post.topic,
    date: post.date,
    readingTime: post.readingTime,
    level: post.level,
    tags: post.tags,
  };
}

export function getPostSummaries(locale: BlogLocale = "en") {
  return getAllPosts(locale).map(toSummary);
}

export function getPostBySlug(slug: string, locale: BlogLocale = "en"): BlogPost | undefined {
  return getAllPosts(locale).find((post) => post.slug === slug);
}

/** Newer and older neighbours in publishing order. */
export function getAdjacentPosts(slug: string, locale: BlogLocale = "en") {
  const all = getAllPosts(locale);
  const index = all.findIndex((post) => post.slug === slug);

  return {
    newer: index > 0 ? toSummary(all[index - 1]!) : undefined,
    older: index >= 0 && index < all.length - 1 ? toSummary(all[index + 1]!) : undefined,
  };
}

/** Same topic first, then shared tags, then recency. */
export function getRelatedPosts(post: BlogPost, locale: BlogLocale = "en", limit = 3) {
  return getAllPosts(locale)
    .filter((item) => item.slug !== post.slug)
    .map((item) => ({
      item,
      score:
        (item.topic === post.topic ? 3 : 0) +
        item.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.score - a.score || byNewest(a.item, b.item))
    .slice(0, limit)
    .map(({ item }) => toSummary(item));
}

export function getTopicCounts(locale: BlogLocale = "en") {
  const counts = Object.fromEntries(BLOG_TOPICS.map((t) => [t, 0])) as Record<BlogTopic, number>;
  getAllPosts(locale).forEach((post) => counts[post.topic]++);
  return counts;
}

export function getBlogStats(locale: BlogLocale = "en") {
  const all = getAllPosts(locale);
  const years = all.map((post) => new Date(post.date).getUTCFullYear());

  return {
    firstYear: Math.min(...years),
    postCount: all.length,
    topicCount: new Set(all.map((post) => post.topic)).size,
    tagCount: new Set(all.flatMap((post) => post.tags)).size,
    readingMinutes: all.reduce((sum, post) => sum + post.readingTime, 0),
  };
}

export interface WritingMonth {
  key: string;
  year: number;
  month: number;
  posts: { slug: string; title: string; topic: BlogTopic }[];
}

/** One bucket per month from the first post until `until`, for the writing-rhythm chart. */
export function getWritingRhythm(
  locale: BlogLocale = "en",
  until: Date = new Date(),
): WritingMonth[] {
  const all = getAllPosts(locale);
  if (all.length === 0) return [];

  const oldest = new Date(all[all.length - 1]!.date);
  const months: WritingMonth[] = [];
  let year = oldest.getUTCFullYear();
  let month = oldest.getUTCMonth();
  const endKey = until.getUTCFullYear() * 12 + until.getUTCMonth();

  while (year * 12 + month <= endKey) {
    const y = year;
    const m = month;
    months.push({
      key: `${y}-${m}`,
      year: y,
      month: m,
      posts: all
        .filter((post) => {
          const d = new Date(post.date);
          return d.getUTCFullYear() === y && d.getUTCMonth() === m;
        })
        .map(({ slug, title, topic }) => ({ slug, title, topic })),
    });
    month += 1;
    if (month === 12) {
      month = 0;
      year += 1;
    }
  }

  return months;
}
