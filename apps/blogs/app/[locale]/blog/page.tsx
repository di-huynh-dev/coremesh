"use client";

import { Footer } from "@/components/layout/footer";
import { getAllPosts } from "@/lib/blog";
import { FeaturedPosts } from "@repo/ui/featured-posts";
import { PostFilters } from "@repo/ui/post-filters";
import { PostList } from "@repo/ui/post-list";
import type { BlogPost } from "@repo/ui/types/post";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const NavbarComponent = dynamic(
  () =>
    import("@/components/layout/navbar").then((mod) => ({
      default: mod.Navbar,
    })),
  {
    ssr: false,
  },
);

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
    return Array.from(levels);
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF5F8] via-background to-background dark:from-[#1C1C1E] dark:via-[#1C1C1E] dark:to-[#1C1C1E]">
      <NavbarComponent />

      {/* What's New Section */}
      <FeaturedPosts
        posts={featuredPosts as BlogPost[]}
        baseHref="/blog"
        locale={locale}
        title="What's new"
      />

      {/* Everything from the blog */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Everything from the blog</h2>

        {/* Search and Filters Section */}
        <PostFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          selectedTags={selectedTags}
          onTagToggle={toggleTag}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          allTags={allTags}
          allLevels={allLevels}
          resultsCount={filteredPosts.length}
        />

        {/* Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Posts List */}
          <div className="lg:col-span-3">
            <PostList
              posts={filteredPosts as BlogPost[]}
              viewMode={viewMode}
              baseHref="/blog"
              locale={locale}
            />
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
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
