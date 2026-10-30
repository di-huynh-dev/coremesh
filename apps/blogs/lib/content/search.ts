import { getGuides } from "./guides";
import { getAllPosts } from "@repo/content/posts";
import { getRoleMaps } from "./role-maps";
import { getAllSeries } from "./series";
import { TOOLS } from "./tools";
import type { BlogLocale, SearchEntry } from "./types";

const MAX_DESCRIPTION = 140;

function clip(text: string) {
  return text.length > MAX_DESCRIPTION ? `${text.slice(0, MAX_DESCRIPTION - 1).trimEnd()}…` : text;
}

/** Site-wide ⌘K index for one locale: posts, series, role maps + stages, guides + chapters, tools. */
export function buildSearchIndex(locale: BlogLocale): SearchEntry[] {
  const base = `/${locale}`;

  const posts: SearchEntry[] = getAllPosts(locale).map((post) => ({
    kind: "post",
    title: post.title,
    description: clip(post.excerpt),
    href: `${base}/blog/${post.slug}`,
    keywords: [post.topic, ...post.tags],
  }));

  const series: SearchEntry[] = getAllSeries(locale).map((item) => ({
    kind: "series",
    title: item.title,
    description: clip(item.description),
    href: `${base}/series/${item.id}`,
    keywords: [item.topic, ...new Set(item.posts.flatMap((post) => post.tags))],
  }));

  const guides: SearchEntry[] = getGuides(locale).flatMap((guide) => [
    {
      kind: "guide" as const,
      title: guide.title,
      description: clip(guide.description),
      href: `${base}/guides/${guide.slug}`,
      context: guide.category.name,
      keywords: [guide.category.name, guide.slug.replace(/-/g, " "), ...guide.tags],
    },
    ...guide.parts.map((part) => ({
      kind: "chapter" as const,
      title: part.title,
      description: clip(part.description),
      href: `${base}/guides/${guide.slug}/${part.slug}`,
      context: guide.title,
      // The English slug keeps translated chapters findable by their original terms.
      keywords: [guide.category.name, part.slug.replace(/^\d+-/, "").replace(/-/g, " ")],
    })),
  ]);

  const roleMaps: SearchEntry[] = getRoleMaps(locale).flatMap((roleMap) => [
    {
      kind: "role" as const,
      title: roleMap.name,
      description: clip(roleMap.tagline),
      href: `${base}/role-map/${roleMap.id}`,
      keywords: roleMap.ecosystem,
    },
    ...roleMap.stages.map((stage) => ({
      kind: "stage" as const,
      title: stage.title,
      description: clip(stage.goal),
      href: `${base}/role-map/${roleMap.id}#stage-${stage.id}`,
      context: roleMap.name,
      keywords: [...stage.tags, ...stage.topics.map((topic) => topic.title)],
    })),
  ]);

  const tools: SearchEntry[] = TOOLS.map((tool) => ({
    kind: "tool",
    title: tool.copy[locale].title,
    description: clip(tool.copy[locale].tagline),
    href: `${base}/tools/${tool.slug}`,
    keywords: tool.keywords,
  }));

  return [...posts, ...series, ...roleMaps, ...guides, ...tools];
}
