'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Layers3,
  Mail,
  Network,
  Star,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type FormState = {
  name: string;
  email: string;
};

const skillRows = [
  { label: 'JavaScript Fundamentals' },
  { label: 'AI Engineering & Tooling', badge: 'NEW', featured: true },
  { label: 'Frontend & Component Frameworks' },
  { label: 'Databases & API Design' },
  { label: 'System Design' },
];

const radarAxes = [
  { label: 'JS Fundamentals', value: 0.74 },
  { label: 'AI + NEW', value: 0.92, featured: true },
  { label: 'Frameworks', value: 0.58 },
  { label: 'APIs & Data', value: 0.72 },
  { label: 'System Design', value: 0.48 },
];

const interviewTopics = [
  {
    title: 'Algorithms & Data Structures',
    detail: 'The patterns interviewers reach for and when they actually matter.',
    Icon: Code2,
  },
  {
    title: 'Frontend Mastery',
    detail: 'Components, rendering and state the way production frontends demand.',
    Icon: Layers3,
  },
  {
    title: 'Fullstack Thinking',
    detail: 'Wiring frontend, API and database into one coherent feature.',
    Icon: Database,
  },
  {
    title: 'System Design',
    detail: 'Scaling, data flow and the tradeoffs seniors reason about out loud.',
    Icon: Network,
  },
  {
    title: 'Software Architecture',
    detail: 'Designing systems that scale past the whiteboard sketch.',
    Icon: Cpu,
  },
  {
    title: 'AI Engineering',
    detail: 'Building with LLMs, tools and agents while keeping engineering judgment.',
    Icon: Bot,
  },
];

const communityMembers = [
  ['Andres', 'Florida, USA'],
  ['Celina', 'Senior Software Engineer - New York'],
  ['Daniel', 'Miami, USA'],
  ['David', 'Salt Lake City, USA'],
  ['Desmend', 'Senior Full-Stack Engineer - Chicago'],
  ['Geetika', 'Fremont, California'],
  ['Kendall', 'Charlotte, USA'],
  ['Mark', 'Staff Frontend Engineer - Santa Rosa'],
  ['Matt', 'Senior Full-Stack Engineer - New York'],
  ['Valeria', 'Lead Frontend Engineer - Texas'],
];

const avatarSeeds = [
  'dicode-andres',
  'dicode-celina',
  'dicode-daniel',
  'dicode-david',
  'dicode-desmend',
  'dicode-geetika',
  'dicode-kendall',
  'dicode-mark',
  'dicode-matt',
  'dicode-valeria',
];

const riskGauge = {
  centerX: 380,
  centerY: 326,
  radius: 238,
  needleRadius: 212,
  needleStartRotation: -78,
  needleEndRotation: 78,
};

function radarPoint(index: number, value: number, total: number, radius = 104, centerX = 180, centerY = 150) {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;

  return {
    x: centerX + Math.cos(angle) * radius * value,
    y: centerY + Math.sin(angle) * radius * value,
  };
}

function radarPolygon(values: number[], scale = 1) {
  return values
    .map((value, index) => {
      const point = radarPoint(index, value * scale, values.length);
      return `${point.x},${point.y}`;
    })
    .join(' ');
}

function gaugePoint(centerX: number, centerY: number, radius: number, angle: number) {
  const radians = (Math.PI * angle) / 180;

  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY - radius * Math.sin(radians),
  };
}

function gaugeArc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
  const start = gaugePoint(centerX, centerY, radius, startAngle);
  const end = gaugePoint(centerX, centerY, radius, endAngle);
  const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function AssessmentForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '' });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const updateForm = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setError('Enter your name and email to start.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Enter a valid email address.');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-900 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:border-[#263024] dark:bg-[#10150f] dark:text-[#f4efe6]">
        <CheckCircle2 className="h-9 w-9 text-emerald-500 dark:text-[#b8ff5d]" />
        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">Assessment unlocked.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-[#a9afa4]">
          Start with the DiCodeWeb question bank and use this page as your senior readiness map.
        </p>
        <Button asChild className="mt-6 h-14 w-full rounded-md text-base">
          <Link href="/questions">
            Open the assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="assessment-company">Leave this field empty</label>
        <input id="assessment-company" tabIndex={-1} autoComplete="off" name="company_website" />
      </div>

      <div>
        <div className="relative flex items-center gap-3 rounded-t-md border-2 border-slate-200 bg-white px-3 transition-colors focus-within:z-10 focus-within:border-slate-900 dark:border-[#303a31] dark:bg-[#070a07] dark:focus-within:border-[#b8ff5d]">
          <label htmlFor="assessment-name" className="sr-only">
            Your name
          </label>
          <UserRound className="h-4 w-4 text-slate-400 dark:text-[#7d8679]" aria-hidden="true" />
          <input
            id="assessment-name"
            value={form.name}
            onChange={(event) => updateForm('name', event.target.value)}
            className="h-14 w-full flex-1 bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-500 focus:outline-none dark:text-[#f5f1e8] dark:placeholder:text-[#777f72]"
            placeholder="Name"
            autoComplete="name"
          />
        </div>

        <div className="relative -mt-px flex items-center gap-3 rounded-b-md border-2 border-slate-200 bg-white px-3 transition-colors focus-within:z-10 focus-within:border-slate-900 dark:border-[#303a31] dark:bg-[#070a07] dark:focus-within:border-[#b8ff5d]">
          <label htmlFor="assessment-email" className="sr-only">
            Email
          </label>
          <Mail className="h-4 w-4 text-slate-400 dark:text-[#7d8679]" aria-hidden="true" />
          <input
            id="assessment-email"
            type="email"
            value={form.email}
            onChange={(event) => updateForm('email', event.target.value)}
            className="h-14 w-full flex-1 bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-500 focus:outline-none dark:text-[#f5f1e8] dark:placeholder:text-[#777f72]"
            placeholder="Email"
            autoComplete="email"
            inputMode="email"
          />
        </div>
      </div>

      <p role="alert" aria-live="polite" className={`mt-1.5 min-h-[18px] text-xs ${error ? 'text-red-600 dark:text-[#ff8a8a]' : 'text-transparent'}`}>
        {error || 'No errors'}
      </p>

      <Button type="submit" className="mt-2 h-14 w-full rounded-md text-lg font-bold tracking-tight">
        Start the Free Assessment
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-[#8d9687]">
        We will send your results by email. Unsubscribe any time.
      </p>
    </form>
  );
}

function FloatingScoreCards() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
      <div className="senior-rise absolute left-[4%] top-[12%] w-[280px] rounded-md border border-white/70 bg-white/80 p-3 text-slate-950 shadow-2xl shadow-slate-900/20 backdrop-blur-md dark:border-white/15 dark:bg-black/60 dark:text-white dark:shadow-black/50">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            AI Fluency
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-4xl font-extrabold leading-none text-red-400">14</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">/ 100</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">Critical gaps. Not interview ready yet.</p>
      </div>

      <div className="senior-rise absolute bottom-[14%] left-[10%] w-[330px] rounded-md border border-white/70 bg-white/90 p-4 text-slate-950 shadow-2xl shadow-slate-900/20 backdrop-blur-md [animation-delay:120ms] dark:border-white/15 dark:bg-black/65 dark:text-white dark:shadow-black/50">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
          Where you rank
        </p>
        <div className="mt-4 flex h-28 items-end gap-2 border-b border-l border-slate-200 px-3 pb-3 dark:border-white/15">
          {[20, 34, 48, 62, 78, 92].map((height, index) => (
            <div key={height} className="relative flex flex-1 justify-center">
              <span
                className={`w-full max-w-8 rounded-t ${index === 0 ? 'bg-[#b8ff5d]' : 'bg-slate-200 dark:bg-white/20'}`}
                style={{ height: `${height}%` }}
              />
              {index === 0 ? (
                <span className="absolute -top-7 rounded bg-[#b8ff5d] px-2 py-1 font-mono text-[10px] font-bold text-[#071006]">
                  YOU
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="senior-rise absolute right-[7%] top-[18%] w-[250px] rounded-md border border-white/70 bg-white/80 p-3 text-slate-950 shadow-2xl shadow-slate-900/20 backdrop-blur-md [animation-delay:240ms] dark:border-white/15 dark:bg-black/60 dark:text-white dark:shadow-black/50">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
          Seniority level
        </p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Mid-level</p>
        <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">Your next sprint should target architecture and AI engineering.</p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-[#8d9687]">
      {children}
    </p>
  );
}

function HighlightMark({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative isolate inline-block px-2 text-[#07112f]">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[0.08em] -z-10 h-[0.72em] rounded-[3px] bg-[#fbff24] shadow-[0_0_22px_rgba(251,255,36,0.55)] dark:bg-[#d8ff3d] dark:shadow-[0_0_22px_rgba(184,255,93,0.28)]"
      />
      {children}
    </span>
  );
}

function BenchmarkChart() {
  const bars = [
    { label: 'Early', value: 18, score: 14, current: true },
    { label: 'Junior', value: 29, score: 29 },
    { label: 'Mid', value: 43, score: 43 },
    { label: 'Upper', value: 58, score: 58 },
    { label: 'Senior', value: 74, score: 74 },
    { label: 'Staff', value: 92, score: 92 },
  ];

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-[#263024] dark:bg-[#11170f] md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-[#8d9687]">
            Score distribution
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-[#f4efe6]">
            You are at the early edge.
          </h3>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-[#303a31] dark:bg-[#0b100b]">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-[#8d9687]">
            Your score
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 dark:text-[#b8ff5d]">
            14<span className="text-base text-slate-500 dark:text-[#8d9687]">/100</span>
          </p>
        </div>
      </div>

      <div className="relative mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 px-5 pb-6 pt-8 dark:border-[#303a31] dark:bg-[#0b100b]">
        <div className="pointer-events-none absolute inset-x-5 bottom-16 top-8">
          {[25, 50, 75].map((line) => (
            <div
              key={line}
              className="absolute inset-x-0 border-t border-dashed border-slate-300/75 dark:border-[#303a31]"
              style={{ bottom: `${line}%` }}
            >
              <span className="absolute -top-3 right-0 bg-slate-50 pl-2 font-mono text-[10px] font-bold text-slate-400 dark:bg-[#0b100b] dark:text-[#65705f]">
                {line}
              </span>
            </div>
          ))}
        </div>

        <div className="relative flex h-72 items-end gap-3 border-b border-l border-slate-300 px-4 pb-8 dark:border-[#303a31]">
          {bars.map((bar) => (
            <div key={bar.label} className="relative flex h-full flex-1 flex-col items-center justify-end">
              <span className="mb-2 font-mono text-[11px] font-bold text-slate-500 dark:text-[#8d9687]">
                {bar.score}
              </span>
              <div
                className={`w-full max-w-16 rounded-t-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] ${
                  bar.current
                    ? 'bg-slate-950 dark:bg-[#b8ff5d]'
                    : 'bg-slate-300 dark:bg-[#2b3428]'
                }`}
                style={{ height: `${bar.value}%` }}
              />
              {bar.current ? (
                <span className="absolute -top-2 rounded-full bg-slate-950 px-3 py-1 font-mono text-[11px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] dark:bg-[#b8ff5d] dark:text-[#071006]">
                  YOU
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-6 gap-2 text-center text-[11px] font-semibold text-slate-600 dark:text-[#8d9687]">
          {bars.map((bar) => (
            <span key={bar.label}>{bar.label}</span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-[#a9afa4] md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#303a31] dark:bg-[#0b100b]">
          <p className="font-semibold text-slate-950 dark:text-[#f4efe6]">Gap to mid</p>
          <p className="mt-1">Practice fundamentals before scaling into architecture.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#303a31] dark:bg-[#0b100b]">
          <p className="font-semibold text-slate-950 dark:text-[#f4efe6]">Benchmark</p>
          <p className="mt-1">Mid-level candidates usually clear the 40-60 range.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#303a31] dark:bg-[#0b100b]">
          <p className="font-semibold text-slate-950 dark:text-[#f4efe6]">Next move</p>
          <p className="mt-1">Use the skill analysis to focus the next sprint.</p>
        </div>
      </div>
    </div>
  );
}

function SkillAnalysisPanel() {
  const radarValues = radarAxes.map((axis) => axis.value);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
      <div className="space-y-5">
        {skillRows.map((skill) => (
          <article
            key={skill.label}
            className={`flex items-center justify-between gap-4 rounded-[18px] border px-5 py-5 shadow-[0_14px_38px_rgba(15,23,42,0.06)] transition-colors md:px-7 md:py-6 ${
              skill.featured
                ? 'border-emerald-400 bg-emerald-50/70 dark:border-[#5ee08f] dark:bg-[#0f2116]'
                : 'border-slate-200 bg-white dark:border-[#263024] dark:bg-[#11170f]'
            }`}
          >
            <div className="flex min-w-0 items-center gap-4">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  skill.featured ? 'bg-emerald-200/80 dark:bg-[#b8ff5d]/25' : 'bg-emerald-100 dark:bg-[#b8ff5d]/15'
                }`}
              >
                <Check className="h-5 w-5 text-emerald-600 dark:text-[#b8ff5d]" aria-hidden="true" />
              </span>
              <h3 className="truncate text-lg font-bold tracking-[-0.035em] text-slate-950 dark:text-[#f4efe6] md:text-2xl">
                {skill.label}
              </h3>
            </div>

            {skill.badge ? (
              <span className="rounded-full bg-emerald-500 px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-white dark:bg-[#b8ff5d] dark:text-[#071006]">
                {skill.badge}
              </span>
            ) : null}
          </article>
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-[420px]">
        <div className="absolute inset-8 rounded-full bg-blue-500/5 blur-3xl dark:bg-[#b8ff5d]/5" aria-hidden="true" />
        <svg viewBox="0 0 360 310" role="img" aria-label="Skill radar chart" className="relative h-auto w-full">
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <polygon
              key={scale}
              points={radarPolygon(radarAxes.map(() => 1), scale)}
              fill="none"
              className="stroke-slate-200 dark:stroke-[#2a3429]"
              strokeWidth="1.4"
            />
          ))}

          {radarAxes.map((axis, index) => {
            const outer = radarPoint(index, 1, radarAxes.length);
            const label = radarPoint(index, 1.28, radarAxes.length);
            const textAnchor = index === 0 ? 'middle' : index === 1 || index === 2 ? 'start' : 'end';

            return (
              <g key={axis.label}>
                <line
                  x1="180"
                  y1="150"
                  x2={outer.x}
                  y2={outer.y}
                  className="stroke-slate-200 dark:stroke-[#2a3429]"
                  strokeWidth="1"
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  className={`font-mono text-[9px] font-bold tracking-[0.04em] ${
                    axis.featured ? 'fill-emerald-600 dark:fill-[#b8ff5d]' : 'fill-slate-600 dark:fill-[#9ba894]'
                  }`}
                >
                  {axis.label}
                </text>
              </g>
            );
          })}

          <polygon points={radarPolygon(radarValues)} fill="rgba(37, 99, 235, 0.16)" stroke="#2563eb" strokeWidth="4" />
          {radarValues.map((value, index) => {
            const point = radarPoint(index, value, radarValues.length);
            const isFeatured = radarAxes[index]?.featured;

            return (
              <circle
                key={radarAxes[index]?.label}
                cx={point.x}
                cy={point.y}
                r={isFeatured ? 7 : 5}
                fill={isFeatured ? '#22c55e' : '#2563eb'}
                className={isFeatured ? 'stroke-emerald-200 dark:stroke-[#b8ff5d]' : 'stroke-white dark:stroke-[#0b100b]'}
                strokeWidth="3"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function TargetedSkillAnalysisSection() {
  return (
    <section className="border-t border-slate-200 bg-white px-4 py-20 dark:border-[#1d241d] dark:bg-[#070907] md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel>{'// 02 - Targeted skill analysis'}</SectionLabel>
          <h2 className="mt-4 text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.06em] text-neutral-950 dark:text-[#f4efe6] md:text-6xl">
            In-Depth <HighlightMark>Skill Analysis</HighlightMark>
          </h2>
        </div>

        <div className="mt-12 rounded-[32px] border border-slate-200 bg-[linear-gradient(rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.055)_1px,transparent_1px)] bg-[size:45px_45px] p-5 shadow-[0_28px_70px_rgba(15,23,42,0.05)] dark:border-[#1f281f] dark:bg-[linear-gradient(rgba(184,255,93,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(184,255,93,0.045)_1px,transparent_1px)] md:p-8 lg:p-10">
          <SkillAnalysisPanel />
        </div>

        <blockquote className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-[#263024] dark:bg-[#11170f] md:p-8">
          <p className="text-4xl leading-none text-neutral-900 dark:text-[#b8ff5d]">&quot;</p>
          <p className="mt-4 text-2xl leading-9 tracking-[-0.03em]">
            I was able to weed out all the noise and focus on the things that were important.
          </p>
          <footer className="mt-5 text-sm text-slate-500 dark:text-[#8d9687]">
            Kirsten Lee Burton - Senior Frontend Engineer - NYC, USA
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

function RiskGaugeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const { centerX, centerY, radius, needleRadius, needleStartRotation, needleEndRotation } = riskGauge;
  const needle = gaugePoint(centerX, centerY, needleRadius, 90);
  const segments = [
    { start: 179, end: 146, color: '#f7b7b5' },
    { start: 143, end: 110, color: '#f9c9b7' },
    { start: 107, end: 73, color: '#ffd31a' },
    { start: 70, end: 37, color: '#cff5cf' },
    { start: 34, end: 1, color: '#aef0c2' },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    const needleElement = needleRef.current;

    if (!section || !needleElement) return;

    let cleanup: (() => void) | undefined;
    let active = true;

    const setupNeedleMotion = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (!active) return;

      gsap.registerPlugin(ScrollTrigger);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(needleElement, {
          rotation: 0,
          svgOrigin: `${centerX} ${centerY}`,
        });
        return;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          needleElement,
          {
            rotation: needleStartRotation,
            svgOrigin: `${centerX} ${centerY}`,
          },
          {
            rotation: needleEndRotation,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 72%',
              end: 'bottom 42%',
              scrub: 0.7,
            },
          },
        );
      }, section);

      cleanup = () => context.revert();
    };

    void setupNeedleMotion();

    return () => {
      active = false;
      cleanup?.();
    };
  }, [centerX, centerY, needleEndRotation, needleStartRotation]);

  return (
    <section ref={sectionRef} className="border-t border-slate-200 bg-slate-50 px-4 py-20 dark:border-[#1d241d] dark:bg-[#070907] md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="mx-auto max-w-5xl text-center text-4xl font-extrabold leading-[1.02] tracking-[-0.065em] text-neutral-950 dark:text-[#f4efe6] md:text-6xl">
          Find your <HighlightMark>AI replacement</HighlightMark> risk.
        </h2>

        <div className="mt-14 rounded-[32px] border border-slate-200 bg-white bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:45px_45px] p-4 shadow-[0_28px_70px_rgba(15,23,42,0.05)] dark:border-[#1f281f] dark:bg-[#0b100b] dark:bg-[linear-gradient(rgba(184,255,93,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(184,255,93,0.035)_1px,transparent_1px)] md:p-8">
          <svg viewBox="0 0 760 430" role="img" aria-label="AI replacement risk gauge" className="h-auto w-full">
            {segments.map((segment) => (
              <path
                key={`${segment.start}-${segment.end}`}
                d={gaugeArc(centerX, centerY, radius, segment.start, segment.end)}
                fill="none"
                stroke={segment.color}
                strokeWidth="88"
              />
            ))}

            <path
              d={gaugeArc(centerX, centerY, radius - 43, 180, 0)}
              fill="none"
              className="stroke-slate-200 dark:stroke-[#243024]"
              strokeWidth="2"
            />

            <g
              ref={needleRef}
              transform={`rotate(${needleStartRotation} ${centerX} ${centerY})`}
              className="will-change-transform"
            >
              <line
                x1={centerX}
                y1={centerY}
                x2={needle.x}
                y2={needle.y}
                stroke="#2563eb"
                strokeWidth="8"
                strokeLinecap="round"
                className="drop-shadow-[0_8px_9px_rgba(37,99,235,0.35)]"
              />
              <circle cx={centerX} cy={centerY} r="15" fill="#ffffff" stroke="#6aa1ff" strokeWidth="5" className="dark:fill-[#0b100b]" />
              <circle cx={centerX} cy={centerY} r="5" fill="#2563eb" />
            </g>

            <text x="94" y="238" className="fill-slate-400 text-[20px] font-extrabold tracking-[-0.02em] dark:fill-[#8d9687]">
              Early Junior
            </text>
            <text x="166" y="126" className="fill-slate-400 text-[20px] font-extrabold tracking-[-0.02em] dark:fill-[#8d9687]">
              Junior
            </text>
            <text x="332" y="68" className="fill-slate-950 text-[18px] font-extrabold tracking-[-0.02em] dark:fill-[#f4efe6]">
              Mid-Level
            </text>
            <text x="516" y="126" className="fill-slate-400 text-[20px] font-extrabold tracking-[-0.02em] dark:fill-[#8d9687]">
              Upper Mid
            </text>
            <text x="626" y="238" className="fill-slate-400 text-[20px] font-extrabold tracking-[-0.02em] dark:fill-[#8d9687]">
              Senior
            </text>

            <text x="245" y="287" className="fill-red-500 text-[28px] font-extrabold tracking-[0.08em]">
              HIGH
            </text>
            <text x="472" y="287" className="fill-emerald-500 text-[28px] font-extrabold tracking-[0.08em]">
              LOW
            </text>
            <text x="380" y="404" textAnchor="middle" className="fill-slate-500 font-mono text-[12px] font-bold uppercase tracking-[0.18em] dark:fill-[#8d9687]">
              AI Replacement Risk
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}

function MentalModelsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const chaosPaths = [
    { d: 'M 64 104 C 128 72, 152 168, 220 138 S 330 120, 396 182', color: '#94a3b8' },
    { d: 'M 58 164 C 132 146, 160 206, 246 176 S 348 152, 404 228', color: '#ef7775' },
    { d: 'M 66 222 C 144 206, 168 250, 240 228 S 336 194, 402 270', color: '#94a3b8' },
    { d: 'M 76 284 C 150 242, 214 306, 286 274 S 354 252, 414 316', color: '#94a3b8' },
    { d: 'M 120 126 C 194 116, 202 226, 286 204 S 346 188, 408 212', color: '#94a3b8' },
    { d: 'M 100 330 C 180 290, 230 356, 310 328 S 374 292, 408 352', color: '#ef7775' },
  ];

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    let cleanup: (() => void) | undefined;
    let active = true;

    const setupMentalModelsMotion = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (!active) return;

      gsap.registerPlugin(ScrollTrigger);

      const chaosLines = Array.from(section.querySelectorAll<SVGPathElement>('[data-mental-chaos-path]'));
      const connectorLines = Array.from(section.querySelectorAll<SVGPathElement>('[data-mental-connector-path]'));
      const headLines = Array.from(section.querySelectorAll<SVGPathElement>('[data-mental-head-path]'));
      const brainLines = Array.from(section.querySelectorAll<SVGPathElement>('[data-mental-brain-path]'));
      const drawLines = [...chaosLines, ...connectorLines, ...headLines, ...brainLines];
      const labels = section.querySelectorAll('[data-mental-label]');
      const model = section.querySelectorAll('[data-mental-model]');
      const dots = section.querySelectorAll('[data-mental-dot]');
      const nodes = section.querySelectorAll('[data-mental-node]');
      const footers = section.querySelectorAll('[data-mental-footer]');

      const setDrawableLine = (line: SVGPathElement) => {
        const length = line.getTotalLength();

        gsap.set(line, {
          opacity: 0,
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      };

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set([...drawLines, labels, model, dots, nodes, footers], {
          clearProps: 'all',
          opacity: 1,
        });
        return;
      }

      const context = gsap.context(() => {
        drawLines.forEach(setDrawableLine);
        gsap.set(labels, { opacity: 0, y: 8 });
        gsap.set(model, {
          opacity: 0,
          scaleY: 0.68,
          transformBox: 'fill-box',
          transformOrigin: '50% 50%',
        });
        gsap.set(dots, { opacity: 0, scale: 0.55, transformOrigin: '50% 50%' });
        gsap.set(nodes, { opacity: 0, scale: 0.25, transformOrigin: '50% 50%' });
        gsap.set(footers, { opacity: 0, y: 10 });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 76%',
            end: 'bottom 44%',
            scrub: 0.75,
          },
        });

        timeline
          .to(chaosLines, {
            opacity: 0.78,
            strokeDashoffset: 0,
            stagger: 0.08,
            duration: 0.85,
            ease: 'none',
          })
          .to(
            labels,
            {
              opacity: 1,
              y: 0,
              stagger: 0.035,
              duration: 0.45,
              ease: 'power2.out',
            },
            '<0.08',
          )
          .to(
            model,
            {
              opacity: 1,
              scaleY: 1,
              duration: 0.38,
              ease: 'power3.out',
            },
            '-=0.18',
          )
          .to(
            dots,
            {
              opacity: 1,
              scale: 1,
              stagger: 0.045,
              duration: 0.35,
              ease: 'back.out(2)',
            },
            '-=0.1',
          )
          .to(connectorLines, {
            opacity: 1,
            strokeDashoffset: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: 'none',
          })
          .to(
            [...headLines, ...brainLines],
            {
              opacity: 1,
              strokeDashoffset: 0,
              stagger: 0.045,
              duration: 0.82,
              ease: 'none',
            },
            '-=0.38',
          )
          .to(
            nodes,
            {
              opacity: 1,
              scale: 1,
              stagger: 0.04,
              duration: 0.34,
              ease: 'back.out(2.2)',
            },
            '-=0.28',
          )
          .to(
            footers,
            {
              opacity: 1,
              y: 0,
              stagger: 0.12,
              duration: 0.38,
              ease: 'power2.out',
            },
            '-=0.12',
          )
          .to(
            nodes,
            {
              scale: 1.14,
              repeat: 1,
              yoyo: true,
              stagger: 0.03,
              duration: 0.16,
              ease: 'power1.inOut',
            },
            '+=0.02',
          );
      }, section);

      cleanup = () => context.revert();
    };

    void setupMentalModelsMotion();

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section ref={sectionRef} className="border-t border-slate-200 bg-white px-4 py-20 dark:border-[#1d241d] dark:bg-[#070907] md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.06em] text-neutral-950 dark:text-[#f4efe6] md:text-6xl">
            From Mental Chaos to <HighlightMark>Mental Models</HighlightMark>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-[#a9afa4]">
            Senior-level thinking to solve complex technical problems quickly and efficiently.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:56px_56px] p-4 shadow-[0_32px_80px_rgba(15,23,42,0.08)] dark:border-[#263024] dark:bg-[#0b100b] dark:bg-[linear-gradient(rgba(184,255,93,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(184,255,93,0.03)_1px,transparent_1px)] md:p-7">
          <svg viewBox="0 0 1100 460" role="img" aria-label="Mental chaos converted into mental models" className="h-auto w-full">
            <text data-mental-label="" x="70" y="74" className="fill-violet-400 font-mono text-[14px] font-bold">Next.js 15</text>
            <text data-mental-label="" x="210" y="116" className="fill-red-400 font-mono text-[14px] font-bold">RSC</text>
            <text data-mental-label="" x="326" y="150" className="fill-red-400 font-mono text-[14px] font-bold">LangChain</text>
            <text data-mental-label="" x="424" y="116" className="fill-emerald-500 font-mono text-[14px] font-bold">Signals</text>
            <text data-mental-label="" x="75" y="188" className="fill-orange-400 font-mono text-[14px] font-bold">Microservices</text>
            <text data-mental-label="" x="98" y="252" className="fill-emerald-500 font-mono text-[14px] font-bold">Kubernetes</text>
            <text data-mental-label="" x="292" y="284" className="fill-red-400 font-mono text-[14px] font-bold">Agents</text>
            <text data-mental-label="" x="478" y="220" className="fill-pink-400 font-mono text-[14px] font-bold">GraphQL</text>
            <text data-mental-label="" x="426" y="314" className="fill-orange-400 font-mono text-[14px] font-bold">Vite</text>
            <text data-mental-label="" x="82" y="378" className="fill-red-400 font-mono text-[14px] font-bold">RAG</text>
            <text data-mental-label="" x="198" y="394" className="fill-violet-400 font-mono text-[14px] font-bold">Monorepos</text>

            {chaosPaths.map((path) => (
              <path data-mental-chaos-path="" key={path.d} d={path.d} fill="none" stroke={path.color} strokeWidth="2.3" opacity="0.78" />
            ))}

            {[112, 152, 192, 232, 272, 312].map((y, index) => (
              <circle data-mental-dot="" key={y} cx="494" cy={y} r="4.5" fill={index === 1 || index === 5 ? '#ef4444' : '#94a3b8'} />
            ))}

            <g data-mental-model="">
              <rect x="502" y="100" width="70" height="242" rx="18" fill="#f8fafc" stroke="#2563eb" strokeWidth="3" className="dark:fill-[#10170f]" />
              <text
                x="537"
                y="224"
                textAnchor="middle"
                transform="rotate(-90 537 224)"
                className="fill-blue-600 font-mono text-[13px] font-extrabold uppercase tracking-[0.34em] dark:fill-[#b8ff5d]"
              >
                Mental Models
              </text>
            </g>

            {[150, 184, 218, 252].map((y, index) => (
              <path
                data-mental-connector-path=""
                key={y}
                d={`M 572 ${y} C ${662 + index * 8} ${y - 2}, ${710 + index * 10} ${112 + index * 42}, 800 ${118 + index * 40}`}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.2"
              />
            ))}

            <path
              data-mental-head-path=""
              d="M 878 78 C 972 78, 1032 136, 1032 220 C 1032 250, 1064 268, 1046 292 C 1030 314, 1004 326, 964 330 C 946 346, 940 382, 944 426 L 818 426 C 828 370, 808 332, 788 298 C 760 250, 762 176, 800 128 C 820 96, 846 82, 878 78 Z"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
            />
            <path data-mental-head-path="" d="M 816 426 L 940 426" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 9" className="dark:stroke-[#435142]" />

            <path data-mental-brain-path="" d="M 840 172 C 882 112, 970 130, 996 196 C 1020 252, 960 300, 890 294 C 830 288, 806 226, 840 172 Z" fill="none" stroke="#b9cdfd" strokeWidth="3" />
            <path data-mental-brain-path="" d="M 862 198 C 906 168, 964 176, 986 220" fill="none" stroke="#2563eb" strokeWidth="2.4" />
            <path data-mental-brain-path="" d="M 842 248 C 884 230, 922 246, 966 276" fill="none" stroke="#2563eb" strokeWidth="2.4" />
            <path data-mental-brain-path="" d="M 884 144 L 914 190 L 952 150 L 982 198 L 964 248 L 904 230 L 872 276" fill="none" stroke="#2563eb" strokeWidth="2.4" />

            {[
              [840, 206],
              [862, 248],
              [884, 144],
              [904, 230],
              [914, 190],
              [952, 150],
              [964, 248],
              [982, 198],
              [872, 276],
            ].map(([x, y]) => (
              <circle data-mental-node="" key={`${x}-${y}`} cx={x} cy={y} r="7" fill="#e8f0ff" stroke="#2563eb" strokeWidth="3" className="dark:fill-[#172111]" />
            ))}

            <text data-mental-label="" x="642" y="122" className="fill-blue-600 font-mono text-[13px] font-bold dark:fill-[#b8ff5d]">
              Critical Rendering Path
            </text>
            <text data-mental-label="" x="958" y="184" className="fill-blue-600 font-mono text-[13px] font-bold dark:fill-[#b8ff5d]">
              Multithreading
            </text>
            <text data-mental-label="" x="660" y="332" className="fill-blue-600 font-mono text-[13px] font-bold dark:fill-[#b8ff5d]">
              Inversion of Control
            </text>

            <text data-mental-footer="" x="68" y="430" className="fill-slate-500 font-mono text-[13px] font-extrabold uppercase tracking-[0.26em] dark:fill-[#8d9687]">
              {'// Before - trial and error'}
            </text>
            <text data-mental-footer="" x="836" y="430" className="fill-blue-600 font-mono text-[13px] font-extrabold uppercase tracking-[0.26em] dark:fill-[#b8ff5d]">
              {'// After - senior mental models'}
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}

function CommunityGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {communityMembers.map((member, index) => (
        <article
          key={`${member[0]}-${member[1]}`}
          className={`rounded-[26px] border border-slate-200 bg-white p-3 shadow-[0_10px_32px_rgba(15,23,42,0.04)] dark:border-[#263024] dark:bg-[#11170f] ${
            index === 1 || index === 8 ? 'md:col-span-2 md:row-span-2' : ''
          }`}
        >
          <Image
            src={`https://picsum.photos/seed/${avatarSeeds[index]}/180/180`}
            alt=""
            aria-hidden="true"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
          <p className="mt-4 text-sm font-bold text-slate-900 dark:text-[#f4efe6]">{member[0]}</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-[#8d9687]">{member[1]}</p>
          {index === 1 || index === 8 ? (
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-[#d7dccf]">
              I finally got clear direction on what to improve before the next technical interview.
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function FreeAssessmentShell() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-[#070907] dark:text-[#f4efe6]">
      <section className="relative lg:grid lg:min-h-[100dvh] lg:grid-cols-[minmax(0,3fr)_minmax(380px,2fr)]">
        <div className="relative h-[34vh] min-h-[240px] overflow-hidden bg-black sm:h-[42vh] lg:h-auto lg:min-h-[100dvh]">
          <Image
            src="https://picsum.photos/seed/dicodeweb-code-review/1920/1280"
            alt="Mentors reviewing code on a laptop"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.15),rgba(0,0,0,0.65))]" />
          <FloatingScoreCards />
        </div>

        <aside className="border-l border-slate-200 bg-white px-5 py-7 dark:border-[#263024] dark:bg-[#0d110d] sm:px-8 lg:sticky lg:top-0 lg:flex lg:min-h-[100dvh] lg:flex-col lg:justify-center">
          <div className="mx-auto w-full max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/d-logo.svg" alt="DiCodeWeb" width={42} height={42} className="rounded-full border border-slate-200 bg-white p-1 dark:border-[#303a31]" />
              <span className="text-xl font-bold tracking-[-0.04em]">DiCodeWeb</span>
            </Link>

            <div className="mt-10">
              <SectionLabel>Free technical assessment</SectionLabel>
              <h1 className="mt-3 text-pretty text-5xl font-semibold leading-[1.04] tracking-[-0.06em] text-neutral-900 dark:text-[#f4efe6] sm:text-6xl lg:text-6xl">
                Find Your Gaps To{' '}
                <span className="relative inline-block">
                  Senior
                  <span className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-full bg-[#b8ff5d]/70" />
                </span>{' '}
                Engineer.
              </h1>

              <ul className="mt-5 flex flex-col gap-2">
                {[
                  'Find out your real gaps to Senior.',
                  'Know what to focus on next.',
                  'See how you stand vs engineers worldwide.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-snug text-slate-600 dark:text-[#d7dccf]">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                      <Check className="h-3 w-3 text-emerald-500 dark:text-[#b8ff5d]" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <AssessmentForm />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex shrink-0 -space-x-3">
                {avatarSeeds.slice(0, 8).map((seed) => (
                  <Image
                    key={seed}
                    src={`https://picsum.photos/seed/${seed}/96/96`}
                    alt=""
                    aria-hidden="true"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full border-2 border-white object-cover dark:border-[#0d110d]"
                  />
                ))}
              </div>
              <p className="min-w-0 flex-1 text-left text-[11px] leading-tight text-slate-500 dark:text-[#8d9687]">
                <strong className="font-semibold text-slate-900 dark:text-[#f4efe6]">10,000+</strong> engineers already took the assessment.
              </p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-[#1d241d]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-[13px] font-bold text-slate-900 dark:text-[#f4efe6]">Excellent</span>
                <span className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span key={index} className="flex h-[18px] w-[18px] items-center justify-center bg-emerald-500">
                      <Star className="h-3 w-3 fill-white text-white" />
                    </span>
                  ))}
                </span>
                <span className="text-[13px] font-medium text-slate-600 dark:text-[#a9afa4]">
                  <span className="font-semibold text-slate-900 dark:text-[#f4efe6]">4.9</span> out of 5
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-20 dark:border-[#1d241d] dark:bg-[#070907] md:px-6 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[360px_1fr] lg:items-start">
          <div className="space-y-4">
            <SectionLabel>Competitive benchmark</SectionLabel>
            <h2 className="text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-neutral-900 dark:text-[#f4efe6] md:text-6xl">
              See Where You Stand.
            </h2>
            <p className="max-w-sm text-lg leading-8 text-slate-600 dark:text-[#a9afa4]">
              Compare your current engineering signal against developers preparing for senior-level interviews.
            </p>
          </div>

          <div className="space-y-6">
            <BenchmarkChart />
            <blockquote className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#263024] dark:bg-[#11170f] md:p-8">
              <p className="text-4xl leading-none text-neutral-900 dark:text-[#b8ff5d]">&quot;</p>
              <p className="mt-4 text-2xl leading-9 tracking-[-0.03em]">
                I wanted to fill my gaps to the Senior level.
              </p>
              <footer className="mt-5 text-sm text-slate-500 dark:text-[#8d9687]">
                Chris Joiner - Senior Frontend Engineer - York, UK
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      <TargetedSkillAnalysisSection />

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-20 dark:border-[#1d241d] dark:bg-[#070907] md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-4">
            <SectionLabel>Interview readiness</SectionLabel>
            <h2 className="text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-neutral-900 dark:text-[#f4efe6] md:text-6xl">
              Based On Real Interview Questions.
            </h2>
            <p className="text-lg leading-8 text-slate-600 dark:text-[#a9afa4]">
              Built around the explanations and tradeoffs that repeatedly separate mid-level from senior engineers.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interviewTopics.map((topic) => {
              const Icon = topic.Icon;
              return (
                <article key={topic.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#263024] dark:bg-[#11170f]">
                  <Icon className="h-6 w-6 text-neutral-900 dark:text-[#b8ff5d]" />
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-[#f4efe6]">{topic.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-[#a9afa4]">{topic.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <RiskGaugeSection />

      <MentalModelsSection />

      <section className="border-t border-slate-200 bg-white px-4 py-20 dark:border-[#1d241d] dark:bg-[#070907] md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl space-y-4">
            <SectionLabel>Real members, worldwide</SectionLabel>
            <h2 className="text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-neutral-900 dark:text-[#f4efe6] md:text-6xl">
              Join Engineers Already On The Path.
            </h2>
            <p className="text-lg leading-8 text-slate-600 dark:text-[#a9afa4]">
              A focused space for developers who want sharper frontend judgment and stronger interview readiness.
            </p>
          </div>

          <CommunityGrid />

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-[#303a31] dark:bg-[#11170f]">
            <p className="text-5xl font-semibold tracking-[-0.05em] text-neutral-900 dark:text-[#b8ff5d]">+345</p>
            <p className="mt-2 text-slate-600 dark:text-[#a9afa4]">more engineers from San Francisco to London to Hong Kong</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 dark:border-[#1d241d] dark:bg-[#070907] md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-7 text-sm text-slate-600 dark:border-[#263024] dark:bg-[#11170f] dark:text-[#8d9687] md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3 text-slate-900 dark:text-[#f4efe6]">
            <Image src="/d-logo.svg" alt="DiCodeWeb" width={34} height={34} className="rounded-full bg-white p-1" />
            <span className="font-semibold">DiCodeWeb</span>
          </Link>
          <p className="font-mono text-xs">$ built by engineers, for engineers</p>
          <p>Educational results vary by effort.</p>
        </div>
      </footer>
    </main>
  );
}
