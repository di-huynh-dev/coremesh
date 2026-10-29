import { MotionController } from "@/components/motion/motion-controller";
import { JsonLd } from "@/components/seo/json-ld";
import { SeriesCta } from "@/components/series/series-cta";
import { SeriesLine, SeriesTrack } from "@/components/series/series-track";
import { getAllSeries, getSeries } from "@/lib/content/series";
import { formatPostDate, isBlogLocale } from "@/lib/content/text";
import { authorJsonLd, contentLanguage, pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { topicAccent } from "@/lib/topic-style";
import { locales } from "@/intl.config";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SeriesDetailProps {
  params: Promise<{ locale: string; id: string }>;
}

// Only series with at least two parts in the locale get a page.
export function generateStaticParams({ params }: { params: { locale: string } }) {
  return getAllSeries(isBlogLocale(params.locale) ? params.locale : "en").map((series) => ({
    id: series.id,
  }));
}

async function resolve(params: SeriesDetailProps["params"]) {
  const { id, locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  return { locale, series: getSeries(id, locale) };
}

export async function generateMetadata({ params }: SeriesDetailProps): Promise<Metadata> {
  const { locale, series } = await resolve(params);
  if (!series) return { title: "Not found" };

  return pageMetadata({
    locale,
    path: `/series/${series.id}`,
    title: series.title,
    description: series.description,
    keywords: [...new Set(series.posts.flatMap((post) => post.tags))].slice(0, 12),
    available: locales.filter((l) => getSeries(series.id, l) !== undefined),
  });
}

export default async function SeriesDetailPage({ params }: SeriesDetailProps) {
  const { locale, series } = await resolve(params);
  if (!series) notFound();

  const t = await getTranslations({ locale, namespace: "series" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const tTopics = await getTranslations({ locale, namespace: "topics" });
  const others = getAllSeries(locale).filter((item) => item.id !== series.id);

  const url = `${SITE_URL}/${locale}/series/${series.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#series`,
    url,
    name: series.title,
    description: series.description,
    inLanguage: contentLanguage[locale],
    author: { "@id": authorJsonLd["@id"] },
    numberOfItems: series.posts.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: series.posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/${locale}/blog/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <div className="wrap pt-10 md:pt-14" style={topicAccent(series.topic)}>
      <JsonLd data={jsonLd} />

      <header className="max-w-3xl" data-fx-head="page">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-faint" data-fx="item">
          <Link href={`/${locale}`} className="hover:text-ink">
            {tPost("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/series`} className="hover:text-ink">
            {t("breadcrumb")}
          </Link>
        </nav>
        <p className="eyebrow mt-6 before:bg-[var(--accent)]" data-fx="item">
          {tTopics(`${series.topic}.title`)}
        </p>
        <h1
          data-fx="line"
          className="mt-3 text-4xl font-bold tracking-[-0.035em] text-balance text-ink md:text-5xl"
        >
          {series.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-soft" data-fx="item">
          {series.description}
        </p>
        <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-faint" data-fx="item">
          <span>{t("parts", { count: series.posts.length })}</span>
          <span aria-hidden>·</span>
          <span>{t("minutes", { count: series.readingTime })}</span>
          <span aria-hidden>·</span>
          <span>{t("updated", { date: formatPostDate(series.updated, locale) })}</span>
        </p>
      </header>

      <div className="mt-8 flex max-w-3xl flex-col gap-6 border-y border-line py-6">
        <SeriesLine posts={series.posts} />
        <SeriesCta posts={series.posts} />
      </div>

      <section aria-labelledby="parts-title" className="mt-12 max-w-3xl">
        <h2 id="parts-title" className="sr-only">
          {t("partsTitle")}
        </h2>
        <SeriesTrack posts={series.posts} detailed />
      </section>

      {others.length > 0 ? (
        <section aria-labelledby="other-series" className="pt-20">
          <div className="flex items-end justify-between border-b border-line pb-4">
            <h2 id="other-series" className="text-2xl font-bold tracking-[-0.03em] text-ink">
              {t("others")}
            </h2>
            <Link href={`/${locale}/series`} className="arrow-link">
              {t("title")}
            </Link>
          </div>
          <ul>
            {others.map((item) => (
              <li key={item.id} className="border-b border-line" style={topicAccent(item.topic)}>
                <Link
                  href={`/${locale}/series/${item.id}`}
                  className="group grid gap-x-8 gap-y-2 py-5 md:grid-cols-[minmax(0,1fr)_260px] md:items-center"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink transition-colors group-hover:text-[var(--accent)]">
                      {item.title}
                    </span>
                    <span className="font-mono text-xs text-faint">
                      {t("parts", { count: item.posts.length })} · {t("minutes", { count: item.readingTime })}
                    </span>
                  </span>
                  <SeriesLine posts={item.posts} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <MotionController />
    </div>
  );
}
