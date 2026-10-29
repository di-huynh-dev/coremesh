import { ReadingRoom } from "@/components/reading/reading-room";
import { getAllSeries } from "@/lib/content/series";
import { isBlogLocale } from "@/lib/content/text";
import { pageMetadata } from "@/lib/seo";
import { getPostSummaries } from "@repo/content/posts";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

interface ReadingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ReadingPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "reading" });

  // Personal, per-browser page: nothing here for search engines.
  return {
    ...pageMetadata({ locale, path: "/reading", title: t("title"), description: t("lead") }),
    robots: { index: false, follow: true },
  };
}

export default async function ReadingPage({ params }: ReadingPageProps) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "reading" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const series = getAllSeries(locale).map(({ id, title, topic, posts }) => ({ id, title, topic, posts }));

  return (
    <div className="wrap pt-10 md:pt-14">
      <header className="mb-10 border-b border-line pb-10">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-faint">
          <Link href={`/${locale}`} className="hover:text-ink">
            {tPost("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-soft">{t("breadcrumb")}</span>
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.035em] text-ink md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-soft">{t("lead")}</p>
      </header>

      <ReadingRoom posts={getPostSummaries(locale)} series={series} />
    </div>
  );
}
