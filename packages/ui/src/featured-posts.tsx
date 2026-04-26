"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import Link from "next/link";
import type { BlogPost } from "./types/post";

const levelColors: Record<string, { bg: string; text: string }> = {
  Starter: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  Intermediate: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
  },
  Advanced: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
};

export interface FeaturedPostsProps {
  posts: BlogPost[];
  baseHref: string;
  locale?: string;
  title?: string;
}

export function FeaturedPosts({
  posts,
  baseHref,
  locale = "en",
  title = "What's new",
}: FeaturedPostsProps) {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 border-b">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/${locale}${baseHref}/${post.slug}`}>
              <div className="group bg-card hover:bg-accent/50 border rounded-lg p-5 transition-all duration-300 cursor-pointer h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {post.category}
                  </span>
                  {post.level &&
                    (() => {
                      const colors = levelColors[post.level];
                      if (!colors) return null;
                      return (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}
                        >
                          {post.level}
                        </span>
                      );
                    })()}
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-grow">
                  {post.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  {post.tags && (
                    <div className="flex items-center gap-1">
                      {post.tags.slice(0, 1).map((tag) => (
                        <span key={tag} className="text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
