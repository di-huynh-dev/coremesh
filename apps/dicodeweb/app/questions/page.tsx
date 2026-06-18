import Link from 'next/link';
import { ArrowRight, Bookmark, ChevronRight, Layers3, Search, Sparkles } from 'lucide-react';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';

import {
  availableTopicSummaries,
  collectionRows,
  featuredQuestion,
  getQuestionsByTopic,
  questionStats,
} from './question-bank';

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

function getDifficultyTone(level: string): 'neutral' | 'accent' | 'success' | 'premium' {
  if (level === 'Hard') {
    return 'premium';
  }

  if (level === 'Medium') {
    return 'accent';
  }

  return 'success';
}

export default function QuestionsPage() {
  const topicSections = availableTopicSummaries.map((topic) => ({
    ...topic,
    questions: getQuestionsByTopic(topic.slug).slice(0, 6),
  }));

  return (
    <>
      <Navbar />

      <main className="bg-background min-h-[100dvh] px-4 pt-28 pb-24 md:px-6 md:pt-32">
        <div className="editorial-grid">
          <section className="grid gap-8 pb-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,1.05fr)] lg:items-start">
            <div className="max-w-2xl">
              <p className="text-accent text-sm font-medium tracking-[0.16em] uppercase">
                Question Bank
              </p>

              <h1 className="mt-4 text-[3rem] leading-[0.96] font-semibold tracking-[-0.06em] text-[#071B3A] md:text-[5.25rem] dark:text-[#F5F0EA]">
                Frontend questions, organized the way people actually practice.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[#5b6a81]">
                Browse sample quizzes by topic, jump into individual questions, and review answer
                explanations with a cleaner reading flow inspired by modern interview-prep products.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#topics"
                  className="inline-flex items-center gap-2 rounded-full bg-[#071B3A] px-5 py-3 text-sm font-medium text-[#F5F0EA] transition-colors hover:bg-[#0F447A]"
                >
                  Explore topics
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href={
                    featuredQuestion
                      ? `/questions/${featuredQuestion.topicSlug}/${featuredQuestion.slug}`
                      : '/questions'
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-[#d7ccbf] bg-white/85 px-5 py-3 text-sm font-medium text-[#071B3A] transition-colors hover:bg-[#fffaf4]"
                >
                  Open sample question
                  <Bookmark className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {questionStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.3rem] border border-[#e6dbcf] bg-white/88 px-4 py-4 shadow-[0_12px_28px_rgba(53,42,28,0.04)]"
                  >
                    <p className="text-[1.7rem] font-semibold tracking-[-0.04em] text-[#071B3A]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-[#60708c]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[#dfd3c5] bg-[linear-gradient(180deg,#fffefd_0%,#fffaf4_100%)] p-3 shadow-[0_22px_54px_rgba(53,42,28,0.08)]">
              <div className="rounded-[1.45rem] border border-[#ece1d5] bg-white p-5 md:p-6">
                <div className="flex items-center justify-between gap-3 border-b border-[#efe6dc] pb-4">
                  <div>
                    <p className="text-sm font-semibold text-[#071B3A]">Browse Questions</p>
                    <p className="mt-1 text-xs text-[#60708c]">
                      Search, filter, and open the next question without losing context.
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ece1d5] text-[#60708c]">
                    <Search className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 rounded-[1rem] border border-[#ebe2d7] bg-[#fefcf8] px-4 py-3 text-sm text-[#8a97aa]">
                  Search questions, topics, or keywords...
                </div>

                {featuredQuestion ? (
                  <Link
                    href={`/questions/${featuredQuestion.topicSlug}/${featuredQuestion.slug}`}
                    className="mt-4 block rounded-[1.2rem] border border-[#e8ded3] bg-[#fbfdff] p-4 transition-colors hover:border-[#d7e3f3]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Label tone="accent">{featuredQuestion.topicTitle}</Label>
                          <Label tone={getDifficultyTone(featuredQuestion.difficulty)}>
                            {featuredQuestion.difficulty}
                          </Label>
                          <Label>{featuredQuestion.quizTitle}</Label>
                        </div>

                        <h2 className="mt-4 text-xl leading-8 font-semibold tracking-[-0.03em] text-[#071B3A]">
                          {featuredQuestion.text}
                        </h2>

                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#5b6a81]">
                          {featuredQuestion.explanation}
                        </p>
                      </div>

                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#60708c]" />
                    </div>
                  </Link>
                ) : null}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {collectionRows.slice(0, 3).map((collection) => (
                    <div
                      key={collection.title}
                      className="rounded-[1rem] border border-[#ede4d8] bg-white px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-[#071B3A]">{collection.title}</p>
                      <p className="mt-1 text-[11px] text-[#0F447A]">{collection.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]" id="topics">
            <aside className="self-start lg:sticky" style={{ top: 'var(--site-nav-offset, 96px)' }}>
              <div className="rounded-[1.6rem] border border-[#dfd3c5] bg-[linear-gradient(180deg,#fffdf9_0%,#fff8f1_100%)] p-5 shadow-[0_18px_40px_rgba(53,42,28,0.05)]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#0F447A]">
                  <Sparkles className="h-4 w-4" />
                  Active topics
                </div>

                <div className="mt-4 space-y-2">
                  <Link
                    href="#topics"
                    className="flex items-center justify-between rounded-[1rem] border border-[#e7ddd1] bg-white px-4 py-3 text-sm font-medium text-[#071B3A] transition-colors hover:border-[#d7e3f3]"
                  >
                    <span>All topics</span>
                    <span className="text-[#60708c]">{availableTopicSummaries.length}</span>
                  </Link>

                  {availableTopicSummaries.map((topic) => (
                    <Link
                      key={topic.slug}
                      href={`#topic-${topic.slug}`}
                      className="flex items-center justify-between rounded-[1rem] border border-[#e7ddd1] bg-white px-4 py-3 text-sm transition-colors hover:border-[#d7e3f3]"
                    >
                      <div>
                        <p className="font-medium text-[#071B3A]">{topic.title}</p>
                        <p className="mt-0.5 text-xs text-[#60708c]">{topic.quizCount} quiz sets</p>
                      </div>
                      <span className="text-sm text-[#60708c]">{topic.questionCount}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-5 rounded-[1.1rem] border border-[#e8ded3] bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[#071B3A]">Collections</p>
                  <p className="mt-2 text-sm leading-7 text-[#5b6a81]">
                    {collectionRows.length} sample quiz sets across React, JavaScript, TypeScript,
                    and CSS.
                  </p>
                </div>
              </div>
            </aside>

            <div className="space-y-10">
              <div className="flex flex-wrap gap-2">
                <Label tone="accent">All topics</Label>
                {availableTopicSummaries.map((topic) => (
                  <Link key={topic.slug} href={`#topic-${topic.slug}`}>
                    <Label>{topic.title}</Label>
                  </Link>
                ))}
              </div>

              {topicSections.map((topic) => (
                <section
                  key={topic.slug}
                  id={`topic-${topic.slug}`}
                  className="rounded-[1.8rem] border border-[#dfd3c5] bg-[linear-gradient(180deg,#fffefd_0%,#fffaf4_100%)] p-3 shadow-[0_18px_42px_rgba(53,42,28,0.06)]"
                >
                  <div className="rounded-[1.45rem] border border-[#ece1d5] bg-white p-5 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap gap-2">
                          <Label tone="accent">{topic.title}</Label>
                          <Label>{topic.questionCount} questions</Label>
                          <Label>{topic.quizCount} quiz sets</Label>
                        </div>

                        <h2 className="mt-4 text-[2rem] leading-[1.04] font-semibold tracking-[-0.04em] text-[#071B3A] md:text-[2.6rem]">
                          {topic.title}
                        </h2>

                        <p className="mt-3 max-w-xl text-sm leading-7 text-[#5b6a81] md:text-base">
                          {topic.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {topic.difficultyLevels.map((level) => (
                          <Label key={level} tone={getDifficultyTone(level)}>
                            {level}
                          </Label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
                      <div className="rounded-[1.2rem] border border-[#e8ded3] bg-[#fbfdff] p-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#0F447A]">
                          <Layers3 className="h-4 w-4" />
                          Featured quiz set
                        </div>

                        <h3 className="mt-4 text-lg leading-7 font-semibold text-[#071B3A]">
                          {topic.featuredQuiz?.title}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-[#5b6a81]">
                          {topic.featuredQuiz?.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Label>{topic.featuredQuiz?.questions.length ?? 0} questions</Label>
                          {topic.featuredQuiz?.difficulty ? (
                            <Label tone={getDifficultyTone(topic.featuredQuiz.difficulty)}>
                              {topic.featuredQuiz.difficulty}
                            </Label>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-2 rounded-[1.2rem] border border-[#e8ded3] bg-white p-2">
                        {topic.questions.map((question, index) => (
                          <Link
                            key={question.slug}
                            href={`/questions/${topic.slug}/${question.slug}`}
                            className="grid items-center gap-3 rounded-[1rem] px-4 py-4 transition-colors hover:bg-[#fbf8f4] md:grid-cols-[40px_minmax(0,1fr)_auto]"
                          >
                            <span className="text-sm font-medium text-[#60708c]">
                              {`${index + 1}`.padStart(2, '0')}
                            </span>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#071B3A] md:text-base">
                                {question.text}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                <Label>{question.quizTitle}</Label>
                                <Label tone={getDifficultyTone(question.difficulty)}>
                                  {question.difficulty}
                                </Label>
                                <Label>{question.options.length} options</Label>
                              </div>
                            </div>

                            <ChevronRight className="h-4 w-4 text-[#97a1b1]" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
