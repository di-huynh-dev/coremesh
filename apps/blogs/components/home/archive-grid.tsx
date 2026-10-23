"use client";

import { BLOG_TOPICS, type BlogPostSummary, type BlogTopic } from "@/lib/content/types";
import { formatPostDate } from "@/lib/content/text";
import { topicStyles } from "@/lib/topic-style";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

/** Dense tile wall of every post; hover or focus a tile to reveal it in the caption bar. */
export function ArchiveGrid({ posts }: { posts: BlogPostSummary[] }) {
  const locale = useLocale();
  const t = useTranslations("home");
  const tTopics = useTranslations("topics");
  const [topic, setTopic] = useState<BlogTopic | null>(null);
  const [peek, setPeek] = useState<BlogPostSummary | null>(null);
  const [phase, setPhase] = useState<"idle" | "pre" | "in">("idle");
  const gridRef = useRef<HTMLUListElement>(null);

  // Tiles start small and transparent, then cascade in once the grid is on screen.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (grid.getBoundingClientRect().top < window.innerHeight * 0.85) return;

    let timer = 0;
    const raf = requestAnimationFrame(() => setPhase("pre"));
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setPhase("in");
        timer = window.setTimeout(() => setPhase("idle"), 2400);
      },
      { threshold: 0.15 },
    );
    observer.observe(grid);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const counts = useMemo(() => {
    const map = new Map<BlogTopic, number>();
    posts.forEach((post) => map.set(post.topic, (map.get(post.topic) ?? 0) + 1));
    return map;
  }, [posts]);

  const visible = topic ? posts.filter((post) => post.topic === topic) : posts;
  const shown = peek ?? visible[0];

  return (
    <div data-fx-skip>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("topicsTitle")}>
        <button
          type="button"
          className="chip"
          aria-pressed={topic === null}
          onClick={() => setTopic(null)}
        >
          {t("archiveAll")}
          <span className="chip-count">{posts.length}</span>
        </button>
        {BLOG_TOPICS.filter((item) => counts.has(item)).map((item) => (
          <button
            key={item}
            type="button"
            className="chip"
            aria-pressed={topic === item}
            onClick={() => setTopic(item)}
          >
            <span className={cn("topic-dot", topicStyles[item].dot)} />
            {tTopics(`${item}.title`)}
            <span className="chip-count">{counts.get(item)}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line">
        <ul
          ref={gridRef}
          className={cn(
            phase === "pre" && "ax-pre",
            phase === "in" && "ax-in",
            "grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1.5 bg-paper p-3 sm:grid-cols-[repeat(auto-fill,minmax(72px,1fr))]",
          )}
          onMouseLeave={() => setPeek(null)}
        >
          {visible.map((post, index) => (
            <li
              key={post.slug}
              className="ax-sq"
              style={{ "--n": index } as React.CSSProperties}
            >
              <Link
                href={`/${locale}/blog/${post.slug}`}
                aria-label={post.title}
                onMouseEnter={() => setPeek(post)}
                onFocus={() => setPeek(post)}
                onBlur={() => setPeek(null)}
                className={cn(
                  "flex aspect-square flex-col justify-between rounded-lg border-l-[3px] p-2 transition-[background-color,transform] duration-200 ease-[var(--ease-site)] hover:scale-[1.08] focus-visible:scale-[1.08]",
                  topicStyles[post.topic].tile,
                  topicStyles[post.topic].border,
                  shown?.slug === post.slug && "ring-2 ring-ink/70",
                )}
              >
                <span className="font-mono text-[0.6rem] text-ink/60">
                  {post.date.slice(2, 7).replace("-", "·")}
                </span>
                <span className="line-clamp-2 text-[0.62rem] leading-tight font-medium text-ink/70">
                  {post.tags[0] ? `#${post.tags[0]}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex min-h-[88px] flex-col justify-center gap-1 border-t border-line bg-background px-5 py-4" aria-live="polite">
          {shown ? (
            <>
              <span className="flex flex-wrap items-center gap-x-3 font-mono text-xs text-faint">
                <span>{formatPostDate(shown.date, locale)}</span>
                <span className={topicStyles[shown.topic].text}>
                  {tTopics(`${shown.topic}.title`)}
                </span>
              </span>
              <Link
                href={`/${locale}/blog/${shown.slug}`}
                className="truncate text-lg font-semibold tracking-[-0.01em] text-ink hover:text-cobalt"
                tabIndex={-1}
              >
                {shown.title}
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
