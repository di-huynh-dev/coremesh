"use client";

import { scrollToProgress, useArticleProgress } from "@/components/blog/use-article";
import { isInProgress, readingStore } from "@/lib/reading-store";
import { BookOpen, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

/**
 * Thin bar under the navbar that tracks progress through `targetId`. With `slug`, the
 * position is remembered in the reading store so the post can be resumed later.
 */
export function ReadingProgress({ targetId, slug }: { targetId: string; slug?: string }) {
  const progress = useArticleProgress(targetId);
  const scrolled = useRef(false);
  const pending = useRef<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    readingStore.visit(slug);

    // Only a real scroll counts: opening a post at the top must not erase where the reader was.
    const onScroll = () => {
      scrolled.current = true;
    };
    const flush = () => {
      if (pending.current === null) return;
      readingStore.setProgress(slug, pending.current);
      pending.current = null;
    };
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [slug]);

  // Write once scrolling settles; the cleanup above flushes on navigation.
  useEffect(() => {
    if (!slug || !scrolled.current) return;
    pending.current = Math.round(progress * 1000) / 1000;
    const timer = window.setTimeout(() => {
      if (pending.current === null) return;
      readingStore.setProgress(slug, pending.current);
      pending.current = null;
    }, 600);
    return () => window.clearTimeout(timer);
  }, [progress, slug]);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-16 z-40 h-0.5 origin-left bg-cobalt"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}

/** Offers to jump back to where the reader left off, when they reopen an unfinished post. */
export function ResumePrompt({ targetId, slug }: { targetId: string; slug: string }) {
  const t = useTranslations("post.resume");
  const [saved, setSaved] = useState<number | null>(null);

  useEffect(() => {
    // Read the entry as it was when the page opened, before this visit moves it.
    const entry = readingStore.get(slug);
    if (!isInProgress(entry) || window.location.hash || window.scrollY > 200) return;
    setSaved(entry!.progress);

    // Scrolling on from the top means the reader chose to start over.
    const onScroll = () => {
      if (window.scrollY > 600) setSaved(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  if (saved === null) return null;
  const percent = Math.round(saved * 100);

  const resume = () => {
    const target = document.getElementById(targetId);
    if (target) scrollToProgress(target, saved);
    setSaved(null);
  };

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-[4.75rem] z-45 flex justify-center px-4 animate-in fade-in-0 slide-in-from-top-2 duration-300"
    >
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-line bg-card/95 p-2.5 pl-4 shadow-xl backdrop-blur-xl">
        <BookOpen aria-hidden className="hidden size-4 shrink-0 text-cobalt sm:block" />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug font-medium text-ink">{t("title")}</p>
          <span aria-hidden className="mt-1.5 block h-1 overflow-hidden rounded-full bg-line">
            <span className="block h-full rounded-full bg-cobalt" style={{ width: `${percent}%` }} />
          </span>
        </div>
        <button type="button" onClick={resume} className="btn btn-ink h-9 shrink-0 px-3.5 text-[0.8rem]">
          {t("action", { percent })}
        </button>
        <button
          type="button"
          onClick={() => setSaved(null)}
          aria-label={t("dismiss")}
          title={t("dismiss")}
          className="shrink-0 rounded-full p-1.5 text-faint transition-colors hover:bg-paper hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
