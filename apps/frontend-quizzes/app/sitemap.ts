import { MetadataRoute } from "next";
import { getAllQuestions } from "@/lib/mdx";
import { TOPICS } from "@/data/topics";
import { getSiteUrl } from "@/utils/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  // 1. Core Static Pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/questions`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  // 2. Dynamic Category Pages (e.g. /questions/react, /questions/javascript)
  const categoryPages = TOPICS.map((topic) => ({
    url: `${baseUrl}/questions/${topic.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 3. Dynamic Question Pages scanned from the filesystem (e.g. /questions/javascript/debounce-immediate)
  const questions = getAllQuestions();
  const questionPages = questions.map((q) => ({
    url: `${baseUrl}/questions/${q.category}/${q.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...questionPages];
}
