"use client";

import { Footer } from "@/components/layout/footer";
import { getAllPosts } from "@/lib/blog";
import type { BlogPost } from "@repo/ui/types/post";
import {
  ArrowRight,
  Flame,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const NavbarComponent = dynamic(
  () =>
    import("@/components/layout/navbar").then((mod) => ({
      default: mod.Navbar,
    })),
  {
    ssr: false,
  },
);

const levelStyles: Record<string, string> = {
  Starter: "text-[#16a34a] dark:text-[#86efac]",
  Intermediate: "text-[#38bdf8] dark:text-[#7dd3fc]",
  Advanced: "text-[#f43f5e] dark:text-[#fda4af]",
};

function formatPostDate(date: string, locale: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function BlogListItem({
  post,
  href,
  locale,
}: {
  post: BlogPost;
  href: string;
  locale: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[#e5e7eb] bg-white px-6 py-7 transition-colors duration-200 hover:border-[#d7dce3] dark:border-white/10 dark:bg-[#17171a] dark:hover:border-white/15"
    >
      <article className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative aspect-[1.95/1] w-full shrink-0 overflow-hidden rounded-md bg-[#111827] md:w-[178px]">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 178px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1d4ed8] to-[#111827] text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
              {post.category}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-[2rem] leading-[1.2] font-semibold tracking-[-0.03em] text-[#23262d] transition-colors group-hover:text-black dark:text-white md:text-[2.55rem]">
                {post.title}
              </h2>
              <p className="mt-2 text-[1.05rem] leading-8 text-[#5f6470] dark:text-white/68 md:text-[1.18rem]">
                {post.excerpt}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.98rem]">
                {post.level ? (
                  <span
                    className={`inline-flex items-center font-medium ${levelStyles[post.level] ?? "text-foreground"}`}
                  >
                    <Flame className="mr-2 h-4 w-4 text-[#9ca3af]" />
                    {post.level}
                  </span>
                ) : null}

                <span className="inline-flex items-center gap-2 text-[#5f6470] dark:text-white/62">
                  {formatPostDate(post.date, locale)}
                </span>

                {post.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[0.98rem] text-[#2f333b] underline decoration-[#bfc5ce] underline-offset-4 transition hover:text-black dark:text-white/85 dark:decoration-white/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden self-center md:flex">
              <span className="inline-flex h-10 w-10 items-center justify-center text-[#9aa1ac] transition-transform duration-200 group-hover:translate-x-1 dark:text-white/45">
                <ArrowRight className="h-6 w-6" strokeWidth={1.8} />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  const locale = useLocale();
  const allPosts = getAllPosts(locale as "en" | "vi");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allPosts.forEach((post) => {
      post.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allPosts]);

  const allLevels = useMemo(() => {
    const levels = new Set<string>();
    allPosts.forEach((post) => {
      if (post.level) levels.add(post.level);
    });
    return Array.from(levels);
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        normalizedQuery.length === 0 ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.excerpt.toLowerCase().includes(normalizedQuery) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      const matchesLevel = !selectedLevel || post.level === selectedLevel;
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => post.tags?.includes(tag));

      return matchesSearch && matchesLevel && matchesTags;
    });
  }, [allPosts, searchQuery, selectedLevel, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLevel(null);
    setSelectedTags([]);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#111114]">
      <NavbarComponent />

      <section className="container mx-auto px-4 py-14 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#23262d] dark:text-white md:text-4xl">
                  What&apos;s new
                </h1>
                <p className="mt-2 max-w-2xl text-base leading-7 text-[#6b7280] dark:text-white/62">
                  Fresh notes on frontend engineering, UI systems, performance, and product craft.
                </p>
              </div>

              <div className="text-sm text-[#6b7280] dark:text-white/55">
                {filteredPosts.length} article
                {filteredPosts.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="mb-7 rounded-2xl border border-[#e5e7eb] bg-white p-4 dark:border-white/10 dark:bg-[#17171a]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Search articles, topics, and tags"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#e5e7eb] bg-white pl-11 pr-4 text-sm text-[#23262d] outline-none transition focus:border-[#d1d5db] focus:ring-2 focus:ring-black/5 dark:border-white/10 dark:bg-[#17171a] dark:text-white"
                />
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#2f333b] transition hover:bg-[#f8fafc] dark:border-white/10 dark:bg-[#17171a] dark:text-white"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>

                {(selectedLevel || selectedTags.length > 0 || searchQuery) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-12 items-center rounded-xl px-4 text-sm font-medium text-[#6b7280] transition hover:text-[#23262d] dark:text-white/55 dark:hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {showFilters ? (
              <div className="mt-4 grid gap-4 border-t border-[#eef0f3] pt-4 dark:border-white/8 md:grid-cols-[220px_1fr]">
                <div>
                  <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#6b7280] uppercase dark:text-white/55">
                    Level
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLevel(null)}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${selectedLevel === null ? "bg-[#23262d] text-white" : "bg-[#f3f4f6] text-[#23262d] hover:bg-[#e5e7eb] dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.08]"}`}
                    >
                      All
                    </button>
                    {allLevels.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSelectedLevel(level)}
                        className={`rounded-full px-3 py-1.5 text-sm transition ${selectedLevel === level ? "bg-[#23262d] text-white" : "bg-[#f3f4f6] text-[#23262d] hover:bg-[#e5e7eb] dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.08]"}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#6b7280] uppercase dark:text-white/55">
                    Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full px-3 py-1.5 text-sm transition ${active ? "bg-[#23262d] text-white" : "bg-[#f3f4f6] text-[#23262d] hover:bg-[#e5e7eb] dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.08]"}`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <BlogListItem
                  key={post.slug}
                  post={post as BlogPost}
                  href={`/${locale}/blog/${post.slug}`}
                  locale={locale}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white px-6 py-16 text-center text-[#6b7280] dark:border-white/10 dark:bg-[#17171a] dark:text-white/55">
                No articles matched your filters.
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
