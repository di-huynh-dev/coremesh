import Link from "next/link";
import React, { JSX } from "react";
import { FiLayers, FiPlayCircle } from "react-icons/fi";
import {
  DIFFICULTY_STYLES,
  getCategoryBadgeClass,
  getBeamColor,
} from "@/lib/constants";

export interface QuizCardProps {
  id: string;
  category: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionCount: number;
  icon: JSX.Element;
}

const QuizCard: React.FC<QuizCardProps> = ({
  id,
  category,
  title,
  description,
  difficulty,
  questionCount,
  icon,
}) => {
  const normalizedCategory = category.toLowerCase();
  const diffClass =
    DIFFICULTY_STYLES[difficulty.toLowerCase()]?.simpleBadge ||
    DIFFICULTY_STYLES.medium.simpleBadge;
  const categoryClass = getCategoryBadgeClass(normalizedCategory);
  const beamColor = getBeamColor(normalizedCategory);

  return (
    <Link
      href={`/quizzes/${normalizedCategory}/${id}`}
      className="group relative flex flex-col justify-between h-full rounded-2xl p-[1.5px] overflow-hidden transition-all duration-300"
    >
      {/* Default resting border — fades out when beam activates */}
      <div className="absolute inset-0 rounded-2xl border border-card-border group-hover:opacity-0 transition-opacity duration-300 pointer-events-none z-20" />

      {/* Rotating Border Beam — only visible on hover */}
      <div
        className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `conic-gradient(from 0deg, transparent 35%, ${beamColor} 50%, transparent 65%)`,
        }}
      />

      {/* Card Surface */}
      <div className="relative flex flex-col justify-between h-full bg-card-bg/60 backdrop-blur-md rounded-[14.5px] p-6 z-10">
        <div>
          {/* Top visual graphic area or icon header */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-background border border-card-border text-foreground group-hover:scale-105 transition-all duration-300">
              {icon}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded text-white border uppercase ${categoryClass}`}
              >
                {category}
              </span>
              <span
                className={`text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase ${diffClass}`}
              >
                {difficulty}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base md:text-lg font-bold text-foreground tracking-tight group-hover:text-foreground/95 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Description */}
          <p className="mt-2.5 text-xs md:text-sm text-text-muted leading-relaxed font-normal line-clamp-3 transition-colors">
            {description}
          </p>
        </div>

        {/* Footer Details */}
        <div className="mt-6 pt-4 border-t border-card-border flex items-center justify-between text-xs font-semibold text-text-muted group-hover:text-foreground transition-colors">
          <div className="flex items-center gap-1.5 text-text-muted">
            <FiLayers className="w-3.5 h-3.5" />
            <span>{questionCount} Questions</span>
          </div>

          <div className="flex items-center gap-1 text-foreground font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            <span>Start Quiz</span>
            <FiPlayCircle className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default QuizCard;
