import { ArrowRight, Braces, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import {
  SvglLibraryIcon,
  findLibraryIconId,
  getRoadmapLibraryIconIds,
} from '@/components/roadmap/svgl-library-icon';
import type {
  RoadmapDocument,
  RoadmapId,
  RoadmapLocaleContent,
  RoadmapPageCopy,
} from '@/lib/roadmap-content';

const DESKTOP_NODE_HEIGHT = 248;
const DESKTOP_PATH_WIDTH = 132;
const DESKTOP_CENTER_X = DESKTOP_PATH_WIDTH / 2;

function RoadmapIcon({ roadmapId, className }: { roadmapId: RoadmapId; className?: string }) {
  if (roadmapId === 'react') {
    return (
      <SvglLibraryIcon
        id="react"
        size={className?.includes('h-7') ? 28 : 16}
        className={className}
      />
    );
  }

  return (
    <SvglLibraryIcon
      id="nestjs"
      size={className?.includes('h-7') ? 28 : 16}
      className={className}
    />
  );
}

function buildTopicDistribution(totalTopics: number, milestoneCount: number) {
  const baseTopics = Math.floor(totalTopics / milestoneCount);
  const remainder = totalTopics % milestoneCount;

  return Array.from(
    { length: milestoneCount },
    (_, index) => baseTopics + (index < remainder ? 1 : 0),
  );
}

function buildPhaseRanges(
  totalSteps: number,
  phaseLabels: RoadmapPageCopy['detail']['phaseLabels'],
  totalLabel: string,
) {
  const first = Math.ceil(totalSteps / 3);
  const second = Math.ceil((totalSteps - first) / 2);
  const third = Math.max(totalSteps - first - second, 1);
  const sizes = [first, second, third];
  let current = 1;

  const phases = sizes.map((size, index) => {
    const start = current;
    const end = current + size - 1;
    current = end + 1;

    return {
      label: phaseLabels[index],
      range: start === end ? `${start}` : `${start}-${end}`,
    };
  });

  return [
    ...phases,
    {
      label: totalLabel,
      range: `${totalSteps}`,
    },
  ];
}

function VerticalJourneyPath({
  milestoneCount,
  accent,
}: {
  milestoneCount: number;
  accent: string;
}) {
  const totalHeight = milestoneCount * DESKTOP_NODE_HEIGHT;
  let d = `M ${DESKTOP_CENTER_X} ${DESKTOP_NODE_HEIGHT / 2}`;

  for (let index = 0; index < milestoneCount - 1; index += 1) {
    const currentY = index * DESKTOP_NODE_HEIGHT + DESKTOP_NODE_HEIGHT / 2;
    const nextY = (index + 1) * DESKTOP_NODE_HEIGHT + DESKTOP_NODE_HEIGHT / 2;
    const midY = (currentY + nextY) / 2;
    const bulge = index % 2 === 0 ? DESKTOP_CENTER_X + 28 : DESKTOP_CENTER_X - 28;
    d += ` C ${bulge} ${midY - 12}, ${bulge} ${midY + 12}, ${DESKTOP_CENTER_X} ${nextY}`;
  }

  return (
    <svg
      className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
      style={{ width: DESKTOP_PATH_WIDTH, height: totalHeight, zIndex: 0 }}
      viewBox={`0 0 ${DESKTOP_PATH_WIDTH} ${totalHeight}`}
    >
      <path d={d} fill="none" stroke="#E6E0D7" strokeWidth="16" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={accent}
        strokeOpacity="0.55"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OverviewJourneyTrack({
  milestoneCount,
  activeIndex,
  accent,
}: {
  milestoneCount: number;
  activeIndex: number;
  accent: string;
}) {
  const width = 640;
  const height = 90;
  const points = Array.from({ length: milestoneCount }, (_, index) => {
    const x = 32 + index * ((width - 64) / Math.max(milestoneCount - 1, 1));
    const y = index % 2 === 0 ? 36 : 62;

    return { x, y };
  });

  const path = points.reduce((currentPath, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previousPoint = points[index - 1];
    const controlX = (previousPoint.x + point.x) / 2;
    const controlY = index % 2 === 0 ? 76 : 22;

    return `${currentPath} Q ${controlX} ${controlY} ${point.x} ${point.y}`;
  }, '');

  return (
    <svg className="h-24 w-full" viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke="#DFD7CC" strokeWidth="5" strokeLinecap="round" />
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeOpacity="0.65"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {points.map((point, index) => {
        const isActive = index === activeIndex;
        const isCompleted = index < activeIndex;

        return (
          <g key={`${point.x}-${point.y}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={isActive ? 18 : 13}
              fill={isActive ? '#FFFFFF' : isCompleted ? `${accent}1A` : '#FFFFFF'}
              stroke={isActive || isCompleted ? accent : '#D9D2C7'}
              strokeWidth={isActive ? 4 : 3}
            />
            <text
              x={point.x}
              y={point.y + 4}
              textAnchor="middle"
              fontSize={isActive ? 12 : 11}
              fontWeight="700"
              fill={isActive || isCompleted ? accent : '#95A0B4'}
            >
              {(index + 1).toString().padStart(2, '0')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MilestonePreview({
  milestone,
  accent,
  strong,
  index,
}: {
  milestone: RoadmapLocaleContent['milestones'][number];
  accent: string;
  strong: string;
  index: number;
}) {
  const primaryTag = milestone.tags[0] ?? milestone.title;
  const secondaryTag = milestone.tags[1] ?? milestone.step;
  const tertiaryTag = milestone.tags[2] ?? primaryTag;
  const variant = index % 4;

  if (variant === 0) {
    return (
      <div className="border-border/70 rounded-[1.2rem] border bg-white/80 p-3 dark:bg-white/5">
        <div className="space-y-2">
          {[primaryTag, secondaryTag, tertiaryTag].map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"
              style={{ borderColor: `${accent}45`, background: `${accent}10`, color: accent }}
            >
              {findLibraryIconId(tag) ? (
                <SvglLibraryIcon id={findLibraryIconId(tag)!} size={14} className="h-3.5 w-3.5" />
              ) : null}
              {tag}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 1) {
    return (
      <div
        className="rounded-[1.2rem] p-3 font-mono text-[11px] leading-5 text-white"
        style={{ background: strong }}
      >
        <div className="opacity-60">{'function roadmapStep() {'}</div>
        <div className="pl-3 text-[#9EE86A]">{`return '${primaryTag}';`}</div>
        <div className="pl-3 text-[#86D9FF]">{`// ${secondaryTag}`}</div>
        <div>{'}'}</div>
      </div>
    );
  }

  if (variant === 2) {
    return (
      <div className="border-border/70 grid grid-cols-2 gap-2 rounded-[1.2rem] border bg-white/80 p-3 dark:bg-white/5">
        {[primaryTag, secondaryTag, tertiaryTag, milestone.step].map((tag) => (
          <div
            key={tag}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border px-2 text-center text-[11px] font-semibold"
            style={{ borderColor: `${accent}45`, color: accent }}
          >
            {findLibraryIconId(tag) ? (
              <SvglLibraryIcon id={findLibraryIconId(tag)!} size={14} className="h-3.5 w-3.5" />
            ) : null}
            {tag}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border-border/70 rounded-[1.2rem] border bg-white/80 p-3 dark:bg-white/5">
      <div className="mb-2 flex flex-wrap justify-center gap-2">
        {[primaryTag, secondaryTag, tertiaryTag].map((tag) => (
          <div
            key={tag}
            className="inline-flex max-w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-center text-[11px] leading-4 font-semibold"
            style={{ background: `${accent}14`, color: accent }}
          >
            {findLibraryIconId(tag) ? (
              <SvglLibraryIcon id={findLibraryIconId(tag)!} size={12} className="h-3 w-3" />
            ) : null}
            {tag}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-px flex-1" style={{ background: `${accent}45` }} />
        <div
          className="rounded-full px-2 py-1 text-[10px] font-bold tracking-[0.16em] uppercase"
          style={{ background: `${accent}18`, color: accent }}
        >
          #{milestone.step}
        </div>
        <div className="h-px flex-1" style={{ background: `${accent}45` }} />
      </div>
    </div>
  );
}

function DesktopMilestoneCard({
  milestone,
  index,
  roadmap,
  topics,
  actionLabel,
  topicUnitLabel,
}: {
  milestone: RoadmapLocaleContent['milestones'][number];
  index: number;
  roadmap: RoadmapDocument;
  topics: number;
  actionLabel: string;
  topicUnitLabel: string;
}) {
  return (
    <article className="paper-card rounded-[1.65rem] p-5 shadow-[0_18px_60px_rgba(15,68,122,0.08)]">
      <div className="grid gap-4 xl:grid-cols-[1fr_168px] xl:items-start">
        <div>
          <h4 className="text-lg font-semibold text-[#071B3A] dark:text-[#F5F0EA]">
            {milestone.title}
          </h4>
          <p className="text-muted-foreground mt-2 text-sm leading-6">{milestone.description}</p>

          <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {milestone.tags.map((tag) => (
              <span
                key={`${milestone.step}-${tag}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                style={{
                  borderColor: roadmap.theme.border,
                  background: roadmap.theme.soft,
                  color: roadmap.theme.accent,
                }}
              >
                {findLibraryIconId(tag) ? (
                  <SvglLibraryIcon id={findLibraryIconId(tag)!} size={14} className="h-3.5 w-3.5" />
                ) : null}
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-sm font-medium">
              {topics} {topicUnitLabel}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ background: roadmap.theme.soft, color: roadmap.theme.accent }}
            >
              {actionLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <MilestonePreview
          milestone={milestone}
          accent={roadmap.theme.accent}
          strong={roadmap.theme.strong}
          index={index}
        />
      </div>
    </article>
  );
}

type ClassicRoadmapJourneyProps = {
  roadmapId: RoadmapId;
  roadmap: RoadmapDocument;
  content: RoadmapLocaleContent;
  copy: RoadmapPageCopy;
};

export function ClassicRoadmapJourney({
  roadmapId,
  roadmap,
  content,
  copy,
}: ClassicRoadmapJourneyProps) {
  const topicsByMilestone = buildTopicDistribution(
    roadmap.totals.topics,
    content.milestones.length,
  );
  const phaseRanges = buildPhaseRanges(
    content.milestones.length,
    copy.detail.phaseLabels,
    copy.detail.totalLabel,
  );
  const activeIndex = Math.min(
    content.milestones.length - 1,
    Math.floor(content.milestones.length / 2),
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
        <div className="space-y-5 rounded-[2rem] bg-white/55 p-1 dark:bg-white/0">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{
              borderColor: roadmap.theme.border,
              background: roadmap.theme.soft,
              color: roadmap.theme.accent,
            }}
          >
            <RoadmapIcon roadmapId={roadmapId} className="h-3.5 w-3.5" />
            {copy.detail.eyebrow}
          </div>

          <div className="space-y-4">
            <h2 className="max-w-3xl text-4xl leading-[1.02] font-black tracking-[-0.06em] text-[#071B3A] md:text-6xl dark:text-[#F5F0EA]">
              {content.name}
            </h2>
            <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
              {content.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#classic-roadmap-path"
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
            >
              {copy.detail.continueAction}
              <ArrowRight className="h-4 w-4" />
            </a>

            <Link
              href="/questions"
              className="border-border hover:bg-muted inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors"
            >
              {copy.cta.secondary}
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {[content.durationText, content.topicCountText, content.questionCountText].map(
              (stat) => (
                <div
                  key={stat}
                  className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium shadow-sm dark:bg-white/6"
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: roadmap.theme.accent }}
                  />
                  {stat}
                </div>
              ),
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {getRoadmapLibraryIconIds(roadmapId).map((iconId) => (
              <div
                key={`${roadmapId}-${iconId}`}
                className="border-border/70 flex h-11 w-11 items-center justify-center rounded-2xl border bg-white/85 shadow-sm dark:bg-white/6"
              >
                <SvglLibraryIcon id={iconId} size={20} className="h-5 w-5" />
              </div>
            ))}
          </div>
        </div>

        <div className="paper-card rounded-[1.85rem] p-5 shadow-[0_18px_60px_rgba(15,68,122,0.08)] md:p-6">
          <h3 className="text-lg font-semibold text-[#071B3A] dark:text-[#F5F0EA]">
            {copy.detail.overviewTitle}
          </h3>

          <div className="mt-4">
            <OverviewJourneyTrack
              milestoneCount={content.milestones.length}
              activeIndex={activeIndex}
              accent={roadmap.theme.accent}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {phaseRanges.map((phase) => (
              <div
                key={`${phase.label}-${phase.range}`}
                className="border-border/70 rounded-[1.15rem] border bg-white/75 px-4 py-3 dark:bg-white/5"
              >
                <p className="text-sm font-semibold text-[#071B3A] dark:text-[#F5F0EA]">
                  {phase.label}
                </p>
                <p className="mt-1 text-lg font-bold" style={{ color: roadmap.theme.accent }}>
                  {phase.range}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="classic-roadmap-path" className="pt-2">
        <h3 className="mb-6 text-2xl font-bold tracking-tight text-[#071B3A] dark:text-[#F5F0EA]">
          {copy.detail.milestonesTitle}
        </h3>

        <div className="space-y-4 lg:hidden">
          {content.milestones.map((milestone, index) => (
            <div key={`${roadmapId}-mobile-${milestone.step}`} className="relative pl-16">
              {index < content.milestones.length - 1 ? (
                <div
                  className="absolute top-11 left-[1.45rem] h-[calc(100%-0.5rem)] w-[6px] rounded-full"
                  style={{ background: `${roadmap.theme.accent}2B` }}
                />
              ) : null}

              <div
                className="absolute top-1 left-0 flex h-12 w-12 items-center justify-center rounded-full border-[5px] bg-white text-sm font-bold shadow-sm"
                style={{ borderColor: roadmap.theme.soft, color: roadmap.theme.accent }}
              >
                {milestone.step}
              </div>

              <DesktopMilestoneCard
                milestone={milestone}
                index={index}
                roadmap={roadmap}
                topics={topicsByMilestone[index] ?? 0}
                actionLabel={copy.detail.studyAction}
                topicUnitLabel={copy.detail.topicUnitLabel}
              />
            </div>
          ))}
        </div>

        <div
          className="relative hidden lg:block"
          style={{ minHeight: content.milestones.length * DESKTOP_NODE_HEIGHT }}
        >
          <VerticalJourneyPath
            milestoneCount={content.milestones.length}
            accent={roadmap.theme.accent}
          />

          <div className="relative z-10">
            {content.milestones.map((milestone, index) => {
              const isLeft = index % 2 === 0;
              const isLast = index === content.milestones.length - 1;

              if (isLast) {
                return (
                  <div
                    key={`${roadmapId}-${milestone.step}`}
                    className="flex flex-col items-center justify-center gap-5"
                    style={{ minHeight: DESKTOP_NODE_HEIGHT }}
                  >
                    <div className="relative flex w-[14%] shrink-0 items-center justify-center">
                      <div
                        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-[6px] bg-white text-sm font-bold shadow-[0_12px_30px_rgba(15,68,122,0.10)]"
                        style={{ borderColor: roadmap.theme.soft, color: roadmap.theme.accent }}
                      >
                        {milestone.step}
                      </div>
                    </div>

                    <div className="w-[43%] min-w-0">
                      <DesktopMilestoneCard
                        milestone={milestone}
                        index={index}
                        roadmap={roadmap}
                        topics={topicsByMilestone[index] ?? 0}
                        actionLabel={copy.detail.studyAction}
                        topicUnitLabel={copy.detail.topicUnitLabel}
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`${roadmapId}-${milestone.step}`}
                  className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                  style={{ minHeight: DESKTOP_NODE_HEIGHT }}
                >
                  <div className="w-[43%]">
                    <DesktopMilestoneCard
                      milestone={milestone}
                      index={index}
                      roadmap={roadmap}
                      topics={topicsByMilestone[index] ?? 0}
                      actionLabel={copy.detail.studyAction}
                      topicUnitLabel={copy.detail.topicUnitLabel}
                    />
                  </div>

                  <div className="relative flex w-[14%] shrink-0 items-center justify-center">
                    <div className="bg-border/80 absolute top-1/2 right-0 left-0 h-px -translate-y-1/2" />
                    <div
                      className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-[6px] bg-white text-sm font-bold shadow-[0_12px_30px_rgba(15,68,122,0.10)]"
                      style={{ borderColor: roadmap.theme.soft, color: roadmap.theme.accent }}
                    >
                      {milestone.step}
                    </div>
                  </div>

                  <div className="w-[43%]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="paper-card rounded-[1.6rem] p-5">
          <h3 className="text-xl font-bold text-[#071B3A] dark:text-[#F5F0EA]">
            {content.support.title}
          </h3>
          <p className="text-muted-foreground mt-3 text-sm leading-7">
            {content.support.description}
          </p>

          <div className="mt-4 space-y-3">
            {content.support.items.map((item) => (
              <div
                key={item}
                className="border-border/70 flex items-start gap-3 rounded-[1rem] border bg-white/75 px-4 py-3 dark:bg-white/5"
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: roadmap.theme.accent }}
                />
                <p className="text-sm leading-6 text-[#071B3A] dark:text-[#F5F0EA]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="paper-card rounded-[1.6rem] p-5">
          <h3 className="text-xl font-bold text-[#071B3A] dark:text-[#F5F0EA]">
            {copy.detail.outcomesTitle}
          </h3>
          <div className="mt-4 space-y-3">
            {content.outcomes.map((outcome) => (
              <div key={outcome} className="flex items-start gap-3">
                <div
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: roadmap.theme.accent }}
                />
                <p className="text-muted-foreground text-sm leading-7">{outcome}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="paper-card rounded-[1.6rem] p-5">
          <div className="flex items-center gap-2">
            <Braces className="h-5 w-5" style={{ color: roadmap.theme.accent }} />
            <h3 className="text-xl font-bold text-[#071B3A] dark:text-[#F5F0EA]">
              {copy.detail.skillMapTitle}
            </h3>
          </div>

          <p className="text-muted-foreground mt-3 text-sm leading-7">
            {copy.detail.skillMapDescription}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {getRoadmapLibraryIconIds(roadmapId).map((iconId) => (
              <div
                key={`skill-${roadmapId}-${iconId}`}
                className="border-border/70 flex h-10 w-10 items-center justify-center rounded-2xl border bg-white/80 dark:bg-white/6"
              >
                <SvglLibraryIcon id={iconId} size={18} className="h-4.5 w-4.5" />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {content.previewNodes.map((node, index) => (
              <div key={`${roadmapId}-${node}`} className="flex items-center gap-3">
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold"
                  style={{
                    borderColor: roadmap.theme.border,
                    background: roadmap.theme.soft,
                    color: roadmap.theme.accent,
                  }}
                >
                  {findLibraryIconId(node) ? (
                    <SvglLibraryIcon id={findLibraryIconId(node)!} size={16} className="h-4 w-4" />
                  ) : null}
                  {node}
                </div>
                {index < content.previewNodes.length - 1 ? (
                  <ArrowRight className="text-muted-foreground h-4 w-4" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
