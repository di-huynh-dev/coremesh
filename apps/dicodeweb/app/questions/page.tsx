import Link from 'next/link';
import { ArrowRight, BookOpen, Clock3, Layers3 } from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';

const previewSections = [
  {
    title: 'Topics',
    description:
      'Browse frontend categories like accessibility, performance, networking, React hooks, and more.',
  },
  {
    title: 'Framework / language',
    description:
      'Filter the bank by JavaScript, TypeScript, React, Next.js, Vue, HTML, and CSS.',
  },
  {
    title: 'Format',
    description:
      'Switch between UI coding, JavaScript functions, system design, quizzes, and debugging prompts.',
  },
];

export default function QuestionsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background text-foreground min-h-screen px-4 pb-20 pt-32 md:px-6 md:pt-40">
        <div className="editorial-grid">
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-medium tracking-[0.16em] text-accent uppercase">
              Question Bank
            </p>
            <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#071B3A] md:text-6xl dark:text-[#F5F0EA]">
              Detailed practice will live here.
            </h1>
            <p className="text-muted-foreground text-lg leading-8">
              This page is the dedicated destination for exploring the full question bank in depth.
              The landing page preview now routes here when learners want to browse further or drill
              into the material.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {previewSections.map((section, index) => {
              const Icon = [Layers3, BookOpen, Clock3][index] ?? Layers3;

              return (
                <article key={section.title} className="paper-card rounded-[1.75rem] p-6">
                  <Icon className="h-6 w-6 text-accent" />
                  <h2 className="mt-5 text-2xl font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground mt-3 text-sm leading-7">
                    {section.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 rounded-[2rem] border border-[#071B3A] bg-[#071B3A] px-6 py-10 text-[#F5F0EA] md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold tracking-[-0.03em] md:text-5xl">
                  Keep shaping the full interview prep experience here next.
                </h2>
                <p className="mt-4 text-base leading-8 text-[#D7E2FF]">
                  The homepage now previews the structure. This dedicated route can evolve into the
                  searchable, filterable, detailed question-bank experience.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="border-0 bg-[#8BD63F] text-[#071B3A] hover:bg-[#A4EA5B]"
              >
                <Link href="/">
                  Back to homepage
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
