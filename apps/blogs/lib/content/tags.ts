import { getAllPosts, toSummary, type BlogLocale, type BlogPostSummary, type BlogTopic } from "@repo/content/posts";
import { dominantTopic } from "./series";

/*
 * Tag pages: every tag from meta.yaml used by at least MIN_TAG_POSTS posts in a locale.
 * Rarer tags stay plain search links (a one-post page is thin content).
 * Server-only (reads the filesystem through getAllPosts).
 */

export const MIN_TAG_POSTS = 2;

export interface Tag {
  /** The tag exactly as written in meta.yaml; already URL-safe (kebab-case) */
  tag: string;
  /** Newest first */
  posts: BlogPostSummary[];
  /** Most common topic among the posts; colours the tag */
  topic: BlogTopic;
  /** Date of the newest post */
  updated: string;
}

/** Tags with a page in `locale`, most used first (ties alphabetical). */
export function getAllTags(locale: BlogLocale): Tag[] {
  const byTag = new Map<string, BlogPostSummary[]>();
  for (const post of getAllPosts(locale)) {
    const summary = toSummary(post);
    for (const tag of new Set(post.tags)) byTag.set(tag, [...(byTag.get(tag) ?? []), summary]);
  }

  return [...byTag.entries()]
    .filter(([, posts]) => posts.length >= MIN_TAG_POSTS)
    .map(([tag, posts]) => ({ tag, posts, topic: dominantTopic(posts), updated: posts[0]!.date }))
    .sort((a, b) => b.posts.length - a.posts.length || a.tag.localeCompare(b.tag));
}

export function getTag(tag: string, locale: BlogLocale) {
  return getAllTags(locale).find((item) => item.tag === tag);
}

/** Set of tags that have a page, for deciding where a tag chip links. */
export function getTagPageSet(locale: BlogLocale) {
  return new Set(getAllTags(locale).map((item) => item.tag));
}

/** Other tags with a page that appear on the same posts, most shared first. */
export function getRelatedTags(tag: Tag, locale: BlogLocale, limit = 12) {
  const pages = getTagPageSet(locale);
  const counts = new Map<string, number>();
  for (const post of tag.posts) {
    for (const other of post.tags) {
      if (other !== tag.tag && pages.has(other)) counts.set(other, (counts.get(other) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => name);
}

/** Where a tag chip should point: its page when it has one, otherwise a blog search. */
export function tagHref(tag: string, locale: BlogLocale, pages: Set<string>) {
  return pages.has(tag) ? `/${locale}/tags/${tag}` : `/${locale}/blog?q=${encodeURIComponent(tag)}`;
}
