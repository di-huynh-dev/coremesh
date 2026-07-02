"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiBookmark, FiCpu, FiChevronRight, FiGrid, FiSettings, 
  FiImage, FiCode, FiGlobe, FiAlertTriangle, FiZap, 
  FiCheckCircle, FiAward, FiStar, FiArrowLeft
} from "react-icons/fi";
import ShareButtons from "@/components/ShareButtons";
import { getCategoryDisplayName } from "@/lib/constants";

export interface GuideFrontmatter {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  readingTime?: number;
  relatedQuestions?: string[];
  [key: string]: unknown;
}

interface GuideLayoutProps {
  children: React.ReactNode;
  frontmatter?: GuideFrontmatter;
  relatedQuestionsCards?: React.ReactNode;
}

const sectionsList = [
  { id: "introduction", label: "Introduction", icon: FiBookmark, color: "text-sky-500" },
  { id: "why-this-matters", label: "Why This Matters", icon: FiCpu, color: "text-emerald-500" },
  { id: "prerequisites", label: "Prerequisites", icon: FiChevronRight, color: "text-amber-500" },
  { id: "mental-model", label: "Mental Model", icon: FiGrid, color: "text-indigo-500" },
  { id: "how-it-works", label: "How It Works", icon: FiSettings, color: "text-rose-500" },
  { id: "visual-diagram", label: "Visual Diagram", icon: FiImage, color: "text-cyan-500" },
  { id: "simple-example", label: "Simple Example", icon: FiCode, color: "text-amber-500" },
  { id: "real-world-example", label: "Real World Example", icon: FiGlobe, color: "text-sky-500" },
  { id: "common-mistakes", label: "Common Mistakes", icon: FiAlertTriangle, color: "text-rose-500" },
  { id: "performance-considerations", label: "Performance", icon: FiZap, color: "text-emerald-500" },
  { id: "best-practices", label: "Best Practices", icon: FiCheckCircle, color: "text-teal-500" },
  { id: "production-recommendations", label: "Production Recommendations", icon: FiAward, color: "text-yellow-500" },
  { id: "summary-key-takeaways", label: "Key Takeaways", icon: FiStar, color: "text-purple-500" },
  { id: "related-interview-questions", label: "Related Questions", icon: FiAward, color: "text-indigo-500" },
];

const categoryGlows: Record<string, string> = {
  react: "from-sky-500/10 dark:from-sky-500/5",
  javascript: "from-yellow-500/10 dark:from-yellow-500/5",
  css: "from-purple-500/10 dark:from-purple-500/5",
  performance: "from-emerald-500/10 dark:from-emerald-500/5",
};


const GuideLayout: React.FC<GuideLayoutProps> = ({
  children,
  frontmatter,
  relatedQuestionsCards,
}) => {
  const [activeSection, setActiveSection] = useState<string>("");

  const category = frontmatter?.category?.toLowerCase() || "react";
  const glowClass = categoryGlows[category] || "from-sky-500/10 dark:from-sky-500/5";

  const guideCategory = frontmatter?.category || "";
  const title = frontmatter?.title || "";
  const categoryKey = guideCategory.toLowerCase();
  const categoryDisplayName = getCategoryDisplayName(categoryKey) || guideCategory;

  const backUrl = "/guides";
  const backLabel = "Back to Guides";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
    ...(guideCategory ? [{ label: categoryDisplayName, href: "/guides" }] : []),
    { label: title },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // Offset to clear the sticky navbar (e.g. 100px)
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  // Dynamic Scroll Tracking
  useEffect(() => {
    const handleScroll = () => {
      let closestSection = "";
      let minDistance = Infinity;

      for (const section of sectionsList) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Find the element whose top edge is closest to our viewport triggering threshold (e.g., 120px)
          const distance = Math.abs(rect.top - 120);
          if (distance < minDistance) {
            minDistance = distance;
            closestSection = section.id;
          }
        }
      }

      if (closestSection) {
        setActiveSection(closestSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ─── Ambient Glows (wrapped in absolute container without overflow breaking sticky) ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b ${glowClass} to-transparent rounded-full blur-[140px] transition-all duration-500`} />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-16 md:pt-12">
        <div className="flex gap-8 items-start">
          
          {/* ─── Left Dynamic Section Navigation ────────────────────────── */}
          <aside className="hidden xl:flex flex-col flex-shrink-0 w-64 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            <div className="rounded-2xl border border-card-border bg-card-bg/50 backdrop-blur-md p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-foreground font-brand">
                  Guide Navigation
                </h3>
                <p className="text-[10px] text-text-muted mt-1">
                  Jump to different sections of this guide.
                </p>
              </div>

              <nav className="flex flex-col gap-1 pt-2 border-t border-card-border/50">
                {sectionsList.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(e) => handleNavClick(e, section.id)}
                      className={`
                        group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold
                        transition-all duration-200 border
                        ${isActive 
                          ? "bg-foreground/5 border-card-hover-border text-foreground shadow-2xs" 
                          : "border-transparent text-text-muted hover:text-foreground hover:bg-foreground/3"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`flex-shrink-0 transition-colors ${isActive ? section.color : "text-text-muted/65 group-hover:text-foreground"}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{section.label}</span>
                      </div>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ─── Main Content Column ──────────────────────────────────── */}
          <main className="flex-grow min-w-0">
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

            {/* Guide Header */}
            {frontmatter?.title && (
              <header className="mb-10 pb-6 border-b border-card-border/60">
                <div className="flex items-center gap-2 mb-3">
                  {frontmatter.category && (
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full text-sky-500 bg-sky-500/10 border border-sky-500/20`}>
                      {frontmatter.category}
                    </span>
                  )}
                  {frontmatter.difficulty && (
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-foreground/5 text-text-muted border border-card-border">
                      {frontmatter.difficulty}
                    </span>
                  )}
                  {frontmatter.readingTime && (
                    <span className="text-[10px] font-medium tracking-normal px-2.5 py-1 rounded-full bg-foreground/3 text-text-muted">
                      {frontmatter.readingTime} min read
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight font-brand">
                  {frontmatter.title}
                </h1>
                {frontmatter.description && (
                  <p className="mt-3 text-base md:text-lg text-text-muted leading-relaxed font-normal">
                    {frontmatter.description}
                  </p>
                )}
              </header>
            )}

            {/* Markdown Body */}
            <article className="prose-custom w-full max-w-full">
              {children}
            </article>

            {/* Share buttons */}
            <div className="mt-12 mb-8 pt-6 border-t border-card-border/60">
              <ShareButtons title={frontmatter?.title || ""} />
            </div>

            {/* Inline Dynamic Related Questions section (appended at bottom of content) */}
            {relatedQuestionsCards && (
              <section id="related-interview-questions" className="mt-16 pt-10 border-t border-card-border/60 scroll-margin-top-24">
                <h2 className="text-2xl font-bold tracking-tight text-foreground font-brand mb-2 flex items-center gap-2">
                  <FiAward className="w-6 h-6 text-indigo-500" />
                  <span>Related Interview Questions</span>
                </h2>
                <p className="text-sm text-text-muted mb-8 leading-relaxed">
                  Bridge theory and coding practice. Test your understanding of this concept with these curated technical interview rounds.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedQuestionsCards}
                </div>
              </section>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default GuideLayout;
