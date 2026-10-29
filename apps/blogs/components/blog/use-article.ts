"use client";

import type { BlogHeading } from "@/lib/content/types";
import { useEffect, useState } from "react";

// Reading geometry shared by the progress bar, the resume prompt and both tables of contents.
// A post counts as started once its body reaches the top quarter of the viewport, and as
// finished when its last 60% of a viewport is on screen.
const START_OFFSET = 0.25;
const END_OFFSET = 0.6;

/** How far the reader is through `target`, 0..1. */
export function measureProgress(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const total = rect.height - window.innerHeight * END_OFFSET;
  const read = -rect.top + window.innerHeight * START_OFFSET;
  return Math.min(Math.max(read / Math.max(total, 1), 0), 1);
}

/** Inverse of measureProgress: scrolls so that `target` reads as `progress`. */
export function scrollToProgress(target: HTMLElement, progress: number) {
  const rect = target.getBoundingClientRect();
  const total = rect.height - window.innerHeight * END_OFFSET;
  const top = window.scrollY + rect.top + progress * total - window.innerHeight * START_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

/** Live reading progress through the element with `targetId`, updated once per frame. */
export function useArticleProgress(targetId: string) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      setProgress(measureProgress(target));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return progress;
}

/** The heading the reader is in: the last one that has scrolled past the top band. */
export function useActiveHeading(headings: BlogHeading[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const update = () => {
      let current: string | null = null;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= 120) current = el.id;
        else break;
      }
      setActiveId(current ?? elements[0]!.id);
    };

    const observer = new IntersectionObserver(update, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: [0, 1],
    });
    elements.forEach((el) => observer.observe(el));
    update();

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}
