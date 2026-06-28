'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Crown,
  Flame,
  Layers3,
  Lock,
  Radar,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  companyFocus,
  continueTask,
  dashboardHero,
  dashboardStats,
  focusAreas,
  nextRecommendations,
  practiceCategories,
  practiceQueue,
  premiumHighlights,
  recentActivity,
  studyPlan,
} from '@/app/interviews/dashboard/dashboard-data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const categoryAccents = [
  'rgba(173, 190, 206, 0.22)',
  'rgba(138, 161, 184, 0.18)',
  'rgba(212, 222, 232, 0.16)',
];

const heroIndicators = [
  {
    label: 'Current plan',
    value: dashboardHero.currentPlan,
    icon: Layers3,
  },
  {
    label: 'Weekly goal',
    value: dashboardHero.weeklyGoal,
    icon: Target,
  },
  {
    label: 'Current streak',
    value: dashboardHero.streak,
    icon: Flame,
  },
  {
    label: 'Overall progress',
    value: `${dashboardHero.overallProgress}%`,
    icon: Radar,
  },
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="interview-meter h-2 w-full overflow-hidden rounded-full">
      <span className="block h-full rounded-full" style={{ width: `${value}%` }} />
    </div>
  );
}

function SectionIntro({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/8 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-[1.55rem] leading-tight font-semibold tracking-[-0.04em] text-[#f3f6f8] md:text-[2rem]">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#9eaaba]">{description}</p>
      </div>

      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#dce6ef] transition-colors hover:text-white"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function StatPanel() {
  return (
    <section className="interview-panel dashboard-reveal rounded-[1.55rem] p-5 md:p-6">
      <SectionIntro
        title="Progress Summary"
        description="A calm read on what is actually moving, not a wall of analytics."
      />

      <div className="mt-5 space-y-4">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className="interview-soft-panel rounded-[1.2rem] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#f2f5f7]">{stat.label}</p>
                <p className="mt-1 text-[1.55rem] leading-tight font-semibold tracking-[-0.04em] text-white">
                  {stat.value}
                </p>
              </div>
              {typeof stat.progress === 'number' ? (
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-[#b3c0ce]">
                  {stat.progress}%
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-[#9ba8b8]">{stat.helper}</p>
            {typeof stat.progress === 'number' ? (
              <div className="mt-4">
                <ProgressBar value={stat.progress} />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function statusTone(status: string) {
  if (status === 'Done') return 'text-[#c4f08b] border-[#c4f08b]/18 bg-[#c4f08b]/8';
  if (status === 'In progress') return 'text-[#d9e6f2] border-[#d9e6f2]/16 bg-[#d9e6f2]/6';
  if (status === 'Locked') return 'text-[#a4b1bf] border-[#a4b1bf]/14 bg-[#a4b1bf]/6';
  return 'text-[#96a4b5] border-[#96a4b5]/14 bg-[#96a4b5]/5';
}

function difficultyTone(level: string) {
  if (level === 'Advanced' || level === 'Hard') return 'text-[#f0d7b3] border-[#f0d7b3]/16 bg-[#f0d7b3]/7';
  if (level === 'Intermediate' || level === 'Medium') return 'text-[#d8e4f1] border-[#d8e4f1]/16 bg-[#d8e4f1]/7';
  return 'text-[#c8ed95] border-[#c8ed95]/16 bg-[#c8ed95]/7';
}

function queueStatusTone(status: string) {
  if (status === 'Done') return 'text-[#c7ef93]';
  if (status === 'In progress') return 'text-[#e8edf3]';
  return 'text-[#9ba8b8]';
}

function FocusPanel() {
  return (
    <section className="interview-panel dashboard-reveal rounded-[1.55rem] p-5 md:p-6">
      <SectionIntro
        title="Focus Areas"
        description="Use weak spots to decide the next hour, not just the next click."
      />

      <div className="mt-5 space-y-3">
        {focusAreas.map((item, index) => (
          <article
            key={item.title}
            className={cn(
              'interview-soft-panel rounded-[1.15rem] p-4 transition-transform duration-500',
              index > 0 ? '-mt-1 md:-mt-2' : '',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#f2f5f7]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#9ba8b8]">{item.reason}</p>
              </div>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-medium',
                  item.weakness === 'High'
                    ? 'border-[#f0d7b3]/16 bg-[#f0d7b3]/7 text-[#f0d7b3]'
                    : item.weakness === 'Medium'
                      ? 'border-[#d8e4f1]/16 bg-[#d8e4f1]/7 text-[#d8e4f1]'
                      : 'border-[#c8ed95]/16 bg-[#c8ed95]/7 text-[#c8ed95]',
                )}
              >
                {item.weakness}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#738296]">Suggested action</p>
              <Link
                href={item.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#eef2f6] transition-colors hover:text-white"
              >
                {item.action}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CompanyFocusPanel() {
  return (
    <section className="interview-panel dashboard-reveal rounded-[1.55rem] p-5 md:p-6">
      <SectionIntro
        title="Company Focus"
        description="Practice patterns commonly tested by frontend interviews at large product companies."
      />

      <div className="mt-5 space-y-2.5">
        {companyFocus.map((company) => (
          <div
            key={company.name}
            className="interview-soft-panel flex items-center justify-between gap-4 rounded-[1rem] px-4 py-3"
          >
            <span className="text-sm font-medium text-[#f0f4f7]">{company.name}</span>
            <span className="text-xs leading-5 text-[#93a1b1]">{company.emphasis}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PremiumPanel() {
  return (
    <section className="interview-panel dashboard-reveal rounded-[1.55rem] p-5 md:p-6">
      <div className="flex items-center gap-2 text-sm font-medium text-[#dce6ef]">
        <Crown className="h-4 w-4 text-[#e6edf4]" />
        Unlock deeper prep
      </div>

      <p className="mt-3 text-[1.6rem] leading-tight font-semibold tracking-[-0.04em] text-white">
        Extra depth when you move beyond sample rounds.
      </p>

      <p className="mt-3 text-sm leading-7 text-[#98a6b6]">
        Keep the free dashboard as your daily command center, then open the deeper layer only when
        you need explanation quality, premium packs, and tighter tracking.
      </p>

      <div className="mt-5 space-y-2.5">
        {premiumHighlights.map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm text-[#dce6ef]">
            <CheckCircle2 className="h-4 w-4 text-[#c4f08b]" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <Button
        asChild
        className="interview-primary-action mt-6 h-10 w-full rounded-full text-sm font-medium shadow-none hover:-translate-y-[1px]"
      >
        <Link href="/pricing">View Pro plan</Link>
      </Button>
    </section>
  );
}

function ActivityPanel() {
  return (
    <section className="interview-panel dashboard-reveal rounded-[1.55rem] p-5 md:p-6">
      <SectionIntro
        title="Recent Activity"
        description="A short trail of work so the dashboard feels connected to real practice."
      />

      <div className="mt-5 space-y-3">
        {recentActivity.map((item) => (
          <Link
            key={`${item.action}-${item.target}`}
            href={item.href}
            className="interview-soft-panel flex items-start justify-between gap-4 rounded-[1rem] px-4 py-3 transition-colors hover:bg-white/[0.05]"
          >
            <div>
              <p className="text-sm text-[#dfe7ee]">
                <span className="font-medium">{item.action}</span> {item.target}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#79889b]">
                {item.time}
              </p>
            </div>
            <ChevronRight className="mt-0.5 h-4 w-4 text-[#93a1b1]" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-[#b2bfce]">
      {label}
    </span>
  );
}

export function InterviewDashboardShell() {
  const mainRef = useRef<HTMLElement>(null);
  const companyRows = useMemo(
    () => [companyFocus.slice(0, 3), companyFocus.slice(3, 6)],
    [],
  );

  useGSAP(
    () => {
      gsap.from('.dashboard-hero > *', {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'all',
      });

      gsap.utils.toArray<Element>('.dashboard-reveal').forEach((element) => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'all',
        });
      });
    },
    { scope: mainRef },
  );

  return (
    <>
      <Navbar />

      <main ref={mainRef} className="interviews-shell min-h-[100dvh] overflow-x-hidden">
        <div className="editorial-grid px-4 pt-28 pb-24 md:px-0 md:pt-32">
          <section className="dashboard-reveal interview-panel overflow-hidden rounded-[1.9rem] p-5 md:p-7">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_360px] xl:items-start">
              <div className="dashboard-hero">
                <p className="interview-kicker font-mono text-[11px] uppercase tracking-[0.18em]">
                  Frontend interview command center
                </p>

                <h1 className="mt-4 max-w-4xl text-[2.7rem] leading-[0.96] font-semibold tracking-[-0.06em] text-white md:text-[4.6rem]">
                  {dashboardHero.title}
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-[#9aa8b9] md:text-lg">
                  {dashboardHero.subtitle}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="interview-primary-action rounded-full px-5 py-3 text-sm font-medium shadow-none hover:-translate-y-[1px]"
                  >
                    <Link href="/questions">
                      Continue practice
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="interview-secondary-action rounded-full border-white/12 px-5 py-3 text-sm font-medium text-[#eef2f6] hover:bg-white/[0.05] hover:text-white"
                  >
                    <Link href="/questions">View question bank</Link>
                  </Button>
                </div>
              </div>

              <div className="dashboard-hero interview-soft-panel rounded-[1.45rem] p-4 md:p-5">
                <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
                  <div>
                    <p className="text-sm font-medium text-[#eef2f6]">Prep status</p>
                    <p className="mt-1 text-sm leading-6 text-[#96a4b5]">
                      The shortest read on where your week stands.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#b0becd]">
                    Week 2 active
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {heroIndicators.map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="interview-soft-panel flex items-start gap-3 rounded-[1rem] px-4 py-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-[#d9e3ec]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-[#78879a]">{label}</p>
                        <p className="mt-1 text-sm font-medium text-[#f3f6f8]">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_360px]">
            <div className="space-y-8">
              <section className="interview-panel dashboard-reveal rounded-[1.65rem] p-5 md:p-6">
                <SectionIntro
                  title="Continue Where You Left Off"
                  description="The next best task should feel obvious, not buried in a question bank."
                />

                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_320px]">
                  <article className="interview-soft-panel rounded-[1.3rem] p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge label={continueTask.type} />
                      <CategoryBadge label={continueTask.difficulty} />
                      <CategoryBadge label={continueTask.estimate} />
                    </div>

                    <h3 className="mt-5 text-[1.8rem] leading-tight font-semibold tracking-[-0.04em] text-white">
                      {continueTask.title}
                    </h3>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#9aa8b9]">
                      {continueTask.note}
                    </p>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-sm text-[#cfd9e3]">
                        <span>Progress</span>
                        <span>{continueTask.progress}%</span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={continueTask.progress} />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <Button
                        asChild
                        className="interview-primary-action rounded-full px-5 py-3 text-sm font-medium shadow-none hover:-translate-y-[1px]"
                      >
                        <Link href={continueTask.href}>Resume</Link>
                      </Button>

                      <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#dce6ef] transition-colors hover:text-white"
                      >
                        Read related notes
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>

                  <div className="space-y-3">
                    {nextRecommendations.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="interview-soft-panel flex items-center justify-between gap-4 rounded-[1.1rem] px-4 py-4 transition-colors hover:bg-white/[0.05]"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#eff3f7]">{item.title}</p>
                          <p className="mt-1 text-sm text-[#8e9daf]">{item.meta}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#93a1b1]" />
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              <section className="interview-panel dashboard-reveal rounded-[1.65rem] p-5 md:p-6">
                <SectionIntro
                  title="Current Study Plan"
                  description="A four-week structure that keeps conceptual review, UI coding, and system design in the same lane."
                  actionLabel="Follow roadmap"
                  actionHref="/roadmap"
                />

                <div className="mt-5">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-[#8291a2]">Current Study Plan</p>
                      <p className="mt-1 text-xl font-semibold text-white">4-Week Frontend Interview Sprint</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#b7c4d1]">
                      Structured weekly
                    </span>
                  </div>

                  <div className="space-y-3">
                    {studyPlan.map((week) => (
                      <article
                        key={week.week}
                        className="interview-soft-panel rounded-[1.15rem] p-4 md:p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8ea0b3]">
                                {week.week}
                              </span>
                              <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', statusTone(week.status))}>
                                {week.status}
                              </span>
                            </div>
                            <h3 className="mt-3 text-lg font-semibold text-[#f3f6f8]">{week.title}</h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {week.topics.map((topic) => (
                                <CategoryBadge key={topic} label={topic} />
                              ))}
                            </div>
                          </div>

                          <div className="w-full md:w-40">
                            <div className="flex items-center justify-between text-sm text-[#cfd9e3]">
                              <span>Progress</span>
                              <span>{week.progress}%</span>
                            </div>
                            <div className="mt-2">
                              <ProgressBar value={week.progress} />
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="interview-panel dashboard-reveal rounded-[1.65rem] p-5 md:p-6">
                <SectionIntro
                  title="Today's Practice Queue"
                  description="A realistic frontend mix: explanation, implementation, UI reasoning, and one harder design prompt."
                  actionLabel="Open question bank"
                  actionHref="/questions"
                />

                <div className="mt-5 overflow-hidden rounded-[1.2rem] border border-white/8">
                  <div className="hidden grid-cols-[minmax(0,1.5fr)_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-white/8 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.16em] text-[#8191a4] md:grid">
                    <span>Question</span>
                    <span>Topic</span>
                    <span>Type</span>
                    <span>Difficulty</span>
                    <span>Estimate</span>
                    <span>Status</span>
                  </div>

                  <div className="divide-y divide-white/8">
                    {practiceQueue.map((question) => (
                      <Link
                        key={question.title}
                        href={question.href}
                        className="grid gap-3 px-4 py-4 transition-colors hover:bg-white/[0.03] md:grid-cols-[minmax(0,1.5fr)_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] md:items-center"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-[#f3f6f8]">
                              {question.title}
                            </p>
                            {question.isPremium ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-[#d9e6f2]">
                                <Lock className="h-3 w-3" />
                                Pro
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <span className="hidden text-sm text-[#9aa8b9] md:block">{question.topic}</span>
                        <span className="text-sm text-[#9aa8b9] hidden md:block">{question.type}</span>
                        <span className={cn('hidden w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium md:inline-flex', difficultyTone(question.difficulty))}>
                          {question.difficulty}
                        </span>
                        <span className="hidden text-sm text-[#9aa8b9] md:block">{question.estimate}</span>
                        <span className={cn('text-sm font-medium', queueStatusTone(question.status))}>
                          {question.status}
                        </span>

                        <div className="flex flex-wrap gap-2 md:hidden">
                          <CategoryBadge label={question.topic} />
                          <CategoryBadge label={question.type} />
                          <CategoryBadge label={question.estimate} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              <section className="interview-panel dashboard-reveal rounded-[1.65rem] p-5 md:p-6">
                <SectionIntro
                  title="Practice Categories"
                  description="Topic coverage built around how frontend interviews actually feel: coding, architecture, UI reasoning, and communication."
                />

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 [grid-auto-flow:dense]">
                  {practiceCategories.map((category, index) => {
                    const progress = Math.round((category.completedCount / category.questionCount) * 100);

                    return (
                      <Link
                        key={category.title}
                        href={category.href}
                        className="interview-soft-panel group rounded-[1.2rem] p-4 transition-all duration-300 hover:-translate-y-[2px] hover:bg-white/[0.05]"
                        style={{
                          boxShadow: `inset 0 1px 0 ${categoryAccents[index % categoryAccents.length]}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs uppercase tracking-[0.15em] text-[#8291a2]">
                                {category.questionCount} questions
                              </span>
                              {category.isPremium ? (
                                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-[#dce6ef]">
                                  Premium
                                </span>
                              ) : null}
                            </div>
                            <h3 className="mt-3 text-lg font-semibold text-[#f3f6f8]">
                              {category.title}
                            </h3>
                          </div>

                          <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', difficultyTone(category.difficulty))}>
                            {category.difficulty}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-[#97a6b6]">{category.description}</p>

                        <div className="mt-4 flex items-center justify-between text-sm text-[#cfd9e3]">
                          <span>{category.completedCount} completed</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={progress} />
                        </div>

                        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#eef2f6] transition-colors group-hover:text-white">
                          Practice
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="space-y-8 xl:sticky" style={{ top: 'var(--site-nav-offset, 96px)' }}>
              <StatPanel />
              <FocusPanel />
              <CompanyFocusPanel />
              <PremiumPanel />
              <ActivityPanel />
            </aside>
          </div>

          <section className="interview-panel dashboard-reveal mt-8 rounded-[1.8rem] p-5 md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="interview-kicker font-mono text-[11px] uppercase tracking-[0.18em]">
                  Read, then practice
                </p>
                <h2 className="mt-3 text-[1.8rem] leading-tight font-semibold tracking-[-0.04em] text-white md:text-[2.25rem]">
                  Study notes, question reps, and roadmap milestones should reinforce each other.
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#95a3b4]">
                  Use the dashboard to decide the next rep, then jump into the question bank, review
                  a note, or move one lane forward on the roadmap without losing the thread.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="interview-primary-action rounded-full px-5 py-3 text-sm font-medium shadow-none hover:-translate-y-[1px]"
                >
                  <Link href="/questions">Continue practice</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="interview-secondary-action rounded-full border-white/12 px-5 py-3 text-sm font-medium text-[#eef2f6] hover:bg-white/[0.05] hover:text-white"
                >
                  <Link href="/roadmap">Follow roadmap</Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {companyRows.map((row, index) => (
                <div
                  key={`company-row-${index}`}
                  className="interview-soft-panel flex flex-wrap gap-2 rounded-[1.1rem] p-3"
                >
                  {row.map((company) => (
                    <span
                      key={company.name}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-[#dce6ef]"
                    >
                      {company.name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
