import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryLayout from "@/components/layouts/CategoryLayout";
import { FiCheckSquare, FiPlayCircle, FiLayers } from "react-icons/fi";
import { getQuizzesByCategory } from "@/lib/quizzes";
import { getCategoryBadgeClass, getCategoryDisplayName, DIFFICULTY_STYLES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categoryName = getCategoryDisplayName(category);
  return {
    title: `${categoryName} Quizzes`,
    description: `Test your ${categoryName} knowledge with interactive, bite-sized quizzes.`,
  };
}

export async function generateStaticParams() {
  const { getQuizCategories } = await import("@/lib/quizzes");
  return getQuizCategories().map((category) => ({
    category: category.toLowerCase(),
  }));
}

export default async function CategoryQuizzesPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const quizzes = getQuizzesByCategory(category);

  if (!quizzes || quizzes.length === 0) {
    notFound();
  }

  const categoryName = getCategoryDisplayName(category);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Quizzes", href: "/quizzes" },
    { label: categoryName },
  ];
  
  const backLink = {
    label: "All Quizzes",
    href: "/quizzes",
  };

  return (
    <CategoryLayout breadcrumbs={breadcrumbs} backLink={backLink}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-12 relative">
          <div className="md:col-span-2 text-left relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4 tracking-wide uppercase">
              <FiCheckSquare className="w-3.5 h-3.5" />
              <span>{categoryName} Quizzes</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-text-muted bg-clip-text text-transparent mb-4">
              {categoryName} Quizzes
            </h1>
            <p className="text-text-muted text-base md:text-lg max-w-2xl leading-relaxed">
              Challenge yourself with our curated {categoryName} multiple-choice quizzes. Get instant feedback and identify areas where you need to improve.
            </p>
          </div>

          {/* Stats Card */}
          <div className="relative overflow-hidden group bg-card-bg/45 backdrop-blur-md border border-card-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-text-muted">
                Available Quizzes
              </span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-foreground/5 text-foreground">
                <FiLayers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-foreground">
                {quizzes.length}
              </span>
              <span className="text-sm text-text-muted">quizzes</span>
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative pt-8 border-t border-card-border">
          {quizzes.map((quiz) => {
            const diffStyle = DIFFICULTY_STYLES[quiz.difficulty.toLowerCase()] || DIFFICULTY_STYLES.medium;
            return (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.category.toLowerCase()}/${quiz.id}`}
                className="group flex flex-col justify-between p-6 bg-card-bg/45 backdrop-blur-md border border-card-border hover:border-card-hover-border rounded-3xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FiPlayCircle className="w-24 h-24" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className={`shrink-0 text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded-md border ${getCategoryBadgeClass(quiz.category)}`}>
                      {categoryName}
                    </span>
                    <span className={`shrink-0 text-[10px] px-2 py-1 rounded-full font-bold uppercase border ${diffStyle.badge}`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-sky-400 transition-colors">
                    {quiz.title}
                  </h3>
                  
                  <p className="text-sm text-text-muted line-clamp-2 mb-6">
                    {quiz.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-card-border/50 text-xs font-semibold text-text-muted relative z-10">
                  <div className="flex items-center gap-1.5">
                    <FiLayers className="w-4 h-4" />
                    <span>{quiz.questions.length} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sky-400 group-hover:text-sky-300 transition-colors">
                    <span>Start Quiz</span>
                    <FiPlayCircle className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </CategoryLayout>
  );
}
