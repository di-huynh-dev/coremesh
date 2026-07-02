import React from "react";
import Link from "next/link";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { FaReact, FaCss3Alt } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import { SiTypescript, SiNextdotjs } from "react-icons/si";
import { FiLayers } from "react-icons/fi";
import QuestionCard from "@/components/QuestionCard";
import GuideCard from "@/components/GuideCard";
import QuizCard from "@/components/QuizCard";
import { getAllQuestionsWithMetadata, getAllGuidesWithMetadata } from "@/lib/mdx";
import { getAllQuizzes } from "@/lib/quizzes";

const getCategoryIcon = (category: string) => {
  const norm = category.toLowerCase();
  switch (norm) {
    case "javascript":
      return <IoLogoJavascript className="w-5 h-5 text-yellow-500" />;
    case "react":
      return <FaReact className="w-5 h-5 text-sky-400" />;
    case "typescript":
      return <SiTypescript className="w-5 h-5 text-blue-500" />;
    case "css":
      return <FaCss3Alt className="w-5 h-5 text-purple-500" />;
    case "nextjs":
      return <SiNextdotjs className="w-5 h-5 text-white" />;
    default:
      return <FiLayers className="w-5 h-5 text-text-muted" />;
  }
};

const RecentlyAdded = () => {
  // We'll mock "Recently Added" by picking specific/first items from the collections
  const allQuestions = getAllQuestionsWithMetadata();
  const allGuides = getAllGuidesWithMetadata();
  const allQuizzes = getAllQuizzes();

  // Grab the first of each (or random if you prefer, here we just take the first)
  const recentQuestion = allQuestions.length > 0 ? allQuestions[0] : null;
  const recentGuide = allGuides.length > 0 ? allGuides[0] : null;
  const recentQuiz = allQuizzes.length > 0 ? allQuizzes[allQuizzes.length - 1] : null;

  return (
    <section className="section-wrapper relative border-t border-card-border/50">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between max-w-5xl mx-auto mb-12 gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FiStar className="text-yellow-400" />
            Recently Added
          </h2>
          <p className="mt-3 text-sm md:text-base text-text-muted leading-relaxed font-normal">
            Fresh out of the oven! Check out the newest questions, in-depth guides, and quizzes added to our platform.
          </p>
        </div>

        <Link
          href="/questions"
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-foreground hover:opacity-90 group/btn transition-all self-start md:self-auto"
        >
          <span>Explore All Content</span>
          <FiArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Render a Question */}
        {recentQuestion && (
          <div className="flex flex-col gap-2">
             <span className="text-xs font-semibold text-text-muted uppercase tracking-wider pl-1">New Question</span>
             <QuestionCard
              id={recentQuestion.slug}
              slug={recentQuestion.slug}
              title={recentQuestion.title}
              category={recentQuestion.category}
              difficulty={recentQuestion.difficulty as "Easy" | "Medium" | "Hard"}
              timeEstimation={`${recentQuestion.readingTime} mins`}
              summary={recentQuestion.description}
              icon={getCategoryIcon(recentQuestion.category)}
            />
          </div>
        )}

        {/* Render a Guide */}
        {recentGuide && (
           <div className="flex flex-col gap-2">
             <span className="text-xs font-semibold text-text-muted uppercase tracking-wider pl-1">New Guide</span>
            <GuideCard
              id={recentGuide.slug}
              slug={recentGuide.slug}
              title={recentGuide.title}
              category={recentGuide.category}
              difficulty={recentGuide.difficulty as "Beginner" | "Intermediate" | "Advanced"}
              readTime={`${recentGuide.readingTime} min read`}
              description={recentGuide.description}
            />
          </div>
        )}

        {/* Render a Quiz */}
        {recentQuiz && (
           <div className="flex flex-col gap-2">
             <span className="text-xs font-semibold text-text-muted uppercase tracking-wider pl-1">New Quiz</span>
            <QuizCard
              id={recentQuiz.id}
              category={recentQuiz.category}
              title={recentQuiz.title}
              description={recentQuiz.description}
              difficulty={recentQuiz.difficulty as "Easy" | "Medium" | "Hard"}
              questionCount={recentQuiz.questions.length}
              icon={getCategoryIcon(recentQuiz.category)}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentlyAdded;
