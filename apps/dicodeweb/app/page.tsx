'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Braces, GraduationCap, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

const learningTracks = [
  {
    title: 'Frontend Systems',
    description:
      'Build resilient interfaces with strong architecture, readable design systems, and real delivery standards.',
    accent: 'UI Architecture',
  },
  {
    title: 'Developer Tooling',
    description:
      'Master the stack around your stack: workflows, automation, performance, and the habits that compound.',
    accent: 'Workflow Craft',
  },
  {
    title: 'Technical Writing',
    description:
      'Turn hard-won engineering knowledge into lessons, docs, and product thinking people can actually use.',
    accent: 'Editorial Depth',
  },
];

const highlights = [
  'Warm, distraction-free reading surfaces',
  'Structured paths for developers and creators',
  'Practical lessons grounded in real product work',
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-background text-foreground min-h-screen">
        <section className="px-4 pt-32 pb-20 md:px-6 md:pt-40 md:pb-28">
          <div className="editorial-grid grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="reading-width space-y-8">
              <span className="tag-chip inline-flex rounded-full px-4 py-2 text-sm font-medium">
                Digital learning with a paper-and-ink feel
              </span>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-[-0.03em] text-[#071B3A] md:text-6xl dark:text-[#D7E2FF]">
                  Learn code and digital craft through a calmer, sharper editorial experience.
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg leading-8 md:text-xl">
                  DiCodeWeb blends technical rigor with warm visual pacing, so long-form learning
                  feels focused, premium, and easy to stay with.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="px-6">
                  <Link href="/blog">
                    Explore the blog
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-6">
                  <Link href="#tracks">See learning tracks</Link>
                </Button>
              </div>
            </div>

            <div className="paper-card rounded-[2rem] p-6 md:p-8">
              <div className="border-border mb-6 flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Editorial System</p>
                  <p className="text-2xl font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                    DiCodeWeb
                  </p>
                </div>
                <Sparkles className="h-6 w-6 text-[#22C7E8]" />
              </div>

              <div className="space-y-4">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="bg-muted/70 flex items-center gap-3 rounded-2xl px-4 py-4"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-[#8BD63F]" />
                    <p className="text-foreground text-sm leading-6">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl bg-[#071B3A] p-5 text-[#F5F0EA]">
                <p className="text-sm tracking-[0.18em] text-[#22C7E8] uppercase">
                  Reading principle
                </p>
                <p className="mt-3 text-lg leading-8">
                  High-contrast typography on warm surfaces, with lime reserved for moments that
                  deserve commitment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="px-4 py-16 md:px-6 md:py-24">
          <div className="editorial-grid grid gap-6 md:grid-cols-3">
            <div className="paper-card rounded-[1.75rem] p-6">
              <BookOpen className="h-6 w-6 text-[#22C7E8]" />
              <h2 className="mt-5 text-2xl font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                Built for reading
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-7">
                Warm backgrounds, disciplined spacing, and human pacing reduce fatigue across
                long-form technical content.
              </p>
            </div>
            <div className="paper-card rounded-[1.75rem] p-6">
              <Braces className="h-6 w-6 text-[#22C7E8]" />
              <h2 className="mt-5 text-2xl font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                Built for builders
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-7">
                Lessons stay practical, code-aware, and structured around real implementation
                tradeoffs instead of generic theory.
              </p>
            </div>
            <div className="paper-card rounded-[1.75rem] p-6">
              <GraduationCap className="h-6 w-6 text-[#22C7E8]" />
              <h2 className="mt-5 text-2xl font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                Built for momentum
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-7">
                Clear calls to action, clean progress cues, and strong learning hierarchy help
                people keep going.
              </p>
            </div>
          </div>
        </section>

        <section id="tracks" className="px-4 py-16 md:px-6 md:py-24">
          <div className="editorial-grid">
            <div className="mb-10 max-w-2xl space-y-4">
              <p className="text-sm font-medium tracking-[0.16em] text-[#22C7E8] uppercase">
                Learning Tracks
              </p>
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#071B3A] md:text-5xl dark:text-[#D7E2FF]">
                A curriculum shaped like modern digital work.
              </h2>
              <p className="text-muted-foreground text-base leading-8 md:text-lg">
                Each track is designed to feel editorial, not overwhelming: strong hierarchy, clear
                entry points, and room to think.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {learningTracks.map((track) => (
                <article
                  key={track.title}
                  className="paper-card paper-card-hover rounded-[1.75rem] p-6"
                >
                  <span className="tag-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase">
                    {track.accent}
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                    {track.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-7">
                    {track.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-24">
          <div className="editorial-grid">
            <div className="rounded-[2rem] border border-[#071B3A] bg-[#071B3A] px-6 py-10 text-[#F5F0EA] md:px-10">
              <p className="text-sm font-medium tracking-[0.16em] text-[#22C7E8] uppercase">
                Ready to start
              </p>
              <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-bold tracking-[-0.03em] md:text-5xl">
                    Shift the whole site from flashy SaaS to warm editorial learning.
                  </h2>
                  <p className="mt-4 text-base leading-8 text-[#D7E2FF]">
                    This new visual direction makes DiCodeWeb feel premium, quieter, and more
                    credible for long-form education.
                  </p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="border-0 bg-[#8BD63F] text-[#071B3A] hover:bg-[#A4EA5B]"
                >
                  <Link href="/blog">Read the latest articles</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
