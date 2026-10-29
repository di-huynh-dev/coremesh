"use client";

import { isInProgress, useReadingEntry } from "@/lib/reading-store";
import { cn } from "@/lib/utils";
import { BookmarkCheck, Check } from "lucide-react";
import { useTranslations } from "next-intl";

/** Small ring filled to `value` (0..1). */
export function ProgressRing({ value, className }: { value: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-3 shrink-0 rounded-full", className)}
      style={{
        background: `conic-gradient(var(--cobalt) ${Math.round(value * 360)}deg, var(--line) 0)`,
      }}
    />
  );
}

/** Where the reader is with a post, from the reading store: read, in progress or saved. */
export function ReadMark({ slug, className }: { slug: string; className?: string }) {
  const t = useTranslations("post");
  const entry = useReadingEntry(slug);
  const base = cn("inline-flex items-center gap-1.5 font-mono text-xs", className);

  if (entry?.readAt) {
    return (
      <span className={cn(base, "text-topic-performance")}>
        <Check aria-hidden className="size-3.5" />
        {t("readMark")}
      </span>
    );
  }
  if (isInProgress(entry)) {
    const percent = Math.round(entry!.progress * 100);
    return (
      <span className={cn(base, "text-cobalt")}>
        <ProgressRing value={entry!.progress} />
        {t("progressMark", { percent })}
      </span>
    );
  }
  if (entry?.savedAt) {
    return (
      <span className={cn(base, "text-soft")}>
        <BookmarkCheck aria-hidden className="size-3.5" />
        {t("savedState")}
      </span>
    );
  }
  return null;
}
