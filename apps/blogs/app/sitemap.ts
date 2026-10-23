import { getAllPosts } from "@/lib/content/posts";
import { ROADMAP_IDS } from "@/lib/content/roadmaps";
import { TOOLS } from "@/lib/content/tools";
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";
const locales = ["en", "vi"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = locales.flatMap((locale) => [
    { url: `${siteUrl}/${locale}`, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${siteUrl}/${locale}/blog`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${siteUrl}/${locale}/roadmap`, changeFrequency: "monthly" as const, priority: 0.8 },
    ...ROADMAP_IDS.map((id) => ({
      url: `${siteUrl}/${locale}/roadmap/${id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // Individual guides canonicalize to DevOps Daily, so only the index is listed.
    { url: `${siteUrl}/${locale}/guides`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${siteUrl}/${locale}/tools`, changeFrequency: "monthly" as const, priority: 0.7 },
    ...TOOLS.map((tool) => ({
      url: `${siteUrl}/${locale}/tools/${tool.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]);

  const posts = locales.flatMap((locale) =>
    getAllPosts(locale).map((post) => ({
      url: `${siteUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}/${l}/blog/${post.slug}`]),
        ),
      },
    })),
  );

  return [...pages, ...posts];
}
