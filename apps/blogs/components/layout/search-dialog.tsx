"use client";

import { matchesTerms, normalizeSearch } from "@/lib/content/text";
import type { BlogPostSummary, SearchEntry, SearchKind } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { CornerDownLeft, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function matchesQuery(post: BlogPostSummary, query: string, topicLabel: string) {
  return matchesTerms([post.title, post.excerpt, topicLabel, ...post.tags], query);
}

const KIND_STYLE: Record<SearchKind, string> = {
  post: "bg-cobalt-soft text-cobalt",
  series: "bg-topic-growth/12 text-topic-growth",
  guide: "bg-topic-tooling/12 text-topic-tooling",
  chapter: "bg-topic-tooling/12 text-topic-tooling",
  roadmap: "bg-topic-performance/12 text-topic-performance",
  stage: "bg-topic-performance/12 text-topic-performance",
  tool: "bg-topic-frontend/12 text-topic-frontend",
};

const MAX_RESULTS = 10;

export function SearchDialog({
  open,
  onClose,
  entries,
}: {
  open: boolean;
  onClose: () => void;
  entries: SearchEntry[];
}) {
  const t = useTranslations("search");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const needle = normalizeSearch(query.trim());
    return entries
      .filter((entry) =>
        matchesTerms(
          [entry.title, entry.description, entry.context ?? "", ...entry.keywords],
          query,
        ),
      )
      // Title hits first; otherwise keep index order (posts, roadmaps, guides, tools).
      .map((entry, order) => ({ entry, order, inTitle: normalizeSearch(entry.title).includes(needle) }))
      .sort((a, b) => Number(b.inTitle) - Number(a.inTitle) || a.order - b.order)
      .slice(0, MAX_RESULTS)
      .map(({ entry }) => entry);
  }, [entries, query]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    setQuery("");
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active].href);
    }
  };

  // Portal out of the sticky header: its backdrop-filter would otherwise
  // become the containing block for this fixed overlay.
  return createPortal(
    <div
      className="fixed inset-0 z-250 flex items-start justify-center bg-night/40 px-4 pt-[12vh] backdrop-blur-sm animate-in fade-in-0 duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        onKeyDown={onKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-card shadow-2xl animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-faint" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            placeholder={t("placeholder")}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={
              results[active] ? `${listId}-${active}` : undefined
            }
            className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-faint"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-md p-1.5 text-faint transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {!query.trim() ? (
            <p className="px-3 py-8 text-center text-sm text-soft">
              {t("empty")}
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-soft">
              {t("noResults", { query })}
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label={t("title")}>
              {results.map((entry, index) => (
                <li
                  key={entry.href}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(entry.href)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3",
                    index === active && "bg-paper",
                  )}
                >
                  <span
                    className={cn(
                      "w-16 shrink-0 rounded-md px-1.5 py-0.5 text-center font-mono text-[0.62rem] tracking-wide uppercase",
                      KIND_STYLE[entry.kind],
                    )}
                  >
                    {t(`kinds.${entry.kind}`)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{entry.title}</p>
                    <p className="truncate text-xs text-soft">
                      {entry.context ? `${entry.context} · ` : ""}
                      {entry.description}
                    </p>
                  </div>
                  {index === active ? (
                    <CornerDownLeft className="size-4 shrink-0 text-faint" />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        {results.length > 0 ? (
          <div className="border-t border-line px-4 py-2 font-mono text-[0.7rem] text-faint">
            {t("results", { count: results.length })}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
