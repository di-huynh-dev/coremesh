import Link from "next/link";
import React from "react";
import { FiClock, FiArrowRight, FiBookOpen, FiActivity, FiCpu, FiUsers } from "react-icons/fi";
import { FaReact, FaCss3Alt } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";

export interface GuideCardProps {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  bgGradient?: string;
  icon?: React.ReactNode;
  isNew?: boolean;
}

const difficultyColors = {
  Beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const categoryPillColors: Record<string, string> = {
  react: "text-sky-500 bg-sky-500/10 border-sky-500/20",
  javascript: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  css: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  "css & web": "text-purple-500 bg-purple-500/10 border-purple-500/20",
  performance: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "system design": "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  behavioral: "text-teal-500 bg-teal-500/10 border-teal-500/20",
};

const beamColors: Record<string, string> = {
  react: "#0ea5e9",
  javascript: "#eab308",
  css: "#a855f7",
  performance: "#10b981",
  "system design": "#6366f1",
  behavioral: "#14b8a6",
};

const categoryIcons: Record<string, React.ReactNode> = {
  react: <FaReact className="w-5 h-5 text-sky-400" />,
  javascript: <IoLogoJavascript className="w-5 h-5 text-yellow-500" />,
  css: <FaCss3Alt className="w-5 h-5 text-purple-400" />,
  performance: <FiActivity className="w-5 h-5 text-emerald-400" />,
  "system design": <FiCpu className="w-5 h-5 text-indigo-400" />,
  behavioral: <FiUsers className="w-5 h-5 text-teal-400" />,
};

const GuideCard: React.FC<GuideCardProps> = ({
  slug,
  title,
  category,
  readTime,
  difficulty,
  description,
  icon,
  isNew,
}) => {
  const normalizedCategory = category.toLowerCase();
  const diffClass =
    difficultyColors[difficulty] || difficultyColors.Intermediate;
  const categoryClass =
    categoryPillColors[normalizedCategory] ||
    "text-neutral-500 bg-neutral-500/10 border-neutral-500/20";
  const beamColor = beamColors[normalizedCategory] || "#6366f1";
  const cardIcon = icon || categoryIcons[normalizedCategory] || <FiBookOpen className="w-4 h-4 text-text-muted" />;

  return (
    <Link
      href={`/guides/${category}/${slug}`}
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
              {cardIcon}
            </div>

            <div className="flex items-center gap-2">
              {isNew && (
                <span className="text-[9.5px] font-extrabold tracking-wider px-2 py-0.5 rounded border bg-teal-500/10 text-teal-400 border-teal-500/30 animate-pulse uppercase">
                  New
                </span>
              )}
              <span
                className={`text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase ${categoryClass}`}
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

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-card-border flex items-center justify-between text-xs font-semibold text-text-muted group-hover:text-foreground transition-colors">
          <div className="flex items-center gap-1.5 text-text-muted">
            <FiClock className="w-3.5 h-3.5" />
            <span>{readTime}</span>
          </div>

          <div className="flex items-center gap-1 text-foreground font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            <span>Read Guide</span>
            <FiArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GuideCard;
