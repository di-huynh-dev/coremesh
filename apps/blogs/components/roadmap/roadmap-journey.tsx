"use client";

import { SkillChip } from "@/components/roadmap/library-icon";
import type { RoadmapMilestone } from "@/lib/content/roadmaps";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface Phase {
  label: string;
  start: number;
  end: number;
}

/**
 * Vertical stage path. A progress line fills as the reader scrolls, nodes light up once
 * they pass the reading line, and the sticky overview tracks the current stage.
 */
export function RoadmapJourney({
  milestones,
  phases,
  overviewLabel,
  stageLabel,
}: {
  milestones: RoadmapMilestone[];
  phases: Phase[];
  overviewLabel: string;
  stageLabel: string;
}) {
  const pathRef = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const readingLine = window.innerHeight * 0.55;
      const rect = path.getBoundingClientRect();
      setProgress(Math.min(Math.max((readingLine - rect.top) / rect.height, 0), 1));

      const nodes = path.querySelectorAll<HTMLElement>("[data-node]");
      let count = 0;
      nodes.forEach((node) => {
        if (node.getBoundingClientRect().top + node.offsetHeight / 2 <= readingLine) count++;
      });
      setReached(count);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const current = Math.max(reached - 1, 0);

  return (
    <div className="grid gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
      <aside className="hidden lg:block">
        <nav className="sticky top-24" aria-label={overviewLabel}>
          <p className="eyebrow before:bg-[var(--accent)]">{overviewLabel}</p>
          <ol className="mt-5 space-y-5">
            {phases.map((phase) => (
              <li key={phase.label}>
                <p className="flex items-baseline justify-between text-sm font-semibold text-ink">
                  {phase.label}
                  <span className="font-mono text-xs font-normal text-faint">
                    {String(phase.start + 1).padStart(2, "0")}–
                    {String(phase.end + 1).padStart(2, "0")}
                  </span>
                </p>
                <ol className="mt-2 space-y-0.5 border-l border-line">
                  {milestones.slice(phase.start, phase.end + 1).map((milestone, i) => {
                    const index = phase.start + i;
                    const active = reached > 0 && index === current;
                    return (
                      <li key={milestone.step}>
                        <a
                          href={`#stage-${milestone.step}`}
                          aria-current={active ? "step" : undefined}
                          className={cn(
                            "-ml-px block truncate border-l-2 py-1 pl-3 text-[0.8rem] transition-colors",
                            active
                              ? "border-[var(--accent)] font-medium text-ink"
                              : index < reached
                                ? "border-transparent text-ink/70 hover:text-ink"
                                : "border-transparent text-faint hover:text-ink",
                          )}
                        >
                          {milestone.title}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      <ol ref={pathRef} className="relative">
        {/* Rail and its scroll-driven fill */}
        <span aria-hidden className="absolute top-5 bottom-5 left-[19px] w-0.5 bg-line" />
        <span
          aria-hidden
          className="absolute top-5 bottom-5 left-[19px] w-0.5 origin-top bg-[var(--accent)]"
          style={{ transform: `scaleY(${progress})` }}
        />

        {milestones.map((milestone, index) => {
          const phase = phases.find((p) => p.start === index);
          const isReached = index < reached;

          return (
            <li
              key={milestone.step}
              id={`stage-${milestone.step}`}
              className="relative grid scroll-mt-28 grid-cols-[40px_minmax(0,1fr)] gap-5 pb-12 last:pb-0 md:gap-8"
            >
              <span
                data-node
                className={cn(
                  "relative z-10 flex size-10 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-[background-color,border-color,color,transform] duration-500 ease-[var(--ease-site)]",
                  isReached
                    ? "scale-110 border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-line bg-background text-faint",
                )}
              >
                {milestone.step}
              </span>

              <div data-fx-head="stage" className="pt-1.5">
                {phase ? (
                  <p
                    className="eyebrow mb-3 before:bg-[var(--accent)]"
                    data-fx="item"
                  >
                    {phase.label}
                  </p>
                ) : null}
                <p className="font-mono text-xs text-faint" data-fx="item">
                  {stageLabel.replace("{step}", milestone.step)}
                </p>
                <h3
                  className="mt-1 text-xl font-semibold tracking-[-0.02em] text-ink md:text-[1.4rem]"
                  data-fx="item"
                >
                  {milestone.title}
                </h3>
                <p className="mt-2 max-w-[68ch] leading-7 text-soft" data-fx="item">
                  {milestone.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2" data-fx="item">
                  {milestone.tags.map((tag) => (
                    <SkillChip key={tag} label={tag} />
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
