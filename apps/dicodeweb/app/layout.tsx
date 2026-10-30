import type { Metadata } from 'next';
import { headers } from 'next/headers';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';
import './globals.css';
import { Providers } from './providers';

const metaContent = {
  en: {
    title: 'DiCodeWeb | Developer Learning System',
    description:
      'DiCodeWeb helps developers sharpen frontend judgment through questions, roadmaps, technical notes, and readiness assessment.',
    ogDescription:
      'Questions, roadmaps and assessment for frontend developers moving toward senior-level judgment.',
  },
  vi: {
    title: 'DiCodeWeb | Developer Learning System',
    description:
      'DiCodeWeb helps developers sharpen frontend judgment through questions, roadmaps, technical notes, and readiness assessment.',
    ogDescription:
      'Questions, roadmaps and assessment for frontend developers moving toward senior-level judgment.',
  },
  ja: {
    title: 'DiCodeWeb | Developer Learning System',
    description:
      'DiCodeWeb helps developers sharpen frontend judgment through questions, roadmaps, technical notes, and readiness assessment.',
    ogDescription:
      'Questions, roadmaps and assessment for frontend developers moving toward senior-level judgment.',
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
    <html
      lang="vi"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
