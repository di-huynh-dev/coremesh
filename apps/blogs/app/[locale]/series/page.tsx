import { MotionController } from "@/components/motion/motion-controller";
import { SeriesCard } from "@/components/series/series-card";
import { getAllSeries } from "@/lib/content/series";
import { isBlogLocale } from "@/lib/content/text";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

interface SeriesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "series" });

  return pageMetadata({ locale, path: "/series", title: t("title"), description: t("lead") });
}

export default async function SeriesIndexPage({ params }: SeriesPageProps) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "series" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const series = getAllSeries(locale);

  return (
    <div className="wrap pt-10 md:pt-14">
      <header className="mb-12 border-b border-line pb-10" data-fx-head="page">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-faint" data-fx="item">
          <Link href={`/${locale}`} className="hover:text-ink">
            {tPost("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-soft">{t("breadcrumb")}</span>
        </nav>
        <h1
          data-fx="line"
          className="mt-4 text-4xl font-bold tracking-[-0.035em] text-ink md:text-5xl"
        >
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-soft" data-fx="item">
          {t("lead")}
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2" data-fx-skip>
        {series.map((item, index) => (
          <SeriesCard key={item.id} series={item} index={index} />
        ))}
      </div>

      <MotionController />
    </div>
  );
}
