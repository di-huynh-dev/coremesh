import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { Providers } from './providers';

const metaContent = {
  en: {
    title: 'DiCodeWeb | Digital Learning System',
    description:
      'DiCodeWeb is a premium digital learning platform for developers, creators, and lifelong learners who value clarity, craft, and practical depth.',
    ogDescription:
      'A warm, editorial learning experience for modern builders exploring code, systems, and digital craft.',
  },
  vi: {
    title: 'DiCodeWeb | Hệ Thống Học Tập Số',
    description:
      'DiCodeWeb là nền tảng học tập số cao cấp dành cho lập trình viên, nhà sáng tạo và người học suốt đời đề cao sự rõ ràng, chất lượng và chiều sâu thực tiễn.',
    ogDescription:
      'Trải nghiệm học tập biên tập ấm áp dành cho những người xây dựng hiện đại khám phá mã nguồn, hệ thống và nghề thủ công số.',
  },
  ja: {
    title: 'DiCodeWeb | デジタル学習システム',
    description:
      'DiCodeWebは、明確さ、品質、実践的な深さを重視する開発者、クリエイター、生涯学習者のためのプレミアムデジタル学習プラットフォームです。',
    ogDescription:
      'コード、システム、デジタルクラフトを探求する現代のビルダーのための、温かいエディトリアル学習体験。',
  },
};

function getLocaleFromAcceptLanguage(acceptLang: string | null): keyof typeof metaContent {
  if (!acceptLang) return 'vi';
  const lang = acceptLang.toLowerCase();
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('en')) return 'en';
  return 'vi';
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = getLocaleFromAcceptLanguage(headersList.get('accept-language'));
  const content = metaContent[locale];

  return {
    title: content.title,
    description: content.description,
    keywords: [
      'DiCodeWeb',
      'digital learning',
      'developer education',
      'web development',
      'technical blog',
    ],
    authors: [{ name: 'DiCodeWeb', url: 'https://dicodeweb.local' }],
    icons: {
      icon: [{ url: '/d-logo.svg', type: 'image/svg+xml' }],
      shortcut: '/d-logo.svg',
      apple: '/d-logo.svg',
    },
    openGraph: {
      title: content.title,
      description: content.ogDescription,
      type: 'website',
      url: 'https://dicodeweb.com',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
