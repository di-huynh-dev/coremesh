'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';

const categoryColors: Record<string, string> = {
  Engineering: '#071B3A',
  Design: '#22C7E8',
  Framework: '#8BD63F',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="bg-background min-h-screen">
      <div className="editorial-grid px-0 pt-24 md:pt-32">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <header className="px-4 pt-8 pb-10 md:px-6 md:pb-16">
        <div className="editorial-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="reading-width"
          >
            <p className="mb-3 text-sm font-medium tracking-[0.16em] text-[#22C7E8] uppercase">
              Journal
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-[-0.03em] text-[#071B3A] md:text-5xl lg:text-6xl dark:text-[#D7E2FF]">
              Blog
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-8 md:text-lg">
              Notes on modern product development, editorial UI systems, and the small technical
              decisions that quietly shape better learning experiences.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="px-4 pb-20 md:px-6 md:pb-28">
        <div className="editorial-grid grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="paper-card paper-card-hover h-full rounded-[1.75rem] p-5 md:p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-4 md:gap-3">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase"
                      style={{
                        backgroundColor:
                          post.category === 'Design'
                            ? 'rgba(34, 199, 232, 0.14)'
                            : post.category === 'Framework'
                              ? 'rgba(139, 214, 63, 0.18)'
                              : 'rgba(7, 27, 58, 0.08)',
                        color: categoryColors[post.category] || '#071B3A',
                      }}
                    >
                      {post.category}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {post.readingTime} min read
                    </span>
                  </div>

                  <h2 className="mb-3 text-xl font-semibold text-[#071B3A] transition-colors group-hover:text-[#22C7E8] dark:text-[#D7E2FF]">
                    {post.title}
                  </h2>

                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-7">
                    {post.excerpt}
                  </p>

                  <div className="border-border flex items-center justify-between border-t pt-4">
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-[#22C7E8] transition-all group-hover:gap-2">
                      Read article
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}
