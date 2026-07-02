import Link from "next/link";
import React from "react";
import { FiArrowRight } from "react-icons/fi";

export interface TopicCardProps {
  slug: string;
  title: string;
  description: string;
  questionCount?: number;
  icon: React.ReactNode;
  glowColor?: string;
  bgGradient?: string;
  iconColor?: string;
  badgeClass?: string;
  isNew?: boolean;
}

const beamColors: Record<string, string> = {
  react: "#0ea5e9",
  javascript: "#eab308",
  typescript: "#3178c6",
  css: "#3b82f6",
  nextjs: "#94a3b8",
  performance: "#f97316",
  security: "#ef4444",
  dsa: "#a855f7",
  "system-design": "#10b981",
  behavioral: "#14b8a6",
};

const iconHoverStyles: Record<string, string> = {
  react:
    "group-hover:border-sky-500/30 group-hover:bg-sky-500/5 group-hover:text-sky-400",
  javascript:
    "group-hover:border-yellow-500/30 group-hover:bg-yellow-500/5 group-hover:text-yellow-400",
  typescript:
    "group-hover:border-blue-500/30 group-hover:bg-blue-500/5 group-hover:text-blue-400",
  css: "group-hover:border-blue-500/30 group-hover:bg-blue-500/5 group-hover:text-blue-500",
  nextjs:
    "group-hover:border-slate-500/30 group-hover:bg-slate-500/5 group-hover:text-slate-400",
  behavioral:
    "group-hover:border-teal-500/30 group-hover:bg-teal-500/5 group-hover:text-teal-400",
  performance:
    "group-hover:border-orange-500/30 group-hover:bg-orange-500/5 group-hover:text-orange-400",
  security:
    "group-hover:border-red-500/30 group-hover:bg-red-500/5 group-hover:text-red-400",
  dsa: "group-hover:border-purple-500/30 group-hover:bg-purple-500/5 group-hover:text-purple-400",
  "system-design":
    "group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 group-hover:text-emerald-400",
};

const TopicCard: React.FC<TopicCardProps> = ({
  slug,
  title,
  description,
  questionCount,
  icon,
  isNew,
}) => {
  const beamColor = beamColors[slug] || "#6366f1";
  const hoverClass = iconHoverStyles[slug] || "";

  return (
    <Link
      href={`/questions/${slug}`}
      className="group relative flex flex-col h-full rounded-2xl p-[1.5px] overflow-hidden transition-all duration-300"
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
      <div className="relative flex flex-col h-full bg-card-bg/60 backdrop-blur-md rounded-[14.5px] p-6 z-10">
        {/* Top section: Icon & Badge */}
        <div className="flex items-center justify-between mb-5">
          <div
            className={`flex items-center justify-center w-11 h-11 rounded-xl bg-background border border-card-border text-foreground transition-all duration-300 group-hover:scale-105 ${hoverClass}`}
          >
            {icon}
          </div>

          <div className="flex items-center gap-1.5">
            {isNew && (
              <span className="text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full border bg-teal-500/10 text-teal-400 border-teal-500/30 animate-pulse uppercase">
                New
              </span>
            )}
            {questionCount ? (
              <span className="text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-full border uppercase bg-badge-bg text-badge-text border-badge-border transition-colors">
                {questionCount} Questions
              </span>
            ) : (
              <span className="text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-full border uppercase bg-yellow-500/10 text-yellow-500 border-yellow-500 transition-colors">
                Coming Soon
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-foreground tracking-tight transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-sm text-text-muted leading-relaxed font-normal transition-colors">
            {description}
          </p>
        </div>

        {/* Action Footer */}
        <div className="mt-6 pt-4 border-t border-card-border flex items-center justify-between text-xs font-semibold text-text-muted group-hover:text-foreground transition-colors">
          <span>Explore Questions</span>
          <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300 text-text-muted group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
