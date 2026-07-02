"use client";

import React, { useState } from "react";
import { FiList, FiChevronRight, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import TOCSidebar, { type TocItem } from "@/components/TOCSidebar";
import ShareButtons from "@/components/ShareButtons";
import { getCategoryDisplayName } from "@/lib/constants";

export interface ArticleFrontmatter {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  [key: string]: unknown;
}

interface ArticleLayoutProps {
  /** The main article content */
  children: React.ReactNode;
  /** Parsed frontmatter from the MDX file */
  frontmatter?: ArticleFrontmatter;
  /** Optional left sidebar content (e.g. chapter nav, topic list) */
  sidebar?: React.ReactNode;
  /** Headings to render in the right-hand TOC */
  tocItems?: TocItem[];
  /** Optional cards showing other questions */
  moreQuestionsCards?: React.ReactNode;
}


const ArticleLayout: React.FC<ArticleLayoutProps> = ({
  children,
  frontmatter,
  sidebar,
  tocItems = [],
  moreQuestionsCards,
}) => {
  const [tocOpen, setTocOpen] = useState(false);

  const category = frontmatter?.category || "";
  const title = frontmatter?.title || "";
  const categoryKey = category.toLowerCase();
  const categoryDisplayName = getCategoryDisplayName(categoryKey) || category;

  const backUrl = category ? `/questions/${categoryKey}` : "/questions";
  const backLabel = category ? `Back to ${categoryDisplayName} Questions` : "Back to Questions";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Questions", href: "/questions" },
    ...(category ? [{ label: categoryDisplayName, href: `/questions/${categoryKey}` }] : []),
    { label: title },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Sticky TOC toggle button (mobile + tablet) ─────────────── */}
      <button
        onClick={() => setTocOpen((v) => !v)}
        className="
          fixed bottom-6 right-6 z-50
          lg:hidden
          flex items-center gap-2
          px-4 py-2.5 rounded-full
          bg-card-bg/95 backdrop-blur-xl
          border border-card-border
          text-sm font-semibold text-foreground
          shadow-lg shadow-black/10
          hover:bg-foreground/5 transition-all duration-200
        "
        aria-label="Toggle table of contents"
      >
        <FiList className="w-4 h-4" />
        Contents
      </button>

      {/* ─── Main three-column grid ──────────────────────────────────── */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-16 md:pt-12">
        <div className="flex gap-8 items-start">
          {/* ── Left Sidebar (optional: chapter/topic nav) ─────────── */}
          {sidebar && (
            <aside className="hidden lg:flex flex-col flex-shrink-0 w-52 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="rounded-2xl border border-card-border bg-card-bg/60 backdrop-blur-md p-4">
                {sidebar}
              </div>
            </aside>
          )}

          {/* ── Main Article Content ────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Desktop TOC toggle — lives in top-right of main column header */}
            {/* <div className="hidden lg:flex justify-end mb-4">
              <button
                onClick={() => setTocOpen((v) => !v)}
                className="
                  flex items-center gap-1.5
                  text-xs font-semibold text-text-muted
                  hover:text-foreground
                  px-3 py-1.5 rounded-lg
                  border border-card-border
                  bg-card-bg/60 hover:bg-foreground/5
                  transition-all duration-200
                "
                aria-label="Toggle table of contents"
              >
                <FiList className="w-3.5 h-3.5" />
                {tocOpen ? "Hide" : "Show"} Contents
              </button>
            </div> */}

            {/* Back Button & Breadcrumbs Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-card-border/30">
              {/* Back Button */}
              <Link
                href={backUrl}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors group px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 shadow-2xs hover:scale-[1.02] active:scale-[0.98] w-fit"
              >
                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>{backLabel}</span>
              </Link>

              {/* Breadcrumbs */}
              <nav className="flex items-center flex-wrap gap-2 text-xs font-semibold text-text-muted bg-card-bg/60 backdrop-blur-md px-4 py-2 rounded-xl border border-card-border shadow-2xs w-fit">
                {breadcrumbs.map((item, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <FiChevronRight className="w-3.5 h-3.5 text-text-muted/40 flex-shrink-0" />
                      )}
                      {isLast ? (
                        <span className="text-foreground font-bold truncate max-w-[150px] sm:max-w-[250px] md:max-w-[350px]">
                          {item.label}
                        </span>
                      ) : item.href ? (
                        <Link
                          href={item.href}
                          className="hover:text-foreground hover:underline transition-all"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>

            {/* Article header from frontmatter */}
            {frontmatter?.title && (
              <header className="mb-8 pb-6 border-b border-card-border">
                <div className="flex items-center gap-2 mb-3">
                  {frontmatter.category && (
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
                      {frontmatter.category}
                    </span>
                  )}
                  {frontmatter.difficulty && (
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-foreground/5 text-text-muted border border-card-border">
                      {frontmatter.difficulty}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  {frontmatter.title}
                </h1>
                {frontmatter.description && (
                  <p className="mt-2 text-base text-text-muted leading-relaxed">
                    {frontmatter.description}
                  </p>
                )}
              </header>
            )}

            {/* Article body */}
            <article className="prose-custom">{children}</article>

            {/* Share buttons */}
            <div className="mt-12 pt-6 border-t border-card-border">
              <ShareButtons title={frontmatter?.title || ""} />
            </div>

            {/* More Questions Section */}
            {moreQuestionsCards && (
              <section className="mt-16 pt-10 border-t border-card-border/60 scroll-margin-top-24">
                <h2 className="text-xl font-bold tracking-tight text-foreground font-brand mb-2 flex items-center gap-2">
                  <FiList className="w-5 h-5 text-sky-400" />
                  <span>More Technical Questions</span>
                </h2>
                <p className="text-xs text-text-muted mb-8 leading-relaxed">
                  Expand your mastery. Deep dive into other frontend interview challenges in this category.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {moreQuestionsCards}
                </div>
              </section>
            )}
          </main>

          {/* ── Right TOC Sidebar ───────────────────────────────────── */}
          <TOCSidebar
            items={tocItems}
            isOpen={tocOpen}
            onClose={() => setTocOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleLayout;
