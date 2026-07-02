import React from "react";
import { notFound } from "next/navigation";
import CategoryLayout from "@/components/layouts/CategoryLayout";
import QuizPlayer from "@/components/QuizPlayer";
import { getAllQuizzes, getQuizById } from "@/lib/quizzes";
import { getCategoryDisplayName } from "@/lib/constants";

interface QuizPageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: QuizPageProps) {
  const { category, id } = await params;
  const quiz = getQuizById(category, id);

  if (!quiz) {
    return {
      title: "Quiz Not Found",
    };
  }

  return {
    title: quiz.title,
    description: quiz.description,
  };
}

export async function generateStaticParams() {
  const quizzes = getAllQuizzes();
  return quizzes.map((quiz) => ({
    category: quiz.category.toLowerCase(),
    id: quiz.id,
  }));
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { category, id } = await params;
  const quiz = getQuizById(category, id);

  if (!quiz) {
    notFound();
  }

  const categoryName = getCategoryDisplayName(quiz.category);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Quizzes", href: "/quizzes" },
    { label: categoryName, href: `/quizzes/${quiz.category.toLowerCase()}` },
    { label: quiz.title },
  ];

  const backLink = {
    label: `Back to ${categoryName} Quizzes`,
    href: `/quizzes/${quiz.category.toLowerCase()}`,
  };

  return (
    <CategoryLayout breadcrumbs={breadcrumbs} backLink={backLink}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-foreground/5 text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
            {categoryName} Quiz
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 font-brand">
            {quiz.title}
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            {quiz.description}
          </p>
        </div>

        <QuizPlayer quiz={quiz} />
      </div>
    </CategoryLayout>
  );
}
