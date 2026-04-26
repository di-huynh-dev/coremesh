export type BlogPostLevel = "Starter" | "Intermediate" | "Advanced";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  contentHtml?: string;
  category: string;
  date: string;
  readingTime: number;
  author?: {
    name: string;
    avatar?: string;
  };
  image?: string;
  level?: BlogPostLevel;
  tags?: string[];
}
