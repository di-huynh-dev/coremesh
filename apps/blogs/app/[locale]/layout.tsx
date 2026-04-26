import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import "../globals.css";
import { Providers } from "../providers";
import { getMessages } from "next-intl/server";

export const revalidate = 0;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DiCodeWeb | Engineering Notes & Systems Thinking",
  description:
    "A personal blog about frontend engineering, system design, and developer growth. Focused on React, Next.js, scalable architectures, and real-world lessons from building production systems.",
  keywords: [
    "DiCodeWeb",
    "Frontend Engineering",
    "React",
    "Next.js",
    "System Design",
    "Monorepo",
    "Micro Frontend",
    "Developer Blog",
  ],
  authors: [{ name: "DiCodeWeb" }],
  icons: {
    icon: [{ url: "/round-avatar.svg", type: "image/svg+xml" }],
    apple: "/round-avatar.svg",
  },

  openGraph: {
    title: "DiCodeWeb | Engineering Notes & Systems Thinking",
    description:
      "Insights on frontend architecture, performance, and building scalable web applications. No fluff, just practical engineering.",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "DiCodeWeb | Engineering Notes",
    description: "Frontend, system design, and real-world engineering lessons.",
    creator: "@DiCodeWeb",
  },
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "vi" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
