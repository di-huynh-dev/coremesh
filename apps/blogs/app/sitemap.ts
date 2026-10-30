import { locales } from "@/intl.config";
import { ROLE_MAP_IDS } from "@/lib/content/role-maps";
import { getGuides } from "@/lib/content/guides";
import { getAllSeries, getSeries } from "@/lib/content/series";
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
      { path: "/series", changeFrequency: "weekly" as const, priority: 0.8 },
      { path: "/roadmap", changeFrequency: "monthly" as const, priority: 0.8 },
      ...ROLE_MAP_IDS.map((id) => ({
        path: `/roadmap/${id}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      { path: "/guides", changeFrequency: "weekly" as const, priority: 0.8 },
      ...getGuides()
        .filter((guide) => guide.adaptedFrom)
        .flatMap((guide) => [
          { path: `/guides/${guide.slug}`, changeFrequency: "monthly" as const, priority: 0.7 },
          ...guide.parts.map((part) => ({
            path: `/guides/${guide.slug}/${part.slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.6,
          })),
        ]),
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

  const series = locales.flatMap((locale) =>
    getAllSeries(locale).map((item) => ({
      url: `${SITE_URL}/${locale}/series/${item.id}`,
      lastModified: new Date(item.updated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: languages(
          `/series/${item.id}`,
          locales.filter((l) => getSeries(item.id, l) !== undefined),
        ),
      },
    })),
  );

  return [...pages, ...series, ...posts];
}
