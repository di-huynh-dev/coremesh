"use client";

import { PostCard } from "@repo/ui/post-card";
import type { BlogPost } from "@repo/ui/types/post";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { BlogNavbar } from "./blog-navbar";

type BlogSectionProps = {
  posts: BlogPost[];
  blogsBaseUrl: string;
};

export function BlogSection({ posts, blogsBaseUrl }: BlogSectionProps) {
  const resolvedBlogsBaseUrl = blogsBaseUrl.replace(/\/$/, "");

  return (
    <section id="blog" className="px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono-data text-muted-foreground">
                from the blog
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                Latest writing from the blogs app
              </h2>
            </div>
            <a
              href={`${resolvedBlogsBaseUrl}/blog`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              Open blogs
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <BlogNavbar blogsBaseUrl={blogsBaseUrl} />

          <div className="grid gap-4 lg:grid-cols-3">
            {posts.map((post, index) => (
              <PostCard
                key={post.slug}
                post={post}
                viewMode="grid"
                href={`${resolvedBlogsBaseUrl}/blog/${post.slug}`}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
