import { allPosts } from '../.content-collections/generated';

export type BlogPost = (typeof allPosts)[number];

export function getAllPosts() {
  return [...allPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getAllSlugs() {
  return getAllPosts().map((post) => post.slug);
}
