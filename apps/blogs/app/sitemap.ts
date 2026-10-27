import { locales } from "@/intl.config";
import { ROADMAP_IDS } from "@/lib/content/roadmaps";
import { TOOLS } from "@/lib/content/tools";
import type { BlogLocale } from "@/lib/content/types";
import { localizedAlternates, postLocales } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { getAllPosts } from "@repo/content/posts";
import type { MetadataRoute } from "next";

/** Same hreflang set as the page's own metadata, as absolute URLs. */
function languages(path: string, available: readonly BlogLocale[] = locales) {
  const { languages: links } = localizedAlternates(available[0] ?? "vi", path, available);
  return Object.fromEntries(
    Object.entries(links ?? {}).map(([lang, href]) => [lang, `${SITE_URL}${String(href)}`]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = locales.flatMap((locale) =>
    [
      { path: "", changeFrequency: "weekly" as const, priority: 1 },
      { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
      { path: "/roadmap", changeFrequency: "monthly" as const, priority: 0.8 },
      ...ROADMAP_IDS.map((id) => ({
        path: `/roadmap/${id}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      // Individual guides canonicalize to DevOps Daily, so only the index is listed.
      { path: "/guides", changeFrequency: "weekly" as const, priority: 0.8 },
      { path: "/tools", changeFrequency: "monthly" as const, priority: 0.7 },
      ...TOOLS.map((tool) => ({
        path: `/tools/${tool.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ].map(({ path, ...entry }) => ({
      url: `${SITE_URL}/${locale}${path}`,
      ...entry,
      alternates: { languages: languages(path) },
    })),
  );

  const posts = locales.flatMap((locale) =>
    getAllPosts(locale).map((post) => ({
      url: `${SITE_URL}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: { languages: languages(`/blog/${post.slug}`, postLocales(post.slug)) },
    })),
  );

  return [...pages, ...posts];
}
