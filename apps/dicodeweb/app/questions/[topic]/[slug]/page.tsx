import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Layers3 } from 'lucide-react';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';

import {
  getQuestionByTopicAndSlug,
  getQuestionsStaticParams,
  getRelatedQuestions,
  getTopicSummaryBySlug,
} from '../../question-bank';

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

function getOptionLabel(index: number) {
  return String.fromCharCode(65 + index);
}

type QuestionDetailPageProps = {
  params: Promise<{ topic: string; slug: string }>;
};

export function generateStaticParams() {
  return getQuestionsStaticParams();
}

export async function generateMetadata({ params }: QuestionDetailPageProps) {
  const resolvedParams = await params;
  const question = getQuestionByTopicAndSlug(resolvedParams.topic, resolvedParams.slug);

  if (!question) {
    return { title: 'Question Not Found | DiCodeWeb' };
  }

  return {
    title: `${question.topicTitle}: ${question.text} | DiCodeWeb`,
    description: question.explanation,
  };
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const resolvedParams = await params;
  const question = getQuestionByTopicAndSlug(resolvedParams.topic, resolvedParams.slug);

  if (!question) {
    notFound();
  }

  const topic = getTopicSummaryBySlug(question.topicSlug);
  const relatedQuestions = getRelatedQuestions(question, 4);
  const correctOption = question.options.find((option) => option.id === question.correctOptionId);

  return (
    <>
      <Navbar />

      <main className="bg-background min-h-[100dvh] px-4 pt-28 pb-24 md:px-6 md:pt-32">
        <div className="editorial-grid">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#60708c]">
            <Link href="/questions" className="transition-colors hover:text-[#071B3A]">
              Questions
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/questions#topic-${question.topicSlug}`}
              className="transition-colors hover:text-[#071B3A]"
            >
              {question.topicTitle}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="truncate text-[#071B3A]">{question.quizTitle}</span>
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
            <article className="rounded-[1.8rem] border border-[#dfd3c5] bg-[linear-gradient(180deg,#fffefd_0%,#fffaf4_100%)] p-3 shadow-[0_20px_48px_rgba(53,42,28,0.08)]">
              <div className="rounded-[1.45rem] border border-[#ece1d5] bg-white p-6 md:p-8">
                <Link
                  href="/questions"
                  className="inline-flex items-center gap-2 text-sm text-[#60708c] transition-colors hover:text-[#071B3A]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to questions
                </Link>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Label tone="accent">{question.topicTitle}</Label>
                  <Label tone={getDifficultyTone(question.difficulty)}>{question.difficulty}</Label>
                  <Label>{question.quizTitle}</Label>
                  <Label>{question.options.length} options</Label>
                </div>

                <h1 className="mt-5 max-w-4xl text-[2.2rem] leading-[1.06] font-semibold tracking-[-0.05em] text-[#071B3A] md:text-[3.6rem]">
                  {question.text}
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-8 text-[#5b6a81] md:text-lg">
                  Work through the options first, then compare your reasoning against the answer and
                  explanation below.
                </p>

                {question.codeSnippet ? (
                  <div className="mt-8 overflow-hidden rounded-[1.35rem] border border-[#13263f] bg-[#0e1726] shadow-[0_16px_40px_rgba(10,17,28,0.22)]">
                    <div className="border-b border-white/8 px-4 py-3 text-xs font-medium tracking-[0.14em] text-[#9fb2c7] uppercase">
                      Code snippet
                    </div>
                    <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 text-[#dde8f4]">
                      <code>{question.codeSnippet}</code>
                    </pre>
                  </div>
                ) : null}

                <section className="mt-10">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#071B3A] md:text-2xl">
                      Choose the best answer
                    </h2>
                    <Label>{question.options.length} choices</Label>
                  </div>

                  <div className="space-y-3">
                    {question.options.map((option, index) => {
                      const isCorrect = option.id === question.correctOptionId;

                      return (
                        <div
                          key={option.id}
                          className={`rounded-[1.15rem] border px-4 py-4 transition-colors md:px-5 ${
                            isCorrect
                              ? 'border-[#cde4cc] bg-[#f3fbf0]'
                              : 'border-[#e8ded3] bg-[#fffdfa]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                isCorrect
                                  ? 'bg-[#34804a] text-white'
                                  : 'bg-[#f3ede5] text-[#60708c]'
                              }`}
                            >
                              {getOptionLabel(index)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm leading-7 font-medium text-[#071B3A] md:text-base">
                                  {option.text}
                                </p>
                                {isCorrect ? <Label tone="success">Correct answer</Label> : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="mt-10 rounded-[1.35rem] border border-[#d9e4f1] bg-[#f8fbff] p-5 md:p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#0F447A]" />
                    <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#071B3A]">
                      Answer and explanation
                    </h2>
                  </div>

                  {correctOption ? (
                    <p className="mt-4 text-sm font-medium text-[#0F447A]">
                      Correct answer: {correctOption.text}
                    </p>
                  ) : null}

                  <p className="mt-4 text-sm leading-7 text-[#5b6a81] md:text-base md:leading-8">
                    {question.explanation}
                  </p>

                  {question.relatedQuestionSlug ? (
                    <div className="mt-5 rounded-[1rem] border border-[#e0e8f3] bg-white px-4 py-4">
                      <p className="text-xs font-semibold tracking-[0.16em] text-[#60708c] uppercase">
                        Related concept
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#071B3A]">
                        {question.relatedQuestionSlug}
                      </p>
                    </div>
                  ) : null}
                </section>

                {relatedQuestions.length > 0 ? (
                  <section className="mt-10">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#071B3A] md:text-2xl">
                        More from {question.topicTitle}
                      </h2>
                      <Link
                        href={`/questions#topic-${question.topicSlug}`}
                        className="text-sm font-medium text-[#0F447A] transition-colors hover:text-[#071B3A]"
                      >
                        Browse topic
                      </Link>
                    </div>

                    <div className="space-y-2">
                      {relatedQuestions.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/questions/${item.topicSlug}/${item.slug}`}
                          className="flex items-center justify-between gap-4 rounded-[1rem] border border-[#e8ded3] bg-[#fffdfa] px-4 py-4 transition-colors hover:bg-[#fbf8f4]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#071B3A] md:text-base">
                              {item.text}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Label>{item.quizTitle}</Label>
                              <Label tone={getDifficultyTone(item.difficulty)}>
                                {item.difficulty}
                              </Label>
                            </div>
                          </div>

                          <ArrowRight className="h-4 w-4 shrink-0 text-[#97a1b1]" />
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </article>

            <aside className="self-start xl:sticky" style={{ top: 'var(--site-nav-offset, 96px)' }}>
              <div className="space-y-4">
                <div className="rounded-[1.45rem] border border-[#dfd3c5] bg-[linear-gradient(180deg,#fffdf9_0%,#fff8f1_100%)] p-5 shadow-[0_16px_34px_rgba(53,42,28,0.05)]">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#0F447A]">
                    <Layers3 className="h-4 w-4" />
                    Topic overview
                  </div>

                  <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[#071B3A]">
                    {topic?.title ?? question.topicTitle}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-[#5b6a81]">
                    {topic?.description ?? question.quizDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Label>{topic?.questionCount ?? 0} questions</Label>
                    <Label>{topic?.quizCount ?? 0} quiz sets</Label>
                  </div>

                  <Link
                    href={`/questions#topic-${question.topicSlug}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#0F447A] transition-colors hover:text-[#071B3A]"
                  >
                    View all {question.topicTitle} questions
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="rounded-[1.45rem] border border-[#dfd3c5] bg-white p-5 shadow-[0_16px_34px_rgba(53,42,28,0.04)]">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#60708c] uppercase">
                    Quiz set
                  </p>
                  <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#071B3A]">
                    {question.quizTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5b6a81]">
                    {question.quizDescription}
                  </p>
                </div>

                {relatedQuestions.length > 0 ? (
                  <div className="rounded-[1.45rem] border border-[#dfd3c5] bg-white p-5 shadow-[0_16px_34px_rgba(53,42,28,0.04)]">
                    <p className="text-xs font-semibold tracking-[0.16em] text-[#60708c] uppercase">
                      Related questions
                    </p>

                    <div className="mt-4 space-y-3">
                      {relatedQuestions.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/questions/${item.topicSlug}/${item.slug}`}
                          className="block rounded-[1rem] border border-[#e8ded3] px-4 py-4 transition-colors hover:bg-[#fbf8f4]"
                        >
                          <p className="text-sm font-semibold text-[#071B3A]">{item.text}</p>
                          <p className="mt-2 text-xs text-[#60708c]">
                            {item.difficulty} · {item.quizTitle}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
