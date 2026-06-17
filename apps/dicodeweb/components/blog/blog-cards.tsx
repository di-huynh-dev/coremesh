'use client';

import type { BlogPost, BlogSeries } from '@/lib/blog';
import { ArrowRight, BookOpen, Flame } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

function ThumbnailArtwork({
  post,
  compact = false,
}: {
  post: BlogPost;
  compact?: boolean;
}) {
  const surface = getPostSurface(post);

  if (post.image) {
    return (
      <>
        <Image
          src={post.image}
          alt={post.title}
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
      <div
        className="absolute inset-0"
        style={{ background: surface.background }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_15%_80%,rgba(255,255,255,0.08),transparent_34%)]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-5 left-10 h-px w-18 rotate-12 bg-white/40" />
        <div className="absolute top-9 left-22 h-px w-16 -rotate-12 bg-white/30" />
        <div className="absolute top-13 left-30 h-px w-12 rotate-12 bg-white/25" />
      </div>
      {compact ? (
        <div className="absolute bottom-3 left-4 max-w-[130px]">
          <p className="line-clamp-2 text-[9px] leading-[1.35] font-semibold text-white">
            {post.title}
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
      <div className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.08] text-white backdrop-blur-sm">
        <BookOpen className="h-4 w-4" />
      </div>
    </div>
  );
}

export function FeaturedPostCard({
  post,
  label,
  cta = 'Keep reading',
}: {
  post: BlogPost;
  label?: string;
  cta?: string;
}) {
  const primaryTag = post.tags[0] ?? post.category;

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
          <span>{label ?? post.category}</span>
          {label ? null : <span className="h-1 w-1 rounded-full bg-current/40" />}
          <span>{post.readingTime} min read</span>
        </div>

        <h3 className="mt-4 pr-8 text-[1.45rem] leading-[1.3] font-semibold tracking-[-0.02em] text-[#202124] transition-colors group-hover:text-[#071B3A] dark:text-[#F5F7FB]">
          {post.title}
        </h3>

        <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-7">{post.excerpt}</p>

        <div className="text-muted-foreground mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span>{post.date}</span>

            <span className="border-b border-current pb-0.5 font-medium text-[#202124] dark:text-[#E7EDF8]">
              {formatHashTag(primaryTag)}
            </span>
          </div>

          <span className="text-accent inline-flex items-center gap-2 font-medium">
            {cta}
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function WhatsNewCard({ post }: { post: BlogPost }) {
  return <FeaturedPostCard post={post} label="What&apos;s new" cta="Read article" />;
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
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase">
            <span>{post.category}</span>
            <span>{post.readingTime} min read</span>
            <span>{post.date}</span>
          </div>

          <h3 className="mt-3 line-clamp-2 text-[1.35rem] leading-[1.25] font-semibold tracking-[-0.02em] text-[#202124] dark:text-[#F5F7FB] md:text-[1.55rem]">
            {post.title}
          </h3>

          <p className="text-muted-foreground mt-3 line-clamp-2 max-w-3xl text-sm leading-7">
            {post.excerpt}
          </p>

          <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span className="flex items-center gap-2 text-[#5b6a81] dark:text-[#A9B0BD]">
              <Flame className="h-4 w-4 text-[#A9B0BD]" />
              <span>{post.level}</span>
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
