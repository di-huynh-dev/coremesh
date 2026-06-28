'use client';

import {
  EditorialArticleRow,
  EditorialFeaturedArticle,
  LearningTrackCard,
} from '@/components/blog/blog-cards';
import type { HomeLocale } from '@/lib/home-content';
import { resolvePostForLocale, type BlogPost, type BlogSeries } from '@/lib/blog';
import { formatBlogArticleCount, formatBlogCategory } from '@/lib/blog-localization';
import { getPreferredLocale, subscribeToLocaleChange } from '@/lib/site-locale';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

type PagefindResultData = { url: string };

type PagefindModule = {
  search: (query: string) => Promise<{
    results: Array<{ data: () => Promise<PagefindResultData> }>;
  }>;
};

type SortMode = 'newest' | 'oldest' | 'title';

type EditorialIndexCopy = {
  heroTitle: string;
  heroDescription: string;
  readLatestCta: string;
  browseTracksCta: string;
  writingAboutTitle: string;
  writingTopics: string[];
  featuredLabel: string;
  whyLabel: string;
  readBreakdownCta: string;
  latestTitle: string;
  latestDescription: string;
  learningTracksTitle: string;
  learningTracksDescription: string;
  practiceTitle: string;
  practiceDescription: string;
  questionBankCta: string;
  roadmapCta: string;
  sortNewest: string;
  sortOldest: string;
  sortTitle: string;
  searchPlaceholder: string;
  allCategories: string;
  noPostsTitle: string;
  noPostsDescription: string;
  loadMore: string;
  startsWithLabel: string;
  latestLabel: string;
};

const FEATURED_POST_COUNT = 1;
const PAGE_SIZE = 6;
const PAGEFIND_BUNDLE_PATH = '/pagefind/pagefind.js';

const editorialIndexCopy: Record<HomeLocale, EditorialIndexCopy> = {
  en: {
    heroTitle: 'DiCodeWeb Journal',
    heroDescription:
      'Frontend notes from building, breaking, and improving real web systems.',
    readLatestCta: 'Read latest',
    browseTracksCta: 'Browse learning tracks',
    writingAboutTitle: 'Currently writing about',
    writingTopics: [
      'Next.js architecture',
      'Authorization patterns',
      'Frontend interview prep',
      'UI systems',
    ],
    featuredLabel: 'Featured breakdown',
    whyLabel: 'Why this matters',
    readBreakdownCta: 'Read breakdown',
    latestTitle: 'Latest Notes',
    latestDescription:
      'Notes from building DiCodeWeb. Architecture decisions, tradeoffs, and patterns worth keeping in your head before an interview.',
    learningTracksTitle: 'Learning Tracks',
    learningTracksDescription: 'Read in sequence when the topic needs more than one note.',
    practiceTitle: 'Read, then practice',
    practiceDescription:
      'Turn notes into interview-ready understanding. Read the breakdown, then practice related questions or follow the roadmap.',
    questionBankCta: 'Open question bank',
    roadmapCta: 'Follow roadmap',
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    sortTitle: 'Title A-Z',
    searchPlaceholder: 'Search notes, tags, or series',
    allCategories: 'All topics',
    noPostsTitle: 'No notes matched this view.',
    noPostsDescription: 'Try a broader keyword or switch the current filter.',
    loadMore: 'Load more notes',
    startsWithLabel: 'Starts with',
    latestLabel: 'Latest note',
  },
  vi: {
    heroTitle: 'DiCodeWeb Journal',
    heroDescription:
      'Ghi chú frontend từ quá trình xây, phá, và cải thiện những hệ thống web thực tế.',
    readLatestCta: 'Đọc bài mới nhất',
    browseTracksCta: 'Xem lộ trình đọc',
    writingAboutTitle: 'Đang viết về',
    writingTopics: [
      'Kiến trúc Next.js',
      'Pattern phân quyền',
      'Luyện phỏng vấn frontend',
      'Hệ thống UI',
    ],
    featuredLabel: 'Bài phân tích nổi bật',
    whyLabel: 'Vì sao nên đọc',
    readBreakdownCta: 'Đọc bài phân tích',
    latestTitle: 'Latest Notes',
    latestDescription:
      'Ghi chú từ quá trình xây DiCodeWeb. Quyết định kiến trúc, tradeoff, và những pattern nên hiểu thật trước khi đi phỏng vấn.',
    learningTracksTitle: 'Learning Tracks',
    learningTracksDescription: 'Đọc theo mạch khi một chủ đề cần nhiều hơn một bài viết.',
    practiceTitle: 'Đọc xong, rồi luyện',
    practiceDescription:
      'Biến ghi chú thành hiểu biết dùng được trong phỏng vấn. Đọc bài phân tích, rồi luyện câu hỏi liên quan hoặc đi tiếp theo roadmap.',
    questionBankCta: 'Mở ngân hàng câu hỏi',
    roadmapCta: 'Theo roadmap',
    sortNewest: 'Mới nhất trước',
    sortOldest: 'Cũ nhất trước',
    sortTitle: 'Tiêu đề A-Z',
    searchPlaceholder: 'Tìm ghi chú, tag, hoặc series',
    allCategories: 'Tất cả chủ đề',
    noPostsTitle: 'Không có ghi chú nào khớp với chế độ xem này.',
    noPostsDescription: 'Hãy thử từ khóa rộng hơn hoặc đổi bộ lọc hiện tại.',
    loadMore: 'Xem thêm ghi chú',
    startsWithLabel: 'Bắt đầu từ',
    latestLabel: 'Ghi chú mới nhất',
  },
  ja: {
    heroTitle: 'DiCodeWeb Journal',
    heroDescription:
      '実際のWebシステムを作って、壊して、改善する中で残しているフロントエンドのメモです。',
    readLatestCta: '最新を読む',
    browseTracksCta: '学習トラックを見る',
    writingAboutTitle: '最近書いていること',
    writingTopics: [
      'Next.jsアーキテクチャ',
      '認可パターン',
      'フロントエンド面接対策',
      'UIシステム',
    ],
    featuredLabel: 'Featured breakdown',
    whyLabel: 'Why this matters',
    readBreakdownCta: '詳しく読む',
    latestTitle: 'Latest Notes',
    latestDescription:
      'DiCodeWebを作る中で残したメモです。設計判断、トレードオフ、面接前にしっかり理解しておきたいパターンをまとめています。',
    learningTracksTitle: 'Learning Tracks',
    learningTracksDescription: 'ひとつのテーマを複数の記事で追いたいときのための流れです。',
    practiceTitle: '読んだ後に練習する',
    practiceDescription:
      'メモを面接で使える理解に変えます。記事を読んでから、関連する質問を解くか、ロードマップを進めてください。',
    questionBankCta: '問題集を開く',
    roadmapCta: 'ロードマップを見る',
    sortNewest: '新しい順',
    sortOldest: '古い順',
    sortTitle: 'タイトル A-Z',
    searchPlaceholder: 'メモ、タグ、series を検索',
    allCategories: 'すべてのテーマ',
    noPostsTitle: 'この表示条件に合うメモはありません。',
    noPostsDescription: 'もう少し広いキーワードにするか、現在のフィルターを切り替えてください。',
    loadMore: 'さらに読む',
    startsWithLabel: '最初のノート',
    latestLabel: '最新ノート',
  },
};

const featuredWhyItMattersByLocale: Record<HomeLocale, Record<string, string>> = {
  en: {
    'nextjs-16-authorization-patterns':
      'Proxy should stay cheap. Authorization belongs closer to the data.',
    'nextjs-14-app-router':
      'App Router questions are really boundary questions. This note helps you explain them without buzzwords.',
    'building-with-shadcn-ui':
      'Owning the component layer early makes later redesigns and accessibility fixes much less expensive.',
    'why-we-chose-bun':
      'Tooling choices shape onboarding, CI time, and how quickly a team can recover when setup breaks.',
  },
  vi: {
    'nextjs-16-authorization-patterns':
      'Proxy nên giữ nhẹ. Authorization nên nằm gần data hơn.',
    'nextjs-14-app-router':
      'Câu hỏi về App Router thật ra là câu hỏi về boundary. Bài này giúp bạn giải thích rõ mà không cần buzzword.',
    'building-with-shadcn-ui':
      'Sở hữu component layer từ sớm giúp các lần redesign sau này và các đợt sửa accessibility bớt tốn kém hơn nhiều.',
    'why-we-chose-bun':
      'Lựa chọn tooling ảnh hưởng trực tiếp tới onboarding, thời gian CI, và tốc độ hồi phục khi setup bị lỗi.',
  },
  ja: {
    'nextjs-16-authorization-patterns':
      'Proxy は軽く保ち、認可はデータの近くで扱うべきです。',
    'nextjs-14-app-router':
      'App Router の質問は、実際には責務の境界をどう切るかという質問です。',
    'building-with-shadcn-ui':
      'コンポーネント層を自分たちで持つと、後からの再設計やアクセシビリティ修正の負担が大きく下がります。',
    'why-we-chose-bun':
      'ツール選定は、オンボーディング、CI時間、セットアップが壊れた時の復旧速度まで変えます。',
  },
};

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

function getWhyItMatters(post: BlogPost, locale: HomeLocale) {
  return (
    featuredWhyItMattersByLocale[locale][post.slug] ??
    featuredWhyItMattersByLocale.en[post.slug] ??
    resolvePostForLocale(post, locale).excerpt
  );
}

export function BlogIndex({ posts, series }: { posts: BlogPost[]; series: BlogSeries[] }) {
  const locale = useSyncExternalStore<HomeLocale>(
    subscribeToLocaleChange,
    getPreferredLocale,
    () => 'en',
  );
  const copy = editorialIndexCopy[locale];
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

  const featuredPost = useMemo(() => posts.slice(0, FEATURED_POST_COUNT)[0] ?? null, [posts]);

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
              displayPost.level,
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

  const isDefaultView = !query.trim() && activeCategory === 'All' && sortMode === 'newest';
  const postsForList = useMemo(() => {
    if (!featuredPost || !isDefaultView) {
      return filteredPosts;
    }

    return filteredPosts.filter((post) => post.slug !== featuredPost.slug);
  }, [featuredPost, filteredPosts, isDefaultView]);

  const visiblePosts = postsForList.slice(0, visibleCount);
  const hasMore = visibleCount < postsForList.length;

  return (
    <div className="pb-24">
      <section className="blog-panel relative overflow-hidden rounded-[1.5rem] px-5 py-6 md:px-8 md:py-8 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start xl:gap-8">
        <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(24,34,48,0.03),transparent_44%,rgba(24,34,48,0.06))] dark:bg-[linear-gradient(140deg,rgba(255,255,255,0.01),transparent_44%,rgba(130,148,168,0.05))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(108,122,140,0.28),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]" />

        <div className="relative">
          <h1 className="text-foreground max-w-3xl text-[2.6rem] leading-[0.98] font-semibold tracking-[-0.06em] md:text-[4rem]">
            {copy.heroTitle}
          </h1>

          <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-7 md:text-base">
            {copy.heroDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="#latest-notes"
              className="blog-primary-action inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-[1px]"
            >
              {copy.readLatestCta}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="#learning-tracks"
              className="blog-secondary-action inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {copy.browseTracksCta}
            </Link>
          </div>
        </div>

        <aside className="blog-soft-panel relative mt-6 rounded-[1.2rem] p-5 xl:mt-0">
          <p className="blog-kicker font-mono text-[11px] uppercase tracking-[0.18em]">
            {copy.writingAboutTitle}
          </p>

          <ul className="mt-4 space-y-3">
            {copy.writingTopics.map((topic, index) => (
              <li
                key={topic}
                className="flex items-start gap-3 border-t border-border/60 pt-3 first:border-t-0 first:pt-0"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-foreground text-sm leading-6">{topic}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {featuredPost ? (
        <section className="mt-14">
          <EditorialFeaturedArticle
            post={featuredPost}
            label={copy.featuredLabel}
            whyLabel={copy.whyLabel}
            whyItMatters={getWhyItMatters(featuredPost, locale)}
            cta={copy.readBreakdownCta}
          />
        </section>
      ) : null}

      <section id="latest-notes" className="mt-16">
        <div className="flex flex-col gap-6 border-b border-border/80 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-foreground text-3xl leading-tight font-semibold tracking-[-0.04em] md:text-[2.35rem]">
              {copy.latestTitle}
            </h2>

            <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7">
              {copy.latestDescription}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[420px]">
            <label className="blog-soft-panel flex items-center gap-3 rounded-full px-4 py-3 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Search notes</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder={copy.searchPlaceholder}
                className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent outline-none"
              />
            </label>

            <label className="blog-soft-panel flex items-center justify-between rounded-full px-4 py-3 text-sm text-muted-foreground">
              <span className="sr-only">Sort notes</span>
              <span>{sortMode === 'newest' ? copy.sortNewest : sortMode === 'oldest' ? copy.sortOldest : copy.sortTitle}</span>
              <select
                value={sortMode}
                onChange={(event) => {
                  setSortMode(event.target.value as SortMode);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="text-foreground min-w-[8.5rem] bg-transparent text-right outline-none"
                aria-label="Sort notes"
              >
                <option value="newest">{copy.sortNewest}</option>
                <option value="oldest">{copy.sortOldest}</option>
                <option value="title">{copy.sortTitle}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
                    ? 'border-[#32455d]/18 bg-[#32455d] text-white dark:border-[#d8e3ef]/18 dark:bg-[#d8e3ef] dark:text-[#13202f]'
                    : 'blog-soft-panel text-muted-foreground hover:border-[#41566f] hover:text-[#203143] dark:hover:border-[#d8e3ef]/18 dark:hover:text-[#eef3f8]'
                }`}
              >
                {localizedCategoryLabel(category)}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {formatBlogArticleCount(postsForList.length, locale)}
          </span>

          {activeCategory !== 'All' ? (
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {formatBlogCategory(activeCategory, locale)}
            </span>
          ) : null}
        </div>

        {postsForList.length > 0 ? (
          <div className="mt-2">
            {visiblePosts.map((post, index) => (
              <EditorialArticleRow
                key={post.slug}
                post={post}
                index={index + 1}
                seriesTitle={post.series?.slug ? seriesBySlug.get(post.series.slug)?.title : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="blog-soft-panel mt-6 rounded-[1.2rem] border-dashed px-6 py-10 text-center">
            <p className="text-foreground text-lg font-semibold">
              {copy.noPostsTitle}
            </p>

            <p className="text-muted-foreground mt-2 text-sm leading-7">
              {copy.noPostsDescription}
            </p>
          </div>
        )}

        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
              className="blog-secondary-action rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
            >
              {copy.loadMore}
            </button>
          </div>
        ) : null}
      </section>

      <section id="learning-tracks" className="mt-18">
        <div className="flex flex-col gap-3">
          <h2 className="text-foreground text-3xl leading-tight font-semibold tracking-[-0.04em] md:text-[2.2rem]">
            {copy.learningTracksTitle}
          </h2>

          <p className="text-muted-foreground max-w-2xl text-sm leading-7">
            {copy.learningTracksDescription}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {series.map((seriesEntry, index) => (
            <LearningTrackCard
              key={seriesEntry.slug}
              index={index}
              series={seriesEntry}
              startLabel={copy.startsWithLabel}
              latestLabel={copy.latestLabel}
            />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="blog-panel rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(28,40,56,0.02),rgba(28,40,56,0.05))] p-6 md:p-8 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.03))]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-foreground text-3xl leading-tight font-semibold tracking-[-0.04em] md:text-[2.15rem]">
                {copy.practiceTitle}
              </h2>

              <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7">
                {copy.practiceDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/questions"
                className="blog-primary-action inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-[1px]"
              >
                {copy.questionBankCta}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/roadmap"
                className="blog-secondary-action inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {copy.roadmapCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
