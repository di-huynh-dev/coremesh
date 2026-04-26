"use client";

import { Footer } from "@/components/layout/footer";
import { getAllPosts } from "@/lib/blog";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Clock,
  Grid3x3,
  LayoutList,
  Search,
} from "lucide-react";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const NavbarComponent = dynamic(
  () =>
    import("@/components/layout/navbar").then((mod) => ({
      default: mod.Navbar,
    })),
  {
    ssr: false,
  },
);

const levelColors: Record<string, { bg: string; text: string }> = {
  Starter: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  Intermediate: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
  },
  Advanced: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
};

export default function BlogPage() {
  const locale = useLocale();
  const allPosts = getAllPosts(locale as "en" | "vi");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "title" | "readingTime">(
    "date",
  );
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
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

  // Get all unique tags and levels
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allPosts.forEach((post) => {
      post.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allPosts]);

  const allLevels = useMemo(() => {
    const levels = new Set<string>();
    allPosts.forEach((post) => {
      if (post.level) levels.add(post.level);
    });
    return Array.from(levels) as Array<"Starter" | "Intermediate" | "Advanced">;
  }, [allPosts]);

  // Get featured posts (first 3)
  const featuredPosts = useMemo(() => {
    return allPosts.slice(0, 3);
  }, [allPosts]);

  // Get categories for sidebar
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allPosts.forEach((post) => {
      cats.add(post.category);
    });
    return Array.from(cats).sort();
  }, [allPosts]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    const result = allPosts.filter((post) => {
      // Search filter
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

      // Level filter
      const matchesLevel = !selectedLevel || post.level === selectedLevel;

      // Tags filter
      const matchesTags =
        selectedTags.length === 0 ||
        (post.tags && selectedTags.some((tag) => post.tags?.includes(tag)));

      return matchesSearch && matchesLevel && matchesTags;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "readingTime":
          return (a.readingTime || 0) - (b.readingTime || 0);
        case "date":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [allPosts, searchQuery, selectedLevel, selectedTags, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleDropdown = (name: "level" | "tags" | "sort") => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF5F8] via-background to-background dark:from-[#1C1C1E] dark:via-[#1C1C1E] dark:to-[#1C1C1E]">
      <NavbarComponent />

      {/* What's New Section */}
      <div className="container mx-auto px-4 md:px-6 py-12 border-b">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">What&apos;s new</h2>
          <Link
            href={`/${locale}/blog`}
            className="text-primary hover:underline flex items-center gap-2"
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/${locale}/blog/${post.slug}`}>
                <div className="group bg-card hover:bg-accent/50 border rounded-lg p-5 transition-all duration-300 cursor-pointer h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {post.category}
                    </span>
                    {post.level && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColors[post.level].bg} ${levelColors[post.level].text}`}
                      >
                        {post.level}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-grow">
                    {post.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    {post.tags && (
                      <div className="flex items-center gap-1">
                        {post.tags.slice(0, 1).map((tag) => (
                          <span key={tag} className="text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Everything from the blog */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Everything from the blog</h2>

        {/* Search and Filters Section */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  {selectedLevel && (
                    <span className="ml-1 text-primary">✓</span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div
                  className={`absolute top-full mt-2 left-0 bg-background border border-border rounded-lg shadow-lg z-10 min-w-max overflow-hidden transition-all duration-150 ${openDropdown === "level" ? "visible opacity-100 translate-y-0 pointer-events-auto" : "invisible opacity-0 -translate-y-1 pointer-events-none"}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLevel(null);
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
                        setSelectedLevel(level);
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
                        onClick={() => toggleTag(tag)}
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
                      setSortBy("date");
                      setOpenDropdown(null);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-accent transition-colors ${sortBy === "date" ? "bg-accent" : ""}`}
                  >
                    Newest First
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("title");
                      setOpenDropdown(null);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-accent transition-colors ${sortBy === "title" ? "bg-accent" : ""}`}
                  >
                    Title (A-Z)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("readingTime");
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
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-accent" : "hover:bg-accent"}`}
                  title="List view"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
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
            📋 {filteredPosts.length} article
            {filteredPosts.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Posts List */}
          <div className="lg:col-span-3">
            <div
              className={
                viewMode === "list"
                  ? "space-y-6"
                  : "grid grid-cols-1 md:grid-cols-2 gap-6"
              }
            >
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/${locale}/blog/${post.slug}`}>
                      {viewMode === "list" ? (
                        // List View
                        <div className="group bg-card hover:bg-accent/50 border rounded-lg p-6 transition-all duration-300 cursor-pointer flex gap-6">
                          {/* Image */}
                          {post.image && (
                            <div className="flex-shrink-0 w-32 h-32 relative rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                {post.category}
                              </span>
                              {post.level && (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColors[post.level].bg} ${levelColors[post.level].text}`}
                                >
                                  {post.level}
                                </span>
                              )}
                            </div>

                            <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h2>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>

                            <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {post.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.readingTime} min read
                              </div>
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                  {post.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-secondary rounded text-xs"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Grid View
                        <div className="group bg-card hover:bg-accent/50 border rounded-lg p-6 transition-all duration-300 cursor-pointer flex flex-col h-full">
                          {post.image && (
                            <div className="w-full h-40 relative rounded-lg overflow-hidden bg-muted mb-4">
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                              {post.category}
                            </span>
                          </div>

                          <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-grow">
                            {post.title}
                          </h2>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {post.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readingTime} min
                            </div>
                          </div>
                        </div>
                      )}
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 lg:col-span-3">
                  <p className="text-lg text-muted-foreground">
                    No posts found matching your filters.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Browse Series */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Browse series</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Browse content series that are tailored to your experience
                  level.
                </p>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-medium">{category}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
