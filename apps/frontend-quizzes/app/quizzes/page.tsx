import Link from "next/link";
import CategoryLayout from "@/components/layouts/CategoryLayout";
import {
  FiCheckSquare,
  FiPlayCircle,
  FiLayers,
  FiFolder,
} from "react-icons/fi";
import { getQuizzesByCategory } from "@/lib/quizzes";
import { getCategoryBadgeClass, getCategoryDisplayName } from "@/lib/constants";

export const metadata = {
  title: "Interactive Quizzes",
  description:
    "Test your frontend knowledge with interactive, bite-sized quizzes.",
};

export default function QuizzesPage() {
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Quizzes" }];

  const backLink = {
    label: "Back to Home",
    href: "/",
  };

  const ALL_CATEGORIES = [
    "javascript",
    "react",
    "css",
    "typescript",
    "nextjs",
    "system-design",
  ];

  return (
    <CategoryLayout breadcrumbs={breadcrumbs} backLink={backLink}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-12 relative">
          <div className="md:col-span-2 text-left relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4 tracking-wide uppercase">
              <FiCheckSquare className="w-3.5 h-3.5" />
              <span>Test Your Skills</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-text-muted bg-clip-text text-transparent mb-4">
              Interactive Quizzes
            </h1>
            <p className="text-text-muted text-base md:text-lg max-w-2xl leading-relaxed">
              Challenge yourself with our curated multiple-choice quizzes. Get
              instant feedback and identify areas where you need to improve
              before your next interview.
            </p>
          </div>

          {/* Stats Card */}
          <div className="relative overflow-hidden group bg-card-bg/45 backdrop-blur-md border border-card-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-text-muted">
                Categories
              </span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-foreground/5 text-foreground">
                <FiFolder className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-foreground">
                {ALL_CATEGORIES.length}
              </span>
              <span className="text-sm text-text-muted">topics</span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative pt-8 border-t border-card-border">
          {ALL_CATEGORIES.map((category) => {
            const categoryQuizzes = getQuizzesByCategory(category);
            const hasQuizzes = categoryQuizzes.length > 0;

            const CardWrapper = hasQuizzes ? Link : "div";

            return (
              <CardWrapper
                key={category}
                href={hasQuizzes ? `/quizzes/${category.toLowerCase()}` : "#"}
                className={`group flex flex-col justify-between p-6 bg-card-bg/45 backdrop-blur-md border border-card-border rounded-3xl transition-all duration-300 relative overflow-hidden ${
                  hasQuizzes
                    ? "hover:border-card-hover-border hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                    : "opacity-60 grayscale-[50%] cursor-not-allowed"
                }`}
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FiFolder className="w-24 h-24" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span
                      className={`shrink-0 text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded-md border ${getCategoryBadgeClass(category)}`}
                    >
                      {getCategoryDisplayName(category)}
                    </span>
                    {!hasQuizzes && (
                      <span className="shrink-0 text-[10px] px-2 py-1 rounded-full font-bold uppercase border bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-sky-400 transition-colors">
                    {getCategoryDisplayName(category)} Quizzes
                  </h3>

                  <p className="text-sm text-text-muted line-clamp-2 mb-6">
                    {hasQuizzes
                      ? `Test your knowledge in ${getCategoryDisplayName(category)} with ${categoryQuizzes.length} hand-picked quizzes ranging from easy to hard.`
                      : `We're currently crafting top-tier questions for ${getCategoryDisplayName(category)}. Check back soon!`}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-card-border/50 text-xs font-semibold text-text-muted relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <FiLayers className="w-4 h-4" />
                      <span>
                        {hasQuizzes
                          ? `${categoryQuizzes.length} Quizzes`
                          : "0 Quizzes"}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${hasQuizzes ? "text-sky-400 group-hover:text-sky-300" : "text-zinc-500"}`}
                  >
                    <span>{hasQuizzes ? "Explore" : "Locked"}</span>
                    <FiPlayCircle className="w-4 h-4" />
                  </div>
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </CategoryLayout>
  );
}
