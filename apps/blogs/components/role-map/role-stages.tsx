"use client";

import { SkillChip } from "@/components/role-map/library-icon";
import type { ResourceKind, RolePhase, RoleStage } from "@/lib/content/role-maps";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Check, ChevronDown, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

export interface RoleStageLabels {
  overview: string;
  stage: string;
  weeks: string;
  topics: string;
  practices: string;
  pitfalls: string;
  project: string;
  resources: string;
  expandAll: string;
  collapseAll: string;
  phases: Record<RolePhase, string>;
  resourceKinds: Record<ResourceKind, string>;
}

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

function stageIdFromHash() {
  const match = window.location.hash.match(/^#stage-(\d+)$/);
  return match ? match[1] : null;
}

export function RoleStages({ stages, labels }: { stages: RoleStage[]; labels: RoleStageLabels }) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(stages.slice(0, 1).map((s) => s.id)));
  const [activeId, setActiveId] = useState(stages[0]?.id ?? "");
  const allOpen = openIds.size === stages.length;

  useEffect(() => {
    const openFromHash = () => {
      const id = stageIdFromHash();
      if (!id) return;
      setOpenIds((current) => new Set(current).add(id));
      requestAnimationFrame(() => document.getElementById(`stage-${id}`)?.scrollIntoView());
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id.replace("stage-", ""));
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    stages.forEach((stage) => {
      const element = document.getElementById(`stage-${stage.id}`);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [stages]);

  const setStageOpen = (id: string, open: boolean) => {
    setOpenIds((current) => {
      if (current.has(id) === open) return current;
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const phases = (Object.keys(labels.phases) as RolePhase[])
    .map((phase) => ({ phase, stages: stages.filter((stage) => stage.phase === phase) }))
    .filter((group) => group.stages.length > 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
      <aside className="hidden lg:block">
        <nav className="sticky top-24" aria-label={labels.overview}>
          <p className="eyebrow before:bg-[var(--accent)]">{labels.overview}</p>
          <ol className="mt-5 space-y-5">
            {phases.map((group) => (
              <li key={group.phase}>
                <p className="flex items-baseline justify-between text-sm font-semibold text-ink">
                  {labels.phases[group.phase]}
                  <span className="text-xs font-normal text-faint tabular-nums">
                    {fill(labels.weeks, { count: group.stages.reduce((sum, s) => sum + s.weeks, 0) })}
                  </span>
                </p>
                <ol className="mt-2 border-l border-line">
                  {group.stages.map((stage) => {
                    const active = stage.id === activeId;
                    return (
                      <li key={stage.id}>
                        <a
                          href={`#stage-${stage.id}`}
                          aria-current={active ? "step" : undefined}
                          className={cn(
                            "-ml-px flex gap-2 border-l-2 py-1 pl-3 text-[0.8rem] leading-5 transition-colors",
                            active
                              ? "border-[var(--accent)] font-medium text-ink"
                              : "border-transparent text-faint hover:text-ink",
                          )}
                        >
                          <span className="font-mono tabular-nums">{stage.id}</span>
                          <span className="truncate">{stage.title}</span>
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

      <div>
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => setOpenIds(allOpen ? new Set() : new Set(stages.map((s) => s.id)))}
            className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-soft transition-colors hover:border-ink/30 hover:text-ink"
          >
            {allOpen ? labels.collapseAll : labels.expandAll}
          </button>
        </div>

        {phases.map((group) => (
          <section key={group.phase} className="mb-12 last:mb-0" aria-label={labels.phases[group.phase]}>
            <h3 className="mb-4 flex items-baseline gap-3 border-b border-line pb-3 text-sm font-semibold text-ink">
              {labels.phases[group.phase]}
              <span className="text-xs font-normal text-faint">
                {group.stages[0].id}–{group.stages[group.stages.length - 1].id}
              </span>
            </h3>
            <ol className="space-y-3">
              {group.stages.map((stage) => (
                <StageItem
                  key={stage.id}
                  stage={stage}
                  labels={labels}
                  open={openIds.has(stage.id)}
                  onOpenChange={(open) => setStageOpen(stage.id, open)}
                />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function StageItem({
  stage,
  labels,
  open,
  onOpenChange,
}: {
  stage: RoleStage;
  labels: RoleStageLabels;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <li id={`stage-${stage.id}`} className="scroll-mt-24">
      <details
        open={open}
        onToggle={(event) => onOpenChange(event.currentTarget.open)}
        className="group/stage rounded-2xl border border-line bg-background transition-colors open:border-ink/15"
      >
        <summary className="grid cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 p-4 sm:gap-4 sm:p-5 md:p-6 [&::-webkit-details-marker]:hidden">
          <span className="flex size-8 items-center justify-center rounded-full border-2 sm:size-10 border-[var(--accent)] font-mono text-xs font-semibold text-[var(--accent)] group-open/stage:bg-[var(--accent)] group-open/stage:text-white">
            {stage.id}
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-faint">
              {fill(labels.stage, { id: stage.id })}, {fill(labels.weeks, { count: stage.weeks })}
            </span>
            <span className="mt-0.5 block text-lg font-semibold tracking-[-0.015em] text-ink md:text-xl">
              {stage.title}
            </span>
            <span className="mt-1 block leading-7 text-soft">{stage.goal}</span>
          </span>
          <ChevronDown
            aria-hidden
            className="mt-2 size-5 text-faint transition-transform group-open/stage:rotate-180"
          />
        </summary>

        <div className="space-y-8 border-t border-line px-4 pt-6 pb-7 sm:px-5 md:px-6 md:pl-20">
          <blockquote className="border-l-2 border-[var(--accent)] pl-4 leading-7 text-ink/80">
            {stage.note}
          </blockquote>

          <div>
            <h4 className="text-sm font-semibold text-ink">{labels.topics}</h4>
            <dl className="mt-3 grid gap-x-8 gap-y-5 md:grid-cols-2">
              {stage.topics.map((topic) => (
                <div key={topic.title}>
                  <dt className="font-medium text-ink">{topic.title}</dt>
                  <dd className="mt-1 text-[0.95rem] leading-7 text-soft">{topic.detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-ink">{labels.practices}</h4>
              <ul className="mt-3 space-y-2.5">
                {stage.practices.map((practice) => (
                  <li key={practice} className="flex gap-2.5 text-[0.95rem] leading-7 text-ink/85">
                    <Check aria-hidden className="mt-1.5 size-4 shrink-0 text-[var(--accent)]" strokeWidth={2.5} />
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink">{labels.pitfalls}</h4>
              <ul className="mt-3 space-y-2.5">
                {stage.pitfalls.map((pitfall) => (
                  <li key={pitfall} className="flex gap-2.5 text-[0.95rem] leading-7 text-ink/85">
                    <TriangleAlert aria-hidden className="mt-1.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    {pitfall}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl bg-paper p-5">
            <h4 className="text-sm font-semibold text-ink">
              {labels.project}: {stage.project.title}
            </h4>
            <p className="mt-2 text-[0.95rem] leading-7 text-soft">{stage.project.brief}</p>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-ink">{labels.resources}</h4>
              <ul className="mt-3 space-y-2">
                {stage.resources.map((resource) => (
                  <li key={resource.url} className="flex items-baseline gap-2.5 text-[0.95rem]">
                    <span className="w-16 shrink-0 text-xs text-faint">{labels.resourceKinds[resource.kind]}</span>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-[var(--accent)]"
                    >
                      {resource.title}
                      <ArrowUpRight aria-hidden className="size-3.5 text-faint" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="flex flex-wrap gap-1.5 md:max-w-[40%] md:justify-end">
              {stage.tags.map((tag) => (
                <li key={tag}>
                  <SkillChip label={tag} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </li>
  );
}
