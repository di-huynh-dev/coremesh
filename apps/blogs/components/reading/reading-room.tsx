"use client";

import { ProgressRing } from "@/components/blog/read-mark";
import { TopicTag } from "@/components/blog/topic-tag";
import { SeriesLine } from "@/components/series/series-track";
import { formatPostDate } from "@/lib/content/text";
import { BLOG_TOPICS, type BlogPostSummary, type BlogTopic } from "@/lib/content/types";
import {
  countRead,
  isInProgress,
  nextUnread,
  readingStore,
  useHydrated,
  useReading,
  type ReadingEntry,
} from "@/lib/reading-store";
import { topicAccent, topicStyles } from "@/lib/topic-style";
import { cn } from "@/lib/utils";
import { ArrowRight, BookmarkX, Check, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";

export interface ReadingSeries {
  id: string;
  title: string;
  topic: BlogTopic;
  posts: BlogPostSummary[];
}

interface Item {
  post: BlogPostSummary;
  entry: ReadingEntry;
}

const newest = (key: "visitedAt" | "savedAt" | "readAt") => (a: Item, b: Item) =>
  (b.entry[key] ?? "").localeCompare(a.entry[key] ?? "");

/** The reader's own corner, built entirely from the reading store in this browser. */
export function ReadingRoom({ posts, series }: { posts: BlogPostSummary[]; series: ReadingSeries[] }) {
  const t = useTranslations("reading");
  const hydrated = useHydrated();
  const reading = useReading();

  // Only posts published in this locale; a Vietnamese-only post read on /vi is skipped on /en.
  const items = useMemo(() => {
    const bySlug = new Map(posts.map((post) => [post.slug, post]));
    return Object.entries(reading).flatMap(([slug, entry]) => {
      const post = bySlug.get(slug);
      return post ? [{ post, entry }] : [];
    });
  }, [posts, reading]);

  if (!hydrated) return <div className="min-h-[40vh]" aria-busy="true" />;

  const inProgress = items.filter((item) => isInProgress(item.entry)).sort(newest("visitedAt"));
  const saved = items.filter((item) => item.entry.savedAt).sort(newest("savedAt"));
  const finished = items.filter((item) => item.entry.readAt).sort(newest("readAt"));
  const following = series.filter((s) => {
    const read = countRead(s.posts, reading);
    return read > 0 && read < s.posts.length;
  });

  if (inProgress.length + saved.length + finished.length === 0) {
    return <EmptyState series={series} />;
  }

  const stats = [
    { value: finished.length, label: t("stats.read") },
    { value: finished.reduce((sum, item) => sum + item.post.readingTime, 0), label: t("stats.minutes") },
    { value: inProgress.length, label: t("stats.inProgress") },
    { value: saved.length, label: t("stats.saved") },
  ];

  return (
    <div className="space-y-14">
      <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line sm:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col-reverse gap-1 p-5",
              index % 2 === 1 && "border-l border-line",
              index >= 2 && "border-t border-line sm:border-t-0",
              index === 2 && "sm:border-l",
            )}
          >
            <dt className="font-mono text-xs text-faint">{stat.label}</dt>
            <dd className="text-3xl font-bold tracking-[-0.03em] text-ink tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div className="min-w-0 space-y-14">
          {inProgress.length > 0 ? (
            <Shelf id="in-progress" title={t("inProgress")} count={inProgress.length}>
              {inProgress.map(({ post, entry }) => (
                <Row
                  key={post.slug}
                  post={post}
                  meta={
                    <span className="inline-flex items-center gap-1.5 text-cobalt">
                      <ProgressRing value={entry.progress} />
                      {Math.round(entry.progress * 100)}%
                    </span>
                  }
                  progress={entry.progress}
                  action={{ label: t("forget"), icon: X, onClick: () => readingStore.forget(post.slug) }}
                  cta={t("resume")}
                />
              ))}
            </Shelf>
          ) : null}

          {saved.length > 0 ? (
            <Shelf id="saved" title={t("saved")} count={saved.length}>
              {saved.map(({ post, entry }) => (
                <Row
                  key={post.slug}
                  post={post}
                  meta={<SavedOn date={entry.savedAt!} />}
                  action={{
                    label: t("unsave"),
                    icon: BookmarkX,
                    onClick: () => readingStore.toggleSaved(post.slug),
                  }}
                />
              ))}
            </Shelf>
          ) : null}

          {finished.length > 0 ? (
            <Shelf id="finished" title={t("finished")} count={finished.length}>
              {finished.map(({ post, entry }) => (
                <Row
                  key={post.slug}
                  post={post}
                  compact
                  meta={<ReadOn date={entry.readAt!} />}
                  action={{ label: t("forget"), icon: X, onClick: () => readingStore.forget(post.slug) }}
                />
              ))}
            </Shelf>
          ) : null}
        </div>

        <aside className="space-y-10">
          {following.length > 0 ? <Following series={following} /> : null}
          {finished.length > 0 ? <TopicMix items={finished} /> : null}
          <ClearHistory />
        </aside>
      </div>
    </div>
  );
}

function Shelf({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="flex items-baseline gap-3 border-b border-line pb-3">
        <span className="text-xl font-bold tracking-[-0.02em] text-ink">{title}</span>
        <span className="font-mono text-sm text-faint">{count}</span>
      </h2>
      <ul>{children}</ul>
    </section>
  );
}

function Row({
  post,
  meta,
  progress,
  action,
  cta,
  compact = false,
}: {
  post: BlogPostSummary;
  meta: ReactNode;
  progress?: number;
  action: { label: string; icon: typeof X; onClick: () => void };
  cta?: string;
  compact?: boolean;
}) {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const href = `/${locale}/blog/${post.slug}`;
  const Icon = action.icon;

  return (
    <li className={cn("group flex items-start gap-4 border-b border-line", compact ? "py-3.5" : "py-5")}>
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className={cn(
            "leading-snug text-ink transition-colors hover:text-cobalt",
            compact ? "font-medium" : "text-lg font-semibold tracking-[-0.01em]",
          )}
        >
          {post.title}
        </Link>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-faint">
          {!compact ? <TopicTag topic={post.topic} /> : null}
          <span>{tCommon("minutes", { minutes: post.readingTime })}</span>
          {meta}
        </p>
        {progress !== undefined ? (
          <span aria-hidden className="mt-3 block h-1 max-w-sm overflow-hidden rounded-full bg-line">
            <span className="block h-full rounded-full bg-cobalt" style={{ width: `${progress * 100}%` }} />
          </span>
        ) : null}
      </div>
      {cta ? (
        <Link href={href} className="btn btn-ghost hidden h-9 shrink-0 px-3.5 text-[0.8rem] sm:inline-flex">
          {cta}
          <ArrowRight className="btn-arrow size-3.5" />
        </Link>
      ) : null}
      <button
        type="button"
        onClick={action.onClick}
        aria-label={`${action.label}: ${post.title}`}
        title={action.label}
        className="shrink-0 rounded-full p-2 text-faint transition-colors hover:bg-paper hover:text-ink"
      >
        <Icon className="size-4" />
      </button>
    </li>
  );
}

function SavedOn({ date }: { date: string }) {
  const t = useTranslations("reading");
  const locale = useLocale();
  return <span>{t("savedOn", { date: formatPostDate(date, locale) })}</span>;
}

function ReadOn({ date }: { date: string }) {
  const t = useTranslations("reading");
  const locale = useLocale();
  return (
    <span className="inline-flex items-center gap-1 text-topic-performance">
      <Check aria-hidden className="size-3.5" />
      {t("readOn", { date: formatPostDate(date, locale) })}
    </span>
  );
}

function Following({ series }: { series: ReadingSeries[] }) {
  const t = useTranslations("reading");
  const locale = useLocale();
  const reading = useReading();

  return (
    <section aria-labelledby="following">
      <h2 id="following" className="eyebrow">
        {t("series")}
      </h2>
      <ul className="mt-4 space-y-3">
        {series.map((item) => {
          const next = nextUnread(item.posts, reading);
          return (
            <li key={item.id} className="rounded-2xl border border-line p-4" style={topicAccent(item.topic)}>
              <Link
                href={`/${locale}/series/${item.id}`}
                className="font-semibold text-ink transition-colors hover:text-[var(--accent)]"
              >
                {item.title}
              </Link>
              <SeriesLine posts={item.posts} className="mt-3" />
              {next >= 0 ? (
                <Link
                  href={`/${locale}/blog/${item.posts[next]!.slug}`}
                  className="group mt-3 block border-t border-line pt-3 text-sm"
                >
                  <span className="font-mono text-xs text-[var(--accent)]">
                    {t("nextPart", { n: next + 1 })}
                  </span>
                  <span className="mt-0.5 block text-ink transition-colors group-hover:text-[var(--accent)]">
                    {item.posts[next]!.title}
                  </span>
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Stacked bar of finished posts by topic. */
function TopicMix({ items }: { items: Item[] }) {
  const t = useTranslations("reading");
  const tTopics = useTranslations("topics");
  const counts = BLOG_TOPICS.map((topic) => ({
    topic,
    count: items.filter((item) => item.post.topic === topic).length,
  }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <section aria-labelledby="topic-mix">
      <h2 id="topic-mix" className="eyebrow">
        {t("byTopic")}
      </h2>
      <div aria-hidden className="mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full">
        {counts.map((row) => (
          <span key={row.topic} className={topicStyles[row.topic].dot} style={{ flexGrow: row.count }} />
        ))}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {counts.map((row) => (
          <li key={row.topic} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-ink">
              <span className={cn("topic-dot", topicStyles[row.topic].dot)} />
              {tTopics(`${row.topic}.title`)}
            </span>
            <span className="font-mono text-xs text-faint">
              {Math.round((row.count / items.length) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ClearHistory() {
  const t = useTranslations("reading");
  return (
    <div className="border-t border-line pt-6">
      <p className="text-sm leading-6 text-soft">{t("privacy")}</p>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(t("clearConfirm"))) readingStore.clear();
        }}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-soft transition-colors hover:text-destructive"
      >
        <Trash2 className="size-4" />
        {t("clear")}
      </button>
    </div>
  );
}

function EmptyState({ series }: { series: ReadingSeries[] }) {
  const t = useTranslations("reading");
  const tSeries = useTranslations("series");
  const locale = useLocale();

  return (
    <div className="space-y-12">
      <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
        <p className="text-lg font-semibold text-ink">{t("emptyTitle")}</p>
        <p className="mx-auto mt-2 max-w-md leading-7 text-soft">{t("emptyBody")}</p>
        <Link href={`/${locale}/blog`} className="btn btn-ink mt-6">
          {t("emptyCta")}
          <ArrowRight className="btn-arrow size-4" />
        </Link>
      </div>

      {series.length > 0 ? (
        <section aria-labelledby="start-series">
          <h2 id="start-series" className="eyebrow">
            {t("startWith")}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {series.map((item) => (
              <li key={item.id} style={topicAccent(item.topic)}>
                <Link
                  href={`/${locale}/blog/${item.posts[0]!.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line p-5 transition-colors hover:border-[var(--accent)]"
                >
                  <span className="font-mono text-xs text-[var(--accent)]">
                    {tSeries("parts", { count: item.posts.length })}
                  </span>
                  <span className="mt-1 font-semibold text-ink">{item.title}</span>
                  <span className="mt-auto pt-3 text-sm text-soft group-hover:text-ink">
                    {tSeries("start")} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
