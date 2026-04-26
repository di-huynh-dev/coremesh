import { posts } from "./blog/posts";
import type { BlogLocale, BlogPost, BlogPostSource } from "./blog/types";

export type { BlogPost } from "./blog/types";

function resolvePost(post: BlogPostSource, locale: BlogLocale): BlogPost {
  const localizedContent = post.translations?.[locale];
  const { translations, ...basePost } = post;
  void translations;

  if (!localizedContent) {
    return basePost;
  }

  return {
    ...basePost,
    ...localizedContent,
  };
}

export function getAllPosts(locale: BlogLocale = "en"): BlogPost[] {
  return [...posts]
    .map((post) => resolvePost(post, locale))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(
  slug: string,
  locale: BlogLocale = "en",
): BlogPost | undefined {
  const post = posts.find((item) => item.slug === slug);

  return post ? resolvePost(post, locale) : undefined;
}

export function getAllSlugs(): string[] {
  return posts.map((post) => post.slug);
}
