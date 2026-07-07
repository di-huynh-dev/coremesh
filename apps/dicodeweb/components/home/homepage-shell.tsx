'use client';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { getAllPosts } from '@/lib/blog';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  BookOpenCheck,
  BrainCircuit,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Gauge,
  Layers3,
  Network,
  Radio,
  ShieldCheck,
  Star,
  Trophy,
  Users2,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const latestPosts = getAllPosts().slice(0, 3);

const skillScores = [
  { label: 'JavaScript Fundamentals', value: 74 },
  { label: 'React Architecture', value: 68 },
  { label: 'Performance', value: 57 },
  { label: 'System Design', value: 46 },
  { label: 'AI Engineering', value: 38 },
];

const rankBars = [26, 39, 52, 68, 83, 96];

const learningTracks = [
  {
    title: 'Frontend Interview Bank',
    detail: 'Practice real prompts across JavaScript, React, accessibility, debugging and system thinking.',
    Icon: BookOpenCheck,
    href: '/questions',
  },
  {
    title: 'Senior Readiness Assessment',
    detail: 'Find your current level, skill gaps and next study sprint before applying for better roles.',
    Icon: Gauge,
    href: '/free-assessment',
  },
  {
    title: 'Roadmaps With Depth',
    detail: 'Move through React and fullstack topics with a route that connects concepts to production work.',
    Icon: Layers3,
    href: '/roadmap',
  },
  {
    title: 'Technical Notes',
    detail: 'Read practical essays about frameworks, frontend systems, architecture and delivery tradeoffs.',
    Icon: BrainCircuit,
    href: '/blog',
  },
];

const interviewTopics = [
  { title: 'Algorithms', detail: 'Know the patterns, but also when product work needs something else.', Icon: Code2 },
  { title: 'Frontend Mastery', detail: 'Rendering, state, accessibility and component architecture under pressure.', Icon: Layers3 },
  { title: 'APIs & Data', detail: 'Reason clearly about contracts, fetching, caching and failure states.', Icon: Database },
  { title: 'System Design', detail: 'Explain scale, boundaries, tradeoffs and ownership like a senior engineer.', Icon: Network },
  { title: 'Architecture', detail: 'Structure codebases that stay changeable as teams and features grow.', Icon: Cpu },
  { title: 'AI Engineering', detail: 'Use models, tools and agents without losing engineering judgment.', Icon: Bot },
];

const communityMembers = [
  ['AD', 'Andres', 'Florida, USA'],
  ['CL', 'Celina', 'Senior Software Engineer - New York'],
  ['DN', 'Daniel', 'Miami, USA'],
  ['DV', 'David', 'Salt Lake City, USA'],
  ['DS', 'Desmend', 'Senior Full-Stack Engineer - Chicago'],
  ['ER', 'Erik', 'Idaho, US'],
  ['FR', 'Froi', 'Atlanta, USA'],
  ['GK', 'Geetika', 'Fremont, California'],
  ['IR', 'Irmantas', 'Palms Harbor, USA'],
  ['JN', 'Jenise', 'Remote Frontend Engineer - Maryland'],
];

function SectionMarker({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-sm text-muted-foreground">{children}</p>;
}

function ScoreReport() {
  return (
    <div className="senior-float senior-scan rounded-[34px] border border-slate-200 bg-white p-4 shadow-[0_34px_90px_rgba(15,23,42,0.16)] dark:border-[#263024] dark:bg-[#0d110d] dark:shadow-[0_34px_90px_rgba(0,0,0,0.45)]">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 dark:border-[#273222] dark:bg-[#151b13]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-transparent dark:bg-[#0b0f0b]">
            <p className="text-xs text-slate-500 dark:text-[#8e9789]">Frontend Readiness</p>
            <p className="mt-2 text-5xl font-semibold text-slate-950 dark:text-[#f4efe6]">68</p>
            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-[#b8ff5d]">Strong mid-level signal</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-transparent dark:bg-[#0b0f0b]">
            <p className="text-xs text-slate-500 dark:text-[#8e9789]">Where You Rank</p>
            <p className="mt-2 text-5xl font-semibold text-slate-950 dark:text-[#f4efe6]">
              64<span className="text-xl text-slate-500 dark:text-[#8e9789]">th</span>
            </p>
            <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-[#e4b85b]">Architecture gaps remain</p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-transparent dark:bg-[#0b0f0b]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-[#8e9789]">Estimated Seniority</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-[#f4efe6]">Mid to Senior</p>
            </div>
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-[#384336] dark:bg-transparent dark:text-[#b8ff5d]">
              14 day plan
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {skillScores.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between gap-4 text-xs text-slate-600 dark:text-[#cbd2c6]">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-[#293128]">
                <span
                  className="block h-full rounded-full bg-[#b8ff5d]"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-[#263024] dark:bg-[#11170f]">
        <div className="flex -space-x-3">
          {['JS', 'RX', 'AI'].map((item) => (
            <span
              key={item}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-[#b8ff5d] text-xs font-bold text-[#071006] dark:border-[#11170f]"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-[#8e9789]">DiCodeWeb assessment</p>
          <p className="text-sm font-medium text-slate-950 dark:text-[#f4efe6]">Ready now</p>
        </div>
      </div>
    </div>
  );
}

function RankChart() {
  return (
    <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.07)] dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-[#8d9687]">
            Readiness rank
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">64th percentile</h3>
        </div>
        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 dark:border-[#384336] dark:bg-[#b8ff5d]/10 dark:text-[#b8ff5d]">
          You 68
        </span>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 px-5 pb-6 pt-8 dark:border-[#303a31] dark:bg-[#0b100b]">
        <div className="pointer-events-none absolute inset-x-5 bottom-16 top-8">
          {[25, 50, 75].map((line) => (
            <div
              key={line}
              className="absolute inset-x-0 border-t border-dashed border-slate-300/75 dark:border-[#303a31]"
              style={{ bottom: `${line}%` }}
            />
          ))}
        </div>

        <div className="relative flex h-72 items-end gap-3 border-b border-l border-slate-300 px-4 pb-8 dark:border-[#303a31]">
        {rankBars.map((height, index) => (
          <div key={height} className="relative flex h-full flex-1 flex-col items-center justify-end">
            <span className="mb-2 font-mono text-[11px] font-bold text-slate-500 dark:text-[#8d9687]">
              {height}
            </span>
            <div
              className={`w-full max-w-16 rounded-t-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] ${
                index === 3 ? 'bg-[#b8ff5d]' : 'bg-slate-200 dark:bg-[#2b3428]'
              }`}
              style={{ height: `${height}%` }}
            />
            {index === 3 ? (
              <span className="absolute -top-2 rounded-full bg-[#b8ff5d] px-3 py-1 font-mono text-[11px] font-extrabold text-[#071006] shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
                YOU
              </span>
            ) : null}
          </div>
        ))}
      </div>
        <div className="mt-4 grid grid-cols-6 gap-2 text-center text-[11px] font-semibold text-slate-600 dark:text-[#8d9687]">
          {['Junior', 'Upper Jr', 'Mid', 'Upper Mid', 'Senior', 'Staff'].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunityGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {communityMembers.map((member, index) => (
        <div
          key={`${member[1]}-${member[2]}`}
          className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_38px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1 dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none ${
            index === 1 || index === 6 ? 'md:col-span-2 md:row-span-2' : ''
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 dark:bg-[#20291f] dark:text-[#b8ff5d]">
            {member[0]}
          </div>
          <p className="mt-4 font-semibold text-slate-950 dark:text-[#f4efe6]">{member[1]}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-[#8d9687]">{member[2]}</p>
          {index === 1 || index === 6 ? (
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-[#d7dccf]">
              The roadmap finally made the senior gap feel concrete instead of
              vague.
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function HomePageShell() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-hidden bg-background pt-[var(--site-nav-offset)] text-foreground">
        <section className="relative px-4 pb-14 pt-8 md:px-6 md:pb-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(184,255,93,0.13),transparent_27%),radial-gradient(circle_at_80%_12%,rgba(255,255,255,0.08),transparent_24%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.82fr)] lg:items-center">
            <div className="senior-rise space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-[#b8ff5d]" />
                Senior frontend readiness system
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.04em] md:text-7xl">
                  Fast-track to Senior Engineer.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                  Benchmark your frontend skill, practice real interview
                  questions and close the gaps that keep you at mid-level.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/free-assessment">
                    Take free assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/questions">Browse questions</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {Array.from({ length: 7 }, (_, index) => (
                    <span
                      key={index}
                      className="h-8 w-8 rounded-full border-2 border-background bg-card"
                    />
                  ))}
                </div>
                <span>10,000+ practice sessions started.</span>
                <span className="flex items-center gap-1 text-foreground">
                  <Star className="h-4 w-4 fill-[#b8ff5d] text-[#b8ff5d]" />
                  Excellent 4.9 out of 5
                </span>
              </div>
            </div>

            <ScoreReport />
          </div>
        </section>

        <section className="border-y border-border px-4 py-5 md:px-6">
          <div className="mx-auto grid max-w-7xl gap-4 text-sm text-muted-foreground md:grid-cols-4">
            {['JavaScript', 'React', 'System Design', 'AI Engineering'].map((item) => (
              <div key={item} className="rounded-full border border-border bg-card px-4 py-3 text-center">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[360px_1fr] lg:items-start">
              <div className="space-y-4">
                <SectionMarker>{'// 01 - COMPETITIVE BENCHMARK'}</SectionMarker>
                <h2 className="text-4xl font-semibold md:text-6xl">See Where You Stand</h2>
                <p className="max-w-sm text-lg leading-8 text-muted-foreground">
                  Compare your current frontend signal with engineers preparing
                  for senior-level interviews.
                </p>
              </div>

              <div className="space-y-6">
                <RankChart />
                <blockquote className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none md:p-8">
                  <p className="text-5xl leading-none text-[#b8ff5d]">&quot;</p>
                  <p className="mt-4 text-2xl leading-9">
                    I wanted to fill my gaps to the Senior level.
                  </p>
                  <footer className="mt-5 text-sm text-muted-foreground">
                    Chris Joiner - Senior Frontend Engineer - York, UK
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
              <div>
                <SectionMarker>{'// 02 - LEARNING SYSTEM'}</SectionMarker>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold md:text-6xl">
                  Practice the work seniors actually explain.
                </h2>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {learningTracks.map((track) => {
                    const Icon = track.Icon;

                    return (
                      <Link
                        key={track.title}
                        href={track.href}
                        className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_38px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:border-emerald-300 dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none dark:hover:border-[#b8ff5d]/40"
                      >
                        <Icon className="h-6 w-6 text-[#b8ff5d]" />
                        <div className="mt-5 flex items-start justify-between gap-4">
                          <h3 className="text-xl font-semibold">{track.title}</h3>
                          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-emerald-600 dark:group-hover:text-[#b8ff5d]" />
                        </div>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{track.detail}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none md:p-8">
                <Trophy className="h-8 w-8 text-[#b8ff5d]" />
                <h3 className="mt-6 text-3xl font-semibold">Your next sprint.</h3>
                <div className="mt-6 space-y-4">
                  {[
                    'Complete the free readiness assessment.',
                    'Pick the weakest two skill domains.',
                    'Practice 20 targeted interview prompts.',
                    'Review the roadmap notes before mock interviews.',
                  ].map((item) => (
                    <div key={item} className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-[#d7dccf]">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#b8ff5d]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl space-y-4">
              <SectionMarker>{'// 03 - INTERVIEW READINESS'}</SectionMarker>
              <h2 className="text-4xl font-semibold md:text-6xl">
                Based On Real Interview Patterns
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Train the explanations and tradeoffs that repeatedly separate
                mid-level engineers from senior engineers.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {interviewTopics.map((topic) => {
                const Icon = topic.Icon;
                return (
                  <article key={topic.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_38px_rgba(15,23,42,0.05)] dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none">
                    <Icon className="h-6 w-6 text-[#b8ff5d]" />
                    <h3 className="mt-5 text-xl font-semibold">{topic.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{topic.detail}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none">
                <div className="flex items-center gap-3">
                  <Radio className="h-6 w-6 text-[#b8ff5d]" />
                  <h3 className="text-3xl font-semibold">AI replacement risk.</h3>
                </div>
                <div className="mt-8 h-8 rounded-full bg-[linear-gradient(90deg,#e85858,#e5b84a,#b8ff5d)]" />
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>HIGH</span>
                  <span>LOW</span>
                </div>
              </div>
              <blockquote className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none">
                <p className="text-sm text-[#b8ff5d]">Excellent - 4.9 out of 5</p>
                <p className="mt-5 text-2xl leading-9">
                  The system keeps me focused on skills that show up in real
                  interviews.
                </p>
                <footer className="mt-5 text-sm text-muted-foreground">Kendall - Verified review</footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl space-y-4">
              <SectionMarker>{'// THE COMMUNITY - REAL MEMBERS, WORLDWIDE'}</SectionMarker>
              <h2 className="text-4xl font-semibold md:text-6xl">
                Join engineers already on the path.
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                A focused space for developers who want sharper frontend
                judgment and better interview readiness.
              </p>
            </div>

            <CommunityGrid />

            <div className="mt-6 rounded-[34px] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_52px_rgba(15,23,42,0.06)] dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none">
              <Users2 className="mx-auto h-7 w-7 text-[#b8ff5d]" />
              <p className="mt-4 text-5xl font-semibold text-[#b8ff5d]">450+</p>
              <p className="mt-2 text-muted-foreground">engineers learning across questions, roadmaps and notes</p>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none md:p-8">
              <ShieldCheck className="h-8 w-8 text-[#b8ff5d]" />
              <h2 className="mt-6 text-4xl font-semibold md:text-5xl">
                Start with the free assessment.
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
                Get your senior-readiness snapshot, then follow the question
                bank and roadmap that match your weakest areas.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link href="/free-assessment">
                  Start assessment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:border-emerald-300 dark:border-[#263024] dark:bg-[#11170f] dark:shadow-none dark:hover:border-[#b8ff5d]/40"
                >
                  <p className="font-mono text-xs text-muted-foreground">{post.category}</p>
                  <h3 className="mt-3 text-2xl font-semibold">{post.title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#b8ff5d]">
                    Read article
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
