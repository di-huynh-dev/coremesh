"use client";

import { TocList } from "@/components/blog/table-of-contents";
import { useActiveHeading, useArticleProgress } from "@/components/blog/use-article";
import type { BlogHeading } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { ArrowUp, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

const RING = 2 * Math.PI * 13;

/** Below lg the sidebar is gone: a floating pill shows the current section and opens the outline. */
export function MobileToc({ headings, targetId }: { headings: BlogHeading[]; targetId: string }) {
  const t = useTranslations("post");
  const progress = useArticleProgress(targetId);
  const activeId = useActiveHeading(headings);
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (headings.length < 2) return null;

  const active = headings.find((heading) => heading.id === activeId);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <div
        className={cn(
          // Moves above the docked listen player while it is open (see post-actions.tsx).
          "fixed right-4 bottom-4 z-150 transition-[opacity,translate,bottom] duration-300 ease-[var(--ease-site)] lg:hidden [html[data-player-open]_&]:bottom-24",
          progress > 0 && progress < 1 ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          aria-haspopup="dialog"
          aria-label={t("tocOpen")}
          className="flex h-11 max-w-[min(20rem,calc(100vw-2rem))] items-center gap-2.5 rounded-full border border-line bg-background/95 pr-4 pl-1.5 shadow-lg backdrop-blur-xl"
        >
          <svg viewBox="0 0 32 32" className="size-8 shrink-0 -rotate-90" aria-hidden>
            <circle cx="16" cy="16" r="13" fill="none" strokeWidth="3" className="stroke-line" />
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-cobalt"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - progress)}
            />
          </svg>
          <span className="truncate text-sm font-medium text-ink">{active?.text ?? t("toc")}</span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="mobile-toc-title"
        onClick={(event) => {
          // A click on the dialog itself is a click on the backdrop.
          if (event.target === event.currentTarget) close();
        }}
        className="mx-0 mt-auto mb-0 max-h-[78vh] w-full max-w-none rounded-t-3xl border border-line bg-card p-0 text-foreground backdrop:bg-night/45 backdrop:backdrop-blur-[2px] open:animate-in open:slide-in-from-bottom-8 open:fade-in-0 lg:hidden"
      >
        <div className="safe-area-inset-bottom px-5 pt-3 pb-5">
          <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-line" />
          <div className="flex items-center justify-between">
            <h2 id="mobile-toc-title" className="eyebrow">
              {t("toc")}
            </h2>
            <span className="ml-auto mr-2 font-mono text-xs text-faint">{Math.round(progress * 100)}%</span>
            <button
              type="button"
              onClick={close}
              aria-label={t("tocClose")}
              className="rounded-full p-2 text-soft hover:bg-paper hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
          <TocList
            headings={headings}
            activeId={activeId}
            onNavigate={close}
            className="mt-3 max-h-[52vh] overflow-y-auto overscroll-contain"
          />
          <a
            href="#main"
            onClick={close}
            className="btn btn-ghost mt-5 h-10 w-full text-[0.8rem]"
          >
            <ArrowUp className="size-4" />
            {t("backToTop")}
          </a>
        </div>
      </dialog>
    </>
  );
}
