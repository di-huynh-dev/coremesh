'use client';

import type { HomeLocale } from '@/lib/home-content';
import { resolvePostForLocale, type BlogPost, type BlogSeries } from '@/lib/blog';
import {
  formatBlogCategory,
  formatBlogDate,
  formatBlogLevel,
  formatBlogReadingTime,
  formatSeriesPostCount,
  getBlogUiCopy,
} from '@/lib/blog-localization';
import { getPreferredLocale, subscribeToLocaleChange } from '@/lib/site-locale';
import { ArrowRight, BookOpen, Flame } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSyncExternalStore } from 'react';

const CATEGORY_ACCENTS: Record<string, { background: string; accent: string; soft: string }> = {
  Engineering: {
    background: 'linear-gradient(135deg, #141d29 0%, #243247 100%)',
    accent: '#bfd0df',
    soft: 'rgba(191,208,223,0.12)',
  },
  Design: {
    background: 'linear-gradient(135deg, #182230 0%, #30455f 100%)',
    accent: '#c9d7e4',
    soft: 'rgba(201,215,228,0.12)',
  },
  Framework: {
    background: 'linear-gradient(135deg, #101925 0%, #26384f 100%)',
    accent: '#d7e3ef',
    soft: 'rgba(215,227,239,0.12)',
  },
};

export function formatHashTag(tag: string) {
  return `#${tag.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')}`;
}

function useActiveLocale() {
  return useSyncExternalStore<HomeLocale>(subscribeToLocaleChange, getPreferredLocale, () => 'en');
}

function getPostSurface(post: BlogPost) {
  return CATEGORY_ACCENTS[post.category] ?? CATEGORY_ACCENTS.Framework;
}

function ThumbnailArtwork({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  const locale = useActiveLocale();
  const displayPost = resolvePostForLocale(post, locale);
  const surface = getPostSurface(post);

  if (post.image) {
    return (
      <>
        <Image
          src={post.image}
          alt={displayPost.title}
          fill
          sizes={compact ? '(max-width: 768px) 100vw, 188px' : '(max-width: 1280px) 100vw, 33vw'}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,27,58,0.12),rgba(7,27,58,0.02)_45%,rgba(7,27,58,0.3))]" />
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-0" style={{ background: surface.background }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_15%_80%,rgba(255,255,255,0.06),transparent_30%)]" />
      <div className="absolute inset-0 opacity-24">
        <div className="absolute top-5 left-10 h-px w-18 rotate-12 bg-white/40" />
        <div className="absolute top-9 left-22 h-px w-16 -rotate-12 bg-white/30" />
        <div className="absolute top-13 left-30 h-px w-12 rotate-12 bg-white/25" />
      </div>
      {compact ? (
        <div className="absolute bottom-3 left-4 max-w-[130px]">
          <p className="line-clamp-2 text-[9px] leading-[1.35] font-semibold text-white">
            {displayPost.title}
          </p>
        </div>
      ) : null}
    </>
  );
}

export function PostThumbnail({ post }: { post: BlogPost }) {
  return (
    <div className="relative h-[96px] w-full shrink-0 overflow-hidden rounded-[6px] md:h-[100px] md:w-[188px]">
      <ThumbnailArtwork post={post} compact />
      <div className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/18 text-white">
        <BookOpen className="h-4 w-4" />
      </div>
    </div>
  );
}

export function FeaturedPostCard({
  post,
  label,
  cta,
}: {
  post: BlogPost;
  label?: string;
  cta?: string;
}) {
  const locale = useActiveLocale();
  const copy = getBlogUiCopy(locale);
  const displayPost = resolvePostForLocale(post, locale);
  const primaryTag = displayPost.tags[0] ?? displayPost.category;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-[1.45rem] border border-[#dacdbf] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_100%)] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_34px_rgba(65,48,24,0.08),0_2px_10px_rgba(15,68,122,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#cdb9a4] hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_22px_48px_rgba(65,48,24,0.12),0_6px_18px_rgba(15,68,122,0.08)]"
    >
      <div className="relative h-44 overflow-hidden border-b border-[#e7ddd1]">
        <ThumbnailArtwork post={post} />
        <div className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/18 bg-[#071B3A]/35 text-white backdrop-blur-sm">
          <BookOpen className="h-4 w-4" />
        </div>
      </div>

      <div className="flex h-[calc(100%-11rem)] flex-col p-5">
        <div className="text-muted-foreground flex items-center gap-3 text-xs font-medium uppercase">
          <span>{label ?? formatBlogCategory(displayPost.category, locale)}</span>
          {label ? null : <span className="h-1 w-1 rounded-full bg-current/40" />}
          <span>{formatBlogReadingTime(displayPost.readingTime, locale)}</span>
        </div>

        <h3 className="mt-4 pr-8 text-[1.45rem] leading-[1.3] font-semibold tracking-[-0.02em] text-[#202124] transition-colors group-hover:text-[#071B3A] dark:text-[#F5F7FB]">
          {displayPost.title}
        </h3>

        <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-7">
          {displayPost.excerpt}
        </p>

        <div className="text-muted-foreground mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span>{formatBlogDate(displayPost.publishedAt, locale)}</span>

            <span className="border-b border-current pb-0.5 font-medium text-[#202124] dark:text-[#E7EDF8]">
              {formatHashTag(primaryTag)}
            </span>
          </div>

          <span className="text-accent inline-flex items-center gap-2 font-medium">
            {cta ?? copy.keepReadingCta}
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function WhatsNewCard({ post }: { post: BlogPost }) {
  const locale = useActiveLocale();
  const copy = getBlogUiCopy(locale);

  return <FeaturedPostCard post={post} label={copy.whatsNewLabel} cta={copy.readArticle} />;
}

function formatEditorialIndex(index: number) {
  return String(index).padStart(2, '0');
}

function EditorialMeta({
  post,
  locale,
}: {
  post: ReturnType<typeof resolvePostForLocale>;
  locale: HomeLocale;
}) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
      {[
        formatBlogCategory(post.category, locale),
        formatBlogReadingTime(post.readingTime, locale),
        formatBlogLevel(post.level, locale),
        formatBlogDate(post.publishedAt, locale),
      ].join(' / ')}
    </div>
  );
}

export function EditorialFeaturedArticle({
  post,
  label,
  whyLabel,
  whyItMatters,
  cta,
}: {
  post: BlogPost;
  label: string;
  whyLabel: string;
  whyItMatters: string;
  cta: string;
}) {
  const locale = useActiveLocale();
  const displayPost = resolvePostForLocale(post, locale);
  const primaryTag = displayPost.tags[0] ?? displayPost.category;

  return (
    <article className="blog-panel grid gap-6 overflow-hidden rounded-[1.3rem] p-4 md:p-6 xl:grid-cols-[minmax(0,1.05fr)_360px] xl:items-stretch">
      <div className="flex min-w-0 flex-col">
        <div>
          <p className="blog-kicker font-mono text-[11px] uppercase tracking-[0.18em]">
            {label}
          </p>

          <Link href={`/blog/${post.slug}`} className="mt-4 block">
            <h2 className="text-foreground max-w-3xl text-3xl leading-[1.08] font-semibold tracking-[-0.04em] transition-colors hover:text-[#2c4057] md:text-[2.45rem] dark:hover:text-[#dbe6f2]">
              {displayPost.title}
            </h2>
          </Link>

          <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-7 md:text-[15px]">
            {displayPost.excerpt}
          </p>
        </div>

        <div className="blog-soft-panel mt-6 rounded-[1rem] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {whyLabel}
          </p>
          <p className="mt-2 text-sm leading-7 text-[#465568] dark:text-[#d6dce5]">
            {whyItMatters}
          </p>
        </div>

        <div className="mt-6">
          <EditorialMeta post={displayPost} locale={locale} />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {formatHashTag(primaryTag)}
          </span>

          <Link
            href={`/blog/${post.slug}`}
            className="blog-primary-action inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all hover:-translate-y-[1px]"
          >
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <Link
        href={`/blog/${post.slug}`}
        className="group relative min-h-[260px] overflow-hidden rounded-[1rem] border border-border/70 bg-[#131c28]"
      >
        <ThumbnailArtwork post={post} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,28,40,0.08),rgba(18,28,40,0.56))]" />
        <div className="absolute left-4 top-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/88">
          {formatHashTag(primaryTag)}
        </div>
      </Link>
    </article>
  );
}

export function EditorialArticleRow({
  post,
  index,
  seriesTitle,
}: {
  post: BlogPost;
  index: number;
  seriesTitle?: string;
}) {
  const locale = useActiveLocale();
  const displayPost = resolvePostForLocale(post, locale);
  const primaryTag = displayPost.tags[0] ?? displayPost.category;

  return (
    <article className="border-t border-border/70 first:border-t-0">
      <Link
        href={`/blog/${post.slug}`}
        className="grid gap-4 py-5 transition-colors hover:bg-black/[0.015] md:grid-cols-[48px_minmax(0,1fr)_188px] md:gap-6 md:py-6 dark:hover:bg-white/[0.015]"
      >
        <div className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted-foreground">
          {formatEditorialIndex(index)}
        </div>

        <div className="min-w-0">
          <EditorialMeta post={displayPost} locale={locale} />

          <h3 className="text-foreground mt-3 text-[1.3rem] leading-[1.22] font-semibold tracking-[-0.03em] transition-colors hover:text-[#2d4157] md:text-[1.55rem] dark:hover:text-[#dde6f0]">
            {displayPost.title}
          </h3>

          <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7">
            {displayPost.excerpt}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#5a687d] dark:text-[#a8b5c7]">
              {formatHashTag(primaryTag)}
            </span>

            <span className="blog-soft-panel inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-foreground">
              {formatBlogLevel(displayPost.level, locale)}
            </span>

            {seriesTitle ? (
              <span className="text-muted-foreground text-xs uppercase tracking-[0.14em]">
                {seriesTitle}
              </span>
            ) : null}
          </div>

          <div className="mt-4 md:hidden">
            <PostThumbnail post={post} />
          </div>
        </div>

        <div className="hidden md:block">
          <PostThumbnail post={post} />
        </div>
      </Link>
    </article>
  );
}

export function LearningTrackCard({
  index,
  series,
  startLabel,
  latestLabel,
}: {
  index: number;
  series: BlogSeries;
  startLabel: string;
  latestLabel: string;
}) {
  const locale = useActiveLocale();
  const firstPost = series.posts[0];
  const latestPost = series.posts[series.posts.length - 1];
  const updatedAt = series.updatedAt ?? latestPost?.publishedAt;

  return (
    <Link
      href={`/blog/series/${series.slug}`}
      className="blog-panel group flex h-full flex-col rounded-[1.2rem] p-5 transition-all hover:-translate-y-[1px] hover:border-[#4c6078]"
    >
      <div className="flex items-start gap-4">
        <div className="flex shrink-0 flex-col items-center pt-0.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {formatEditorialIndex(index + 1)}
          </span>
          <span className="mt-3 h-16 w-px bg-border/80" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-foreground text-xl leading-tight font-semibold tracking-[-0.03em] transition-colors group-hover:text-[#30455d] dark:group-hover:text-[#dde6f0]">
              {series.title}
            </h3>

            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {formatSeriesPostCount(series.posts.length, locale)}
            </span>
          </div>

          <p className="text-muted-foreground mt-3 text-sm leading-7">{series.description}</p>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {startLabel}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-[#202124] dark:text-[#F5F7FB]">
                {firstPost ? resolvePostForLocale(firstPost, locale).title : series.title}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {latestLabel}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-[#202124] dark:text-[#F5F7FB]">
                {updatedAt ? formatBlogDate(updatedAt, locale) : formatBlogLevel(series.level, locale)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Link>
  );
}

export function BlogListItem({ post }: { post: BlogPost; seriesTitle?: string }) {
  const locale = useActiveLocale();
  const displayPost = resolvePostForLocale(post, locale);
  const primaryTag = displayPost.tags[0] ?? displayPost.category;
  const secondaryTag = displayPost.tags[1];

  return (
    <article className="group border-border bg-card rounded-[10px] border transition-colors hover:border-[#C9D1DC]">
      <Link
        href={`/blog/${post.slug}`}
        className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:gap-7 md:px-10"
      >
        <PostThumbnail post={post} />

        <div className="min-w-0 flex-1">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase">
            <span>{formatBlogCategory(displayPost.category, locale)}</span>
            <span>{formatBlogReadingTime(displayPost.readingTime, locale)}</span>
            <span>{formatBlogDate(displayPost.publishedAt, locale)}</span>
          </div>

          <h3 className="mt-3 line-clamp-2 text-[1.35rem] leading-[1.25] font-semibold tracking-[-0.02em] text-[#202124] md:text-[1.55rem] dark:text-[#F5F7FB]">
            {displayPost.title}
          </h3>

          <p className="text-muted-foreground mt-3 line-clamp-2 max-w-3xl text-sm leading-7">
            {displayPost.excerpt}
          </p>

          <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span className="flex items-center gap-2 text-[#5b6a81] dark:text-[#A9B0BD]">
              <Flame className="h-4 w-4 text-[#A9B0BD]" />
              <span>{formatBlogLevel(displayPost.level, locale)}</span>
            </span>

            <span className="border-b border-[#202124]/70 pb-0.5 text-[#202124] dark:border-white/70 dark:text-[#F5F7FB]">
              {formatHashTag(primaryTag)}
            </span>

            {secondaryTag ? (
              <span className="border-b border-[#202124]/70 pb-0.5 text-[#202124] dark:border-white/70 dark:text-[#F5F7FB]">
                {formatHashTag(secondaryTag)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="hidden shrink-0 items-center justify-center md:flex">
          <ArrowRight className="text-muted-foreground group-hover:text-foreground h-6 w-6 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </article>
  );
}

export function SeriesItem({ index, series }: { index: number; series: BlogSeries }) {
  const locale = useActiveLocale();

  return (
    <Link
      href={`/blog/series/${series.slug}`}
      className="border-border bg-card hover:border-accent/35 hover:bg-accent/[0.04] flex w-full items-center gap-3 rounded-[1.15rem] border px-4 py-4 text-left transition-all"
    >
      <span className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[#5F6368] dark:text-[#B8C1CF]">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-base leading-6 font-medium text-[#202124] dark:text-[#F5F7FB]">
          {series.title}
        </p>

        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-6">
          {series.description}
        </p>

        <p className="text-muted-foreground mt-2 text-xs font-medium tracking-[0.14em] uppercase">
          {formatSeriesPostCount(series.posts.length, locale)}
        </p>
      </div>

      <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
    </Link>
  );
}
