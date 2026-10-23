"use client";

import { PostRow } from "@/components/blog/post-row";
import { matchesQuery } from "@/components/layout/search-dialog";
import { BLOG_TOPICS, type BlogLevel, type BlogPostSummary, type BlogTopic } from "@/lib/content/types";
import { topicStyles } from "@/lib/topic-style";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const LEVELS: BlogLevel[] = ["Starter", "Intermediate", "Advanced"];

function isTopic(value: string | null): value is BlogTopic {
  return BLOG_TOPICS.includes(value as BlogTopic);
}

function isLevel(value: string | null): value is BlogLevel {
  return LEVELS.includes(value as BlogLevel);
}

export function ExploreView({ posts }: { posts: BlogPostSummary[] }) {
  const t = useTranslations("explore");
  const tTopics = useTranslations("topics");
  const tLevels = useTranslations("levels");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const topicParam = searchParams.get("topic");
  const levelParam = searchParams.get("level");
  const topic = isTopic(topicParam) ? topicParam : null;
  const level = isLevel(levelParam) ? levelParam : null;
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    // Native history keeps filtering instant: no server round-trip, no route transition.
    window.history.replaceState(null, "", `${pathname}${qs ? `?${qs}` : ""}`);
  };

  const onQueryChange = (value: string) => {
    setQuery(value);
    setParam("q", value.trim() ? value : null);
  };

  const clearAll = () => {
    setQuery("");
    window.history.replaceState(null, "", pathname);
  };

  const searched = useMemo(
    () =>
      posts.filter((post) =>
        matchesQuery(post, query, tTopics(`${post.topic}.title`)),
      ),
    [posts, query, tTopics],
  );

  // Facet counts reflect the other active filters, so chips never lead to an empty list.
  const topicCounts = useMemo(() => {
    const map = new Map<BlogTopic, number>();
    searched
      .filter((post) => !level || post.level === level)
      .forEach((post) => map.set(post.topic, (map.get(post.topic) ?? 0) + 1));
    return map;
  }, [searched, level]);

  const levelCounts = useMemo(() => {
    const map = new Map<BlogLevel, number>();
    searched
      .filter((post) => !topic || post.topic === topic)
      .forEach((post) => {
        if (post.level) map.set(post.level, (map.get(post.level) ?? 0) + 1);
      });
    return map;
  }, [searched, topic]);

  const filtered = useMemo(() => {
    const list = searched.filter(
      (post) =>
        (!topic || post.topic === topic) && (!level || post.level === level),
    );
    return sort === "oldest" ? [...list].reverse() : list;
  }, [searched, topic, level, sort]);

  const byYear = useMemo(() => {
    const groups: { year: string; posts: BlogPostSummary[] }[] = [];
    filtered.forEach((post) => {
      const year = post.date.slice(0, 4);
      const last = groups[groups.length - 1];
      if (last?.year === year) last.posts.push(post);
      else groups.push({ year, posts: [post] });
    });
    return groups;
  }, [filtered]);

  const hasFilters = Boolean(topic || level || query.trim());

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
      <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
        <label className="relative block">
          <span className="sr-only">{t("search")}</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t("search")}
            className="h-11 w-full rounded-xl border border-line bg-background pr-3 pl-10 text-sm text-ink transition outline-none placeholder:text-faint focus:border-cobalt focus:ring-3 focus:ring-cobalt/15"
          />
        </label>

        <fieldset>
          <legend className="eyebrow mb-3">{t("topic")}</legend>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
            <button
              type="button"
              className="chip lg:justify-between"
              aria-pressed={topic === null}
              onClick={() => setParam("topic", null)}
            >
              {t("all")}
              <span className="chip-count">
                {[...topicCounts.values()].reduce((a, b) => a + b, 0)}
              </span>
            </button>
            {BLOG_TOPICS.map((item) => (
              <button
                key={item}
                type="button"
                className="chip lg:justify-between"
                aria-pressed={topic === item}
                onClick={() => setParam("topic", topic === item ? null : item)}
              >
                <span className="flex items-center gap-2">
                  <span className={cn("topic-dot", topicStyles[item].dot)} />
                  {tTopics(`${item}.title`)}
                </span>
                <span className="chip-count">{topicCounts.get(item) ?? 0}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-3">{t("level")}</legend>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((item) => (
              <button
                key={item}
                type="button"
                className="chip"
                aria-pressed={level === item}
                onClick={() => setParam("level", level === item ? null : item)}
              >
                {tLevels(item)}
                <span className="chip-count">{levelCounts.get(item) ?? 0}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="font-mono text-xs text-soft" aria-live="polite">
            {t("results", { count: filtered.length })}
          </p>
          <div className="flex items-center gap-3">
            {hasFilters ? (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 text-sm text-soft hover:text-ink"
              >
                <X className="size-3.5" />
                {t("clear")}
              </button>
            ) : null}
            <div
              role="group"
              aria-label={t("sort")}
              className="inline-flex rounded-full border border-line p-0.5"
            >
              {(["newest", "oldest"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={sort === value}
                  onClick={() => setParam("sort", value === "newest" ? null : value)}
                  className="rounded-full px-3 py-1 text-xs font-medium text-soft transition-colors aria-pressed:bg-ink aria-pressed:text-background"
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {byYear.length > 0 ? (
          byYear.map((group) => (
            <section key={group.year} aria-labelledby={`year-${group.year}`} className="mt-8">
              <h2
                id={`year-${group.year}`}
                className="flex items-baseline gap-3 font-mono text-sm text-faint"
              >
                <span className="text-2xl font-semibold tracking-tight text-ink">
                  {group.year}
                </span>
                <span>{group.posts.length}</span>
              </h2>
              <div className="mt-2">
                {group.posts.map((post) => (
                  <PostRow key={post.slug} post={post} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
            <p className="font-medium text-ink">{t("empty")}</p>
            <p className="mt-1 text-sm text-soft">{t("emptyHint")}</p>
            {hasFilters ? (
              <button type="button" onClick={clearAll} className="btn btn-ghost mt-5">
                {t("clear")}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
