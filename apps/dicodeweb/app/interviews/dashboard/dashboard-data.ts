export type DashboardStat = {
  label: string;
  value: string;
  helper: string;
  progress?: number;
};

export type PracticeCategory = {
  title: string;
  description: string;
  questionCount: number;
  completedCount: number;
  difficulty: 'Starter' | 'Intermediate' | 'Advanced' | 'Mixed';
  isPremium?: boolean;
  href: string;
};

export type PracticeQuestion = {
  title: string;
  topic: string;
  type: 'Conceptual' | 'Coding' | 'UI Challenge' | 'System Design' | 'Quiz';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimate: string;
  status: 'Not started' | 'In progress' | 'Done';
  isPremium?: boolean;
  href: string;
};

export type StudyWeek = {
  week: string;
  title: string;
  topics: string[];
  status: 'Done' | 'In progress' | 'Upcoming' | 'Locked';
  progress: number;
};

export type FocusArea = {
  title: string;
  weakness: 'High' | 'Medium' | 'Low';
  reason: string;
  action: string;
  href: string;
};

export type ActivityItem = {
  action: string;
  target: string;
  time: string;
  href: string;
};

export type CompanyFocus = {
  name: string;
  emphasis: string;
};

export const dashboardHero = {
  title: 'Interview Dashboard',
  subtitle: 'Plan your frontend prep, practice the right questions, and track what actually improves.',
  currentPlan: 'Frontend Interview Sprint',
  weeklyGoal: '12 questions',
  streak: '4 days',
  overallProgress: 38,
};

export const dashboardStats: DashboardStat[] = [
  {
    label: 'Questions completed',
    value: '42 / 120',
    helper: 'A solid base, but your hard question coverage is still thin.',
    progress: 35,
  },
  {
    label: 'Weekly practice goal',
    value: '8 / 12',
    helper: 'You are ahead on conceptual review, behind on coding reps.',
    progress: 67,
  },
  {
    label: 'Topics reviewed',
    value: '6 topics',
    helper: 'React, async JavaScript, CSS layout, and accessibility are active.',
    progress: 54,
  },
  {
    label: 'Mock readiness score',
    value: '64%',
    helper: 'Good enough for timed drills, not steady enough for system prompts yet.',
    progress: 64,
  },
];

export const continueTask = {
  title: 'React Rendering Model',
  type: 'Conceptual',
  difficulty: 'Medium',
  estimate: '12 min',
  progress: 60,
  href: '/questions',
  note: 'You stopped after the reconciliation examples. Finish this before taking more React mock questions.',
};

export const nextRecommendations = [
  {
    title: 'JavaScript Event Loop',
    meta: 'Conceptual / 9 min',
    href: '/questions',
  },
  {
    title: 'Build a Tabs Component',
    meta: 'UI Challenge / 18 min',
    href: '/questions',
  },
  {
    title: 'Frontend System Design: Autocomplete',
    meta: 'System Design / Read first',
    href: '/blog',
  },
];

export const studyPlan: StudyWeek[] = [
  {
    week: 'Week 1',
    title: 'JavaScript fundamentals, async, event loop',
    topics: ['Closures', 'Promises', 'Async scheduling'],
    status: 'Done',
    progress: 100,
  },
  {
    week: 'Week 2',
    title: 'React rendering, hooks, state management',
    topics: ['Rendering model', 'Hooks discipline', 'State boundaries'],
    status: 'In progress',
    progress: 58,
  },
  {
    week: 'Week 3',
    title: 'UI coding, accessibility, component patterns',
    topics: ['Accessible forms', 'Tabs and menus', 'Layout reasoning'],
    status: 'Upcoming',
    progress: 0,
  },
  {
    week: 'Week 4',
    title: 'Frontend system design, mock interviews, review',
    topics: ['Autocomplete', 'Caching', 'Review loops'],
    status: 'Locked',
    progress: 0,
  },
];

export const practiceCategories: PracticeCategory[] = [
  {
    title: 'JavaScript Coding',
    description: 'Utilities, timing, closures, and edge-case reasoning.',
    questionCount: 34,
    completedCount: 12,
    difficulty: 'Mixed',
    href: '/questions',
  },
  {
    title: 'React',
    description: 'Rendering, hooks, state boundaries, effects, and patterns.',
    questionCount: 28,
    completedCount: 11,
    difficulty: 'Intermediate',
    href: '/questions',
  },
  {
    title: 'TypeScript',
    description: 'Inference, generics, narrowing, and API-safe types.',
    questionCount: 18,
    completedCount: 6,
    difficulty: 'Intermediate',
    href: '/questions',
  },
  {
    title: 'CSS & UI',
    description: 'Layout systems, responsive thinking, and browser behavior.',
    questionCount: 22,
    completedCount: 9,
    difficulty: 'Starter',
    href: '/questions',
  },
  {
    title: 'User Interface Challenges',
    description: 'Build components under pressure with clean interaction states.',
    questionCount: 16,
    completedCount: 4,
    difficulty: 'Advanced',
    isPremium: true,
    href: '/questions',
  },
  {
    title: 'Frontend System Design',
    description: 'State boundaries, data flow, caching, and delivery tradeoffs.',
    questionCount: 14,
    completedCount: 3,
    difficulty: 'Advanced',
    isPremium: true,
    href: '/roadmap',
  },
  {
    title: 'Conceptual Questions',
    description: 'Explain why a pattern works, not just what it is called.',
    questionCount: 26,
    completedCount: 13,
    difficulty: 'Mixed',
    href: '/questions',
  },
  {
    title: 'Quizzes',
    description: 'Short timed rounds for weekly checks and retention.',
    questionCount: 20,
    completedCount: 7,
    difficulty: 'Starter',
    href: '/questions',
  },
  {
    title: 'Behavioral Notes',
    description: 'Answer architecture and teamwork questions with real signal.',
    questionCount: 12,
    completedCount: 2,
    difficulty: 'Starter',
    isPremium: true,
    href: '/blog',
  },
];

export const focusAreas: FocusArea[] = [
  {
    title: 'Event Loop',
    weakness: 'Medium',
    reason: 'You hesitated on microtasks versus macrotasks in two recent quizzes.',
    action: 'Review topic',
    href: '/questions',
  },
  {
    title: 'React Re-rendering',
    weakness: 'High',
    reason: 'You missed 3 related questions this week and skipped the memoization follow-up.',
    action: 'Resume note',
    href: '/questions',
  },
  {
    title: 'CSS Layout',
    weakness: 'Low',
    reason: 'You are solving flexbox questions, but grid edge cases are still slow.',
    action: 'Practice layout',
    href: '/questions',
  },
  {
    title: 'Accessibility',
    weakness: 'Medium',
    reason: 'Keyboard support and focus management answers still feel too generic.',
    action: 'Follow roadmap',
    href: '/roadmap',
  },
  {
    title: 'Client-side Caching',
    weakness: 'High',
    reason: 'System design answers mention caching, but not invalidation or stale reads.',
    action: 'Read related note',
    href: '/blog',
  },
];

export const practiceQueue: PracticeQuestion[] = [
  {
    title: 'Explain event delegation in JavaScript',
    topic: 'JavaScript',
    type: 'Conceptual',
    difficulty: 'Easy',
    estimate: '6 min',
    status: 'Done',
    href: '/questions',
  },
  {
    title: 'Build a debounce function',
    topic: 'JavaScript',
    type: 'Coding',
    difficulty: 'Medium',
    estimate: '12 min',
    status: 'In progress',
    href: '/questions',
  },
  {
    title: 'Why did this React component re-render?',
    topic: 'React',
    type: 'Conceptual',
    difficulty: 'Medium',
    estimate: '10 min',
    status: 'Not started',
    href: '/questions',
  },
  {
    title: 'Design an autocomplete component',
    topic: 'System Design',
    type: 'System Design',
    difficulty: 'Hard',
    estimate: '22 min',
    status: 'Not started',
    isPremium: true,
    href: '/blog',
  },
  {
    title: 'CSS: center an unknown-size element',
    topic: 'CSS & UI',
    type: 'UI Challenge',
    difficulty: 'Easy',
    estimate: '8 min',
    status: 'Done',
    href: '/questions',
  },
  {
    title: 'TypeScript: infer function return types',
    topic: 'TypeScript',
    type: 'Quiz',
    difficulty: 'Medium',
    estimate: '9 min',
    status: 'Not started',
    href: '/questions',
  },
];

export const companyFocus: CompanyFocus[] = [
  { name: 'Google', emphasis: 'UI architecture and JavaScript depth' },
  { name: 'Meta', emphasis: 'React reasoning and practical coding' },
  { name: 'Amazon', emphasis: 'delivery tradeoffs and ownership' },
  { name: 'Atlassian', emphasis: 'component systems and accessibility' },
  { name: 'Netflix', emphasis: 'performance and product constraints' },
  { name: 'Microsoft', emphasis: 'system thinking and platform clarity' },
];

export const premiumHighlights = [
  'Full explanations',
  'Premium question packs',
  'System design breakdowns',
  'Study plans',
  'Progress insights',
];

export const recentActivity: ActivityItem[] = [
  {
    action: 'Completed',
    target: 'JavaScript Event Loop',
    time: '2h ago',
    href: '/questions',
  },
  {
    action: 'Bookmarked',
    target: 'React Rendering Model',
    time: 'Yesterday',
    href: '/questions',
  },
  {
    action: 'Reviewed',
    target: 'CSS Grid vs Flexbox',
    time: 'Yesterday',
    href: '/blog',
  },
  {
    action: 'Started',
    target: 'Frontend System Design: News Feed',
    time: '3 days ago',
    href: '/blog',
  },
];
