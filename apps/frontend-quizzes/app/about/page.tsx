import React from "react";
import CategoryLayout from "@/components/layouts/CategoryLayout";
import { FiTarget, FiUsers, FiCpu, FiCheck, FiX } from "react-icons/fi";
import TopicCard from "@/components/TopicCard";
import { TOPICS } from "@/data/topics";
import { getQuestionCountByCategory } from "@/lib/mdx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "FrontendPrep exists to bridge the gap between simple tutorials and complex, first-principles questions asked in senior technical frontend interviews. Explore why we exist, who it is for, and the curricula tracks we cover.",
  alternates: {
    canonical: "/about",
  },
};

const About = () => {
  const topicsWithCounts = TOPICS.map((topic) => ({
    ...topic,
    questionCount: getQuestionCountByCategory(topic.slug),
  }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About" },
  ];
  const backLink = {
    label: "Back to Home",
    href: "/",
  };

  return (
    <CategoryLayout breadcrumbs={breadcrumbs} backLink={backLink}>
      <div className="max-w-6xl mx-auto px-2 md:px-4 py-8 md:py-16 relative">
        
        {/* Decorative ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[120px] pointer-events-none -z-10 transition-opacity duration-300" />
        <div className="absolute top-3/4 left-1/3 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10 transition-opacity duration-300" />

        {/* Hero Section */}
        <div className="text-center mb-20 relative">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6 tracking-wide uppercase shadow-xs">
            <FiTarget className="w-3.5 h-3.5 animate-pulse" />
            <span>Mastering Frontend Engineering</span>
          </div>

          <h1 className="font-brand font-extrabold text-4xl md:text-6xl tracking-tight bg-gradient-to-b from-foreground to-foreground/75 bg-clip-text text-transparent mb-6 max-w-4xl mx-auto leading-tight transition-colors">
            Demystifying Frontend Engineering.
          </h1>
          <p className="text-text-muted text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            FrontendPrep exists to bridge the gap between generic, high-level tutorial overviews and the intricate, first-principles technical questions asked in elite engineering rounds.
          </p>
        </div>

        {/* Section 1: Why FrontendPrep Exists */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32 pb-16 border-b border-card-border/60">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 shadow-xs">
              <FiCpu className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-brand">
              Why FrontendPrep Exists
            </h2>
            <p className="text-sm md:text-base text-text-muted leading-relaxed font-normal">
              Most developer prep platforms are built strictly for backend engineering—focusing heavily on generic dynamic programming and abstract algorithmic structures. Yet, frontend engineering interviews are fundamentally different.
            </p>
            <p className="text-sm md:text-base text-text-muted leading-relaxed font-normal">
              To ace a modern UI or architecture round, you are expected to understand the intricate lifecycles of JavaScript execution scopes, batched React reconciliations, browser rendering bottlenecks, and system layout painting mechanics.
            </p>
            <p className="text-sm md:text-base text-text-muted leading-relaxed font-normal">
              We built FrontendPrep to provide detailed, high-fidelity technical mock blueprints, deep first-principles explanations, interactive quizzes, and custom structural breakdowns that help you reason about software like an elite UI architect.
            </p>
          </div>

          {/* Interactive Comparison Card */}
          <div className="lg:col-span-6 relative rounded-2xl border border-card-border p-6 md:p-8 bg-card-bg/40 backdrop-blur-md overflow-hidden shadow-xs">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-lg font-bold text-foreground mb-6 font-brand tracking-tight">The Dilemma: Generic DSA vs. Real Frontend</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase mb-1.5">
                  <FiX className="w-4 h-4 flex-shrink-0" />
                  <span>Standard DSA Prep</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Focuses on abstract arrays, graph traversals, and bitwise operations. While valuable for generic reasoning, they almost never translate into writing performant, modular web interfaces.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase mb-1.5">
                  <FiCheck className="w-4 h-4 flex-shrink-0" />
                  <span>FrontendPrep Method</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Deeply analyzes browser event loops, rendering pipelines, state schedules, custom hooks memory allocations, and scalable offline caching systems.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Who It Is For */}
        <div className="mb-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-4 tracking-wide uppercase shadow-xs">
              <FiUsers className="w-3.5 h-3.5" />
              <span>Target Audience</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-brand">
              Built for Elite Frontend Candidates
            </h2>
            <p className="mt-3 text-sm md:text-base text-text-muted leading-relaxed font-normal">
              Whether you are gearing up for big tech, aiming for a high-growth startup, or leveling up your daily engineering skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group rounded-2xl border border-card-border p-6 bg-card-bg/40 backdrop-blur-sm flex flex-col gap-4 hover:border-sky-500/30 hover:bg-card-bg/60 transition-all duration-300">
              <span className="text-[10px] font-bold tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full uppercase self-start">
                Senior Architects
              </span>
              <h3 className="text-lg font-bold text-foreground font-brand">Deep Under-the-Hood Design</h3>
              <p className="text-xs md:text-sm text-text-muted leading-relaxed">
                For veteran developers seeking to master concurrent rendering timelines, memory profiling, custom hooks encapsulation, garbage collection leaks, and scalable micro-frontend architectures.
              </p>
            </div>

            <div className="group rounded-2xl border border-card-border p-6 bg-card-bg/40 backdrop-blur-sm flex flex-col gap-4 hover:border-yellow-500/30 hover:bg-card-bg/60 transition-all duration-300">
              <span className="text-[10px] font-bold tracking-wider text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full uppercase self-start">
                Mid-Level Engineers
              </span>
              <h3 className="text-lg font-bold text-foreground font-brand">Advanced Scopes & Promises</h3>
              <p className="text-xs md:text-sm text-text-muted leading-relaxed">
                For developers leveling up their mastery of JavaScript execution contexts, lexical scope closures, function context bindings, promise queuing order, and custom layout cascades.
              </p>
            </div>

            <div className="group rounded-2xl border border-card-border p-6 bg-card-bg/40 backdrop-blur-sm flex flex-col gap-4 hover:border-purple-400/30 hover:bg-card-bg/60 transition-all duration-300">
              <span className="text-[10px] font-bold tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full uppercase self-start">
                Aspiring Developers
              </span>
              <h3 className="text-lg font-bold text-foreground font-brand">First-Principles Foundations</h3>
              <p className="text-xs md:text-sm text-text-muted leading-relaxed">
                For developers starting their professional journey who want to demystify complex systems, understand layout reflows, program advanced timers, and write clean, optimized components.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Topics We Cover */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-brand">
              Comprehensive Topic Tracks
            </h2>
            <p className="mt-3 text-sm md:text-base text-text-muted leading-relaxed font-normal">
              We cover the absolute core pillars of high-fidelity frontend interviews through five specialized tracks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {topicsWithCounts.map((topic) => (
              <TopicCard key={topic.slug} {...topic} />
            ))}
          </div>
        </div>

      </div>
    </CategoryLayout>
  );
};

export default About;
