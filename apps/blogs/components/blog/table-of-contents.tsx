"use client";

import { useActiveHeading } from "@/components/blog/use-article";
import type { BlogHeading } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

export function TableOfContents({ headings }: { headings: BlogHeading[] }) {
  const t = useTranslations("post");
  const activeId = useActiveHeading(headings);

  if (headings.length < 2) return null;

  return (
    <nav aria-labelledby="toc-title">
      <h2 id="toc-title" className="eyebrow">
        {t("toc")}
      </h2>
      <TocList headings={headings} activeId={activeId} className="mt-4" />
      <a
        href="#main"
        className="mt-4 inline-flex items-center gap-1.5 pl-4 font-mono text-xs text-faint transition-colors hover:text-ink"
      >
        <ArrowUp className="size-3.5" />
        {t("backToTop")}
      </a>
    </nav>
  );
}

export function TocList({
  headings,
  activeId,
  onNavigate,
  className,
}: {
  headings: BlogHeading[];
  activeId: string | null;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <ol className={cn("space-y-1 border-l border-line", className)}>
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            onClick={onNavigate}
            aria-current={activeId === heading.id ? "location" : undefined}
            className={cn(
              "-ml-px block border-l-2 py-1.5 text-sm leading-snug transition-colors",
              heading.level === 3 ? "pl-7" : "pl-4",
              activeId === heading.id
                ? "border-cobalt font-medium text-ink"
                : "border-transparent text-soft hover:text-ink",
            )}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
