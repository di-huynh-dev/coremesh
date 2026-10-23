"use client";

import type { BlogHeading } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function TableOfContents({ headings }: { headings: BlogHeading[] }) {
  const t = useTranslations("post");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // The active heading is the last one that has scrolled past the top band.
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

  if (headings.length < 2) return null;

  return (
    <nav aria-labelledby="toc-title">
      <h2 id="toc-title" className="eyebrow">
        {t("toc")}
      </h2>
      <ol className="mt-4 space-y-1 border-l border-line">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
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
    </nav>
  );
}
