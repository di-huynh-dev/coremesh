"use client";

import { ChevronDown, Grid3x3, LayoutList, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type SortBy = "date" | "title" | "readingTime";
export type ViewMode = "list" | "grid";

export interface PostFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedLevel: string | null;
  onLevelChange: (level: string | null) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  allTags: string[];
  allLevels: string[];
  resultsCount: number;
}

export function PostFilters({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  selectedTags,
  onTagToggle,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  allTags,
  allLevels,
  resultsCount,
}: PostFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<
    "level" | "tags" | "sort" | null
  >(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterBarRef.current &&
        !filterBarRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: "level" | "tags" | "sort") => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div
        ref={filterBarRef}
        className="flex flex-wrap gap-4 items-center justify-between"
      >
        <div className="flex flex-wrap gap-3">
          {/* Level Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("level")}
              className="flex items-center gap-2 px-4 py-2 border border-border bg-background rounded-lg hover:bg-accent transition-colors text-sm font-medium shadow-sm"
            >
              Level{" "}
              {selectedLevel && <span className="ml-1 text-primary">✓</span>}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div
              className={`absolute top-full mt-2 left-0 bg-background border border-border rounded-lg shadow-lg z-10 min-w-max overflow-hidden transition-all duration-150 ${openDropdown === "level" ? "visible opacity-100 translate-y-0 pointer-events-auto" : "invisible opacity-0 -translate-y-1 pointer-events-none"}`}
            >
              <button
                type="button"
                onClick={() => {
                  onLevelChange(null);
                  setOpenDropdown(null);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-accent transition-colors ${!selectedLevel ? "bg-accent" : ""}`}
              >
                All Levels
              </button>
              {allLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    onLevelChange(level);
                    setOpenDropdown(null);
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-accent transition-colors ${selectedLevel === level ? "bg-accent" : ""}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("tags")}
              className="flex items-center gap-2 px-4 py-2 border border-border bg-background rounded-lg hover:bg-accent transition-colors text-sm font-medium shadow-sm"
            >
              Tags{" "}
              {selectedTags.length > 0 && (
                <span className="ml-1 text-primary">✓</span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div
              className={`absolute top-full mt-2 left-0 bg-background border border-border rounded-lg shadow-lg z-10 max-w-xs overflow-hidden transition-all duration-150 ${openDropdown === "tags" ? "visible opacity-100 translate-y-0 pointer-events-auto" : "invisible opacity-0 -translate-y-1 pointer-events-none"}`}
            >
              <div className="flex flex-wrap gap-2 p-3">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-accent"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Button */}
          <button className="flex items-center gap-2 px-4 py-2 border border-border bg-background rounded-lg hover:bg-accent transition-colors text-sm font-medium shadow-sm">
            🔽
          </button>
        </div>

        {/* Sort + View Toggle */}
        <div className="flex gap-3">
          {/* Sort By */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("sort")}
              className="flex items-center gap-2 px-4 py-2 border border-border bg-background rounded-lg hover:bg-accent transition-colors text-sm font-medium shadow-sm"
            >
              Sort by
              <ChevronDown className="w-4 h-4" />
            </button>
            <div
              className={`absolute top-full mt-2 right-0 bg-background border border-border rounded-lg shadow-lg z-10 min-w-max overflow-hidden transition-all duration-150 ${openDropdown === "sort" ? "visible opacity-100 translate-y-0 pointer-events-auto" : "invisible opacity-0 -translate-y-1 pointer-events-none"}`}
            >
              <button
                type="button"
                onClick={() => {
                  onSortChange("date");
                  setOpenDropdown(null);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-accent transition-colors ${sortBy === "date" ? "bg-accent" : ""}`}
              >
                Newest First
              </button>
              <button
                type="button"
                onClick={() => {
                  onSortChange("title");
                  setOpenDropdown(null);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-accent transition-colors ${sortBy === "title" ? "bg-accent" : ""}`}
              >
                Title (A-Z)
              </button>
              <button
                type="button"
                onClick={() => {
                  onSortChange("readingTime");
                  setOpenDropdown(null);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-accent transition-colors ${sortBy === "readingTime" ? "bg-accent" : ""}`}
              >
                Reading Time
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 border border-border bg-background rounded-lg p-2 shadow-sm">
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-accent" : "hover:bg-accent"}`}
              title="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-accent" : "hover:bg-accent"}`}
              title="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
        📋 {resultsCount} article
        {resultsCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
