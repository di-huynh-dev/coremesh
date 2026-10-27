import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { motionPreScript } from "@/components/motion/motion-controller";
import { buildSearchIndex } from "@/lib/content/search";
import { isBlogLocale } from "@/lib/content/text";
import { ogLocale } from "@/lib/seo";
import { AUTHOR, SITE_NAME, SITE_TITLE, SITE_URL, TWITTER_HANDLE } from "@/lib/site";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import "../globals.css";
import { Providers } from "../providers";

// Keep fonts local: Google Fonts can return URLs Turbopack cannot parse.
const beVietnam = localFont({
  src: [
    { path: "../fonts/BeVietnamPro-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/BeVietnamPro-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/BeVietnamPro-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/BeVietnamPro-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-be-vietnam",
  display: "swap",
});

const jetBrainsMono = localFont({
  src: "../fonts/JetBrainsMono.woff2",
  weight: "400 500",
  style: "normal",
  variable: "--font-jetbrains-mono",
  display: "swap",
  fallback: ["monospace"],
  adjustFontFallback: false,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer" });

  // Page-level metadata (lib/seo.ts) adds canonical, hreflang and per-page Open Graph.
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_NAME}`,
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
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    icons: {
      icon: [{ url: "/round-avatar.svg", type: "image/svg+xml" }],
      apple: "/round-avatar.svg",
    },
    // Fallbacks for routes without their own metadata (e.g. 404): no hreflang, since the
    // locale homes are not translations of an arbitrary page.
    alternates: {
      types: { "application/rss+xml": `/${locale}/rss.xml` },
    },
    openGraph: {
      title: SITE_TITLE,
      description: t("description"),
      type: "website",
      siteName: SITE_NAME,
      locale: isBlogLocale(locale) ? ogLocale[locale] : ogLocale.en,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: t("description"),
      creator: TWITTER_HANDLE,
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
