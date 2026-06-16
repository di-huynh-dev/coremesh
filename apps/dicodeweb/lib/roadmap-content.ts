import nestjsRoadmap from '@/content/roadmaps/nestjs.json';
import reactRoadmap from '@/content/roadmaps/react.json';
import type { HomeLocale } from '@/lib/home-content';

export const roadmapIds = ['react', 'nestjs'] as const;
export const defaultRoadmapId = 'react' as const;

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
    fullStackCard: {
      title: string;
      summary: string;
      items: string[];
      action: string;
      status: string;
    };
  };
  connection: {
    eyebrow: string;
    title: string;
    description: string;
    items: string[];
    flowTitle: string;
    steps: string[];
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
      badge: 'Nhiều lộ trình cho nhiều mục tiêu',
      title: 'Chọn đúng roadmap để phát triển kỹ năng',
      description:
        'Trang roadmap tập trung vào hai hướng học cốt lõi là React và NestJS, rồi nối chúng lại bằng tư duy project full-stack và interview-ready portfolio.',
      primaryCta: 'Khám phá roadmap',
      secondaryCta: 'Xem roadmap đang chọn',
      stats: {
        roadmaps: 'roadmap đang mở',
        locales: 'ngôn ngữ',
        milestones: 'chặng học',
        questions: 'bài thực hành',
      },
      previewTitle: 'Bảng điều hướng nhanh',
      previewDescription:
        'React và NestJS là hai hướng học chính. Full-stack Project Path sẽ là lớp kết nối giữa frontend, backend và portfolio thực chiến.',
      practiceRow: {
        label: 'Luyện tập',
        items: ['Câu hỏi', 'Challenge', 'Mock interview'],
      },
      deliveryRow: {
        label: 'Ứng dụng',
        items: [
          'Full-stack Project',
          'Auth & RBAC',
          'Admin Dashboard',
          'API Integration',
          'Deploy Production',
          'Portfolio Case Study',
        ],
      },
    },
    catalog: {
      eyebrow: 'Roadmap hiện có',
      title: 'Chọn hướng học bạn muốn đào sâu',
      description:
        'React giúp bạn xây giao diện. NestJS giúp bạn xây backend. Full-stack Project Path sẽ giúp bạn nối hai hướng này thành project thực tế.',
      action: 'Xem roadmap',
      selected: 'Đang hiển thị',
      comingSoon: 'Sắp mở thêm',
      comingSoonItems: ['Next.js', 'System Design', 'Frontend Interview'],
      fullStackCard: {
        title: 'Full-stack Project Path',
        summary:
          'Kết nối React + NestJS thành các project thực tế như dashboard, auth system, blog CMS, e-commerce API và portfolio app sẵn sàng cho interview.',
        items: ['Dashboard', 'Auth System', 'Blog CMS', 'E-commerce API', 'Portfolio Apps'],
        action: 'Sắp mở',
        status: 'Coming soon',
      },
    },
    connection: {
      eyebrow: 'Cách các lộ trình kết nối',
      title:
        'React dạy bạn xây giao diện. NestJS dạy bạn xây backend. Project dạy bạn cách kết nối cả hai.',
      description:
        'Section này làm roadmap khác với các trang roadmap chung chung vì nó cho thấy rõ cách frontend path và backend path hợp lại thành full-stack project thật.',
      items: [
        'React dạy bạn cách xây interface.',
        'NestJS dạy bạn cách xây backend.',
        'Projects dạy bạn cách kết nối cả hai.',
      ],
      flowTitle: 'Learning flow',
      steps: [
        'JavaScript / TypeScript',
        'React Frontend',
        'API Integration',
        'NestJS Backend',
        'Database + Auth',
        'Full-stack Project',
        'Interview / Portfolio',
      ],
    },
    detail: {
      eyebrow: 'Roadmap chi tiết',
      overviewTitle: 'Tổng quan hành trình',
      phaseLabels: ['Dễ vào', 'Xây nền', 'Nâng cao'],
      totalLabel: 'Tổng cộng',
      topicUnitLabel: 'chủ đề',
      currentMilestoneLabel: 'Bạn đang ở chặng',
      studyAction: 'Học chủ đề',
      continueAction: 'Tiếp tục học',
      milestonesTitle: 'Các chặng học chính',
      outcomesTitle: 'Bạn sẽ đạt được',
      skillMapTitle: 'Khối kỹ năng liên quan',
      skillMapDescription:
        'Chuỗi kỹ năng này cho bạn biết roadmap đang dẫn từ nền tảng nào tới nhóm năng lực nào.',
      startLabel: 'Bắt đầu với',
      focusLabel: 'Trọng tâm',
    },
    cta: {
      title: 'Sẵn sàng bắt đầu hành trình phù hợp với bạn?',
      description:
        'Chọn React nếu bạn muốn xây modern UI. Chọn NestJS nếu bạn muốn xây backend có cấu trúc. Sau đó dùng project để nối cả hai thành portfolio thực chiến.',
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
        'The roadmap page focuses on React and NestJS as the two core tracks, then shows how they connect into full-stack projects and interview-ready portfolio work.',
      primaryCta: 'Explore roadmaps',
      secondaryCta: 'View selected roadmap',
      stats: {
        roadmaps: 'active roadmaps',
        locales: 'languages',
        milestones: 'milestones',
        questions: 'practice items',
      },
      previewTitle: 'Quick navigation board',
      previewDescription:
        'React and NestJS are the two core tracks. The Full-stack Project Path is the layer that connects frontend, backend, and portfolio-ready work.',
      practiceRow: {
        label: 'Practice',
        items: ['Questions', 'Challenges', 'Mock Interview'],
      },
      deliveryRow: {
        label: 'Delivery',
        items: [
          'Full-stack Project',
          'Auth & RBAC',
          'Admin Dashboard',
          'API Integration',
          'Deploy Production',
          'Portfolio Case Study',
        ],
      },
    },
    catalog: {
      eyebrow: 'Available roadmaps',
      title: 'Choose the direction you want to deepen',
      description:
        'React teaches interface building. NestJS teaches backend architecture. The next layer is connecting both into real full-stack projects.',
      action: 'View roadmap',
      selected: 'Currently shown',
      comingSoon: 'Coming next',
      comingSoonItems: ['Next.js', 'System Design', 'Frontend Interview'],
      fullStackCard: {
        title: 'Full-stack Project Path',
        summary:
          'Connect React + NestJS into real projects like dashboard, auth system, blog CMS, e-commerce API, and interview-ready portfolio apps.',
        items: ['Dashboard', 'Auth System', 'Blog CMS', 'E-commerce API', 'Portfolio Apps'],
        action: 'Coming soon',
        status: 'Coming soon',
      },
    },
    connection: {
      eyebrow: 'How the paths connect',
      title:
        'React teaches you how to build the interface. NestJS teaches you how to build the backend. Projects teach you how to connect both.',
      description:
        'This section makes the roadmap feel different from generic roadmap pages. It shows how the frontend path and backend path merge into real full-stack projects and portfolio-ready work.',
      items: [
        'React teaches you how to build the interface.',
        'NestJS teaches you how to build the backend.',
        'Projects teach you how to connect both.',
      ],
      flowTitle: 'Learning flow',
      steps: [
        'JavaScript / TypeScript',
        'React Frontend',
        'API Integration',
        'NestJS Backend',
        'Database + Auth',
        'Full-stack Project',
        'Interview / Portfolio',
      ],
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
      skillMapDescription:
        'This lane shows the sequence of capabilities the roadmap is trying to build from start to finish.',
      startLabel: 'Start with',
      focusLabel: 'Focus',
    },
    cta: {
      title: 'Ready to start the path that fits you?',
      description:
        'Choose React if you want to build modern UI. Choose NestJS if you want a structured backend path. Then connect both through full-stack projects and portfolio work.',
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
        'この roadmap page は React と NestJS を中心にしつつ、その先で full-stack project と interview-ready portfolio にどうつながるかまで見せます。',
      primaryCta: 'ロードマップを見る',
      secondaryCta: '選択中の roadmap を表示',
      stats: {
        roadmaps: '公開中ロードマップ',
        locales: '言語',
        milestones: '学習ステップ',
        questions: 'practice items',
      },
      previewTitle: 'Quick navigation board',
      previewDescription:
        'React と NestJS が 2 つの中心トラックで、Full-stack Project Path が frontend、backend、portfolio work をつなぐレイヤーになります。',
      practiceRow: {
        label: '練習',
        items: ['質問', 'チャレンジ', '模擬面接'],
      },
      deliveryRow: {
        label: '実践',
        items: [
          'Full-stack Project',
          'Auth & RBAC',
          'Admin Dashboard',
          'API Integration',
          'Deploy Production',
          'Portfolio Case Study',
        ],
      },
    },
    catalog: {
      eyebrow: '利用可能な roadmap',
      title: '深めたい学習方向を選ぶ',
      description:
        'React は interface 作りを、NestJS は backend 設計を教えます。その次のレイヤーが、それらを real full-stack projects につなぐことです。',
      action: 'roadmap を見る',
      selected: '表示中',
      comingSoon: '次に公開予定',
      comingSoonItems: ['Next.js', 'System Design', 'Frontend Interview'],
      fullStackCard: {
        title: 'Full-stack Project Path',
        summary:
          'React + NestJS を dashboard、auth system、blog CMS、e-commerce API、interview-ready portfolio app などの実践 project につなげる path です。',
        items: ['Dashboard', 'Auth System', 'Blog CMS', 'E-commerce API', 'Portfolio Apps'],
        action: 'Coming soon',
        status: 'Coming soon',
      },
    },
    connection: {
      eyebrow: 'どのようにつながるか',
      title:
        'React は interface の作り方を、NestJS は backend の作り方を、projects はその両方をつなぐ方法を教えてくれます。',
      description:
        'この section で、frontend path と backend path が real full-stack projects と portfolio-ready work に合流する流れを見せます。',
      items: [
        'React は interface の作り方を教えます。',
        'NestJS は backend の作り方を教えます。',
        'Projects はその両方をつなぐ方法を教えます。',
      ],
      flowTitle: 'Learning flow',
      steps: [
        'JavaScript / TypeScript',
        'React Frontend',
        'API Integration',
        'NestJS Backend',
        'Database + Auth',
        'Full-stack Project',
        'Interview / Portfolio',
      ],
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
      skillMapDescription:
        'このレーンでは、この roadmap がどの基礎から始まり、どの能力までつなげるかを見られます。',
      startLabel: '開始地点',
      focusLabel: '重点',
    },
    cta: {
      title: '自分に合う学習ルートを始める準備はできましたか？',
      description:
        'React で modern UI を学び、NestJS で structured backend を学び、その後 full-stack projects と portfolio work で両方をつなげていきます。',
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
