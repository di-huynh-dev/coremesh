import Link from "next/link";

const Hero = () => {
  return (
    <section className="section-wrapper relative flex flex-col items-center justify-center text-center overflow-hidden min-h-[65vh]">
      {/* Dynamic Background Spotlight Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none transition-opacity" />

      {/* Decorative Top Badge */}
      <div className="z-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-badge-bg border border-badge-border text-xs font-semibold text-text-muted shadow-xs transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          The Ultimate Frontend Interview Platform
        </span>
      </div>

      {/* High-Impact Main Heading */}
      <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight z-10 leading-[1.1] max-w-4xl mx-auto bg-gradient-to-b from-foreground to-foreground/65 bg-clip-text text-transparent transition-colors">
        Prep Smarter, <br className="sm:hidden" />
        Not Harder.
      </h1>

      {/* Descriptive Subtitle */}
      <p className="mt-6 text-base sm:text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed z-10 font-normal transition-colors">
        Your go-to engineered resource for mastering frontend interviews with
        highly detailed questions, interactive guides, bite-sized quizzes, and expert code
        solutions.
      </p>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 z-10 w-full sm:w-auto px-4">
        <Link href="/questions/javascript">
          <button className="group relative w-full sm:w-auto px-7 py-4 bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover border border-transparent hover:shadow-[0_0_25px_-3px_rgba(14,165,233,0.25)] font-semibold rounded-xl text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
            {/* Animated Border Beam */}
            <div className="absolute inset-0 rounded-xl p-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none z-0">
              <div
                className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite]"
                style={{
                  background: `conic-gradient(from 0deg, transparent 40%, #0ea5e9 50%, transparent 60%)`,
                }}
              />
              <div className="absolute inset-[1.5px] bg-btn-primary-bg rounded-[10.5px] group-hover:bg-btn-primary-hover transition-colors duration-300" />
            </div>
            <span className="relative z-10">Start Learning</span>
          </button>
        </Link>
        <Link href="/quizzes">
          <button className="w-full sm:w-auto px-7 py-4 bg-btn-secondary-bg border border-btn-secondary-border hover:border-foreground/30 text-btn-secondary-text hover:bg-foreground/5 font-semibold rounded-xl text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
            Test Yourself
          </button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
