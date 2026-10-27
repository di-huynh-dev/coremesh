import { SITE_URL } from "@/lib/data/profile";
import { EXPLORE_MAPS } from "@/lib/explore";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: { en: SITE_URL, vi: `${SITE_URL}/vi` } },
    },
    {
      url: `${SITE_URL}/vi`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: { en: SITE_URL, vi: `${SITE_URL}/vi` } },
    },
    { url: `${SITE_URL}/colophon`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/vi/colophon`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/story`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    ...Object.keys(EXPLORE_MAPS).map((id) => ({
      url: `${SITE_URL}/story/kham-pha/${id}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
