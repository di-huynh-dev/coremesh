import nestjsRoadmap from '@/content/roadmaps/nestjs.json';
import reactRoadmap from '@/content/roadmaps/react.json';
import type { HomeLocale } from '@/lib/home-content';

export const roadmapIds = ['react', 'nestjs'] as const;

export type RoadmapId = (typeof roadmapIds)[number];

export type RoadmapMilestone = {
  step: string;
  title: string;
  description: string;
  tags: string[];
};

export type RoadmapSupportBlock = {
  title: string;
  description: string;
  items: string[];
};

export type RoadmapLocaleContent = {
  name: string;
  shortName: string;
  track: string;
  role: string;
  level: string;
  summary: string;
  durationText: string;
  topicCountText: string;
  questionCountText: string;
  skills: string[];
  previewNodes: string[];
  milestones: RoadmapMilestone[];
  outcomes: string[];
  support: RoadmapSupportBlock;
};

export type RoadmapTheme = {
  accent: string;
  soft: string;
  border: string;
  glow: string;
  strong: string;
};

export type RoadmapDocument = {
  id: RoadmapId;
  icon: string;
  theme: RoadmapTheme;
  totals: {
    weeks: number;
    topics: number;
    questions: number;
    milestones: number;
  };
  locales: Record<HomeLocale, RoadmapLocaleContent>;
};

export type RoadmapPageCopy = {
  localeLabel: string;
  nav: {
    questions: string;
    roadmap: string;
    blog: string;
  };
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    stats: {
      roadmaps: string;
      locales: string;
      milestones: string;
      questions: string;
    };
    previewTitle: string;
    previewDescription: string;
    practiceRow: {
      label: string;
      items: string[];
    };
    deliveryRow: {
      label: string;
      items: string[];
    };
  };
  catalog: {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    selected: string;
    comingSoon: string;
    comingSoonItems: string[];
  };
  detail: {
    eyebrow: string;
    overviewTitle: string;
    phaseLabels: [string, string, string];
    totalLabel: string;
    topicUnitLabel: string;
    currentMilestoneLabel: string;
    studyAction: string;
    continueAction: string;
    milestonesTitle: string;
    outcomesTitle: string;
    skillMapTitle: string;
    skillMapDescription: string;
    startLabel: string;
    focusLabel: string;
  };
  cta: {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
};

const roadmapDocuments: Record<RoadmapId, RoadmapDocument> = {
  react: reactRoadmap as RoadmapDocument,
  nestjs: nestjsRoadmap as RoadmapDocument,
};

const roadmapPageContent: Record<HomeLocale, RoadmapPageCopy> = {
  vi: {
    localeLabel: 'Ngôn ngữ',
    nav: {
      questions: 'Câu hỏi',
      roadmap: 'Lộ trình',
      blog: 'Blog',
    },
    hero: {
      badge: 'Nhiều lộ trình cho mọi mục tiêu',
      title: 'Chọn đúng roadmap để phát triển kỹ năng',
      description:
        'Trang roadmap mới ưu tiên cho hai hướng học đang mở là ReactJS và NestJS. Chọn roadmap bạn muốn theo, phần chi tiết sẽ cập nhật ngay gần đầu trang thay vì bị đẩy xuống quá sâu.',
      primaryCta: 'Khám phá lộ trình',
      secondaryCta: 'Xem roadmap đã chọn',
      stats: {
        roadmaps: 'roadmap đang mở',
        locales: 'ngôn ngữ',
        milestones: 'chặng học',
        questions: 'câu hỏi',
      },
      previewTitle: 'Bảng điều hướng nhanh',
      previewDescription: 'Chọn ReactJS hoặc NestJS để đổi ngay phần roadmap chi tiết ở bên dưới.',
      practiceRow: {
        label: 'Luyện tập',
        items: ['Câu hỏi', 'Challenge', 'Mock interview'],
      },
      deliveryRow: {
        label: 'Ứng dụng',
        items: ['Portfolio', 'System Design', 'Deploy'],
      },
    },
    catalog: {
      eyebrow: 'Roadmap hiện có',
      title: 'Chọn hướng học bạn muốn đào sâu',
      description:
        'Hiện tại DiCodeWeb mở hai roadmap trọng tâm. Mỗi roadmap có dữ liệu riêng, milestone riêng và nội dung được dịch theo locale bạn chọn.',
      action: 'Xem roadmap',
      selected: 'Đang hiển thị',
      comingSoon: 'Sắp mở thêm',
      comingSoonItems: ['Next.js', 'System Design', 'Frontend Interview'],
    },
    detail: {
      eyebrow: 'Roadmap chi tiết',
      overviewTitle: 'Tổng quan hành trình',
      phaseLabels: ['Dễ hiểu', 'Nền tảng', 'Nâng cao'],
      totalLabel: 'Tổng cộng',
      topicUnitLabel: 'chủ đề',
      currentMilestoneLabel: 'Bạn đang ở chặng',
      studyAction: 'Học chủ đề',
      continueAction: 'Tiếp tục học',
      milestonesTitle: 'Các chặng học chính',
      outcomesTitle: 'Bạn sẽ đạt được',
      skillMapTitle: 'Khối kỹ năng liên quan',
      skillMapDescription: 'Chuỗi kỹ năng này cho bạn biết roadmap đang đi từ nền tảng nào đến nhóm năng lực nào.',
      startLabel: 'Bắt đầu với',
      focusLabel: 'Trọng tâm',
    },
    cta: {
      title: 'Sẵn sàng bắt đầu hành trình phù hợp với bạn?',
      description:
        'Chọn ReactJS nếu bạn muốn đi sâu vào frontend hiện đại. Chọn NestJS nếu bạn muốn xây backend TypeScript có cấu trúc và dễ scale.',
      primary: 'Mở roadmap đã chọn',
      secondary: 'Khám phá câu hỏi',
    },
  },
  en: {
    localeLabel: 'Language',
    nav: {
      questions: 'Questions',
      roadmap: 'Roadmap',
      blog: 'Blog',
    },
    hero: {
      badge: 'Multiple paths for different goals',
      title: 'Choose the right roadmap to grow your skills',
      description:
        'The updated roadmap page focuses on the two tracks that are currently open: ReactJS and NestJS. Pick one and the detailed view updates near the top of the page instead of feeling buried below.',
      primaryCta: 'Explore roadmaps',
      secondaryCta: 'View selected roadmap',
      stats: {
        roadmaps: 'active roadmaps',
        locales: 'languages',
        milestones: 'milestones',
        questions: 'questions',
      },
      previewTitle: 'Quick navigation board',
      previewDescription: 'Switch between ReactJS and NestJS to update the detailed roadmap instantly.',
      practiceRow: {
        label: 'Practice',
        items: ['Questions', 'Challenges', 'Mock Interview'],
      },
      deliveryRow: {
        label: 'Delivery',
        items: ['Portfolio', 'System Design', 'Deploy'],
      },
    },
    catalog: {
      eyebrow: 'Available roadmaps',
      title: 'Choose the direction you want to deepen',
      description:
        'DiCodeWeb currently opens two core roadmap tracks. Each roadmap owns its own JSON data, milestones, and locale-specific copy.',
      action: 'View roadmap',
      selected: 'Currently shown',
      comingSoon: 'Coming next',
      comingSoonItems: ['Next.js', 'System Design', 'Frontend Interview'],
    },
    detail: {
      eyebrow: 'Detailed roadmap',
      overviewTitle: 'Journey overview',
      phaseLabels: ['Easy start', 'Core build', 'Advanced'],
      totalLabel: 'Total',
      topicUnitLabel: 'topics',
      currentMilestoneLabel: 'You are currently on step',
      studyAction: 'Study this step',
      continueAction: 'Keep learning',
      milestonesTitle: 'Core learning milestones',
      outcomesTitle: 'What you will walk away with',
      skillMapTitle: 'Related skill blocks',
      skillMapDescription: 'This lane shows the sequence of capabilities the roadmap is trying to build from start to finish.',
      startLabel: 'Start with',
      focusLabel: 'Focus',
    },
    cta: {
      title: 'Ready to start the path that fits you?',
      description:
        'Choose ReactJS if you want to go deeper into modern frontend work. Choose NestJS if you want a structured TypeScript backend path.',
      primary: 'Open selected roadmap',
      secondary: 'Explore questions',
    },
  },
  ja: {
    localeLabel: '言語',
    nav: {
      questions: '質問',
      roadmap: 'ロードマップ',
      blog: 'ブログ',
    },
    hero: {
      badge: '目的に合わせて選べる複数の学習ルート',
      title: '自分に合うロードマップを選んでスキルを伸ばす',
      description:
        '新しい roadmap ページでは現在公開中の ReactJS と NestJS に集中できます。選択すると詳細 roadmap がページ上部近くで切り替わり、下まで大きく探しに行かなくて済みます。',
      primaryCta: 'ロードマップを見る',
      secondaryCta: '選択中の roadmap を表示',
      stats: {
        roadmaps: '公開中ロードマップ',
        locales: '言語',
        milestones: '学習ステップ',
        questions: '質問',
      },
      previewTitle: 'クイックナビゲーション',
      previewDescription: 'ReactJS と NestJS を切り替えると、下の詳細 roadmap がすぐ更新されます。',
      practiceRow: {
        label: '練習',
        items: ['質問', 'チャレンジ', '模擬面接'],
      },
      deliveryRow: {
        label: '実践',
        items: ['Portfolio', 'System Design', 'Deploy'],
      },
    },
    catalog: {
      eyebrow: '利用可能な roadmap',
      title: '深めたい学習方向を選ぶ',
      description:
        'DiCodeWeb では現在 2 つの主要 roadmap を公開しています。各 roadmap は独立した JSON データ、milestone、locale 別コピーを持っています。',
      action: 'roadmap を見る',
      selected: '表示中',
      comingSoon: '次に公開予定',
      comingSoonItems: ['Next.js', 'System Design', 'Frontend Interview'],
    },
    detail: {
      eyebrow: '詳細 roadmap',
      overviewTitle: '進行の全体像',
      phaseLabels: ['導入', '基礎固め', '発展'],
      totalLabel: '合計',
      topicUnitLabel: 'トピック',
      currentMilestoneLabel: '現在のステップ',
      studyAction: 'このステップを学ぶ',
      continueAction: '学習を続ける',
      milestonesTitle: '主要 milestones',
      outcomesTitle: '得られるもの',
      skillMapTitle: '関連スキルブロック',
      skillMapDescription: 'このレーンでは、この roadmap がどの基礎から始まり、どの能力までつなげるかを見られます。',
      startLabel: '開始地点',
      focusLabel: '重点',
    },
    cta: {
      title: '自分に合う学習ルートを始める準備はできましたか？',
      description:
        'ReactJS は modern frontend を深めたい人向けです。NestJS は構造化された TypeScript backend を育てたい人向けです。',
      primary: '選択中 roadmap を開く',
      secondary: '質問を見る',
    },
  },
};

export const roadmapCatalog = roadmapIds.map((roadmapId) => roadmapDocuments[roadmapId]);

export function getRoadmapDocument(roadmapId: RoadmapId) {
  return roadmapDocuments[roadmapId];
}

export function getRoadmapPageCopy(locale: HomeLocale) {
  return roadmapPageContent[locale];
}
