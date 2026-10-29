"use client";

import { formatPostDate } from "@/lib/content/text";
import type { BlogPostSummary } from "@/lib/content/types";
import { countRead, useReading } from "@/lib/reading-store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

// A series reads like a transit line: one stop per part, the line fills in with the
// series colour as parts are read. Colour comes from `--accent` (see topicAccent).

/** Vertical line of stops; `currentSlug` marks the post being read, `detailed` adds excerpts. */
export function SeriesTrack({
  posts,
  currentSlug,
  detailed = false,
  className,
}: {
  posts: BlogPostSummary[];
  currentSlug?: string;
  detailed?: boolean;
  className?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("series");
  const tCommon = useTranslations("common");
  const tPost = useTranslations("post");
  const reading = useReading();

  return (
    <ol className={className}>
      {posts.map((post, index) => {
        const read = Boolean(reading[post.slug]?.readAt);
        const current = post.slug === currentSlug;
        const last = index === posts.length - 1;

        return (
          <li
            key={post.slug}
            className={cn("relative flex gap-4", !last && (detailed ? "pb-9" : "pb-5"))}
          >
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-8 bottom-1 left-[13px] w-0.5 rounded-full transition-colors duration-500",
                  read ? "bg-[var(--accent)]" : "bg-line",
                )}
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[0.7rem] font-semibold transition-colors duration-500",
                read
                  ? "border-[var(--accent)] bg-[var(--accent)] text-background"
                  : current
                    ? "border-[var(--accent)] bg-background text-[var(--accent)] ring-4 ring-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
                    : "border-line bg-background text-faint",
              )}
            >
              {read ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              {detailed ? (
                <p className="font-mono text-xs text-faint">{t("partLabel", { n: index + 1 })}</p>
              ) : null}
              {current ? (
                <p aria-current="page" className="leading-snug font-semibold text-ink">
                  {post.title}
                </p>
              ) : (
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className={cn(
                    "leading-snug text-ink transition-colors hover:text-[var(--accent)]",
                    detailed ? "mt-1 block text-lg font-semibold tracking-[-0.01em] md:text-xl" : "font-medium",
                  )}
                >
                  {post.title}
                </Link>
              )}
              {detailed ? (
                <p className="mt-2 max-w-[62ch] text-[0.95rem] leading-7 text-soft">{post.excerpt}</p>
              ) : null}
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-faint">
                {detailed ? <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time> : null}
                <span>{tCommon("minutes", { minutes: post.readingTime })}</span>
                {read ? <span className="text-topic-performance">{tPost("readMark")}</span> : null}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The same line laid out horizontally, as a compact progress meter. */
export function SeriesLine({ posts, className }: { posts: BlogPostSummary[]; className?: string }) {
  const t = useTranslations("series");
  const reading = useReading();
  const read = countRead(posts, reading);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ol aria-hidden className="flex flex-1 items-center">
        {posts.map((post, index) => {
          const done = Boolean(reading[post.slug]?.readAt);
          return (
            <li key={post.slug} className={cn("flex items-center", index > 0 && "flex-1")}>
              {index > 0 ? (
                <span
                  className={cn(
                    "h-0.5 flex-1 transition-colors duration-500",
                    done ? "bg-[var(--accent)]" : "bg-line",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full border-2 transition-colors duration-500",
                  done ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--accent)] bg-background",
                )}
              />
            </li>
          );
        })}
      </ol>
      <span className="font-mono text-xs whitespace-nowrap text-faint">
        {t("progress", { read, total: posts.length })}
      </span>
    </div>
  );
}
