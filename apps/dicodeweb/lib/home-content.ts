export const homeLocales = ["en", "vi", "ja"] as const;

export type HomeLocale = (typeof homeLocales)[number];

type HeroStat = {
  value: string;
  label: string;
  detail: string;
  counterValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

type Track = {
  accent: string;
  title: string;
  description: string;
};

type QuestionPreview = {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
};

type QuestionBankItem = {
  label: string;
  previewQuestions: QuestionPreview[];
};

type QuestionBankGroup = {
  name: string;
  totalQuestions: string;
  totalHours: string;
  featuredItem: string;
  items: QuestionBankItem[];
};

type HomeCopy = {
  localeLabel: string;
  nav: {
    about: string;
    tracks: string;
    blog: string;
    contact: string;
  };
  hero: {
    badge: string;
    titleLines: [string, string];
    brand: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    snippetTabs: string[];
    snippetTitle: string;
    snippetQuote: string;
    snippetAction: string;
    snippetFooter: string;
    stats: HeroStat[];
  };
  about: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{
      title: string;
      description: string;
    }>;
  };
  tracks: {
    eyebrow: string;
    title: string;
    description: string;
    items: Track[];
  };
  questionBank: {
    eyebrow: string;
    title: string;
    description: string;
    groups: QuestionBankGroup[];
    footerNote: string;
    cta: string;
    cardCta: string;
  };
  cta: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
  };
};

function qp(
  title: string,
  description: string,
  category: string,
  difficulty: string,
  tags: string[]
): QuestionPreview {
  return { title, description, category, difficulty, tags };
}

const topicGroupsEn: QuestionBankItem[] = [
  {
    label: "Accessibility",
    previewQuestions: [
      qp(
        "Build an accessible contact form",
        "Model labels, error messaging, keyboard navigation, and screen reader announcements for a production-ready form flow.",
        "UI coding",
        "Easy",
        ["React", "Forms", "A11y"]
      ),
      qp(
        "Design a resilient modal system",
        "Explain focus trapping, escape handling, scroll locking, and the tradeoffs between native and custom semantics.",
        "Systems thinking",
        "Medium",
        ["Accessibility", "Architecture"]
      ),
      qp(
        "Quiz: visually hidden content patterns",
        "Compare common approaches for hiding content while preserving semantics for assistive technologies.",
        "Quiz",
        "Medium",
        ["Accessibility", "CSS"]
      ),
    ],
  },
  {
    label: "Async JavaScript",
    previewQuestions: [
      qp(
        "Build a request queue with concurrency control",
        "Coordinate retries, cancellation, and pending states when multiple async tasks compete for limited capacity.",
        "JavaScript functions",
        "Medium",
        ["Promises", "Concurrency"]
      ),
      qp(
        "Explain race conditions in frontend data fetching",
        "Walk through stale responses, abort signals, and strategies for keeping async UI flows consistent.",
        "Systems thinking",
        "Medium",
        ["Async", "Networking"]
      ),
      qp(
        "Implement debounce with flush and cancel",
        "Handle timers, edge cases, and real interview follow-ups around function identity and cleanup.",
        "JavaScript functions",
        "Easy",
        ["Async", "Utilities"]
      ),
    ],
  },
  {
    label: "CSS Systems",
    previewQuestions: [
      qp(
        "Build a responsive pricing grid",
        "Balance spacing, typography, and component reuse while keeping the layout robust across breakpoints.",
        "UI coding",
        "Easy",
        ["CSS", "Responsive"]
      ),
      qp(
        "Design a scalable token strategy",
        "Explain how you would structure color, spacing, and typography tokens for a growing design system.",
        "Systems thinking",
        "Medium",
        ["CSS", "Design systems"]
      ),
      qp(
        "Refactor a specificity-heavy stylesheet",
        "Reduce overrides, improve naming, and make the styling model easier for a team to extend safely.",
        "Debugging",
        "Medium",
        ["CSS", "Maintainability"]
      ),
    ],
  },
  {
    label: "HTML Semantics",
    previewQuestions: [
      qp(
        "Mark up a complex article page semantically",
        "Choose the right elements for landmarks, headings, metadata, and assistive-technology friendly reading order.",
        "UI coding",
        "Easy",
        ["HTML", "Semantics"]
      ),
      qp(
        "Explain button vs link tradeoffs",
        "Discuss behavior, accessibility, keyboard interactions, and how semantic choices affect user expectations.",
        "Quiz",
        "Easy",
        ["HTML", "A11y"]
      ),
      qp(
        "Audit a form for semantic issues",
        "Spot common mistakes around labels, fieldsets, inputs, and native validation hints.",
        "Debugging",
        "Medium",
        ["HTML", "Forms"]
      ),
    ],
  },
  {
    label: "Internationalization",
    previewQuestions: [
      qp(
        "Design a locale-aware checkout flow",
        "Handle number formatting, currencies, right-to-left layout concerns, and fallback content strategies.",
        "System design",
        "Medium",
        ["i18n", "UX"]
      ),
      qp(
        "Refactor a hard-coded UI for translation",
        "Extract strings, account for pluralization, and avoid layout regressions in longer languages.",
        "UI coding",
        "Medium",
        ["i18n", "React"]
      ),
      qp(
        "Explain hydration concerns in localized apps",
        "Compare server-rendered content, browser locale detection, and translation loading boundaries.",
        "Architecture",
        "Hard",
        ["i18n", "SSR"]
      ),
    ],
  },
  {
    label: "Networking",
    previewQuestions: [
      qp(
        "Model a resilient fetch layer",
        "Design retries, timeouts, deduplication, and error normalization for frontend API calls.",
        "System design",
        "Medium",
        ["Networking", "Architecture"]
      ),
      qp(
        "Explain caching headers to a product team",
        "Translate stale-while-revalidate, ETags, and CDN caching into frontend performance outcomes.",
        "Quiz",
        "Medium",
        ["HTTP", "Caching"]
      ),
      qp(
        "Debug inconsistent API responses in production",
        "Trace auth state, edge caching, and browser-level request behavior to isolate the issue.",
        "Debugging",
        "Hard",
        ["Networking", "Observability"]
      ),
    ],
  },
  {
    label: "Performance",
    previewQuestions: [
      qp(
        "Refactor a slow dashboard list",
        "Walk through rendering bottlenecks, memoization tradeoffs, virtualization choices, and how you would measure improvements.",
        "Performance",
        "Hard",
        ["React", "Profiling", "UX"]
      ),
      qp(
        "Improve a poor LCP landing page",
        "Prioritize image loading, font strategy, script cost, and rendering path improvements.",
        "System design",
        "Medium",
        ["Web vitals", "Rendering"]
      ),
      qp(
        "Explain when memoization hurts",
        "Discuss allocation costs, stale assumptions, and team-level maintainability tradeoffs.",
        "Quiz",
        "Medium",
        ["Performance", "React"]
      ),
    ],
  },
  {
    label: "React Hooks",
    previewQuestions: [
      qp(
        "Implement a reusable tabs component in React",
        "Discuss state control, keyboard support, and how custom hooks can isolate shared behavior cleanly.",
        "UI coding",
        "Easy",
        ["React Hooks", "Accessibility"]
      ),
      qp(
        "Explain stale closures in event handlers",
        "Compare patterns using refs, dependencies, and newer React event helpers to avoid subtle bugs.",
        "Quiz",
        "Medium",
        ["React", "Hooks"]
      ),
      qp(
        "Refactor effect-heavy code into custom hooks",
        "Reduce coupling, clarify responsibilities, and make data synchronization easier to reason about.",
        "Architecture",
        "Medium",
        ["Hooks", "Maintainability"]
      ),
    ],
  },
  {
    label: "State Management",
    previewQuestions: [
      qp(
        "Design state boundaries for a workspace app",
        "Separate server state, UI state, and persisted state while keeping feature ownership clear.",
        "System design",
        "Medium",
        ["State", "Architecture"]
      ),
      qp(
        "Refactor prop drilling in a settings flow",
        "Compare context, local state, reducers, and store-based solutions for a medium-sized app.",
        "UI coding",
        "Medium",
        ["React", "State"]
      ),
      qp(
        "Explain optimistic updates safely",
        "Handle rollback, error recovery, and consistency when multiple writes happen in parallel.",
        "Architecture",
        "Hard",
        ["State", "Data fetching"]
      ),
    ],
  },
  {
    label: "Testing",
    previewQuestions: [
      qp(
        "Test a multistep form flow",
        "Cover validation, async submission, and user interactions without over-coupling tests to implementation details.",
        "UI coding",
        "Medium",
        ["Testing", "Forms"]
      ),
      qp(
        "Explain the test pyramid for frontend teams",
        "Choose the right balance between unit, integration, and E2E tests for sustainable coverage.",
        "Quiz",
        "Easy",
        ["Testing", "Strategy"]
      ),
      qp(
        "Debug a flaky component test",
        "Track timing assumptions, hidden shared state, and unreliable selectors in a CI environment.",
        "Debugging",
        "Medium",
        ["Testing", "CI"]
      ),
    ],
  },
  {
    label: "Web APIs",
    previewQuestions: [
      qp(
        "Build an infinite scroll observer",
        "Use Intersection Observer carefully while handling cleanup, loading states, and repeated triggers.",
        "UI coding",
        "Easy",
        ["Web APIs", "Scrolling"]
      ),
      qp(
        "Explain storage API tradeoffs",
        "Compare localStorage, sessionStorage, IndexedDB, and cookies for different frontend product needs.",
        "Quiz",
        "Medium",
        ["Storage", "Browser APIs"]
      ),
      qp(
        "Design offline draft persistence",
        "Coordinate browser storage, sync recovery, and conflict handling for a user-facing editing flow.",
        "System design",
        "Hard",
        ["IndexedDB", "Offline"]
      ),
    ],
  },
];

const frameworkGroupsEn: QuestionBankItem[] = [
  {
    label: "JavaScript",
    previewQuestions: [
      qp(
        "Implement a deep clone utility",
        "Handle arrays, objects, dates, and circular references while explaining practical interview tradeoffs.",
        "JavaScript functions",
        "Medium",
        ["JavaScript", "Utilities"]
      ),
      qp(
        "Build a makeCounter function",
        "Use closures cleanly and discuss alternative designs if interviewers ask for reset and undo behavior.",
        "JavaScript functions",
        "Easy",
        ["Closures", "JavaScript"]
      ),
    ],
  },
  {
    label: "TypeScript",
    previewQuestions: [
      qp(
        "Model a generic async resource hook",
        "Use discriminated unions and inference to make loading, success, and error states safe to consume.",
        "Type systems",
        "Medium",
        ["TypeScript", "React"]
      ),
      qp(
        "Refactor a type-heavy form flow",
        "Improve inferencing, validation boundaries, and maintainability for a growing frontend codebase.",
        "Type systems",
        "Hard",
        ["TypeScript", "Forms", "DX"]
      ),
    ],
  },
  {
    label: "React",
    previewQuestions: [
      qp(
        "Implement a reusable tabs component in React",
        "Discuss compound components, keyboard support, roving focus, and how you would expose a maintainable API.",
        "Component design",
        "Easy",
        ["React", "Accessibility"]
      ),
      qp(
        "Explain stale closures in React handlers",
        "Compare refs, dependencies, and event helper patterns for keeping handlers fresh without over-rendering.",
        "Quiz",
        "Medium",
        ["React", "Hooks"]
      ),
    ],
  },
  {
    label: "Next.js",
    previewQuestions: [
      qp(
        "Explain the tradeoffs of React Server Components",
        "Compare data-fetching, bundle size, and client/server boundaries in a real production scenario.",
        "Architecture",
        "Medium",
        ["React", "Next.js", "Rendering"]
      ),
      qp(
        "Design route-level caching in Next.js",
        "Balance freshness, ISR behavior, and user-specific rendering for a content-heavy product.",
        "System design",
        "Hard",
        ["Next.js", "Caching"]
      ),
    ],
  },
  {
    label: "Vue",
    previewQuestions: [
      qp(
        "Build a controlled accordion in Vue",
        "Explain reactive state boundaries, keyboard support, and component communication choices.",
        "UI coding",
        "Easy",
        ["Vue", "Accessibility"]
      ),
      qp(
        "Compare Vue composables to React hooks",
        "Discuss mental models, ergonomics, and team tradeoffs when moving between ecosystems.",
        "Quiz",
        "Medium",
        ["Vue", "Architecture"]
      ),
    ],
  },
  {
    label: "HTML",
    previewQuestions: [
      qp(
        "Mark up a complex article page semantically",
        "Choose the right elements for landmarks, headings, metadata, and assistive-technology friendly reading order.",
        "UI coding",
        "Easy",
        ["HTML", "Semantics"]
      ),
      qp(
        "Audit a form for semantic issues",
        "Spot common mistakes around labels, fieldsets, inputs, and native validation hints.",
        "Debugging",
        "Medium",
        ["HTML", "Forms"]
      ),
    ],
  },
  {
    label: "CSS",
    previewQuestions: [
      qp(
        "Build a responsive pricing grid",
        "Balance spacing, typography, and component reuse while keeping the layout robust across breakpoints.",
        "UI coding",
        "Easy",
        ["CSS", "Responsive"]
      ),
      qp(
        "Refactor a specificity-heavy stylesheet",
        "Reduce overrides, improve naming, and make the styling model easier for a team to extend safely.",
        "Debugging",
        "Medium",
        ["CSS", "Maintainability"]
      ),
    ],
  },
];

const formatGroupsEn: QuestionBankItem[] = [
  {
    label: "UI coding",
    previewQuestions: [
      qp(
        "Build a file explorer component",
        "Create a recursive tree viewer that supports expand/collapse, keyboard traversal, and sensible state modeling.",
        "UI coding",
        "Medium",
        ["Trees", "State", "React"]
      ),
      qp(
        "Build a 7-segment digital clock",
        "Model timing updates, rendering boundaries, and the cleanest way to express segmented visuals.",
        "UI coding",
        "Medium",
        ["JavaScript", "UI"]
      ),
    ],
  },
  {
    label: "JavaScript functions",
    previewQuestions: [
      qp(
        "Implement debounce with flush and cancel",
        "Handle timers, edge cases, and real interview follow-ups around function identity and cleanup.",
        "JavaScript functions",
        "Easy",
        ["JavaScript", "Async"]
      ),
      qp(
        "Write a flatten utility",
        "Cover nested arrays, recursion, iterative alternatives, and time-space tradeoffs clearly.",
        "JavaScript functions",
        "Easy",
        ["JavaScript", "Recursion"]
      ),
    ],
  },
  {
    label: "System design",
    previewQuestions: [
      qp(
        "Design a frontend architecture for notifications",
        "Model event delivery, optimistic updates, unread counts, and scaling considerations across product surfaces.",
        "System design",
        "Hard",
        ["Architecture", "Realtime"]
      ),
      qp(
        "Design state boundaries for a workspace app",
        "Separate server state, UI state, and persisted state while keeping feature ownership clear.",
        "System design",
        "Medium",
        ["State", "Architecture"]
      ),
    ],
  },
  {
    label: "Quiz",
    previewQuestions: [
      qp(
        "Quiz: visually hidden content patterns",
        "Compare common approaches for hiding content while preserving semantics for assistive technologies.",
        "Quiz",
        "Medium",
        ["Accessibility", "CSS"]
      ),
      qp(
        "Quiz: button vs link tradeoffs",
        "Explain semantics, keyboard interactions, and user expectations across common interface patterns.",
        "Quiz",
        "Easy",
        ["HTML", "A11y"]
      ),
    ],
  },
  {
    label: "Debugging",
    previewQuestions: [
      qp(
        "Debug inconsistent API responses in production",
        "Trace auth state, edge caching, and browser-level request behavior to isolate the issue.",
        "Debugging",
        "Hard",
        ["Networking", "Observability"]
      ),
      qp(
        "Debug a flaky component test",
        "Track timing assumptions, hidden shared state, and unreliable selectors in a CI environment.",
        "Debugging",
        "Medium",
        ["Testing", "CI"]
      ),
    ],
  },
];

const topicGroupsVi: QuestionBankItem[] = [
  {
    label: "Accessibility",
    previewQuestions: [
      qp(
        "Xây dựng contact form có accessibility tốt",
        "Mô phỏng label, error message, keyboard navigation và screen reader announcement cho một form thực tế.",
        "UI coding",
        "Easy",
        ["React", "Forms", "A11y"]
      ),
      qp(
        "Thiết kế một modal system bền vững",
        "Giải thích focus trap, xử lý phím escape, khóa scroll và trade-off giữa semantics native với custom.",
        "Systems thinking",
        "Medium",
        ["Accessibility", "Architecture"]
      ),
      qp(
        "Quiz: các pattern ẩn nội dung trực quan",
        "So sánh các cách phổ biến để ẩn nội dung nhưng vẫn giữ semantics cho công nghệ hỗ trợ.",
        "Quiz",
        "Medium",
        ["Accessibility", "CSS"]
      ),
    ],
  },
  {
    label: "Async JavaScript",
    previewQuestions: [
      qp(
        "Xây request queue có kiểm soát concurrency",
        "Điều phối retry, cancellation và pending state khi nhiều async task chạy song song.",
        "JavaScript functions",
        "Medium",
        ["Promises", "Concurrency"]
      ),
      qp(
        "Giải thích race condition trong data fetching",
        "Phân tích stale response, abort signal và cách giữ cho async UI flow luôn nhất quán.",
        "Systems thinking",
        "Medium",
        ["Async", "Networking"]
      ),
      qp(
        "Implement debounce có flush và cancel",
        "Xử lý timer, edge case và các câu follow-up hay gặp về cleanup và function identity.",
        "JavaScript functions",
        "Easy",
        ["Async", "Utilities"]
      ),
    ],
  },
  {
    label: "CSS Systems",
    previewQuestions: [
      qp(
        "Xây một pricing grid responsive",
        "Cân bằng spacing, typography và khả năng tái sử dụng component trên nhiều breakpoint.",
        "UI coding",
        "Easy",
        ["CSS", "Responsive"]
      ),
      qp(
        "Thiết kế chiến lược token có thể scale",
        "Giải thích cách tổ chức token cho màu sắc, spacing và typography trong design system đang lớn dần.",
        "Systems thinking",
        "Medium",
        ["CSS", "Design systems"]
      ),
      qp(
        "Refactor một stylesheet bị specificity nặng",
        "Giảm override, cải thiện naming và làm cho mô hình styling dễ mở rộng hơn cho team.",
        "Debugging",
        "Medium",
        ["CSS", "Maintainability"]
      ),
    ],
  },
  {
    label: "HTML Semantics",
    previewQuestions: [
      qp(
        "Đánh dấu semantic cho một article page phức tạp",
        "Chọn đúng landmark, heading, metadata và reading order thân thiện với assistive technologies.",
        "UI coding",
        "Easy",
        ["HTML", "Semantics"]
      ),
      qp(
        "Giải thích trade-off giữa button và link",
        "Phân tích semantics, keyboard interaction và kỳ vọng của người dùng trong từng ngữ cảnh.",
        "Quiz",
        "Easy",
        ["HTML", "A11y"]
      ),
      qp(
        "Audit một form có lỗi semantic",
        "Tìm các lỗi phổ biến quanh label, fieldset, input và gợi ý validate native.",
        "Debugging",
        "Medium",
        ["HTML", "Forms"]
      ),
    ],
  },
  {
    label: "Internationalization",
    previewQuestions: [
      qp(
        "Thiết kế checkout flow có hỗ trợ locale",
        "Xử lý number format, currency, layout RTL và fallback content cho nhiều ngôn ngữ.",
        "System design",
        "Medium",
        ["i18n", "UX"]
      ),
      qp(
        "Refactor UI hard-code để hỗ trợ dịch",
        "Tách string, xử lý pluralization và tránh layout regression khi text dài hơn.",
        "UI coding",
        "Medium",
        ["i18n", "React"]
      ),
      qp(
        "Giải thích hydration concern trong app đa ngôn ngữ",
        "So sánh server-rendered content, locale detection và boundary tải translation.",
        "Architecture",
        "Hard",
        ["i18n", "SSR"]
      ),
    ],
  },
  {
    label: "Networking",
    previewQuestions: [
      qp(
        "Thiết kế một fetch layer bền vững",
        "Mô hình hóa retry, timeout, deduplication và chuẩn hóa error cho API calls phía frontend.",
        "System design",
        "Medium",
        ["Networking", "Architecture"]
      ),
      qp(
        "Giải thích cache headers cho product team",
        "Dịch stale-while-revalidate, ETags và CDN caching thành tác động cụ thể tới trải nghiệm người dùng.",
        "Quiz",
        "Medium",
        ["HTTP", "Caching"]
      ),
      qp(
        "Debug phản hồi API không nhất quán trên production",
        "Lần theo auth state, edge caching và hành vi request của trình duyệt để cô lập vấn đề.",
        "Debugging",
        "Hard",
        ["Networking", "Observability"]
      ),
    ],
  },
  {
    label: "Performance",
    previewQuestions: [
      qp(
        "Refactor một dashboard list đang chậm",
        "Phân tích bottleneck render, trade-off của memoization, lựa chọn virtualization và cách đo cải thiện hiệu năng.",
        "Performance",
        "Hard",
        ["React", "Profiling", "UX"]
      ),
      qp(
        "Cải thiện một landing page có LCP kém",
        "Ưu tiên lại image loading, chiến lược font, chi phí script và đường đi render quan trọng.",
        "System design",
        "Medium",
        ["Web vitals", "Rendering"]
      ),
      qp(
        "Giải thích khi nào memoization gây hại",
        "Phân tích allocation cost, stale assumption và trade-off maintainability trong team.",
        "Quiz",
        "Medium",
        ["Performance", "React"]
      ),
    ],
  },
  {
    label: "React Hooks",
    previewQuestions: [
      qp(
        "Xây tabs component có thể tái sử dụng trong React",
        "Phân tích state control, keyboard support và cách custom hook tách shared behavior sạch sẽ.",
        "UI coding",
        "Easy",
        ["React Hooks", "Accessibility"]
      ),
      qp(
        "Giải thích stale closure trong event handler",
        "So sánh pattern dùng ref, dependencies và event helper để tránh bug tinh vi.",
        "Quiz",
        "Medium",
        ["React", "Hooks"]
      ),
      qp(
        "Refactor effect-heavy code thành custom hooks",
        "Giảm coupling, làm rõ trách nhiệm và giúp đồng bộ dữ liệu dễ suy luận hơn.",
        "Architecture",
        "Medium",
        ["Hooks", "Maintainability"]
      ),
    ],
  },
  {
    label: "State Management",
    previewQuestions: [
      qp(
        "Thiết kế boundary state cho một workspace app",
        "Tách server state, UI state và persisted state trong khi vẫn giữ ownership rõ ràng.",
        "System design",
        "Medium",
        ["State", "Architecture"]
      ),
      qp(
        "Refactor prop drilling trong một settings flow",
        "So sánh context, local state, reducer và store-based solution cho app cỡ vừa.",
        "UI coding",
        "Medium",
        ["React", "State"]
      ),
      qp(
        "Giải thích optimistic update sao cho an toàn",
        "Xử lý rollback, error recovery và consistency khi có nhiều write diễn ra song song.",
        "Architecture",
        "Hard",
        ["State", "Data fetching"]
      ),
    ],
  },
  {
    label: "Testing",
    previewQuestions: [
      qp(
        "Test một multistep form flow",
        "Bao phủ validation, async submission và user interactions mà không over-couple test vào implementation.",
        "UI coding",
        "Medium",
        ["Testing", "Forms"]
      ),
      qp(
        "Giải thích test pyramid cho frontend team",
        "Chọn đúng cân bằng giữa unit, integration và E2E tests để coverage bền vững.",
        "Quiz",
        "Easy",
        ["Testing", "Strategy"]
      ),
      qp(
        "Debug một component test bị flaky",
        "Lần theo timing assumption, shared state ẩn và selector không ổn định trong CI.",
        "Debugging",
        "Medium",
        ["Testing", "CI"]
      ),
    ],
  },
  {
    label: "Web APIs",
    previewQuestions: [
      qp(
        "Xây infinite scroll bằng Intersection Observer",
        "Dùng browser API này cẩn thận với cleanup, loading state và repeated trigger.",
        "UI coding",
        "Easy",
        ["Web APIs", "Scrolling"]
      ),
      qp(
        "Giải thích trade-off giữa các storage API",
        "So sánh localStorage, sessionStorage, IndexedDB và cookie cho từng nhu cầu sản phẩm.",
        "Quiz",
        "Medium",
        ["Storage", "Browser APIs"]
      ),
      qp(
        "Thiết kế lưu draft offline",
        "Kết hợp browser storage, sync recovery và conflict handling cho luồng chỉnh sửa của người dùng.",
        "System design",
        "Hard",
        ["IndexedDB", "Offline"]
      ),
    ],
  },
];

const frameworkGroupsVi: QuestionBankItem[] = [
  {
    label: "JavaScript",
    previewQuestions: [
      qp(
        "Implement utility deep clone",
        "Xử lý array, object, date và circular reference trong khi vẫn giải thích trade-off thực tế khi phỏng vấn.",
        "JavaScript functions",
        "Medium",
        ["JavaScript", "Utilities"]
      ),
      qp(
        "Xây hàm makeCounter",
        "Dùng closure gọn gàng và giải thích cách mở rộng nếu interviewer hỏi thêm reset hoặc undo.",
        "JavaScript functions",
        "Easy",
        ["Closures", "JavaScript"]
      ),
    ],
  },
  {
    label: "TypeScript",
    previewQuestions: [
      qp(
        "Mô hình hóa generic async resource hook",
        "Dùng discriminated union và inference để loading, success, error state đều an toàn khi consume.",
        "Type systems",
        "Medium",
        ["TypeScript", "React"]
      ),
      qp(
        "Refactor một form flow nặng TypeScript",
        "Cải thiện inferencing, boundary validation và maintainability cho một frontend codebase đang lớn dần.",
        "Type systems",
        "Hard",
        ["TypeScript", "Forms", "DX"]
      ),
    ],
  },
  {
    label: "React",
    previewQuestions: [
      qp(
        "Xây một tabs component có thể tái sử dụng trong React",
        "Phân tích compound components, keyboard support, roving focus và cách expose API cho dễ maintain.",
        "Component design",
        "Easy",
        ["React", "Accessibility"]
      ),
      qp(
        "Giải thích stale closure trong React handler",
        "So sánh refs, dependencies và các event helper pattern để giữ handler luôn mới mà không re-render thừa.",
        "Quiz",
        "Medium",
        ["React", "Hooks"]
      ),
    ],
  },
  {
    label: "Next.js",
    previewQuestions: [
      qp(
        "Giải thích trade-off của React Server Components",
        "So sánh data-fetching, bundle size và ranh giới client/server trong một bối cảnh production thực tế.",
        "Architecture",
        "Medium",
        ["React", "Next.js", "Rendering"]
      ),
      qp(
        "Thiết kế route-level caching trong Next.js",
        "Cân bằng freshness, ISR behavior và user-specific rendering cho một sản phẩm nhiều nội dung.",
        "System design",
        "Hard",
        ["Next.js", "Caching"]
      ),
    ],
  },
  {
    label: "Vue",
    previewQuestions: [
      qp(
        "Xây controlled accordion trong Vue",
        "Giải thích reactive state boundary, keyboard support và cách các component nên giao tiếp với nhau.",
        "UI coding",
        "Easy",
        ["Vue", "Accessibility"]
      ),
      qp(
        "So sánh Vue composables với React hooks",
        "Bàn về mental model, ergonomics và trade-off khi team làm việc đa framework.",
        "Quiz",
        "Medium",
        ["Vue", "Architecture"]
      ),
    ],
  },
  {
    label: "HTML",
    previewQuestions: [
      qp(
        "Đánh dấu semantic cho một article page phức tạp",
        "Chọn đúng landmark, heading, metadata và reading order thân thiện với assistive technologies.",
        "UI coding",
        "Easy",
        ["HTML", "Semantics"]
      ),
      qp(
        "Audit một form có lỗi semantic",
        "Tìm các lỗi phổ biến quanh label, fieldset, input và gợi ý validate native.",
        "Debugging",
        "Medium",
        ["HTML", "Forms"]
      ),
    ],
  },
  {
    label: "CSS",
    previewQuestions: [
      qp(
        "Xây một pricing grid responsive",
        "Cân bằng spacing, typography và khả năng tái sử dụng component trên nhiều breakpoint.",
        "UI coding",
        "Easy",
        ["CSS", "Responsive"]
      ),
      qp(
        "Refactor một stylesheet bị specificity nặng",
        "Giảm override, cải thiện naming và làm cho mô hình styling dễ mở rộng hơn cho team.",
        "Debugging",
        "Medium",
        ["CSS", "Maintainability"]
      ),
    ],
  },
];

const formatGroupsVi: QuestionBankItem[] = [
  {
    label: "UI coding",
    previewQuestions: [
      qp(
        "Xây dựng một file explorer component",
        "Tạo tree viewer đệ quy với expand/collapse, keyboard traversal và state modeling hợp lý.",
        "UI coding",
        "Medium",
        ["Trees", "State", "React"]
      ),
      qp(
        "Xây digital clock dạng 7 đoạn",
        "Mô hình hóa cập nhật theo thời gian, boundary render và cách biểu diễn segmented UI gọn gàng nhất.",
        "UI coding",
        "Medium",
        ["JavaScript", "UI"]
      ),
    ],
  },
  {
    label: "JavaScript functions",
    previewQuestions: [
      qp(
        "Implement debounce có flush và cancel",
        "Xử lý timer, edge case và các câu follow-up hay gặp về cleanup và function identity.",
        "JavaScript functions",
        "Easy",
        ["JavaScript", "Async"]
      ),
      qp(
        "Viết utility flatten",
        "Bao phủ nested array, recursion, iterative alternative và trade-off về time-space rõ ràng.",
        "JavaScript functions",
        "Easy",
        ["JavaScript", "Recursion"]
      ),
    ],
  },
  {
    label: "System design",
    previewQuestions: [
      qp(
        "Thiết kế kiến trúc frontend cho notifications",
        "Mô hình hóa event delivery, optimistic updates, unread counts và các cân nhắc scale trên nhiều product surface.",
        "System design",
        "Hard",
        ["Architecture", "Realtime"]
      ),
      qp(
        "Thiết kế boundary state cho một workspace app",
        "Tách server state, UI state và persisted state trong khi vẫn giữ ownership rõ ràng.",
        "System design",
        "Medium",
        ["State", "Architecture"]
      ),
    ],
  },
  {
    label: "Quiz",
    previewQuestions: [
      qp(
        "Quiz: các pattern ẩn nội dung trực quan",
        "So sánh các cách phổ biến để ẩn nội dung nhưng vẫn giữ semantics cho công nghệ hỗ trợ.",
        "Quiz",
        "Medium",
        ["Accessibility", "CSS"]
      ),
      qp(
        "Quiz: trade-off giữa button và link",
        "Giải thích semantics, keyboard interaction và kỳ vọng người dùng trong các pattern phổ biến.",
        "Quiz",
        "Easy",
        ["HTML", "A11y"]
      ),
    ],
  },
  {
    label: "Debugging",
    previewQuestions: [
      qp(
        "Debug phản hồi API không nhất quán trên production",
        "Lần theo auth state, edge caching và hành vi request của trình duyệt để cô lập vấn đề.",
        "Debugging",
        "Hard",
        ["Networking", "Observability"]
      ),
      qp(
        "Debug một component test bị flaky",
        "Lần theo timing assumption, shared state ẩn và selector không ổn định trong CI.",
        "Debugging",
        "Medium",
        ["Testing", "CI"]
      ),
    ],
  },
];

const questionBankGroupsEn: QuestionBankGroup[] = [
  {
    name: "Topics",
    totalQuestions: "320 questions",
    totalHours: "48 hours total",
    featuredItem: "Accessibility",
    items: topicGroupsEn,
  },
  {
    name: "Framework / language",
    totalQuestions: "180 questions",
    totalHours: "31 hours total",
    featuredItem: "React",
    items: frameworkGroupsEn,
  },
  {
    name: "Format",
    totalQuestions: "96 questions",
    totalHours: "18 hours total",
    featuredItem: "UI coding",
    items: formatGroupsEn,
  },
];

const questionBankGroupsVi: QuestionBankGroup[] = [
  {
    name: "Chủ đề",
    totalQuestions: "320 câu hỏi",
    totalHours: "48 giờ nội dung",
    featuredItem: "Accessibility",
    items: topicGroupsVi,
  },
  {
    name: "Framework / ngôn ngữ",
    totalQuestions: "180 câu hỏi",
    totalHours: "31 giờ nội dung",
    featuredItem: "React",
    items: frameworkGroupsVi,
  },
  {
    name: "Hình thức",
    totalQuestions: "96 câu hỏi",
    totalHours: "18 giờ nội dung",
    featuredItem: "UI coding",
    items: formatGroupsVi,
  },
];

export const homeContent: Record<HomeLocale, HomeCopy> = {
  en: {
    localeLabel: "Language",
    nav: {
      about: "Highlights",
      tracks: "Questions",
      blog: "Blog",
      contact: "FAQ",
    },
    hero: {
      badge: "Frontend depth, systems thinking, and calm execution",
      titleLines: ["Master Frontend", "Engineering with"],
      brand: "DiCodeWeb",
      description:
        "Learn modern frontend development through expert-led notes, hands-on projects, interview prep, and clear roadmaps designed for real product work.",
      primaryCta: "Explore Questions",
      secondaryCta: "Follow the Roadmap",
      snippetTabs: ["HTML", "CSS", "JavaScript", "React"],
      snippetTitle: "Keep Coding. Keep Growing.",
      snippetQuote: "Build. Ship. Get hired.",
      snippetAction: "Level Up",
      snippetFooter: "You are stronger every sprint.",
      stats: [
        {
          value: "320+",
          label: "Questions",
          detail: "Interview prompts with practical explanations",
          counterValue: 320,
          suffix: "+",
        },
        {
          value: "45+",
          label: "Topics",
          detail: "From HTML and CSS to systems and performance",
          counterValue: 45,
          suffix: "+",
        },
        {
          value: "1.8K+",
          label: "Passed Interviews",
          detail: "Learners who used the roadmap to prepare better",
          counterValue: 1.8,
          suffix: "K+",
          decimals: 1,
        },
        {
          value: "4.9/5",
          label: "Success Rating",
          detail: "Trusted by learners preparing for frontend rounds",
          counterValue: 4.9,
          suffix: "/5",
          decimals: 1,
        },
      ],
    },
    about: {
      eyebrow: "Why It Works",
      title: "A learning experience built like a thoughtful product.",
      description:
        "The interface stays expressive, but the learning flow stays disciplined: less noise, stronger hierarchy, and better momentum.",
      cards: [
        {
          title: "Built for reading",
          description:
            "Typography, spacing, and color contrast are tuned for long-form study instead of shallow scanning.",
        },
        {
          title: "Built for builders",
          description:
            "Examples focus on implementation tradeoffs, system design, and practical frontend engineering habits.",
        },
        {
          title: "Built for momentum",
          description:
            "Roadmaps, milestones, and clear entry points help learners keep moving without feeling buried.",
        },
      ],
    },
    tracks: {
      eyebrow: "Learning Tracks",
      title: "A curriculum shaped for modern digital work.",
      description:
        "Each track moves from foundations to production thinking, with enough depth to be useful on the job.",
      items: [
        {
          accent: "UI Architecture",
          title: "Frontend Systems",
          description:
            "Build resilient interfaces with strong component structure, accessibility habits, and scalable design decisions.",
        },
        {
          accent: "Workflow Craft",
          title: "Developer Tooling",
          description:
            "Improve delivery speed with stronger tooling, automation, performance debugging, and team-friendly workflows.",
        },
        {
          accent: "Editorial Depth",
          title: "Technical Communication",
          description:
            "Turn implementation knowledge into docs, portfolio pieces, and lessons people can actually apply.",
        },
      ],
    },
    questionBank: {
      eyebrow: "Question Bank",
      title: "A practice question bank with the frontend topics teams actually screen for.",
      description:
        "Preview the breadth of the bank: critical concepts, interview formats, and practical coding prompts. You can switch tabs and preview groups here, while deeper exploration lives on the dedicated questions page.",
      groups: questionBankGroupsEn,
      footerNote:
        "This preview lets you browse categories and sample questions. Full drilling, progress, and detailed solutions live on the question-bank page.",
      cta: "See all questions",
      cardCta: "Open in question bank",
    },
    cta: {
      eyebrow: "Ready To Start",
      title: "Turn frontend ambition into a sharper, calmer learning routine.",
      description:
        "Study with clearer direction, stronger examples, and a visual system that helps you stay focused longer.",
      button: "Read the latest articles",
    },
  },
  vi: {
    localeLabel: "Ngôn ngữ",
    nav: {
      about: "Điểm nhấn",
      tracks: "Câu hỏi",
      blog: "Blog",
      contact: "Hỏi đáp",
    },
    hero: {
      badge: "Học frontend bài bản, có chiều sâu và nhịp học dễ theo",
      titleLines: ["Làm chủ Frontend", "Engineering với"],
      brand: "DiCodeWeb",
      description:
        "Học frontend hiện đại qua bài giảng có chiều sâu, dự án thực chiến, luyện phỏng vấn và lộ trình rõ ràng cho công việc sản phẩm thực tế.",
      primaryCta: "Khám phá câu hỏi",
      secondaryCta: "Theo lộ trình",
      snippetTabs: ["HTML", "CSS", "JavaScript", "React"],
      snippetTitle: "Cứ code tiếp. Cứ tiến bộ.",
      snippetQuote: "Xây dựng. Ra mắt. Đi làm.",
      snippetAction: "Nâng cấp kỹ năng",
      snippetFooter: "Bạn đang tiến bộ hơn sau từng chặng học.",
      stats: [
        {
          value: "320+",
          label: "Câu hỏi",
          detail: "Câu hỏi phỏng vấn kèm giải thích thực chiến",
          counterValue: 320,
          suffix: "+",
        },
        {
          value: "45+",
          label: "Chủ đề",
          detail: "Bao quát từ HTML, CSS đến hiệu năng và thiết kế hệ thống",
          counterValue: 45,
          suffix: "+",
        },
        {
          value: "1.8K+",
          label: "Người đậu phỏng vấn",
          detail: "Người học dùng lộ trình để chuẩn bị kỹ hơn cho các vòng tuyển dụng",
          counterValue: 1.8,
          suffix: "K+",
          decimals: 1,
        },
        {
          value: "4.9/5",
          label: "Tỷ lệ tin tưởng",
          detail: "Được đánh giá cao bởi người đang luyện phỏng vấn frontend",
          counterValue: 4.9,
          suffix: "/5",
          decimals: 1,
        },
      ],
    },
    about: {
      eyebrow: "Vì Sao Hiệu Quả",
      title: "Một trải nghiệm học được thiết kế như một sản phẩm tốt.",
      description:
        "Giao diện vẫn đủ cuốn hút nhưng luồng học được giữ kỷ luật: ít nhiễu hơn, thứ bậc rõ hơn và tạo đà tốt hơn.",
      cards: [
        {
          title: "Tối ưu cho việc đọc",
          description:
            "Chữ, khoảng trắng và độ tương phản được tinh chỉnh cho việc học dài hơi thay vì chỉ lướt qua.",
        },
        {
          title: "Tối ưu cho người làm",
          description:
            "Ví dụ tập trung vào trade-off triển khai, tư duy hệ thống và thói quen kỹ thuật hữu ích trong công việc.",
        },
        {
          title: "Tối ưu cho đà tiến bộ",
          description:
            "Roadmap, cột mốc và điểm bắt đầu rõ ràng giúp người học tiếp tục tiến lên mà không bị ngợp.",
        },
      ],
    },
    tracks: {
      eyebrow: "Lộ Trình Học",
      title: "Chương trình học được thiết kế cho công việc số hiện đại.",
      description:
        "Mỗi lộ trình đi từ nền tảng đến tư duy production, đủ sâu để áp dụng ngay trong công việc.",
      items: [
        {
          accent: "Kiến trúc UI",
          title: "Hệ thống Frontend",
          description:
            "Xây dựng giao diện bền vững với cấu trúc component tốt, khả năng truy cập và quyết định thiết kế có thể mở rộng.",
        },
        {
          accent: "Quy trình làm việc",
          title: "Công cụ cho Developer",
          description:
            "Tăng tốc độ làm việc bằng tooling tốt hơn, automation, tối ưu hiệu năng và workflow thân thiện với team.",
        },
        {
          accent: "Chiều sâu biên tập",
          title: "Giao tiếp kỹ thuật",
          description:
            "Biến kiến thức triển khai thành tài liệu, portfolio và bài học mà người khác có thể áp dụng ngay.",
        },
      ],
    },
    questionBank: {
      eyebrow: "Ngân Hàng Câu Hỏi",
      title:
        "Một ngân hàng câu hỏi luyện tập bao phủ đúng những chủ đề frontend mà nhà tuyển dụng hay hỏi.",
      description:
        "Phần này cho phép bấm thử qua các tab và nhóm câu hỏi để xem phạm vi nội dung. Toàn bộ thao tác chuyên sâu sẽ nằm ở trang ngân hàng câu hỏi riêng.",
      groups: questionBankGroupsVi,
      footerNote:
        "Phần xem trước này cho phép xem nhanh chủ đề và câu hỏi mẫu. Toàn bộ nội dung chi tiết, luyện tập và theo dõi tiến độ sẽ nằm ở trang ngân hàng câu hỏi riêng.",
      cta: "Xem toàn bộ câu hỏi",
      cardCta: "Mở trong ngân hàng câu hỏi",
    },
    cta: {
      eyebrow: "Sẵn Sàng Bắt Đầu",
      title: "Biến mục tiêu frontend thành nhịp học rõ ràng và bền bỉ hơn.",
      description:
        "Học với định hướng tốt hơn, ví dụ mạnh hơn và một hệ thống thị giác giúp bạn tập trung lâu hơn.",
      button: "Đọc bài viết mới nhất",
    },
  },
  ja: {
    localeLabel: "言語",
    nav: {
      about: "特長",
      tracks: "問題集",
      blog: "ブログ",
      contact: "よくある質問",
    },
    hero: {
      badge: "深いフロントエンド学習を、落ち着いた体験で",
      titleLines: ["Frontend Engineering を", "本気で身につける"],
      brand: "DiCodeWeb",
      description:
        "実務に近いフロントエンド学習を、専門的な講義ノート、実践プロジェクト、面接対策、明確なロードマップで進められます。",
      primaryCta: "問題を見る",
      secondaryCta: "ロードマップをたどる",
      snippetTabs: ["HTML", "CSS", "JavaScript", "React"],
      snippetTitle: "書き続ける。伸び続ける。",
      snippetQuote: "作る。届ける。仕事につなげる。",
      snippetAction: "レベルアップ",
      snippetFooter: "スプリントごとに、確実に強くなる。",
      stats: [
        {
          value: "320+",
          label: "質問数",
          detail: "実践的な解説つきの面接問題",
          counterValue: 320,
          suffix: "+",
        },
        {
          value: "45+",
          label: "トピック",
          detail: "HTML や CSS からパフォーマンス設計まで幅広くカバー",
          counterValue: 45,
          suffix: "+",
        },
        {
          value: "1.8K+",
          label: "合格者数",
          detail: "学習ロードマップで準備を進め、選考を通過した学習者",
          counterValue: 1.8,
          suffix: "K+",
          decimals: 1,
        },
        {
          value: "4.9/5",
          label: "満足度",
          detail: "フロントエンド面接対策に取り組む学習者から高評価",
          counterValue: 4.9,
          suffix: "/5",
          decimals: 1,
        },
      ],
    },
    about: {
      eyebrow: "選ばれる理由",
      title: "考え抜かれたプロダクトのような学習体験。",
      description:
        "表現力のある見た目を保ちながら、学習導線は規律ある設計に。ノイズを減らし、理解の流れを強くします。",
      cards: [
        {
          title: "読むための設計",
          description:
            "タイポグラフィ、余白、コントラストを長時間の学習向けに最適化しています。",
        },
        {
          title: "作る人のための設計",
          description:
            "実装上のトレードオフ、システム設計、実務で効くフロントエンド習慣に焦点を当てます。",
        },
        {
          title: "続けられる設計",
          description:
            "ロードマップ、節目、わかりやすい入口によって、迷わず前進できるようにします。",
        },
      ],
    },
    tracks: {
      eyebrow: "学習トラック",
      title: "現代のデジタル仕事に合わせたカリキュラム。",
      description:
        "各トラックは基礎から実務思考までをつなぎ、仕事で使える深さを持たせています。",
      items: [
        {
          accent: "UI アーキテクチャ",
          title: "Frontend Systems",
          description:
            "堅牢なコンポーネント構造、アクセシビリティ、拡張しやすい設計判断で強い UI を作ります。",
        },
        {
          accent: "ワークフロー設計",
          title: "Developer Tooling",
          description:
            "ツール整備、自動化、性能解析、チームで回るワークフローで開発速度を高めます。",
        },
        {
          accent: "伝える力",
          title: "Technical Communication",
          description:
            "実装知識をドキュメント、ポートフォリオ、学習素材として他者に伝わる形へ変えます。",
        },
      ],
    },
    questionBank: {
      eyebrow: "問題集",
      title: "採用現場で実際に問われるフロントエンド領域をカバーした練習用問題集。",
      description:
        "重要概念、面接形式、実践的なコーディング課題まで、問題集の広がりをここで確認できます。タブやカテゴリを切り替えてプレビューできますが、詳しい学習は専用の questions ページで行います。",
      groups: questionBankGroupsEn,
      footerNote:
        "このプレビューではカテゴリとサンプル問題を素早く確認できます。詳細な演習、進捗管理、解説の閲覧は questions ページで行います。",
      cta: "すべての問題を見る",
      cardCta: "問題集で開く",
    },
    cta: {
      eyebrow: "始める準備はできていますか",
      title: "フロントエンド学習を、もっと明確で持続できる習慣へ。",
      description:
        "より良い方向性、より強い実例、そして集中を保ちやすい視覚設計で学びを前へ進めます。",
      button: "最新記事を読む",
    },
  },
};
