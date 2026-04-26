export type BlogLocale = "en" | "vi";

export interface BlogPostContent {
  title: string;
  excerpt: string;
  content: string;
  contentHtml: string;
}

export interface BlogPostSource extends BlogPostContent {
  slug: string;
  category: string;
  date: string;
  readingTime: number;
  author: {
    name: string;
    avatar?: string;
  };
  image?: string;
  level?: "Starter" | "Intermediate" | "Advanced";
  tags?: string[];
  translations?: Partial<Record<BlogLocale, Partial<BlogPostContent>>>;
}

export interface BlogPost extends BlogPostContent {
  slug: string;
  category: string;
  date: string;
  readingTime: number;
  author: {
    name: string;
    avatar?: string;
  };
  image?: string;
  level?: "Starter" | "Intermediate" | "Advanced";
  tags?: string[];
}
