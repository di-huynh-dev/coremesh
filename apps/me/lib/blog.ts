import type { Locale } from "@/lib/i18n";
import { getAllPosts } from "@repo/content/posts";
import type { BlogPost } from "@repo/ui/types/post";
import path from "node:path";

// The blog app's content folder in this monorepo; read at build time.
const BLOG_POSTS_DIR = path.join(process.cwd(), "..", "blogs", "content", "posts");

export function getLatestPosts(locale: Locale, limit = 3): BlogPost[] {
  let posts: ReturnType<typeof getAllPosts>;
  try {
    posts = getAllPosts(locale, BLOG_POSTS_DIR);
  } catch (error) {
    // Keep the portfolio up if the blog content is missing; the section just renders empty.
    console.error("[me] could not read blog posts", error);
    return [];
  }

  return posts
    .slice(0, limit)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      readingTime: post.readingTime,
      category: post.topic,
      tags: post.tags,
      image: post.image,
    }));
}
