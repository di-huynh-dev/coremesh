'use client';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { getAllPosts } from '@/lib/blog';
import { homeContent, homeLocales, type HomeLocale } from '@/lib/home-content';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookText,
  Braces,
  BriefcaseBusiness,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  Clock3,
  FileText,
  Layers3,
  MoveRight,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users2,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';

const storageKey = 'dicodeweb-home-locale';

gsap.registerPlugin(useGSAP);

type AnimatedStatProps = {
  value: string;
  label: string;
  detail: string;
  counterValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

const difficultyStyles: Record<string, string> = {
  Easy: 'bg-[rgba(34,197,94,0.14)] text-[#15803D]',
  Medium: 'bg-[rgba(245,158,11,0.16)] text-[#B45309]',
  Hard: 'bg-[rgba(239,68,68,0.14)] text-[#B91C1C]',
};

const statIcons: LucideIcon[] = [BookText, Layers3, Users2, Trophy];
const latestPosts = getAllPosts().slice(0, 3);

function getPreferredLocale(): HomeLocale {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const storedLocale = window.localStorage.getItem(storageKey);

  if (storedLocale && homeLocales.includes(storedLocale as HomeLocale)) {
    return storedLocale as HomeLocale;
  }

  const browserLanguage = window.navigator.language.toLowerCase();

  if (browserLanguage.startsWith('vi')) {
    return 'vi';
  }

  if (browserLanguage.startsWith('ja')) {
    return 'ja';
  }

  return 'en';
}

function subscribeToLocaleChange(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('dicodeweb-locale-change', handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('dicodeweb-locale-change', handler);
  };
}

function getSupplementalContent(locale: HomeLocale) {
  if (locale === 'vi') {
    return {
      nav: {
        features: 'Điểm nhấn',
        questions: 'Câu hỏi',
        faq: 'Hỏi đáp',
      },
      highlights: {
        eyebrow: 'Điểm Nhấn Học Tập',
        title: 'Những phần nội dung giúp người học tiết kiệm thời gian và luyện đúng trọng tâm.',
        description:
          'Thay vì chỉ gom tài liệu, trang chủ giờ mô phỏng rõ hơn cách DiCodeWeb giúp bạn đọc nhanh, luyện có mục tiêu và chuẩn bị cho các vòng phỏng vấn frontend.',
        cards: [
          {
            icon: NotebookPen,
            title: 'Tiết kiệm hàng trăm giờ tự mày mò',
            description:
              'Tập trung vào ghi chú có chiều sâu, ví dụ thực chiến và phần giải thích đi thẳng vào các quyết định triển khai.',
            tags: ['Ghi chú có cấu trúc', 'Ví dụ thực tế'],
          },
          {
            icon: BriefcaseBusiness,
            title: 'Luyện phỏng vấn frontend đúng trọng tâm',
            description:
              'Luyện theo đúng nhóm câu hỏi nhà tuyển dụng hay dùng: UI coding, JavaScript, thiết kế hệ thống và gỡ lỗi.',
            tags: ['Ôn phỏng vấn', 'Luyện mô phỏng'],
          },
          {
            icon: ShieldCheck,
            title: 'Sẵn sàng hơn cho các vị trí tốt',
            description:
              'Chuẩn bị hồ sơ kỹ năng rõ ràng hơn để tự tin đi qua vòng sàng lọc, vòng kỹ thuật và bài tập mang về.',
            tags: ['Định hướng nghề nghiệp', 'Tín hiệu năng lực'],
          },
        ],
      },
      prep: {
        eyebrow: 'Lộ Trình Ôn Luyện',
        title: 'Mô phỏng các luồng học và nhóm chủ đề để người xem thấy rõ sản phẩm.',
        flowsTitle: 'Luồng ôn luyện phổ biến',
        libraryTitle: 'Nhóm trọng tâm frontend',
        paths: [
          {
            title: 'Lộ trình phỏng vấn frontend',
            detail: 'Đi từ câu hỏi nền tảng đến UI coding, gỡ lỗi và thiết kế hệ thống theo nhịp tăng dần.',
          },
          {
            title: 'Lộ trình nâng độ chắc JavaScript',
            detail: 'Closures, luồng bất đồng bộ, utility functions và các tình huống hỏi tiếp thường gặp.',
          },
          {
            title: 'Lộ trình React theo tư duy production',
            detail: 'Hooks, ranh giới quản lý state, hiệu năng render và kiến trúc component.',
          },
        ],
        topics: [
          {
            icon: Layers3,
            title: 'Accessibility',
            detail: 'Điều hướng bằng bàn phím, semantics và quản lý focus',
          },
          { icon: Braces, title: 'JavaScript', detail: 'Async, closures, utilities và debugging' },
          { icon: Zap, title: 'Performance', detail: 'Rendering, caching, Core Web Vitals và profiling' },
          {
            icon: ClipboardList,
            title: 'System design',
            detail: 'Ranh giới state, luồng dữ liệu và khả năng mở rộng',
          },
        ],
      },
      proof: {
        quote:
          'Mình dùng question bank để luyện mỗi ngày trước vòng phỏng vấn frontend. Điểm đáng giá nhất là mỗi câu hỏi đều kéo mình về tư duy triển khai thật, không chỉ học mẹo.',
        author: 'Minh Phúc, Kỹ sư Frontend',
        title: 'Chi phí hợp lý, minh bạch và đủ giá trị để theo lâu dài.',
        price: '299.000đ',
        period: '/ tháng',
        bullets: [
          'Ngân hàng câu hỏi theo chủ đề và định dạng',
          'Bài viết có chiều sâu, phù hợp để học lâu',
          'Luồng tự học rõ ràng cho người học độc lập',
        ],
        cta: 'Xem bài viết mới nhất',
      },
      blog: {
        eyebrow: 'Từ Blog',
        title: 'Những bài viết mới cho người học frontend muốn đi sâu và đi đúng hướng.',
        description:
          'Giữ nhịp học bằng các bài viết ngắn, rõ và thực tế về frontend engineering, hệ thống UI và quy trình làm việc.',
        cta: 'Xem tất cả bài viết',
      },
      faq: {
        eyebrow: 'Hỏi Đáp',
        title: 'Một vài câu hỏi mà người xem thường muốn biết ngay khi vào trang chủ.',
        items: [
          {
            question: 'DiCodeWeb phù hợp với ai?',
            answer:
              'Phù hợp với người đang học frontend nghiêm túc, muốn có tài liệu rõ ràng để vừa học nền tảng vừa chuẩn bị cho phỏng vấn.',
          },
          {
            question: 'Có thể học đầy đủ question bank ngay từ trang chủ không?',
            answer:
              'Không. Trang chủ chỉ dùng để mô phỏng cấu trúc và câu hỏi mẫu. Việc luyện tập chuyên sâu sẽ nằm ở trang questions riêng.',
          },
          {
            question: 'Các chủ đề có sát công việc thực tế không?',
            answer:
              'Có. Nội dung được tổ chức theo các nhóm mà đội ngũ tuyển dụng hay kiểm tra như accessibility, performance, React hooks, thiết kế hệ thống và debugging.',
          },
          {
            question: 'Có hỗ trợ đa ngôn ngữ không?',
            answer:
              'Có. Trang chủ hiện hỗ trợ tiếng Anh, tiếng Việt và tiếng Nhật để tạo ấn tượng đầu tiên rõ ràng hơn cho từng nhóm người xem.',
          },
        ],
      },
    };
  }

  if (locale === 'ja') {
    return {
      nav: {
        features: '特長',
        questions: '問題',
        faq: 'FAQ',
      },
      highlights: {
        eyebrow: '特長',
        title: '今のコア導線を崩さずに、プロダクトの価値をより伝えやすくする補助セクションです。',
        description:
          'トップページ全体で、読みやすさ、面接対策のしやすさ、そして学習プロダクトとしての強みをより明確に伝えます。',
        cards: [
          {
            icon: NotebookPen,
            title: '学習の遠回りを大きく減らす',
            description:
              '構造化されたノート、実践的な例、実装上のトレードオフに近い解説で、必要な理解へ素早くたどり着けます。',
            tags: ['構造化ノート', '実践例'],
          },
          {
            icon: BriefcaseBusiness,
            title: 'フロントエンド面接を的確に準備できる',
            description:
              'UI coding、JavaScript、システム設計、デバッグまで、採用で問われやすい領域を見通しよく確認できます。',
            tags: ['面接対策', '模擬練習'],
          },
          {
            icon: ShieldCheck,
            title: 'より良いポジションに向けて備えられる',
            description:
              'ポートフォリオ確認、技術面接、選考での会話に向けて、スキルの見せ方をより明確に整えられます。',
            tags: ['キャリア設計', '実力の見せ方'],
          },
        ],
      },
      prep: {
        eyebrow: '学習の見取り図',
        title:
          '学習フローとトピック群を見せることで、サービス全体の構造をひと目で理解しやすくします。',
        flowsTitle: '代表的な学習フロー',
        libraryTitle: '重点フロントエンド領域',
        paths: [
          {
            title: 'フロントエンド面接対策ルート',
            detail: '基礎概念から UI coding、デバッグ、システム思考までを段階的にたどれます。',
          },
          {
            title: 'JavaScript 理解を深めるルート',
            detail: 'クロージャ、非同期制御、ユーティリティ関数、よくある深掘り質問まで整理しています。',
          },
          {
            title: 'React 実務力ルート',
            detail: 'Hooks、状態の責務分離、描画パフォーマンス、コンポーネント設計を実務目線で学べます。',
          },
        ],
        topics: [
          {
            icon: Layers3,
            title: 'Accessibility',
            detail: 'キーボード操作、セマンティクス、フォーカス管理',
          },
          { icon: Braces, title: 'JavaScript', detail: '非同期処理、クロージャ、ユーティリティ、デバッグ' },
          { icon: Zap, title: 'Performance', detail: '描画、キャッシュ、Core Web Vitals、プロファイリング' },
          {
            icon: ClipboardList,
            title: 'System design',
            detail: '状態の境界、データフロー、拡張性',
          },
        ],
      },
      proof: {
        quote:
          'question bank のプレビューがあることで、プロダクト全体の価値がずっと伝わりやすくなりました。トップページで無理に操作させすぎず、内容の深さだけを素早く感じ取れます。',
        author: 'プロダクト志向のフロントエンド学習者',
        title: '料金は明快で、学習フローの中に無理なく組み込みやすい設計です。',
        price: '$9.99',
        period: '/ 月',
        bullets: [
          'トピック別の問題集プレビュー',
          '長文でも読みやすいフロントエンドノート',
          '独学しやすい整理された学習構造',
        ],
        cta: '最新記事を読む',
      },
      blog: {
        eyebrow: 'ブログより',
        title: '実務に近い深さを求めるフロントエンド学習者のための新着記事です。',
        description:
          'フロントエンドエンジニアリング、UI 設計、より良い実装の進め方を支える編集コンテンツをまとめています。',
        cta: '記事をすべて見る',
      },
      faq: {
        eyebrow: 'FAQ',
        title: 'トップページを見た人が最初に知りたくなる質問を、先にまとめています。',
        items: [
          {
            question: 'DiCodeWeb はどんな人に向いていますか？',
            answer:
              '構造化されたノート、実践的な面接対策、そしてプロダクト志向の学習導線を求める本気のフロントエンド学習者に向いています。',
          },
          {
            question: 'トップページだけで問題集をすべて使えますか？',
            answer:
              'いいえ。トップページでは構造とサンプル問題のプレビューのみを見せています。詳しい演習は専用の questions ページで行います。',
          },
          {
            question: '扱うトピックは実務のフロントエンドに近いですか？',
            answer:
              'はい。アクセシビリティ、パフォーマンス、React hooks、システム設計、デバッグなど、実際の選考や現場で問われやすい領域を含んでいます。',
          },
          {
            question: '多言語表示には対応していますか？',
            answer:
              'はい。トップページは英語、ベトナム語、日本語に対応しており、見る人に合わせた第一印象を作れるようにしています。',
          },
        ],
      },
    };
  }

  return {
    nav: {
      features: 'Highlights',
      questions: 'Questions',
      faq: 'FAQ',
    },
    highlights: {
      eyebrow: 'Highlights',
      title:
        'Additional sections that round out the homepage without disturbing the existing flow.',
      description:
        'The page keeps the current hero and question bank, but now explains the learning value more clearly through supporting product sections.',
      cards: [
        {
          icon: NotebookPen,
          title: 'Save hundreds of hours',
          description:
            'Move faster with structured notes, practical examples, and implementation-focused explanations that reduce wandering.',
          tags: ['Structured notes', 'Examples'],
        },
        {
          icon: BriefcaseBusiness,
          title: 'Ace your frontend interviews',
          description:
            'See how the product supports UI coding, JavaScript, debugging, and system design preparation before users open the dedicated page.',
          tags: ['Interview prep', 'Mock practice'],
        },
        {
          icon: ShieldCheck,
          title: 'Secure high-paying roles',
          description:
            'Position skill growth around real hiring signals: better technical communication, stronger patterns, and clearer readiness.',
          tags: ['Career focus', 'Portfolio signal'],
        },
      ],
    },
    prep: {
      eyebrow: 'Prep Flows',
      title:
        'Mock learning flows and topic clusters that make the product map easier to understand at a glance.',
      flowsTitle: 'Popular prep flows',
      libraryTitle: 'Frontend focus areas',
      paths: [
        {
          title: 'Frontend interview path',
          detail:
            'Foundations, UI coding, debugging, and system thinking arranged in a steady progression.',
        },
        {
          title: 'JavaScript mastery path',
          detail: 'Closures, async control, utilities, and the most common follow-up prompts.',
        },
        {
          title: 'React production path',
          detail: 'Hooks, state boundaries, performance, and maintainable component design.',
        },
      ],
      topics: [
        {
          icon: Layers3,
          title: 'Accessibility',
          detail: 'Keyboard support, semantics, focus management',
        },
        { icon: Braces, title: 'JavaScript', detail: 'Async, closures, utilities, debugging' },
        { icon: Zap, title: 'Performance', detail: 'Rendering, caching, vitals, profiling' },
        {
          icon: ClipboardList,
          title: 'System design',
          detail: 'State boundaries, data flow, scalability',
        },
      ],
    },
    proof: {
      quote:
        'The preview sections make the platform feel much more complete. Visitors can understand the value quickly, then move into the dedicated question-bank experience for real practice.',
      author: 'Early DiCodeWeb reviewer',
      title: 'Affordable, transparent, and worth keeping in the learning stack.',
      price: '$9.99',
      period: '/ month',
      bullets: [
        'Question-bank previews by topic and format',
        'Long-form frontend notes with practical depth',
        'A calmer, more product-like study experience',
      ],
      cta: 'Read the latest articles',
    },
    blog: {
      eyebrow: 'From The Blog',
      title: 'Latest writing for frontend learners who want practical depth.',
      description:
        'A small editorial layer that supports the product story with implementation notes, frameworks, and workflow thinking.',
      cta: 'View all articles',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'A few questions visitors usually want answered before they dive deeper.',
      items: [
        {
          question: 'Who is DiCodeWeb for?',
          answer:
            'It is for frontend learners who want a more intentional mix of notes, interview prep, and practical product thinking.',
        },
        {
          question: 'Can I fully use the question bank from the homepage?',
          answer:
            'No. The homepage is meant to preview categories and sample questions. Full drilling lives on the dedicated questions page.',
        },
        {
          question: 'Are the topics based on real frontend screening areas?',
          answer:
            'Yes. The preview covers accessibility, JavaScript, performance, React hooks, state management, and related topics teams actually ask about.',
        },
        {
          question: 'Does the homepage support multiple languages?',
          answer:
            'Yes. English, Vietnamese, and Japanese are available to support a broader audience and a stronger first impression.',
        },
      ],
    },
  };
}

function formatCounterValue(
  value: number,
  {
    prefix = '',
    suffix = '',
    decimals = 0,
  }: Pick<AnimatedStatProps, 'prefix' | 'suffix' | 'decimals'>,
) {
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

function AnimatedStatCard({
  icon: Icon,
  value,
  label,
  detail,
  counterValue,
  prefix,
  suffix,
  decimals,
}: AnimatedStatProps & { icon: LucideIcon }) {
  const [displayValue, setDisplayValue] = useState(value);

  useGSAP(
    () => {
      const counter = { value: 0 };

      gsap.to(counter, {
        value: counterValue,
        duration: 1.8,
        ease: 'power3.out',
        onUpdate: () => {
          setDisplayValue(
            formatCounterValue(counter.value, {
              prefix,
              suffix,
              decimals,
            }),
          );
        },
      });
    },
    { dependencies: [counterValue, prefix, suffix, decimals] },
  );

  return (
    <article className="paper-card rounded-[1.5rem] px-4 py-4 transition-transform duration-200 hover:-translate-y-1 sm:px-5">
      <div className="grid gap-4">
        <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(34,199,232,0.12),rgba(139,214,63,0.12))] text-[#071B3A]">
            <Icon className="h-7 w-7" strokeWidth={2.1} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-bold tracking-[-0.04em] text-[#071B3A] dark:text-[#F5F0EA]">
              {displayValue}
            </p>
            <p className="text-foreground mt-1 text-base leading-6 font-semibold sm:text-lg">
              {label}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-6 text-balance">{detail}</p>
      </div>
    </article>
  );
}

function getUiLabels(locale: HomeLocale) {
  if (locale === 'vi') {
    return {
      preview: 'Xem trước',
      path: 'Lộ trình',
      readArticle: 'Đọc bài viết',
    };
  }

  if (locale === 'ja') {
    return {
      preview: 'プレビュー',
      path: 'ルート',
      readArticle: '記事を読む',
    };
  }

  return {
    preview: 'Preview',
    path: 'Path',
    readArticle: 'Read article',
  };
}

export function HomePageShell() {
  const systemLocale = useSyncExternalStore<HomeLocale>(
    subscribeToLocaleChange,
    getPreferredLocale,
    () => 'en',
  );
  const [localeOverride, setLocaleOverride] = useState<HomeLocale | null>(null);
  const [activeQuestionGroup, setActiveQuestionGroup] = useState(0);
  const [activeQuestionItem, setActiveQuestionItem] = useState('');
  const locale = localeOverride ?? systemLocale;
  const copy = useMemo(() => homeContent[locale], [locale]);
  const supplemental = useMemo(() => getSupplementalContent(locale), [locale]);
  const uiLabels = useMemo(() => getUiLabels(locale), [locale]);
  const currentQuestionGroup =
    copy.questionBank.groups[activeQuestionGroup] ?? copy.questionBank.groups[0];
  const currentQuestionItem =
    currentQuestionGroup.items.find((item) => item.label === activeQuestionItem) ??
    currentQuestionGroup.items.find((item) => item.label === currentQuestionGroup.featuredItem) ??
    currentQuestionGroup.items[0];

  const handleLocaleChange = (nextLocale: HomeLocale) => {
    setLocaleOverride(nextLocale);
    window.localStorage.setItem(storageKey, nextLocale);
    window.dispatchEvent(new Event('dicodeweb-locale-change'));
  };

  return (
    <>
      <Navbar
        labels={copy.nav}
        locale={locale}
        localeLabel={copy.localeLabel}
        onLocaleChange={handleLocaleChange}
      />

      <main className="bg-background text-foreground min-h-screen">
        <section className="relative overflow-hidden px-4 pt-32 pb-20 md:px-6 md:pt-40 md:pb-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-16 left-[4%] h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute top-20 right-[8%] h-80 w-80 rounded-full bg-[#8BD63F]/12 blur-3xl" />
            <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-[#071B3A]/6 blur-3xl dark:bg-[#D7E2FF]/8" />
          </div>

          <div className="editorial-grid relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <LanguageSwitcher
                  currentLocale={locale}
                  locales={homeLocales}
                  onChange={handleLocaleChange}
                  label={copy.localeLabel}
                  className="w-fit md:hidden"
                />

                <div className="tag-chip inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  {copy.hero.badge}
                </div>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl leading-[0.96] font-black tracking-[-0.07em] text-[#071B3A] md:text-7xl dark:text-[#F5F0EA]">
                  <span className="block">{copy.hero.titleLines[0]}</span>
                  <span className="block">{copy.hero.titleLines[1]}</span>
                  <span className="mt-2 block text-[#8BD63F]">{copy.hero.brand}</span>
                </h1>

                <p className="text-muted-foreground max-w-2xl text-lg leading-8 md:text-xl">
                  {copy.hero.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <Link href="/blog">
                    {copy.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
                  <Link href="#questions">
                    {copy.hero.secondaryCta}
                    <MoveRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-3">
                {copy.hero.stats.map((stat, index) => (
                  <AnimatedStatCard
                    key={stat.label}
                    icon={statIcons[index] ?? CircleHelp}
                    {...stat}
                  />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-accent/14 via-white/10 to-[#8BD63F]/18 blur-3xl" />
              <div className="relative rounded-[2.4rem] border border-[#d9d0c5] bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(248,241,232,0.96))] p-4 shadow-[0_28px_70px_rgba(7,27,58,0.14)] backdrop-blur md:p-5">
                <div className="relative overflow-hidden rounded-[2rem] border border-[#e6ddd2] bg-[#f6efe6] p-4 md:p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,199,232,0.09),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,214,63,0.1),transparent_26%)]" />

                  <div className="relative rounded-[1.4rem] bg-[#fffaf4] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff8f5b]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#8bd63f]" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-[#6b7b96] uppercase">
                        {copy.hero.snippetTabs.map((tab) => (
                          <span key={tab}>{tab}</span>
                        ))}
                      </div>
                    </div>

                    <div className="relative aspect-[1.42] overflow-hidden rounded-[1.2rem] bg-[#081A33] shadow-[0_20px_50px_rgba(7,27,58,0.18)]">
                      <Image
                        src="/hero/hero-section.png"
                        alt="DiCodeWeb hero interface preview"
                        fill
                        priority
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 48vw"
                      />
                    </div>
                  </div>

                  <div className="pointer-events-none absolute -bottom-4 left-6 rounded-2xl border border-white/70 bg-white/88 px-4 py-3 shadow-[0_18px_36px_rgba(7,27,58,0.12)] backdrop-blur md:left-8 md:px-5">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
                      {copy.hero.snippetAction}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#071B3A] md:text-base">
                      {copy.hero.snippetTitle}
                    </p>
                  </div>

                  <div className="pointer-events-none absolute top-10 -right-2 hidden rounded-2xl border border-[#d9d0c5] bg-[#071B3A] px-4 py-3 text-[#f5f0ea] shadow-[0_22px_40px_rgba(7,27,58,0.2)] lg:block">
                    <p className="text-[11px] tracking-[0.18em] text-accent uppercase">
                      {uiLabels.preview}
                    </p>
                    <p className="mt-2 max-w-[180px] text-sm leading-6 text-[#d7e2ff]">
                      {copy.hero.snippetQuote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-16 md:px-6 md:py-24">
          <div className="editorial-grid">
            <div className="mb-10 max-w-3xl space-y-4">
              <p className="text-sm font-medium tracking-[0.16em] text-accent uppercase">
                {supplemental.highlights.eyebrow}
              </p>
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#071B3A] md:text-5xl dark:text-[#D7E2FF]">
                {supplemental.highlights.title}
              </h2>
              <p className="text-muted-foreground text-base leading-8 md:text-lg">
                {supplemental.highlights.description}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {supplemental.highlights.cards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className="paper-card rounded-[1.75rem] p-6">
                    <Icon className="h-6 w-6 text-accent" />
                    <h3 className="mt-5 text-2xl font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 text-sm leading-7">
                      {card.description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="tag-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-24">
          <div className="editorial-grid">
            <div className="mb-10 max-w-3xl space-y-4">
              <p className="text-sm font-medium tracking-[0.16em] text-accent uppercase">
                {supplemental.prep.eyebrow}
              </p>
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#071B3A] md:text-5xl dark:text-[#D7E2FF]">
                {supplemental.prep.title}
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="paper-card rounded-[1.75rem] p-6">
                <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                  <FileText className="h-4 w-4 text-accent" />
                  <span>{supplemental.prep.flowsTitle}</span>
                </div>

                <div className="space-y-4">
                  {supplemental.prep.paths.map((path, index) => (
                    <article
                      key={path.title}
                      className="rounded-[1.25rem] border border-[#e8ddd1] bg-white/70 px-4 py-4 dark:border-[#29415f] dark:bg-[#162132]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold tracking-[0.16em] text-accent uppercase">
                            {uiLabels.path} {index + 1}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                            {path.title}
                          </h3>
                        </div>
                        <ArrowUpRight className="mt-1 h-4 w-4 text-[#8BD63F]" />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#5b6a81] dark:text-[#c8d6ea]">
                        {path.detail}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {supplemental.prep.topics.map((topic) => {
                  const Icon = topic.icon;

                  return (
                    <article key={topic.title} className="paper-card rounded-[1.75rem] p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(34,199,232,0.12),rgba(139,214,63,0.12))] dark:bg-[linear-gradient(180deg,rgba(34,199,232,0.16),rgba(139,214,63,0.18))]">
                        <Icon className="h-5 w-5 text-[#071B3A] dark:text-[#D7E2FF]" />
                      </div>
                      <p className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-accent uppercase">
                        {supplemental.prep.libraryTitle}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                        {topic.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#5b6a81] dark:text-[#c8d6ea]">
                        {topic.detail}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="questions" className="px-4 py-16 md:px-6 md:py-24">
          <div className="editorial-grid">
            <div className="mb-10 max-w-3xl space-y-4">
              <p className="text-sm font-medium tracking-[0.16em] text-accent uppercase">
                {copy.questionBank.eyebrow}
              </p>
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#071B3A] md:text-5xl dark:text-[#D7E2FF]">
                {copy.questionBank.title}
              </h2>
              <p className="text-muted-foreground text-base leading-8 md:text-lg">
                {copy.questionBank.description}
              </p>
            </div>

            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-3">
                {copy.questionBank.groups.map((group, index) => (
                  <button
                    key={group.name}
                    type="button"
                    onClick={() => {
                      setActiveQuestionGroup(index);
                      setActiveQuestionItem(group.featuredItem);
                    }}
                    className={
                      index === activeQuestionGroup
                        ? 'rounded-full bg-[#071B3A] px-5 py-2.5 text-sm font-semibold text-[#F5F0EA]'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:border-[#071B3A]/20'
                    }
                  >
                    {group.name}
                  </button>
                ))}
              </div>

              <div className="text-muted-foreground flex flex-wrap items-center gap-5 text-sm">
                <div className="flex items-center gap-2">
                  <BookText className="h-4 w-4 text-accent" />
                  <span>{currentQuestionGroup.totalQuestions}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-accent" />
                  <span>{currentQuestionGroup.totalHours}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <aside className="paper-card rounded-[1.75rem] p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                  <Layers3 className="h-4 w-4 text-accent" />
                  <span>{currentQuestionItem?.label ?? currentQuestionGroup.featuredItem}</span>
                </div>

                <div className="space-y-3">
                  {currentQuestionGroup.items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActiveQuestionItem(item.label)}
                      className={
                        activeQuestionItem === item.label
                          ? 'block w-full border-l-2 border-[#071B3A] pl-4 text-left text-sm font-semibold text-[#071B3A] dark:border-[#D7E2FF] dark:text-[#D7E2FF]'
                          : 'text-muted-foreground hover:text-foreground block w-full pl-4 text-left text-sm transition-colors'
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </aside>

              <div className="paper-card overflow-hidden rounded-[1.75rem]">
                <div className="divide-border divide-y">
                  {currentQuestionItem.previewQuestions.map((question) => (
                    <article key={question.title} className="px-6 py-6">
                      <Link href="/questions" className="group flex items-start gap-4">
                        <div className="border-border bg-background mt-1 h-7 w-7 rounded-full border" />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-[#071B3A] transition-colors group-hover:text-accent dark:text-[#F5F0EA]">
                                {question.title}
                              </h3>
                              <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-7">
                                {question.description}
                              </p>
                            </div>

                            <span className="border-border bg-background inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-[#071B3A] dark:text-[#F5F0EA]">
                              {copy.questionBank.cardCta}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="bg-muted text-muted-foreground inline-flex rounded-full px-3 py-1 text-xs font-medium">
                              {question.category}
                            </span>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${difficultyStyles[question.difficulty] ?? 'bg-[rgba(148,163,184,0.16)] text-[#475569]'}`}
                            >
                              {question.difficulty}
                            </span>
                            {question.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex rounded-md bg-[#071B3A] px-2.5 py-1 text-[11px] font-semibold text-[#F5F0EA]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>

                <div className="border-border border-t bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(242,237,231,0.48))] px-6 py-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-muted-foreground text-sm leading-6">
                      {copy.questionBank.footerNote}
                    </p>
                    <Link
                      href="/questions"
                      className="border-border bg-background inline-flex rounded-full border px-5 py-3 text-sm font-semibold text-[#071B3A] transition-colors hover:border-[#071B3A]/25 hover:text-accent dark:text-[#F5F0EA]"
                    >
                      {copy.questionBank.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="blog-preview" className="px-4 py-16 md:px-6 md:py-24">
          <div className="editorial-grid">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl space-y-4">
                <p className="text-sm font-medium tracking-[0.16em] text-accent uppercase">
                  {supplemental.blog.eyebrow}
                </p>
                <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#071B3A] md:text-5xl dark:text-[#D7E2FF]">
                  {supplemental.blog.title}
                </h2>
                <p className="text-muted-foreground text-base leading-8 md:text-lg">
                  {supplemental.blog.description}
                </p>
              </div>

              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#071B3A] transition-colors hover:text-accent dark:text-[#F5F0EA]"
              >
                {supplemental.blog.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <article key={post.slug} className="paper-card overflow-hidden rounded-[1.75rem]">
                  <div className="h-40 bg-[linear-gradient(135deg,rgba(34,199,232,0.08),rgba(139,214,63,0.12),rgba(7,27,58,0.04))]" />
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <span className="rounded-full bg-[#071B3A] px-3 py-1 text-[#F5F0EA]">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-[#60708c]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {post.date}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 text-sm leading-7">{post.excerpt}</p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#071B3A] transition-colors hover:text-accent dark:text-[#F5F0EA]"
                    >
                      {uiLabels.readArticle}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 py-16 md:px-6 md:py-24">
          <div className="editorial-grid">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-4">
                <p className="text-sm font-medium tracking-[0.16em] text-accent uppercase">
                  {supplemental.faq.eyebrow}
                </p>
                <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#071B3A] md:text-5xl dark:text-[#D7E2FF]">
                  {supplemental.faq.title}
                </h2>
              </div>

              <div className="paper-card rounded-[1.75rem] p-3 md:p-4">
                {supplemental.faq.items.map((item, index) => (
                  <details
                    key={item.question}
                    className={`group px-4 py-4 ${index !== supplemental.faq.items.length - 1 ? 'border-b border-[#e8ddd1]' : ''}`}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
                      <span>{item.question}</span>
                      <BadgeCheck className="h-5 w-5 shrink-0 text-accent transition-transform group-open:rotate-6" />
                    </summary>
                    <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 py-16 md:px-6 md:py-24">
          <div className="editorial-grid">
            <div className="rounded-[2rem] border border-[#071B3A] bg-[#071B3A] px-6 py-10 text-[#F5F0EA] md:px-10">
              <p className="text-sm font-medium tracking-[0.16em] text-accent uppercase">
                {copy.cta.eyebrow}
              </p>
              <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-bold tracking-[-0.03em] md:text-5xl">
                    {copy.cta.title}
                  </h2>
                  <p className="mt-4 text-base leading-8 text-[#D7E2FF]">{copy.cta.description}</p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="border-0 bg-[#8BD63F] text-[#071B3A] hover:bg-[#A4EA5B]"
                >
                  <Link href="/blog">{copy.cta.button}</Link>
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
