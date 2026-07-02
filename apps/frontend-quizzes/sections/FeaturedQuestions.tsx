import Link from "next/link";
import { FiArrowRight, FiClock } from "react-icons/fi";
import { FaReact, FaCss3Alt } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import { SiTypescript } from "react-icons/si";
import QuestionCard, { QuestionCardProps } from "@/components/QuestionCard";

// Option to showcase a specific question when needed.
// Toggle to true/false in code as desired.
const SHOWCASE_ENABLED = true;

const SHOWCASED_QUESTION: QuestionCardProps = {
  id: "typescript-generics-utility-types",
  slug: "typescript-generics-utility-types",
  title: "TypeScript Generics and Built-in Utility Types",
  category: "typescript",
  difficulty: "Hard",
  timeEstimation: "20 mins",
  summary:
    "Deep dive into TypeScript's advanced type systems. Learn how generics, conditional types, and utility types like Omit, Pick, and ReturnType work under the hood, with real-world examples and interactive compiler explanations.",
  icon: <SiTypescript className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
  matchRate: "99%",
};

const FEATURED_QUESTIONS: QuestionCardProps[] = [
  {
    id: "debounce-immediate",
    slug: "debounce-immediate",
    title: "Implement Debounce with Immediate Flag",
    category: "javascript",
    difficulty: "Medium",
    timeEstimation: "15 mins",
    summary:
      "Write a high-performance debounce function that delays invoking a callback. Implement an edge-trigger option to fire immediately on the leading boundary.",
    icon: <IoLogoJavascript className="w-5 h-5 text-yellow-500" />,
    // matchRate: "98%",
  },
  {
    id: "react-virtual-dom-reconciliation-engine",
    slug: "react-virtual-dom-reconciliation-engine",
    title: "Virtual DOM Reconciliation Engine",
    category: "react",
    difficulty: "Hard",
    timeEstimation: "25 mins",
    icon: <FaReact className="w-5 h-5 text-sky-400" />,
    summary:
      "How does React update the UI efficiently without re-rendering the entire DOM? Understand diffing, Fiber architecture, keys, rendering optimizations, and common React interview questions.",
    // matchRate: "95%",
  },
  {
    id: "flexbox-vs-grid",
    slug: "flexbox-vs-grid",
    title: "Flexbox vs. CSS Grid Layouts",
    category: "css",
    difficulty: "Medium",
    timeEstimation: "15 mins",
    summary:
      "Understand when to use Flexbox (1D) vs. CSS Grid (2D) for modern web layouts. Learn their differences, content-first vs. layout-first design, and key interview scenarios.",
    icon: <FaCss3Alt className="w-5 h-5 text-purple-500" />,
    // matchRate: "92%",
  },
];

const FeaturedQuestions = () => {
  return (
    <section className="section-wrapper relative">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between max-w-5xl mx-auto mb-12 gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Latest Questions
          </h2>
          <p className="mt-3 text-sm md:text-base text-text-muted leading-relaxed font-normal">
            Master the most frequent, high-yield technical challenges asked by
            top-tier engineering organizations.
          </p>
        </div>

        <Link
          href="/questions"
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-foreground hover:opacity-90 group/btn transition-all self-start md:self-auto"
        >
          <span>View All Questions</span>
          <FiArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      {/* Showcased Question (Toggleable Option) */}
      {SHOWCASE_ENABLED && (
        <div className="max-w-5xl mx-auto mb-10 relative group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />
          
          <Link
            href={`/questions/${SHOWCASED_QUESTION.category}/${SHOWCASED_QUESTION.slug}`}
            className="relative flex flex-col md:flex-row justify-between items-stretch gap-6 bg-card-bg/60 backdrop-blur-md border border-card-border hover:border-card-hover-border rounded-2xl p-6 md:p-8 transition-all duration-300 block"
          >
            {/* Left side content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Header elements */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/25">
                    Showcased Question
                  </span>
                  {SHOWCASED_QUESTION.matchRate && (
                    <span className="text-[10px] font-medium text-text-muted bg-card-bg/40 border border-card-border px-2 py-0.5 rounded">
                      {SHOWCASED_QUESTION.matchRate} Match
                    </span>
                  )}
                  <span className="text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
                    {SHOWCASED_QUESTION.category}
                  </span>
                  <span className="text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase text-rose-400 bg-rose-500/10 border-rose-500/20">
                    {SHOWCASED_QUESTION.difficulty}
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight group-hover:text-foreground/95 transition-colors">
                  {SHOWCASED_QUESTION.title}
                </h3>
                <p className="mt-3 text-sm text-text-muted leading-relaxed max-w-3xl">
                  {SHOWCASED_QUESTION.summary}
                </p>
              </div>

              {/* Time estimation and Link */}
              <div className="mt-6 pt-6 border-t border-card-border flex flex-row items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                  <FiClock className="w-4 h-4" />
                  <span>{SHOWCASED_QUESTION.timeEstimation}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-foreground opacity-90 group-hover:opacity-100 transition-opacity">
                  <span>View Solution</span>
                  <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>

            {/* Right side graphical/icon visual element */}
            <div className="hidden md:flex flex-col items-center justify-center min-w-[140px] px-4 border-l border-card-border/60">
              <div className="w-16 h-16 rounded-2xl bg-background border border-card-border flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                {SHOWCASED_QUESTION.icon}
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-3">
                TS Advanced
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Grid of Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {FEATURED_QUESTIONS.map((question) => (
          <QuestionCard key={question.id} {...question} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedQuestions;
