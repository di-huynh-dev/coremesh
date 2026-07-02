"use client";

import React from "react";
import Link from "next/link";
import { FiRefreshCcw, FiArrowLeft, FiAward, FiAlertCircle } from "react-icons/fi";

export interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  mistakes: string[]; // relatedQuestionSlugs
  onRetake: () => void;
  category: string;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  mistakes,
  onRetake,
  category,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  let feedbackText = "";
  if (percentage === 100) feedbackText = "Perfect Score! You are a master.";
  else if (percentage >= 80) feedbackText = "Great job! You know your stuff.";
  else if (percentage >= 50) feedbackText = "Good effort, but room for improvement.";
  else feedbackText = "Keep practicing! Review the concepts below.";

  // Deduplicate mistakes
  const uniqueMistakes = Array.from(new Set(mistakes.filter(Boolean)));

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-card-bg/60 backdrop-blur-md border border-card-border rounded-3xl p-8 md:p-12 text-center shadow-xl">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800">
          {percentage >= 80 ? (
            <FiAward className="w-12 h-12 text-yellow-400" />
          ) : (
            <FiAlertCircle className="w-12 h-12 text-sky-400" />
          )}
        </div>
        
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Quiz Complete!</h2>
        <p className="text-text-muted mb-8">{feedbackText}</p>

        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 px-10">
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest block mb-2">Final Score</span>
            <span className="text-5xl font-black text-foreground">{score}<span className="text-2xl text-zinc-600">/{totalQuestions}</span></span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 px-10">
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest block mb-2">Accuracy</span>
            <span className="text-5xl font-black text-sky-400">{percentage}<span className="text-2xl text-sky-500/50">%</span></span>
          </div>
        </div>

        {uniqueMistakes.length > 0 && (
          <div className="text-left bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-6 mb-10">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Topics to Review</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueMistakes.map((slug) => (
                <Link
                  key={slug}
                  href={`/questions/${category.toLowerCase()}/${slug}`}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onRetake}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-bold hover:bg-zinc-300 transition w-full sm:w-auto justify-center cursor-pointer"
          >
            <FiRefreshCcw />
            Retake Quiz
          </button>
          <Link
            href={`/quizzes/${category.toLowerCase()}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-foreground font-bold hover:bg-zinc-800 transition w-full sm:w-auto justify-center cursor-pointer"
          >
            <FiArrowLeft />
            All Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
