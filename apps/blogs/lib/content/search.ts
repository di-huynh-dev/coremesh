import { getGuides } from "./guides";
import { getAllPosts } from "@repo/content/posts";
import { getRoadmaps } from "./roadmaps";
import { TOOLS } from "./tools";
import type { BlogLocale, SearchEntry } from "./types";

const MAX_DESCRIPTION = 140;

function clip(text: string) {
  return text.length > MAX_DESCRIPTION ? `${text.slice(0, MAX_DESCRIPTION - 1).trimEnd()}…` : text;
}

/** Site-wide ⌘K index for one locale: posts, guides + chapters, roadmaps + stages, tools. */
export function buildSearchIndex(locale: BlogLocale): SearchEntry[] {
  const base = `/${locale}`;

  const posts: SearchEntry[] = getAllPosts(locale).map((post) => ({
    kind: "post",
    title: post.title,
    description: clip(post.excerpt),
    href: `${base}/blog/${post.slug}`,
    keywords: [post.topic, ...post.tags],
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

  const roadmaps: SearchEntry[] = getRoadmaps(locale).flatMap((roadmap) => [
    {
      kind: "roadmap" as const,
      title: roadmap.name,
      description: clip(roadmap.summary),
      href: `${base}/roadmap/${roadmap.id}`,
      context: roadmap.role,
      keywords: roadmap.skills,
    },
    ...roadmap.milestones.map((milestone) => ({
      kind: "stage" as const,
      title: milestone.title,
      description: clip(milestone.description),
      href: `${base}/roadmap/${roadmap.id}#stage-${milestone.step}`,
      context: roadmap.name,
      keywords: milestone.tags,
    })),
  ]);

  const tools: SearchEntry[] = TOOLS.map((tool) => ({
    kind: "tool",
    title: tool.copy[locale].title,
    description: clip(tool.copy[locale].tagline),
    href: `${base}/tools/${tool.slug}`,
    keywords: tool.keywords,
  }));

  return [...posts, ...roadmaps, ...guides, ...tools];
}
