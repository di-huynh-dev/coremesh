"use client";

import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
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

export interface PostCardProps {
  post: BlogPost;
  viewMode?: "list" | "grid";
  href: string;
  index?: number;
}

export function PostCard({
  post,
  viewMode = "list",
  href,
  index = 0,
}: PostCardProps) {
  return (
    <motion.div
      key={post.slug}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={href}>
        {viewMode === "list" ? (
          <div className="group bg-card hover:bg-accent/50 border rounded-lg p-6 transition-all duration-300 cursor-pointer flex gap-6">
            {post.image && (
              <div className="flex-shrink-0 w-32 h-32 relative rounded-lg overflow-hidden bg-muted">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
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

              <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readingTime} min read
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="group bg-card hover:bg-accent/50 border rounded-lg p-6 transition-all duration-300 cursor-pointer flex flex-col h-full">
            {post.image && (
              <div className="w-full h-40 relative rounded-lg overflow-hidden bg-muted mb-4">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {post.category}
              </span>
            </div>

            <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-grow">
              {post.title}
            </h2>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readingTime} min
              </div>
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
