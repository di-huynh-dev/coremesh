"use client";

import { useEffect } from "react";

/**
 * Heading "#" links (added by lib/content/mdx.tsx) jump to their section and copy its URL.
 * Delegated on `targetId`, since the article markup is server-rendered MDX.
 */
export function HeadingAnchors({ targetId, copiedLabel }: { targetId: string; copiedLabel: string }) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;

    const timers: number[] = [];
    const onClick = async (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>("a.heading-anchor");
      if (!anchor) return;
      event.preventDefault();

      window.history.replaceState(null, "", anchor.hash);
      anchor.parentElement?.scrollIntoView({ behavior: "smooth", block: "start" });
      try {
        await navigator.clipboard.writeText(window.location.href);
        anchor.dataset.copied = copiedLabel;
        timers.push(window.setTimeout(() => delete anchor.dataset.copied, 1600));
      } catch {
        // Clipboard blocked: the URL bar already holds the section link.
      }
    };

    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [targetId, copiedLabel]);

  return null;
}
