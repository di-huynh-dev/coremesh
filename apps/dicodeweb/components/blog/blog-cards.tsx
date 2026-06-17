'use client';

import type { BlogPost, BlogSeries } from '@/lib/blog';
import { ArrowRight, BookOpen, Flame } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_ACCENTS: Record<string, { background: string; accent: string; soft: string }> = {
  Engineering: {
    background: 'linear-gradient(135deg, #081A33 0%, #133B6D 100%)',
    accent: '#8BD63F',
    soft: 'rgba(139,214,63,0.16)',
  },
  Design: {
    background: 'linear-gradient(135deg, #123148 0%, #22607E 100%)',
    accent: '#41D7F9',
    soft: 'rgba(65,215,249,0.16)',
  },
  Framework: {
    background: 'linear-gradient(135deg, #071B3A 0%, #0F447A 100%)',
    accent: '#AAF85D',
    soft: 'rgba(170,248,93,0.16)',
  },
};

export function formatHashTag(tag: string) {
  return `#${tag.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
}

function getPostSurface(post: BlogPost) {
  return CATEGORY_ACCENTS[post.category] ?? CATEGORY_ACCENTS.Framework;
}

export function PostThumbnail({ post }: { post: BlogPost }) {
  const surface = getPostSurface(post);

  return (
    <div
      className="relative h-[96px] w-full shrink-0 overflow-hidden rounded-[6px] md:h-[100px] md:w-[188px]"
      style={{ background: surface.background }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_15%_80%,rgba(255,255,255,0.08),transparent_34%)]" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-5 left-10 h-px w-18 rotate-12 bg-white/40" />
        <div className="absolute top-9 left-22 h-px w-16 -rotate-12 bg-white/30" />
        <div className="absolute top-13 left-30 h-px w-12 rotate-12 bg-white/25" />
      </div>

      <div className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.08] text-white backdrop-blur-sm">
        <BookOpen className="h-4 w-4" />
      </div>

      <div className="absolute bottom-3 left-4 max-w-[130px]">
        <p className="line-clamp-2 text-[9px] leading-[1.35] font-semibold text-white">
          {post.title}
        </p>
      </div>
    </div>
  );
}

export function WhatsNewCard({ post }: { post: BlogPost }) {
  const primaryTag = post.tags[0] ?? post.category;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group border-border bg-card hover:border-accent/35 flex h-full flex-col rounded-[1.45rem] border p-5 transition-all"
    >
      <h3 className="pr-8 text-[1.45rem] leading-[1.35] font-semibold tracking-[-0.02em] text-[#202124] transition-colors group-hover:text-[#071B3A] dark:text-[#F5F7FB]">
        {post.title}
      </h3>

      <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-7">{post.excerpt}</p>

      <div className="text-muted-foreground mt-5 flex items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-4">
          <span>{post.date}</span>

          <span className="border-b border-current pb-0.5 font-medium text-[#202124] dark:text-[#E7EDF8]">
            {formatHashTag(primaryTag)}
          </span>
        </div>

        <ArrowRight className="text-muted-foreground group-hover:text-accent h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export function BlogListItem({ post }: { post: BlogPost; seriesTitle?: string }) {
  const primaryTag = post.tags[0] ?? post.category;
  const secondaryTag = post.tags[1];

  return (
    <article className="group border-border bg-card rounded-[10px] border transition-colors hover:border-[#C9D1DC]">
      <Link
        href={`/blog/${post.slug}`}
        className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:gap-7 md:px-10"
      >
        <PostThumbnail post={post} />

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-[20px] leading-tight font-semibold tracking-[-0.02em] text-[#202124] md:text-[24px] dark:text-[#F5F7FB]">
            {post.title}
          </h3>

          <p className="text-muted-foreground mt-2 line-clamp-1 text-[15px] leading-6 md:text-[18px]">
            {post.excerpt}
          </p>

          <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px]">
            <span className="flex items-center gap-2 text-[#2F9FD8]">
              <Flame className="h-5 w-5 text-[#A9B0BD]" />
              <span>{post.level}</span>
            </span>

            <span>{post.date}</span>

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
          {series.posts.length} posts
        </p>
      </div>

      <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
    </Link>
  );
}
