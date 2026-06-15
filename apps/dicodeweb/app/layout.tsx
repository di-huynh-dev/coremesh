import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'DiCodeWeb | Digital Learning System',
  description:
    'DiCodeWeb is a premium digital learning platform for developers, creators, and lifelong learners who value clarity, craft, and practical depth.',
  keywords: [
    'DiCodeWeb',
    'digital learning',
    'developer education',
    'web development',
    'technical blog',
  ],
  authors: [{ name: 'DiCodeWeb', url: 'https://dicodeweb.local' }],
  icons: {
    icon: [{ url: '/d-logo.webp', type: 'image/webp' }],
    apple: '/d-logo.webp',
  },
  openGraph: {
    title: 'DiCodeWeb | Digital Learning System',
    description:
      'A warm, editorial learning experience for modern builders exploring code, systems, and digital craft.',
    type: 'website',
    url: 'https://dicodeweb.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
