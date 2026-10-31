import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import {
  getAllPosts,
  toSummary,
  type BlogLocale,
  type BlogPostSummary,
  type BlogTopic,
} from "@repo/content/posts";

/*
 * Reading series from content/series.yaml: an ordered path through existing posts.
 * Server-only (reads the filesystem); client components receive the resolved `Series`.
 */

const SERIES_FILE = path.join(process.cwd(), "content", "series.yaml");

interface SeriesSource {
  id: string;
  posts: string[];
  vi: { title: string; description: string };
  en: { title: string; description: string };
}

export interface Series {
  id: string;
  title: string;
  description: string;
  /** Parts published in this locale, in reading order */
  posts: BlogPostSummary[];
  /** Most common topic among the parts; colours the series line */
  topic: BlogTopic;
  readingTime: number;
  /** Date of the newest part */
  updated: string;
}

function readSources(): SeriesSource[] {
  return (parseYaml(fs.readFileSync(SERIES_FILE, "utf8")) ?? []) as SeriesSource[];
}

export function dominantTopic(posts: BlogPostSummary[]): BlogTopic {
  const counts = new Map<BlogTopic, number>();
  posts.forEach((post) => counts.set(post.topic, (counts.get(post.topic) ?? 0) + 1));
  // Ties go to the earliest part: Map keeps insertion order.
  return [...counts.entries()].reduce((best, entry) => (entry[1] > best[1] ? entry : best))[0];
}

/** Every series with at least two parts in `locale`, in file order. */
export function getAllSeries(locale: BlogLocale): Series[] {
  const bySlug = new Map(getAllPosts(locale).map((post) => [post.slug, post]));

  return readSources().flatMap((source) => {
    const posts = source.posts.flatMap((slug) => {
      const post = bySlug.get(slug);
      return post ? [toSummary(post)] : [];
    });
    // A one-part "series" is just a post.
    if (posts.length < 2) return [];

    return [
      {
        id: source.id,
        title: source[locale].title,
        description: source[locale].description,
        posts,
        topic: dominantTopic(posts),
        readingTime: posts.reduce((sum, post) => sum + post.readingTime, 0),
        updated: posts.reduce((latest, post) => (post.date > latest ? post.date : latest), ""),
      },
    ];
  });
}

export function getSeries(id: string, locale: BlogLocale) {
  return getAllSeries(locale).find((series) => series.id === id);
}

/** The series a post belongs to and its zero-based position there. */
export function getSeriesForPost(slug: string, locale: BlogLocale) {
  for (const series of getAllSeries(locale)) {
    const index = series.posts.findIndex((post) => post.slug === slug);
    if (index >= 0) return { series, index };
  }
  return undefined;
}
