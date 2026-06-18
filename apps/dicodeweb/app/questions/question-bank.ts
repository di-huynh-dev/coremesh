import cssQuizzes from './quizzes/css.json';
import javascriptQuizzes from './quizzes/javascript.json';
import reactQuizzes from './quizzes/react.json';
import typescriptQuizzes from './quizzes/typescript.json';
import { TOPICS } from './topics';

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  text: string;
  codeSnippet?: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  relatedQuestionSlug?: string;
  slug: string;
};

export type QuizSet = {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  questions: QuizQuestion[];
};

export type QuestionRow = {
  index: string;
  title: string;
  meta: [string, string, string];
  badge: string;
  badgeTone: 'accent' | 'neutral' | 'success' | 'premium';
};

export type FlattenedQuestion = QuizQuestion & {
  topicSlug: string;
  topicTitle: string;
  quizId: string;
  quizTitle: string;
  quizDescription: string;
  difficulty: QuizSet['difficulty'];
  category: string;
};

type TopicMeta = (typeof TOPICS)[number];

export type TopicSummary = TopicMeta & {
  quizzes: QuizSet[];
  questionCount: number;
  quizCount: number;
  difficultyLevels: string[];
  sampleQuestions: FlattenedQuestion[];
  featuredQuiz: QuizSet | null;
  isAvailable: boolean;
};

function asQuizSets(value: unknown) {
  return value as QuizSet[];
}

const quizBankByTopic = {
  css: asQuizSets(cssQuizzes),
  javascript: asQuizSets(javascriptQuizzes),
  react: asQuizSets(reactQuizzes),
  typescript: asQuizSets(typescriptQuizzes),
} satisfies Record<string, QuizSet[]>;

function getTopicTitle(slug: string) {
  return TOPICS.find((topic) => topic.slug === slug)?.title ?? slug;
}

function formatQuestionIndex(index: number) {
  return `${index + 1}`.padStart(2, '0');
}

export const topicSummaries: TopicSummary[] = TOPICS.map((topic) => {
  const quizzes = quizBankByTopic[topic.slug as keyof typeof quizBankByTopic] ?? [];
  const sampleQuestions = quizzes.flatMap((quiz) =>
    quiz.questions.map((question) => ({
      ...question,
      topicSlug: topic.slug,
      topicTitle: topic.title,
      quizId: quiz.id,
      quizTitle: quiz.title,
      quizDescription: quiz.description,
      difficulty: quiz.difficulty,
      category: quiz.category,
    })),
  );

  return {
    ...topic,
    quizzes,
    questionCount: sampleQuestions.length,
    quizCount: quizzes.length,
    difficultyLevels: Array.from(new Set(quizzes.map((quiz) => quiz.difficulty))),
    sampleQuestions: sampleQuestions.slice(0, 4),
    featuredQuiz: quizzes[0] ?? null,
    isAvailable: quizzes.length > 0,
  };
});

export const availableTopicSummaries = topicSummaries.filter((topic) => topic.isAvailable);

export const allQuizSets = availableTopicSummaries.flatMap((topic) => topic.quizzes);

export const allQuestions: FlattenedQuestion[] = availableTopicSummaries.flatMap((topic) =>
  topic.quizzes.flatMap((quiz) =>
    quiz.questions.map((question) => ({
      ...question,
      topicSlug: topic.slug,
      topicTitle: topic.title,
      quizId: quiz.id,
      quizTitle: quiz.title,
      quizDescription: quiz.description,
      difficulty: quiz.difficulty,
      category: quiz.category,
    })),
  ),
);

export const questionStats = [
  { value: allQuestions.length.toString(), label: 'Total questions' },
  { value: availableTopicSummaries.length.toString(), label: 'Active topics' },
  { value: allQuizSets.length.toString(), label: 'Quiz sets' },
  { value: allQuestions.length.toString(), label: 'Answer explanations' },
];

export const questionFilters = [
  'All topics',
  ...availableTopicSummaries.map((topic) => topic.title),
];

export const questionRows: QuestionRow[] = allQuestions.slice(0, 8).map((question, index) => ({
  index: formatQuestionIndex(index),
  title: question.text,
  meta: [question.topicTitle, question.difficulty, question.quizTitle],
  badge: `${question.options.length} options`,
  badgeTone:
    question.difficulty === 'Hard'
      ? 'premium'
      : question.difficulty === 'Medium'
        ? 'accent'
        : 'success',
}));

export const collectionRows = allQuizSets.map((quiz) => ({
  title: quiz.title,
  subtitle: `${quiz.questions.length} questions · ${getTopicTitle(quiz.category)}`,
  description: quiz.description,
  difficulty: quiz.difficulty,
  category: quiz.category,
}));

export const featuredTopic =
  availableTopicSummaries.find((topic) => topic.slug === 'react') ??
  availableTopicSummaries[0] ??
  null;

export const continueQuestion = featuredTopic?.sampleQuestions[0] ?? allQuestions[0] ?? null;

export const featuredQuestion = continueQuestion;

export const premiumQuestion =
  allQuestions.find((question) => question.difficulty === 'Hard') ??
  allQuestions[1] ??
  allQuestions[0] ??
  null;

export const topicCoverageRows = availableTopicSummaries.map((topic) => ({
  label: topic.title,
  progress: `${Math.round((topic.questionCount / allQuestions.length) * 100)}%`,
  current: `${topic.questionCount} / ${allQuestions.length}`,
}));

export const latestQuestionRows = allQuestions.slice(8, 12).map((question, index) => ({
  index: formatQuestionIndex(index),
  title: question.text,
  meta: `${question.topicTitle} · ${question.difficulty} · ${question.quizTitle}`,
}));

export function getTopicSummaryBySlug(topicSlug: string) {
  return availableTopicSummaries.find((topic) => topic.slug === topicSlug) ?? null;
}

export function getQuestionsByTopic(topicSlug: string) {
  return allQuestions.filter((question) => question.topicSlug === topicSlug);
}

export function getQuestionByTopicAndSlug(topicSlug: string, questionSlug: string) {
  return (
    allQuestions.find(
      (question) => question.topicSlug === topicSlug && question.slug === questionSlug,
    ) ?? null
  );
}

export function getRelatedQuestions(currentQuestion: FlattenedQuestion, limit = 4) {
  const sameQuiz = allQuestions.filter(
    (question) =>
      question.slug !== currentQuestion.slug &&
      question.topicSlug === currentQuestion.topicSlug &&
      question.quizId === currentQuestion.quizId,
  );

  if (sameQuiz.length >= limit) {
    return sameQuiz.slice(0, limit);
  }

  const sameTopic = allQuestions.filter(
    (question) =>
      question.slug !== currentQuestion.slug && question.topicSlug === currentQuestion.topicSlug,
  );

  return [...sameQuiz, ...sameTopic.filter((question) => !sameQuiz.includes(question))].slice(
    0,
    limit,
  );
}

export function getQuestionsStaticParams() {
  return allQuestions.map((question) => ({
    topic: question.topicSlug,
    slug: question.slug,
  }));
}
