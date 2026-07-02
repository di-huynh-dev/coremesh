"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  FiGrid,
  FiList,
  FiClock,
  FiArrowRight,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
} from "react-icons/fi";
import {
  DIFFICULTY_ORDER,
  DIFFICULTY_STYLES,
  getCategoryBadgeClass,
  getCategoryDisplayName,
} from "@/lib/constants";

type Difficulty = "easy" | "medium" | "hard";

type Question = {
  slug: string;
  category: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  readingTime?: number;
  isNew?: boolean;
};

type SortOption =
  | "default"
  | "title-asc"
  | "title-desc"
  | "difficulty-asc"
  | "difficulty-desc";

const SORT_LABELS: Record<SortOption, string> = {
  default: "Default Sorting",
  "title-asc": "Title: A to Z",
  "title-desc": "Title: Z to A",
  "difficulty-asc": "Difficulty: Easiest First",
  "difficulty-desc": "Difficulty: Hardest First",
};

interface Props {
  questions: Question[];
  category: string;
}

export default function CategoryQuestions({ questions, category }: Props) {
  const [search, setSearch] = useState("");
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | "all">(
    "all",
  );
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("default");

  // View state and pagination states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(9);

  // Categories list for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set(questions.map((q) => q.category.toLowerCase()));
    return Array.from(cats);
  }, [questions]);

  // Filter and sort questions list
  const filtered = useMemo(() => {
    let list = [...questions];

    // Category/Topic filter
    if (activeCategory !== "all") {
      list = list.filter((q) => q.category.toLowerCase() === activeCategory);
    }

    // Difficulty filter
    if (activeDifficulty !== "all") {
      list = list.filter(
        (q) => q.difficulty?.toLowerCase() === activeDifficulty,
      );
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Sorting
    if (sort === "title-asc")
      list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "title-desc")
      list.sort((a, b) => b.title.localeCompare(a.title));
    if (sort === "difficulty-asc")
      list.sort(
        (a, b) =>
          (DIFFICULTY_ORDER[a.difficulty?.toLowerCase()] ?? 99) -
          (DIFFICULTY_ORDER[b.difficulty?.toLowerCase()] ?? 99),
      );
    if (sort === "difficulty-desc")
      list.sort(
        (a, b) =>
          (DIFFICULTY_ORDER[b.difficulty?.toLowerCase()] ?? 99) -
          (DIFFICULTY_ORDER[a.difficulty?.toLowerCase()] ?? 99),
      );

    return list;
  }, [questions, search, activeDifficulty, activeCategory, sort]);

  // Counts for stats row and pills
  const counts = useMemo(() => {
    const all = questions.length;
    const easy = questions.filter(
      (q) => q.difficulty?.toLowerCase() === "easy",
    ).length;
    const medium = questions.filter(
      (q) => q.difficulty?.toLowerCase() === "medium",
    ).length;
    const hard = questions.filter(
      (q) => q.difficulty?.toLowerCase() === "hard",
    ).length;
    return { all, easy, medium, hard };
  }, [questions]);

  // Pagination computations
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Ensure currentPage doesn't exceed total pages if filter reduces list size
  const sanitizedCurrentPage = Math.min(currentPage, totalPages);

  const paginatedQuestions = useMemo(() => {
    const startIdx = (sanitizedCurrentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    return filtered.slice(startIdx, endIdx);
  }, [filtered, sanitizedCurrentPage, pageSize]);

  const startIdx = (sanitizedCurrentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;

  // Helper to render page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (sanitizedCurrentPage > 3) {
        pages.push("ellipsis-start");
      }
      const start = Math.max(2, sanitizedCurrentPage - 1);
      const end = Math.min(totalPages - 1, sanitizedCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (sanitizedCurrentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (questions.length === 0) {
    const catName = getCategoryDisplayName(category);
    return (
      <div className="text-center py-20 border border-dashed border-card-border rounded-3xl bg-card-bg/25 max-w-2xl mx-auto px-6 shadow-inner">
        <FiHelpCircle className="w-12 h-12 text-sky-400 mx-auto mb-4 opacity-50 animate-pulse" />
        <h3 className="text-lg font-bold text-foreground font-brand">
          {catName} Learning Track Coming Soon
        </h3>
        <p className="text-xs text-text-muted mt-2 leading-relaxed">
          We are busy compiling first-principles study guides and senior-level
          interview questions for this module. Check back soon to explore the
          breakdowns!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter & View Toggle Controls Bar */}
      <div className="flex flex-col gap-4 lg:gap-6">
        {/* Visual Segmented Difficulty Filters & Grid/List View Toggles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Interactive pills for Difficulty */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-900 self-start">
            {(
              [
                {
                  id: "all",
                  label: "All Levels",
                  count: counts.all,
                  colorClass: "text-zinc-400 hover:text-zinc-200",
                },
                {
                  id: "easy",
                  label: "Easy",
                  count: counts.easy,
                  colorClass: "text-emerald-400",
                },
                {
                  id: "medium",
                  label: "Medium",
                  count: counts.medium,
                  colorClass: "text-amber-400",
                },
                {
                  id: "hard",
                  label: "Hard",
                  count: counts.hard,
                  colorClass: "text-rose-400",
                },
              ] as const
            ).map((pill) => {
              const isActive = activeDifficulty === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    setActiveDifficulty(pill.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-zinc-800 text-white shadow-xs border border-zinc-700/50"
                      : `border border-transparent hover:bg-zinc-900/60 ${pill.colorClass}`
                  }`}
                >
                  <span>{pill.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? "bg-zinc-700 text-white"
                        : "bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right side: View Toggle & Page Size */}
          <div className="flex items-center flex-wrap gap-4 self-end sm:self-auto">
            {/* Page Size Select */}
            <div className="flex items-center border border-zinc-800/80 bg-zinc-950 px-3 py-1.5 rounded-xl gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 select-none">
                Show
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer border-none font-semibold pr-4"
              >
                <option value={9} className="bg-zinc-950">
                  9 per page
                </option>
                <option value={18} className="bg-zinc-950">
                  18 per page
                </option>
                <option value={27} className="bg-zinc-950">
                  27 per page
                </option>
                <option value={36} className="bg-zinc-950">
                  36 per page
                </option>
              </select>
            </div>

            {/* Layout View Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted hidden md:inline">
                Layout View
              </span>
              <div className="flex items-center border border-zinc-800/80 bg-zinc-950 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-150 cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-zinc-800 text-sky-400 border border-zinc-700/50 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  aria-label="Grid View"
                  title="Grid View"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-150 cursor-pointer ${
                    viewMode === "list"
                      ? "bg-zinc-800 text-sky-400 border border-zinc-700/50 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  aria-label="List View"
                  title="List View"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Sort and Topic Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search Field */}
          <div className="relative md:col-span-6 lg:col-span-7">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder={
                category === "all"
                  ? "Search questions, descriptions, or tags..."
                  : `Search ${getCategoryDisplayName(category)} questions...`
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-9.5 pr-9.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-800 transition"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition cursor-pointer p-0.5"
                aria-label="Clear search"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Topic Filter Dropdown (Only on questions root) */}
          {category === "all" && (
            <div className="relative md:col-span-3 lg:col-span-2.5 flex items-center bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 mr-2 select-none">
                Topic
              </span>
              <select
                value={activeCategory}
                onChange={(e) => {
                  setActiveCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer border-none font-medium pr-6"
              >
                <option value="all" className="bg-zinc-950">
                  All Topics
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-950">
                    {getCategoryDisplayName(cat)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Dropdown */}
          <div
            className={`relative ${category === "all" ? "md:col-span-3" : "md:col-span-6"} lg:col-span-2.5 flex items-center bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2`}
          >
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 mr-2 select-none">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortOption);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer border-none font-medium pr-6"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <option key={key} value={key} className="bg-zinc-950">
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <p className="text-xs text-zinc-500">
          Showing{" "}
          <span className="font-semibold text-zinc-300">{filtered.length}</span>{" "}
          of{" "}
          <span className="font-semibold text-zinc-400">
            {questions.length}
          </span>{" "}
          questions
        </p>
      </div>

      {/* Questions Grid/List Render Area */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950/20 border border-dashed border-zinc-900 rounded-2xl p-6 text-zinc-500 shadow-inner">
          <FiHelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-400">
            No questions found matching your criteria
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            Try expanding your search query or adjusting active filters
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedQuestions.map((question) => {
            const diff = question.difficulty?.toLowerCase() || "medium";
            const diffStyle =
              DIFFICULTY_STYLES[diff] || DIFFICULTY_STYLES.medium;

            return (
              <Link
                key={question.slug}
                href={`/questions/${question.category}/${question.slug}`}
                className={`group relative flex flex-col justify-between h-full bg-card-bg/40 backdrop-blur-md border border-card-border hover:border-card-hover-border hover:bg-card-bg/60 rounded-2xl p-5 transition-all duration-300 shadow-xs hover:shadow-lg ${diffStyle.glow} hover:-translate-y-1.5`}
              >
                <div>
                  {/* Card Header badges */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-1.5">
                      {question.isNew && (
                        <span className="text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-md border bg-teal-500/10 text-teal-400 border-teal-500/30 animate-pulse uppercase">
                          New
                        </span>
                      )}
                      <span
                        className={`shrink-0 text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(question.category)}`}
                      >
                        {getCategoryDisplayName(question.category)}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${diffStyle.badge}`}
                    >
                      {question.difficulty}
                    </span>
                  </div>

                  {/* Question Title */}
                  <h3 className="text-base font-extrabold text-foreground group-hover:text-white transition-colors duration-200 leading-snug line-clamp-2 mb-2">
                    {question.title}
                  </h3>

                  {/* Short summary or description */}
                  {question.description && (
                    <p className="text-xs text-text-muted leading-relaxed font-normal line-clamp-3 mb-4">
                      {question.description}
                    </p>
                  )}
                </div>

                {/* Footer details */}
                <div className="mt-auto pt-4 border-t border-zinc-900/40 flex flex-col gap-3">
                  {/* Tags */}
                  {question.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {question.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-zinc-900/60 text-zinc-500 border border-zinc-800/80 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 3 && (
                        <span className="text-[9px] text-zinc-600 font-medium pl-1 self-center">
                          +{question.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted group-hover:text-foreground transition-colors mt-1">
                    <div className="flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{question.readingTime || 5} min read</span>
                    </div>
                    <div className="flex items-center gap-1 text-sky-400 font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                      <span>View</span>
                      <FiArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW LAYOUT */
        <div className="space-y-3">
          {paginatedQuestions.map((question, idx) => {
            const diff = question.difficulty?.toLowerCase() || "medium";
            const diffStyle =
              DIFFICULTY_STYLES[diff] || DIFFICULTY_STYLES.medium;
            const rowIdx = startIdx + idx + 1;

            return (
              <Link
                key={question.slug}
                href={`/questions/${question.category}/${question.slug}`}
                className="group relative flex items-center justify-between border border-card-border hover:border-card-hover-border hover:bg-card-bg/60 bg-card-bg/25 px-5 py-4 rounded-xl transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md"
              >
                {/* Left indicator bar based on difficulty */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 group-hover:w-1.5 ${
                    diff === "easy"
                      ? "bg-emerald-500"
                      : diff === "medium"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                />

                <div className="flex items-center gap-4 min-w-0 flex-1 pl-1">
                  {/* Number Index */}
                  <span className="text-xs font-mono font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors w-6 text-right">
                    {String(rowIdx).padStart(2, "0")}
                  </span>

                  {/* Main info container */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {question.isNew && (
                        <span className="text-[9px] font-extrabold tracking-wider px-1.5 py-0.2 rounded border bg-teal-500/10 text-teal-400 border-teal-500/30 animate-pulse uppercase">
                          New
                        </span>
                      )}
                      <span
                        className={`shrink-0 text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded border ${getCategoryBadgeClass(question.category)}`}
                      >
                        {getCategoryDisplayName(question.category)}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white transition truncate mr-2">
                        {question.title}
                      </h3>
                      <span
                        className={`shrink-0 text-[10px] px-2 py-0.2 rounded-full font-semibold border capitalize ${diffStyle.badge}`}
                      >
                        {question.difficulty}
                      </span>
                    </div>

                    {question.description && (
                      <p className="text-xs text-text-muted mt-1.5 line-clamp-1 pr-6">
                        {question.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right details & Meta info */}
                <div className="flex items-center gap-5 shrink-0 pl-4">
                  {/* Reading Time */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted">
                    <FiClock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{question.readingTime || 5}m</span>
                  </div>

                  {/* Tags (Desktop only) */}
                  {question.tags?.length > 0 && (
                    <div className="hidden md:flex flex-wrap gap-1 max-w-[150px] justify-end">
                      {question.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900/60 text-zinc-500 border border-zinc-800/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Arrow Icon */}
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-900 border border-zinc-800/80 text-zinc-500 group-hover:text-sky-400 group-hover:border-sky-500/25 group-hover:bg-sky-500/5 transition-all">
                    <FiArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls Footer */}
      {filtered.length > pageSize && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 pt-6">
          {/* Position details */}
          <span className="text-xs text-zinc-500">
            Showing{" "}
            <span className="font-semibold text-zinc-300">{startIdx + 1}</span>{" "}
            to{" "}
            <span className="font-semibold text-zinc-300">
              {Math.min(endIdx, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-300">
              {filtered.length}
            </span>{" "}
            questions
          </span>

          {/* Button page selectors */}
          <div className="flex items-center gap-1">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={sanitizedCurrentPage === 1}
              className="px-3 h-9 rounded-xl flex items-center gap-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label="Previous Page"
            >
              <FiChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, idx) => {
                if (
                  pageNum === "ellipsis-start" ||
                  pageNum === "ellipsis-end"
                ) {
                  return (
                    <span
                      key={`${pageNum}-${idx}`}
                      className="w-9 h-9 flex items-center justify-center text-zinc-600 text-xs"
                    >
                      •••
                    </span>
                  );
                }

                const isActive = sanitizedCurrentPage === pageNum;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum as number)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-xs"
                        : "border border-zinc-900 bg-zinc-950/20 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={sanitizedCurrentPage === totalPages}
              className="px-3 h-9 rounded-xl flex items-center gap-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label="Next Page"
            >
              <span>Next</span>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
