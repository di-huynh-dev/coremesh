"use client";

import type { BlogPostSummary } from "@/lib/content/types";
import { countRead, nextUnread, useReading } from "@/lib/reading-store";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

/** Start, continue or restart, depending on which parts this browser has read. */
export function SeriesCta({ posts }: { posts: BlogPostSummary[] }) {
  const locale = useLocale();
  const t = useTranslations("series");
  const reading = useReading();
  const read = countRead(posts, reading);
  const next = nextUnread(posts, reading);
  const href = (index: number) => `/${locale}/blog/${posts[index]!.slug}`;

  if (next === -1) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <p className="inline-flex items-center gap-2 font-medium text-topic-performance">
          <Check className="size-4" strokeWidth={3} />
          {t("done")}
        </p>
        <Link href={href(0)} className="btn btn-ghost">
          <RotateCcw className="size-4" />
          {t("restart")}
        </Link>
      </div>
    );
  }

  return (
    <Link href={href(next)} className="btn btn-ink self-start">
      {read > 0 ? t("continue", { n: next + 1 }) : t("start")}
      <ArrowRight className="btn-arrow size-4" />
    </Link>
  );
}
