'use client';

import { BlogListItem, SeriesItem, WhatsNewCard } from '@/components/blog/blog-cards';
import type { HomeLocale } from '@/lib/home-content';
import { resolvePostForLocale, type BlogPost, type BlogSeries } from '@/lib/blog';
import {
  formatBlogArticleCount,
  formatBlogCategory,
  formatBlogLevel,
  getBlogUiCopy,
} from '@/lib/blog-localization';
import { getPreferredLocale, subscribeToLocaleChange } from '@/lib/site-locale';
import { ArrowRight, ArrowUpDown, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

type PagefindResultData = { url: string };

type PagefindModule = {
  search: (query: string) => Promise<{
    results: Array<{ data: () => Promise<PagefindResultData> }>;
  }>;
};

type SortMode = 'newest' | 'oldest' | 'title';

const FEATURED_COUNT = 3;
const PAGE_SIZE = 6;
const PAGEFIND_BUNDLE_PATH = '/pagefind/pagefind.js';

function normalizeUrlToSlug(url: string) {
  return url.replace(/^\/+|\/+$/g, '').replace(/^blog\//, '');
}

function sortPosts(posts: BlogPost[], sortMode: SortMode) {
  const sorted = [...posts];

  if (sortMode === 'oldest') {
    sorted.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    return sorted;
  }

  if (sortMode === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }

  sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return sorted;
}

export function BlogIndex({ posts, series }: { posts: BlogPost[]; series: BlogSeries[] }) {
  const locale = useSyncExternalStore<HomeLocale>(
    subscribeToLocaleChange,
    getPreferredLocale,
    () => 'en',
  );
  const copy = getBlogUiCopy(locale).index;
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [pagefindSlugs, setPagefindSlugs] = useState<string[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(posts.map((post) => post.category)))],
    [posts],
  );

  const localizedCategoryLabel = (category: string) =>
    category === 'All' ? copy.allCategories : formatBlogCategory(category, locale);

  const seriesBySlug = useMemo(
    () => new Map(series.map((seriesEntry) => [seriesEntry.slug, seriesEntry])),
    [series],
  );

  useEffect(() => {
    let ignore = false;

    async function runSearch() {
      if (query.trim().length < 2) {
        setPagefindSlugs(null);
        return;
      }

      try {
        const pagefind = (await import(
          /* webpackIgnore: true */ PAGEFIND_BUNDLE_PATH
        )) as PagefindModule;

        const response = await pagefind.search(query.trim());
        const resolved = await Promise.all(response.results.map((result) => result.data()));

        if (!ignore) {
          setPagefindSlugs(resolved.map((entry) => normalizeUrlToSlug(entry.url)));
        }
      } catch {
        if (!ignore) {
          setPagefindSlugs(null);
        }
      }
    }

    void runSearch();

    return () => {
      ignore = true;
    };
  }, [query]);

  const latestPosts = useMemo(() => posts.slice(0, FEATURED_COUNT), [posts]);

  const filteredPosts = useMemo(() => {
    let nextPosts = posts;

    if (activeCategory !== 'All') {
      nextPosts = nextPosts.filter((post) => post.category === activeCategory);
    }

    if (query.trim()) {
      if (pagefindSlugs && pagefindSlugs.length > 0) {
        const allowed = new Set(pagefindSlugs);
        nextPosts = nextPosts.filter((post) => allowed.has(post.slug));
      } else {
        const normalizedQuery = query.toLowerCase();

        nextPosts = nextPosts.filter((post) => {
          const displayPost = resolvePostForLocale(post, locale);

          return [displayPost.series?.slug]
            .map((slug) => (slug ? seriesBySlug.get(slug) : null))
            .filter(Boolean)
            .flatMap((seriesEntry) => [seriesEntry?.title, seriesEntry?.description])
            .concat([
              displayPost.title,
              displayPost.excerpt,
              formatBlogCategory(displayPost.category, locale),
              formatBlogLevel(displayPost.level, locale),
              ...(displayPost.tags ?? []),
            ])
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery);
        });
      }
    }

    return sortPosts(nextPosts, sortMode);
  }, [activeCategory, locale, pagefindSlugs, posts, query, seriesBySlug, sortMode]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <div className="pb-24">
      <section className="mb-10 space-y-3">
        <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#202124] md:text-5xl dark:text-[#F5F7FB]">
          {copy.heroTitle}
        </h1>

        <p className="text-muted-foreground max-w-3xl text-base leading-8 md:text-lg">
          {copy.heroDescription}
        </p>
      </section>

      <section className="border-border bg-card mb-8 rounded-md border p-6 shadow-[0_16px_45px_rgba(15,68,122,0.05)] md:p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#202124] dark:text-[#F5F7FB]">
                {copy.whatsNewTitle}
              </h2>

              <p className="text-muted-foreground mt-1 text-sm">{copy.whatsNewDescription}</p>
            </div>
          </div>

          <Link
            href="/blog"
            className="hidden items-center gap-1.5 text-sm font-medium text-[#202124] md:inline-flex dark:text-[#F5F7FB]"
          >
            {copy.seeAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {latestPosts.map((post) => (
            <WhatsNewCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="rounded-md border border-transparent bg-transparent p-0 md:p-0">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#202124] dark:text-[#F5F7FB]">
                {copy.everythingTitle}
              </h2>

              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-7">
                {copy.everythingDescription}
              </p>
            </div>

            <div className="border-border bg-background text-muted-foreground flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm">
              <ArrowUpDown className="h-4 w-4" />

              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="bg-transparent outline-none"
              >
                <option value="newest">{copy.sortNewest}</option>
                <option value="oldest">{copy.sortOldest}</option>
                <option value="title">{copy.sortTitle}</option>
              </select>
            </div>
          </div>

          <div className="border-border bg-card mb-4 flex flex-col gap-3 rounded-md border p-4 shadow-[0_16px_45px_rgba(15,68,122,0.05)] md:p-5 xl:flex-row xl:items-center">
            <label className="border-border bg-background text-muted-foreground flex flex-1 items-center gap-3 rounded-[1.1rem] border px-4 py-3 text-sm">
              <Search className="h-4 w-4" />

              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder={copy.searchPlaceholder}
                className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent outline-none"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = category === activeCategory;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                      isActive
                        ? 'border-[#071B3A]/10 bg-[#071B3A]/[0.05] text-[#071B3A] dark:border-white/12 dark:bg-white/[0.05] dark:text-[#F5F7FB]'
                        : 'border-border bg-card text-muted-foreground hover:border-accent/35 hover:text-foreground'
                    }`}
                  >
                    {localizedCategoryLabel(category)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-border text-muted-foreground mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-5 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{formatBlogArticleCount(filteredPosts.length, locale)}</span>
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="space-y-3">
              {visiblePosts.map((post) => (
                <BlogListItem
                  key={post.slug}
                  post={post}
                  seriesTitle={
                    post.series?.slug ? seriesBySlug.get(post.series.slug)?.title : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="border-border rounded-[1.45rem] border border-dashed px-6 py-10 text-center">
              <p className="text-lg font-semibold text-[#202124] dark:text-[#F5F7FB]">
                {copy.noPostsTitle}
              </p>

              <p className="text-muted-foreground mt-2 text-sm leading-7">
                {copy.noPostsDescription}
              </p>
            </div>
          )}

          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                className="border-border bg-card text-muted-foreground hover:border-accent/35 hover:text-foreground rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
              >
                {copy.loadMore}
              </button>
            </div>
          ) : null}
        </div>

        <aside
          id="browse-series"
          className="border-border/80 bg-card/65 rounded-md border p-5 shadow-[0_12px_32px_rgba(15,68,122,0.04)] backdrop-blur-sm xl:sticky"
          style={{ top: 'var(--site-nav-offset, 96px)' }}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#202124] dark:text-[#F5F7FB]">
                {copy.browseSeriesTitle}
              </h2>

              <p className="text-muted-foreground mt-2 text-sm leading-7">
                {copy.browseSeriesDescription}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {series.map((seriesEntry, index) => (
              <SeriesItem key={seriesEntry.slug} index={index} series={seriesEntry} />
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
