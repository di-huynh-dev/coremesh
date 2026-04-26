"use client";

import type { BlogPost } from "./types/post";
import { PostCard } from "./post-card";

export interface PostListProps {
  posts: BlogPost[];
  viewMode?: "list" | "grid";
  baseHref: string;
  locale?: string;
  emptyMessage?: string;
}

export function PostList({
  posts,
  viewMode = "list",
  baseHref,
  locale = "en",
  emptyMessage = "No posts found matching your filters.",
}: PostListProps) {
  const containerClass =
    viewMode === "list" ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 gap-6";

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {posts.map((post, index) => (
        <PostCard
          key={post.slug}
          post={post}
          viewMode={viewMode}
          href={`/${locale}${baseHref}/${post.slug}`}
          index={index}
        />
      ))}
    </div>
  );
}
