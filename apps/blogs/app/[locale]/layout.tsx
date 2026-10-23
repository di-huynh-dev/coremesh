import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { motionPreScript } from "@/components/motion/motion-controller";
import { buildSearchIndex } from "@/lib/content/search";
import { isBlogLocale } from "@/lib/content/text";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { ViewTransition } from "react";
import "../globals.css";
import { Providers } from "../providers";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteTitle = "DiCodeWeb | Engineering Notes & Systems Thinking";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer" });

  return {
    title: {
      default: siteTitle,
      template: "%s | DiCodeWeb",
    },
    description: t("description"),
    keywords: [
      "DiCodeWeb",
      "Frontend Engineering",
      "React",
      "Next.js",
      "System Design",
      "Monorepo",
      "Developer Blog",
    ],
    authors: [{ name: "Huỳnh Tiến Dĩ", url: "https://github.com/di-huynh-dev" }],
    icons: {
      icon: [{ url: "/round-avatar.svg", type: "image/svg+xml" }],
      apple: "/round-avatar.svg",
    },
    alternates: {
      languages: { en: "/en", vi: "/vi" },
      types: { "application/rss+xml": `/${locale}/rss.xml` },
    },
    openGraph: {
      title: siteTitle,
      description: t("description"),
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "DiCodeWeb | Engineering Notes",
      description: t("description"),
      creator: "@DiCodeWeb",
    },
  };
}

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
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "navigation" });
  const searchIndex = buildSearchIndex(isBlogLocale(locale) ? locale : "en");

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${beVietnam.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionPreScript }} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-300 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-background"
            >
              {t("skip")}
            </a>
            <Navbar searchIndex={searchIndex} />
            <main id="main" className="min-h-[60vh]">
              {/* Route changes crossfade the page; post titles morph on their own (share). */}
              <ViewTransition default="none" update="page-fade">
                {children}
              </ViewTransition>
            </main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
