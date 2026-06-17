import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  Clock3,
  Crown,
  Filter,
  Layers3,
  Lock,
  Search,
  Share2,
  Sparkles,
  Star,
} from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';

const stats = [
  { value: '1,248', label: 'Total questions' },
  { value: '28', label: 'Topics' },
  { value: '6', label: 'Formats' },
  { value: '312', label: 'Premium answers' },
];

const filters = ['All topics', 'React', 'Next.js', 'JavaScript', 'TypeScript', 'CSS'];

const questionRows = [
  {
    index: '01',
    title: 'Implementing Code Splitting and Lazy Loading in React',
    meta: ['React', 'Intermediate', 'Theory'],
    badge: 'Free',
    badgeTone: 'free',
  },
  {
    index: '02',
    title: 'Explain React Server Components',
    meta: ['Next.js', 'Advanced', 'Theory'],
    badge: 'Premium',
    badgeTone: 'premium',
  },
  {
    index: '03',
    title: 'Debounce vs Throttle',
    meta: ['JavaScript', 'Beginner', 'Output'],
    badge: 'Free',
    badgeTone: 'free',
  },
  {
    index: '04',
    title: 'How does useEffect cleanup work?',
    meta: ['React', 'Intermediate', 'Theory'],
    badge: 'Free',
    badgeTone: 'free',
  },
  {
    index: '05',
    title: 'Next.js 14 vs 16 key differences',
    meta: ['Next.js', 'Intermediate', 'Theory'],
    badge: 'Premium',
    badgeTone: 'premium',
  },
];

const collections = [
  {
    title: 'React Interview Essentials',
    subtitle: '120 questions',
    description: 'Essential React questions from basics to advanced patterns.',
  },
  {
    title: 'Next.js Interview Patterns',
    subtitle: '85 questions',
    description: 'App Router, Server Components, auth, and rendering strategy.',
  },
  {
    title: 'JavaScript Core Concepts',
    subtitle: '95 questions',
    description: 'Closures, event loop, object identity, and async behavior.',
  },
];

const topicQuestions = [
  'Implementing Code Splitting and Lazy Loading in React',
  'Explain React Server Components',
  'How does useEffect cleanup work?',
  'Context API vs Redux',
];

const progressRows = [
  { label: 'React', progress: '40%', current: '24 / 60' },
  { label: 'Next.js', progress: '40%', current: '16 / 40' },
  { label: 'JavaScript', progress: '36%', current: '18 / 50' },
  { label: 'CSS', progress: '20%', current: '4 / 20' },
];

const bookmarks = [
  'Explain React Server Components',
  'Debounce vs Throttle',
  'How does useEffect cleanup work?',
  'Next.js 14 vs 16 key differences',
];

function AppShell({
  title,
  subtitle,
  children,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.7rem] border border-[#dfd3c5] bg-[linear-gradient(180deg,#fffefd_0%,#fffaf4_100%)] p-3 shadow-[0_22px_54px_rgba(53,42,28,0.08)]">
      <div className="rounded-[1.35rem] border border-[#ece1d5] bg-white">
        <div className="flex items-center justify-between border-b border-[#efe6dc] px-5 py-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-[#071B3A]">DiCodeWeb</p>
            <div className="hidden items-center gap-4 text-xs text-[#60708c] md:flex">
              <span className="font-medium text-[#0F447A]">Questions</span>
              <span>Roadmap</span>
              <span>Blog</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rightAction}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ece1d5] text-[#60708c]">
              <Search className="h-4 w-4" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ece1d5] text-[#60708c]">
              <Bookmark className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="mb-5">
            <h2 className="text-[1.9rem] leading-[1.1] font-semibold tracking-[-0.04em] text-[#071B3A]">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5b6a81]">{subtitle}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Label({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'premium';
}) {
  const styles = {
    neutral: 'border-[#e6ddd3] bg-[#fbf8f4] text-[#60708c]',
    accent: 'border-[#d7e3f3] bg-[#f5f9ff] text-[#0F447A]',
    success: 'border-[#d8ead5] bg-[#f3fbf0] text-[#34804a]',
    premium: 'border-[#f0dfbe] bg-[#fff7e8] text-[#b26a12]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function FlowSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-7">
      <div className="mb-5 flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d6e2f0] bg-white/85 px-3 py-1 text-sm font-medium text-[#0F447A]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F447A] text-xs text-white">
            {step}
          </span>
          Flow preview
        </div>
        <h2 className="text-[2rem] leading-[1.08] font-semibold tracking-[-0.04em] text-[#071B3A] md:text-[2.7rem]">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-8 text-[#5b6a81]">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function QuestionsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background text-foreground min-h-[100dvh] px-4 pb-24 pt-28 md:px-6 md:pt-32">
        <div className="editorial-grid">
          <section className="grid gap-10 pb-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-accent text-sm font-medium tracking-[0.14em] uppercase">
                Question Bank
              </p>
              <h1 className="mt-4 text-[3rem] leading-[0.98] font-semibold tracking-[-0.06em] text-[#071B3A] md:text-[5.2rem] dark:text-[#F5F0EA]">
                A cleaner interview practice flow.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#5b6a81]">
                The new direction follows the flow in your reference: homepage, browse, detail,
                premium lock, collections, progress, and saved questions, all translated into the
                current DiCodeWeb palette and surface system.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#071B3A] px-6 text-[#F5F0EA] hover:bg-[#0F447A]"
                >
                  <Link href="#homepage-flow">
                    Explore the flow
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-[#d7ccbf] bg-white/85 text-[#071B3A] hover:bg-[#fffaf4]"
                >
                  <Link href="/roadmap">See the roadmap</Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.25rem] border border-[#e6dbcf] bg-white/88 px-4 py-4 shadow-[0_12px_28px_rgba(53,42,28,0.04)]"
                  >
                    <p className="text-[1.7rem] font-semibold tracking-[-0.04em] text-[#071B3A]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-[#60708c]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <AppShell
              title="Question Bank"
              subtitle="Practice real frontend interview questions. Level up your skills with curated prompts and expert answers."
            >
              <div className="rounded-[1rem] border border-[#ebe2d7] bg-[#fefcf8] px-4 py-3 text-sm text-[#8a97aa]">
                Search questions, topics, or keywords...
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1rem] border border-[#ede4d8] bg-white px-3 py-4"
                  >
                    <p className="text-lg font-semibold text-[#071B3A]">{stat.value}</p>
                    <p className="mt-1 text-[11px] text-[#60708c]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.1rem] border border-[#e8ded3] bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#071B3A]">Continue practicing</p>
                    <Link href="#browse-flow" className="text-xs font-medium text-[#0F447A]">
                      View all
                    </Link>
                  </div>
                  <div className="rounded-[1rem] border border-[#edf2fa] bg-[#fbfdff] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#071B3A]">
                          Implementing Code Splitting and Lazy Loading in React
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Label tone="accent">React</Label>
                          <Label>Intermediate</Label>
                          <Label>Theory</Label>
                        </div>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 text-[#60708c]" />
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-[#edf1f5]">
                      <div className="h-2 w-[60%] rounded-full bg-[#0F447A]" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.1rem] border border-[#e8ded3] bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#071B3A]">Popular collections</p>
                    <Link href="#supporting-flow" className="text-xs font-medium text-[#0F447A]">
                      View all
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {collections.slice(0, 2).map((collection) => (
                      <div
                        key={collection.title}
                        className="rounded-[1rem] border border-[#edf2fa] bg-[#fbfdff] px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-[#071B3A]">{collection.title}</p>
                        <p className="mt-1 text-[11px] text-[#0F447A]">{collection.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AppShell>
          </section>

          <FlowSection
            step="1"
            title="Homepage and browse screens should feel product-led"
            description="The first two screens do the most orientation work: start the learner with a clear search entry, then expand into a serious browse view with filters, chips, and readable question rows."
          >
            <div className="grid gap-6 xl:grid-cols-2" id="homepage-flow">
              <AppShell
                title="Question Bank"
                subtitle="Practice real frontend interview questions and build a steady review rhythm."
              >
                <div className="rounded-[1rem] border border-[#ebe2d7] bg-[#fefcf8] px-4 py-3 text-sm text-[#8a97aa]">
                  Search questions, topics, or keywords...
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[1rem] border border-[#ede4d8] bg-white px-3 py-4"
                    >
                      <p className="text-lg font-semibold text-[#071B3A]">{stat.value}</p>
                      <p className="mt-1 text-[11px] text-[#60708c]">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[1.1rem] border border-[#e8ded3] bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#071B3A]">Continue practice</p>
                    <span className="text-xs text-[#0F447A]">View all</span>
                  </div>
                  <div className="rounded-[1rem] border border-[#edf2fa] bg-[#fbfdff] p-4">
                    <p className="text-sm font-semibold text-[#071B3A]">
                      Implementing Code Splitting and Lazy Loading in React
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Label tone="accent">React</Label>
                      <Label>Intermediate</Label>
                      <Label>Theory</Label>
                    </div>
                  </div>
                </div>
              </AppShell>

              <AppShell
                title="All Questions"
                subtitle="Browse all interview questions and practice by topic."
                rightAction={
                  <div className="hidden rounded-full border border-[#ece1d5] px-3 py-1.5 text-xs text-[#60708c] md:block">
                    Filters
                  </div>
                }
              >
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-[1rem] border border-[#ebe2d7] bg-[#fefcf8] px-4 py-3 text-sm text-[#8a97aa]">
                      Search questions...
                    </div>
                    <div className="flex items-center gap-2 rounded-[1rem] border border-[#ebe2d7] bg-white px-4 text-sm text-[#60708c]">
                      <Filter className="h-4 w-4" />
                      Filters
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter, index) => (
                      <Label key={filter} tone={index === 0 ? 'accent' : 'neutral'}>
                        {filter}
                      </Label>
                    ))}
                  </div>

                  <div className="space-y-2 rounded-[1.1rem] border border-[#e8ded3] bg-white p-2">
                    {questionRows.map((row) => (
                      <div
                        key={row.index}
                        className="grid items-center gap-3 rounded-[0.95rem] px-3 py-3 transition-colors hover:bg-[#fbf8f4] md:grid-cols-[40px_minmax(0,1fr)_auto_auto]"
                      >
                        <span className="text-sm font-medium text-[#60708c]">{row.index}</span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#071B3A]">
                            {row.title}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {row.meta.map((item) => (
                              <Label key={item}>{item}</Label>
                            ))}
                          </div>
                        </div>
                        <Label tone={row.badgeTone === 'premium' ? 'premium' : 'success'}>
                          {row.badge}
                        </Label>
                        <Bookmark className="h-4 w-4 text-[#97a1b1]" />
                      </div>
                    ))}
                  </div>
                </div>
              </AppShell>
            </div>
          </FlowSection>

          <FlowSection
            step="2"
            title="The detail view needs both an open answer and a premium edge"
            description="A useful question detail page gives enough free value to earn trust, then shows exactly what premium unlocks without feeling hostile."
          >
            <div className="grid gap-6 xl:grid-cols-2" id="browse-flow">
              <AppShell
                title="Implementing Code Splitting and Lazy Loading in React"
                subtitle="Explain how code splitting and lazy loading work in React. When should you use React.lazy and Suspense?"
                rightAction={
                  <div className="hidden items-center gap-2 md:flex">
                    <Bookmark className="h-4 w-4 text-[#60708c]" />
                    <Share2 className="h-4 w-4 text-[#60708c]" />
                  </div>
                }
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  <Label tone="accent">React</Label>
                  <Label>Intermediate</Label>
                  <Label>Theory</Label>
                  <Label>8 min read</Label>
                  <Label tone="success">Free</Label>
                </div>

                <div className="flex gap-6 border-b border-[#efe6dc] pb-3 text-sm">
                  <span className="font-semibold text-[#0F447A]">Question</span>
                  <span className="text-[#60708c]">Answer</span>
                  <span className="text-[#60708c]">Discussion (24)</span>
                </div>

                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-[#071B3A]">Question</p>
                    <p className="mt-2 text-sm leading-7 text-[#5b6a81]">
                      Explain how code splitting and lazy loading work in React. When should you
                      use React.lazy and Suspense?
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#071B3A]">What interviewers expect</p>
                    <ul className="mt-2 space-y-2 text-sm leading-7 text-[#5b6a81]">
                      <li>Understand bundle splitting</li>
                      <li>Know React.lazy and Suspense</li>
                      <li>Understand when and why to lazy load components</li>
                    </ul>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#e8ded3] bg-[#fbfdff] p-4">
                    <p className="text-sm font-semibold text-[#071B3A]">Answer preview</p>
                    <p className="mt-2 text-sm leading-7 text-[#5b6a81]">
                      Code splitting is a technique that splits your JavaScript bundle into smaller
                      chunks that can be loaded on demand. In React, you can use React.lazy to
                      dynamically import a component and Suspense to show a fallback while it loads.
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <Link href="/blog" className="text-sm font-semibold text-[#0F447A]">
                        View full answer
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-[#60708c]">
                        <Clock3 className="h-3.5 w-3.5" />
                        8 min read
                      </div>
                    </div>
                  </div>
                </div>
              </AppShell>

              <AppShell
                title="Explain React Server Components"
                subtitle="What are React Server Components? How do they work in Next.js and what are the benefits and limits?"
                rightAction={
                  <div className="hidden items-center gap-2 md:flex">
                    <Bookmark className="h-4 w-4 text-[#60708c]" />
                    <Share2 className="h-4 w-4 text-[#60708c]" />
                  </div>
                }
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  <Label tone="accent">Next.js</Label>
                  <Label>Advanced</Label>
                  <Label>Theory</Label>
                  <Label>12 min read</Label>
                  <Label tone="premium">Premium</Label>
                </div>

                <div className="flex gap-6 border-b border-[#efe6dc] pb-3 text-sm">
                  <span className="font-semibold text-[#0F447A]">Question</span>
                  <span className="text-[#60708c]">Answer</span>
                  <span className="text-[#60708c]">Discussion (18)</span>
                </div>

                <div className="mt-5 rounded-[1.3rem] border border-[#efdfc3] bg-[linear-gradient(180deg,#fffdfa_0%,#fff7ea_100%)] p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff2d9] text-[#b26a12]">
                    <Lock className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-[#071B3A]">
                    Premium answer locked
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#6f6a61]">
                    Upgrade to unlock the full answer with code examples, common mistakes,
                    follow-up questions, and senior-level explanation.
                  </p>

                  <div className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm text-[#6f6a61]">
                    {[
                      'Full interview-ready answer',
                      'Code examples',
                      'Common mistakes',
                      'Follow-up questions',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-[#d97706]" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button className="bg-[#071B3A] text-[#F5F0EA] hover:bg-[#0F447A]">
                      Upgrade to Pro
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#d8cab9] bg-white text-[#071B3A] hover:bg-[#fffaf4]"
                    >
                      View pricing
                    </Button>
                  </div>
                </div>
              </AppShell>
            </div>
          </FlowSection>

          <FlowSection
            step="3"
            title="Supporting screens should complete the loop"
            description="Collections guide entry points, topic pages deepen practice, progress keeps motivation visible, and bookmarks support short focused review sessions."
          >
            <div className="grid gap-6 md:grid-cols-2" id="supporting-flow">
              <AppShell
                title="Collections"
                subtitle="Practice with curated question sets and interview paths."
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  {['All collections', 'Interview prep', 'By framework', 'By company'].map(
                    (item, index) => (
                      <Label key={item} tone={index === 0 ? 'accent' : 'neutral'}>
                        {item}
                      </Label>
                    ),
                  )}
                </div>
                <div className="space-y-3">
                  {collections.map((collection, index) => (
                    <div
                      key={collection.title}
                      className="flex items-start justify-between gap-4 rounded-[1rem] border border-[#e8ded3] bg-white px-4 py-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f8fd] text-[#0F447A]">
                          {index === 0 ? 'R' : index === 1 ? 'N' : 'JS'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#071B3A]">
                            {collection.title}
                          </p>
                          <p className="mt-1 text-xs text-[#0F447A]">{collection.subtitle}</p>
                          <p className="mt-2 text-sm leading-6 text-[#5b6a81]">
                            {collection.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 text-[#60708c]" />
                    </div>
                  ))}
                </div>
              </AppShell>

              <AppShell
                title="React"
                subtitle="Questions about React fundamentals, hooks, components, state management, performance, and composition."
              >
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    { value: '420', label: 'Questions' },
                    { value: '3', label: 'Difficulty levels' },
                    { value: '12', label: 'Collections' },
                    { value: '85%', label: 'Free to practice' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1rem] border border-[#ede4d8] bg-white px-3 py-4"
                    >
                      <p className="text-lg font-semibold text-[#071B3A]">{item.value}</p>
                      <p className="mt-1 text-[11px] text-[#60708c]">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {topicQuestions.map((title, index) => (
                    <div
                      key={title}
                      className="grid gap-3 rounded-[0.95rem] border border-[#e8ded3] bg-white px-4 py-3 md:grid-cols-[26px_minmax(0,1fr)_auto]"
                    >
                      <span className="text-sm text-[#60708c]">{`0${index + 1}`}</span>
                      <p className="truncate text-sm font-semibold text-[#071B3A]">{title}</p>
                      <Label tone={index === 1 ? 'premium' : 'success'}>
                        {index === 1 ? 'Premium' : 'Free'}
                      </Label>
                    </div>
                  ))}
                </div>
              </AppShell>

              <AppShell
                title="Your Progress"
                subtitle="Keep practicing and track your interview preparation."
              >
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    { value: '32', label: 'Completed' },
                    { value: '14', label: 'In progress' },
                    { value: '8', label: 'Bookmarked' },
                    { value: '76%', label: 'Accuracy' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1rem] border border-[#ede4d8] bg-white px-3 py-4"
                    >
                      <p className="text-lg font-semibold text-[#071B3A]">{item.value}</p>
                      <p className="mt-1 text-[11px] text-[#60708c]">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-4 rounded-[1.1rem] border border-[#e8ded3] bg-white p-4">
                  {progressRows.map((row) => (
                    <div key={row.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-[#071B3A]">{row.label}</span>
                        <span className="text-[#60708c]">{row.current}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#edf1f5]">
                        <div
                          className="h-2 rounded-full bg-[#0F447A]"
                          style={{ width: row.progress }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AppShell>

              <AppShell
                title="Bookmarked Questions"
                subtitle="Keep your saved questions for quick access."
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Label tone="accent">All</Label>
                    <Label>Free</Label>
                    <Label tone="premium">Premium</Label>
                  </div>
                  <Label>Sort: Newest</Label>
                </div>
                <div className="space-y-2">
                  {bookmarks.map((item, index) => (
                    <div
                      key={item}
                      className="grid gap-3 rounded-[0.95rem] border border-[#e8ded3] bg-white px-4 py-3 md:grid-cols-[26px_minmax(0,1fr)_auto]"
                    >
                      <span className="text-sm text-[#60708c]">{`0${index + 1}`}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#071B3A]">{item}</p>
                        <p className="mt-1 text-xs text-[#60708c]">
                          {index % 2 === 0 ? 'React' : 'Next.js'} · Intermediate · Theory
                        </p>
                      </div>
                      <Bookmark className="h-4 w-4 fill-[#0F447A] text-[#0F447A]" />
                    </div>
                  ))}
                </div>
              </AppShell>
            </div>
          </FlowSection>

          <section className="pb-8 pt-8">
            <div className="rounded-[1.8rem] border border-[#ddd1c3] bg-[linear-gradient(135deg,#fffdfa_0%,#f7fbff_100%)] px-6 py-8 shadow-[0_20px_48px_rgba(53,42,28,0.05)] md:px-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e4f1] bg-white/85 px-3 py-1 text-sm font-medium text-[#0F447A]">
                    <Sparkles className="h-4 w-4" />
                    Current direction
                  </div>
                  <h2 className="mt-4 text-[2.4rem] leading-[1.06] font-semibold tracking-[-0.04em] text-[#071B3A] md:text-[3.4rem]">
                    A more complete product story for interview prep.
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-8 text-[#5b6a81]">
                    The page now reads like a coherent question-bank system instead of a generic
                    placeholder. It keeps the warm-paper DiCodeWeb world while borrowing the
                    stronger flow structure from your reference.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#071B3A] px-6 text-[#F5F0EA] hover:bg-[#0F447A]"
                  >
                    <Link href="/blog">
                      Read related articles
                      <Layers3 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-[#d7ccbf] bg-white/85 text-[#071B3A] hover:bg-[#fffaf4]"
                  >
                    <Link href="/">
                      <ArrowLeft className="h-4 w-4" />
                      Back to homepage
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
