import type { HomeLocale } from '@/lib/home-content';

type BlogCategory = 'Engineering' | 'Design' | 'Framework';
type BlogLevel = 'Starter' | 'Intermediate' | 'Advanced';

type BlogIndexCopy = {
  heroTitle: string;
  heroDescription: string;
  whatsNewTitle: string;
  whatsNewDescription: string;
  seeAll: string;
  everythingTitle: string;
  everythingDescription: string;
  sortNewest: string;
  sortOldest: string;
  sortTitle: string;
  searchPlaceholder: string;
  allCategories: string;
  noPostsTitle: string;
  noPostsDescription: string;
  loadMore: string;
  browseSeriesTitle: string;
  browseSeriesDescription: string;
};

type BlogArticleCopy = {
  tableOfContents: string;
  tableOfContentsAria: string;
  backToBlog: string;
  authorLabel: string;
  listen: string;
  keepReadingEyebrow: string;
  keepReadingTitle: string;
  keepReadingDescription: string;
  moreArticles: string;
  previousInSeries: string;
  nextInSeries: string;
  relatedArticle: string;
  relatedFrom: string;
  restart: string;
  stop: string;
  settings: string;
  closePlayer: string;
  playbackSettings: string;
  speed: string;
  voice: string;
  restartToApply: string;
};

type BlogUiCopy = {
  index: BlogIndexCopy;
  article: BlogArticleCopy;
  keepReadingCta: string;
  whatsNewLabel: string;
  readArticle: string;
};

const localeTags: Record<HomeLocale, string> = {
  en: 'en-US',
  vi: 'vi-VN',
  ja: 'ja-JP',
};

const categoryLabels: Record<BlogCategory, Record<HomeLocale, string>> = {
  Engineering: {
    en: 'Engineering',
    vi: 'Kỹ thuật',
    ja: 'Engineering',
  },
  Design: {
    en: 'Design',
    vi: 'Thiết kế',
    ja: 'Design',
  },
  Framework: {
    en: 'Framework',
    vi: 'Framework',
    ja: 'Framework',
  },
};

const levelLabels: Record<BlogLevel, Record<HomeLocale, string>> = {
  Starter: {
    en: 'Starter',
    vi: 'Cơ bản',
    ja: 'Starter',
  },
  Intermediate: {
    en: 'Intermediate',
    vi: 'Trung cấp',
    ja: 'Intermediate',
  },
  Advanced: {
    en: 'Advanced',
    vi: 'Nâng cao',
    ja: 'Advanced',
  },
};

const blogUiCopy: Record<HomeLocale, BlogUiCopy> = {
  en: {
    index: {
      heroTitle: 'DiCodeWeb Journal',
      heroDescription:
        'Learn modern systems through practical write-ups, deeper implementation notes, and curated content grouped into clear series.',
      whatsNewTitle: "What's new",
      whatsNewDescription: 'Fresh posts and recent additions from the editorial stream.',
      seeAll: 'See all',
      everythingTitle: 'Everything from the blog',
      everythingDescription:
        'Browse every post, narrow by category, and jump into deeper topic paths through the series rail on the right.',
      sortNewest: 'Newest first',
      sortOldest: 'Oldest first',
      sortTitle: 'Title A-Z',
      searchPlaceholder: 'Search posts, tags, or series',
      allCategories: 'All',
      noPostsTitle: 'No posts matched this view.',
      noPostsDescription: 'Try a broader keyword or switch the active category filter.',
      loadMore: 'Load more articles',
      browseSeriesTitle: 'Browse series',
      browseSeriesDescription:
        'Explore grouped content arcs instead of isolated posts, from Next.js patterns to frontend systems decisions.',
    },
    article: {
      tableOfContents: 'Contents',
      tableOfContentsAria: 'Table of contents',
      backToBlog: 'Back to Blog',
      authorLabel: 'Author',
      listen: 'Listen',
      keepReadingEyebrow: 'Keep reading',
      keepReadingTitle: 'Better navigation for the next step.',
      keepReadingDescription:
        'This article is part of {series}, so you can keep moving through the same learning path.',
      moreArticles: 'More articles',
      previousInSeries: 'Previous in series',
      nextInSeries: 'Next in series',
      relatedArticle: 'Related article',
      relatedFrom: 'Related from {label}',
      restart: 'Restart',
      stop: 'Stop',
      settings: 'Settings',
      closePlayer: 'Close player',
      playbackSettings: 'Playback Settings',
      speed: 'Speed',
      voice: 'Voice',
      restartToApply: 'Changes apply when you restart',
    },
    keepReadingCta: 'Keep reading',
    whatsNewLabel: "What's new",
    readArticle: 'Read article',
  },
  vi: {
    index: {
      heroTitle: 'DiCodeWeb Journal',
      heroDescription:
        'Học các hệ thống hiện đại qua bài viết thực tế, ghi chú triển khai có chiều sâu và nội dung được nhóm lại thành các series rõ ràng.',
      whatsNewTitle: 'Mới nhất',
      whatsNewDescription: 'Các bài viết mới và cập nhật gần đây từ dòng nội dung biên tập.',
      seeAll: 'Xem tất cả',
      everythingTitle: 'Toàn bộ bài viết',
      everythingDescription:
        'Duyệt toàn bộ bài viết, lọc theo chủ đề và đi sâu hơn qua danh sách series ở bên phải.',
      sortNewest: 'Mới nhất trước',
      sortOldest: 'Cũ nhất trước',
      sortTitle: 'Tiêu đề A-Z',
      searchPlaceholder: 'Tìm bài viết, tag hoặc series',
      allCategories: 'Tất cả',
      noPostsTitle: 'Không có bài viết nào khớp bộ lọc này.',
      noPostsDescription: 'Hãy thử từ khóa rộng hơn hoặc đổi bộ lọc chủ đề đang chọn.',
      loadMore: 'Tải thêm bài viết',
      browseSeriesTitle: 'Khám phá series',
      browseSeriesDescription:
        'Đi theo các mạch nội dung được nhóm lại thay vì những bài rời rạc, từ pattern Next.js đến quyết định về frontend systems.',
    },
    article: {
      tableOfContents: 'Mục lục',
      tableOfContentsAria: 'Mục lục bài viết',
      backToBlog: 'Quay lại Blog',
      authorLabel: 'Tác giả',
      listen: 'Nghe bài viết',
      keepReadingEyebrow: 'Đọc tiếp',
      keepReadingTitle: 'Đi tiếp mạch học ở bước kế tiếp.',
      keepReadingDescription:
        'Bài viết này thuộc series {series}, nên bạn có thể tiếp tục theo cùng một lộ trình học.',
      moreArticles: 'Thêm bài viết',
      previousInSeries: 'Bài trước trong series',
      nextInSeries: 'Bài tiếp theo trong series',
      relatedArticle: 'Bài liên quan',
      relatedFrom: 'Liên quan từ {label}',
      restart: 'Phát lại',
      stop: 'Dừng',
      settings: 'Cài đặt',
      closePlayer: 'Đóng trình phát',
      playbackSettings: 'Cài đặt phát',
      speed: 'Tốc độ',
      voice: 'Giọng đọc',
      restartToApply: 'Thay đổi sẽ áp dụng khi bạn phát lại',
    },
    keepReadingCta: 'Đọc tiếp',
    whatsNewLabel: 'Mới nhất',
    readArticle: 'Đọc bài',
  },
  ja: {
    index: {
      heroTitle: 'DiCodeWeb Journal',
      heroDescription:
        '実践的な write-up、より深い実装メモ、そして明確な series に整理された curated content を通して、現代的な system を学べます。',
      whatsNewTitle: '最新記事',
      whatsNewDescription: 'エディトリアル stream からの新着記事と最近の追加です。',
      seeAll: 'すべて見る',
      everythingTitle: 'ブログの全記事',
      everythingDescription:
        'すべての記事をたどり、category で絞り込み、右側の series rail からより深い topic path へ進めます。',
      sortNewest: '新しい順',
      sortOldest: '古い順',
      sortTitle: 'タイトル A-Z',
      searchPlaceholder: '記事、tag、series を検索',
      allCategories: 'すべて',
      noPostsTitle: 'この表示条件に一致する記事はありません。',
      noPostsDescription:
        'より広い keyword を試すか、active category filter を切り替えてください。',
      loadMore: '記事をさらに表示',
      browseSeriesTitle: 'Series を探す',
      browseSeriesDescription:
        '単発の記事ではなく、Next.js pattern から frontend systems の判断まで、まとまりのある content arc を追えます。',
    },
    article: {
      tableOfContents: '目次',
      tableOfContentsAria: '記事の目次',
      backToBlog: 'ブログへ戻る',
      authorLabel: '著者',
      listen: '音声で聞く',
      keepReadingEyebrow: '続きを読む',
      keepReadingTitle: '次の一歩へ進みやすい navigation。',
      keepReadingDescription: 'この記事は {series} の一部なので、同じ学習 path を続けて進めます。',
      moreArticles: '他の記事',
      previousInSeries: 'Series の前の記事',
      nextInSeries: 'Series の次の記事',
      relatedArticle: '関連記事',
      relatedFrom: '{label} からの関連記事',
      restart: '最初から',
      stop: '停止',
      settings: '設定',
      closePlayer: 'プレイヤーを閉じる',
      playbackSettings: '再生設定',
      speed: '速度',
      voice: '音声',
      restartToApply: '変更は再開時に反映されます',
    },
    keepReadingCta: '続きを読む',
    whatsNewLabel: '最新記事',
    readArticle: '記事を読む',
  },
};

export function getBlogUiCopy(locale: HomeLocale) {
  return blogUiCopy[locale];
}

export function getBlogLocaleTag(locale: HomeLocale) {
  return localeTags[locale];
}

export function getBlogVoicePrefix(locale: HomeLocale) {
  return localeTags[locale].split('-')[0].toLowerCase();
}

export function formatBlogCategory(category: string, locale: HomeLocale) {
  return categoryLabels[category as BlogCategory]?.[locale] ?? category;
}

export function formatBlogLevel(level: string, locale: HomeLocale) {
  return levelLabels[level as BlogLevel]?.[locale] ?? level;
}

export function formatBlogDate(publishedAt: string, locale: HomeLocale) {
  return new Intl.DateTimeFormat(getBlogLocaleTag(locale), { dateStyle: 'long' }).format(
    new Date(publishedAt),
  );
}

export function formatBlogReadingTime(minutes: number, locale: HomeLocale) {
  if (locale === 'vi') {
    return `${minutes} phút đọc`;
  }

  if (locale === 'ja') {
    return `${minutes}分で読める`;
  }

  return `${minutes} min read`;
}

export function formatBlogArticleCount(count: number, locale: HomeLocale) {
  if (locale === 'vi') {
    return `${count} bài viết`;
  }

  if (locale === 'ja') {
    return `${count}記事`;
  }

  return `${count} ${count === 1 ? 'article' : 'articles'}`;
}

export function formatSeriesPostCount(count: number, locale: HomeLocale) {
  if (locale === 'vi') {
    return `${count} bài`;
  }

  if (locale === 'ja') {
    return `${count}記事`;
  }

  return `${count} ${count === 1 ? 'post' : 'posts'}`;
}

export function formatTopicClusterLabel(label: string, locale: HomeLocale) {
  return formatBlogCategory(label, locale);
}

export function formatRelatedLabel(template: string, label: string) {
  return template.replace('{label}', label);
}
