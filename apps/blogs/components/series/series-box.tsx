"use client";

import { SeriesTrack } from "@/components/series/series-track";
import type { BlogPostSummary, BlogTopic } from "@/lib/content/types";
import { useReading } from "@/lib/reading-store";
import { topicAccent } from "@/lib/topic-style";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

/** Collapsible "part n of m" card at the top of a post that belongs to a series. */
export function SeriesBox({
  id,
  title,
  topic,
  posts,
  index,
}: {
  id: string;
  title: string;
  topic: BlogTopic;
  posts: BlogPostSummary[];
  index: number;
}) {
  const locale = useLocale();
  const t = useTranslations("post.series");
  const reading = useReading();

  return (
    <details
      className="group/series mb-10 rounded-2xl border border-line bg-paper"
      style={topicAccent(topic)}
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 rounded-2xl p-4 sm:px-5 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="eyebrow before:bg-[var(--accent)]">
            {t("eyebrow", { n: index + 1, total: posts.length })}
          </p>
          <p className="mt-1.5 truncate font-semibold text-ink">{title}</p>
        </div>
        <span aria-hidden className="hidden items-center gap-1 sm:flex">
          {posts.map((post, part) => (
            <span
              key={post.slug}
              className={cn(
                "h-1.5 w-5 rounded-full transition-colors duration-500",
                reading[post.slug]?.readAt || part === index
                  ? "bg-[var(--accent)]"
                  : "bg-line",
                part === index && !reading[post.slug]?.readAt && "opacity-50",
              )}
            />
          ))}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-soft">
          <span className="hidden md:inline">{t("showParts")}</span>
          <ChevronDown aria-hidden className="size-4 transition-transform group-open/series:rotate-180" />
        </span>
      </summary>

      <div className="border-t border-line px-4 pt-5 pb-5 sm:px-5">
        <SeriesTrack posts={posts} currentSlug={posts[index]?.slug} />
        <Link href={`/${locale}/series/${id}`} className="arrow-link mt-6 text-[var(--accent)]">
          {t("viewSeries")}
        </Link>
      </div>
    </details>
  );
}
