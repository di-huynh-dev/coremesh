

import React from "react";
import Link from "next/link";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BackLink {
  label: string;
  href: string;
}

interface CategoryLayoutProps {
  /** The main category content */
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backLink?: BackLink;
}

const CategoryLayout: React.FC<CategoryLayoutProps> = ({
  children,
  breadcrumbs,
  backLink,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {(backLink || breadcrumbs) && (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-card-border/30">
            {/* Back Button */}
            {backLink ? (
              <Link
                href={backLink.href}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors group px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 shadow-2xs hover:scale-[1.02] active:scale-[0.98] w-fit"
              >
                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>{backLink.label}</span>
              </Link>
            ) : (
              <div />
            )}

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center flex-wrap gap-2 text-xs font-semibold text-text-muted bg-card-bg/60 backdrop-blur-md px-4 py-2 rounded-xl border border-card-border shadow-2xs w-fit">
                {breadcrumbs.map((item, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <FiChevronRight className="w-3.5 h-3.5 text-text-muted/40 flex-shrink-0" />
                      )}
                      {isLast ? (
                        <span className="text-foreground font-bold truncate max-w-[200px] sm:max-w-[300px]">
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
            )}
          </div>
        </div>
      )}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pb-16">
        {children}
      </div>
    </div>
  );
};

export default CategoryLayout;