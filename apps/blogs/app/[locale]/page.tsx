import { PostRow } from "@/components/blog/post-row";
import { ArchiveGrid } from "@/components/home/archive-grid";
import { Hero } from "@/components/home/hero";
import { LearnSection } from "@/components/home/learn-section";
import { Principles } from "@/components/home/principles";
import { SectionHeading } from "@/components/home/section-heading";
import { TopicsSection } from "@/components/home/topics-section";
import { MotionController } from "@/components/motion/motion-controller";
import { RoadmapCard } from "@/components/roadmap/roadmap-card";
import { SeriesCard } from "@/components/series/series-card";
import { JsonLd } from "@/components/seo/json-ld";
import { authorJsonLd, contentLanguage, pageMetadata } from "@/lib/seo";
import { AUTHOR, SITE_NAME, SITE_URL } from "@/lib/site";
import { getBlogStats, getPostSummaries, getWritingRhythm } from "@repo/content/posts";
import { isBlogLocale } from "@/lib/content/text";
import { getGuides } from "@/lib/content/guides";
import { getRoadmaps } from "@/lib/content/roadmaps";
import { getAllSeries } from "@/lib/content/series";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

// The writing-rhythm chart runs up to the current month: refresh daily.
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "footer" });
  // ./opengraph-image.tsx sits in this segment.
  return pageMetadata({ locale, path: "", description: t("description"), ownImage: true });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "home" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tRoadmap = await getTranslations({ locale, namespace: "roadmap" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });
  const tSeries = await getTranslations({ locale, namespace: "series" });

  const posts = getPostSummaries(locale);
  // Freshest series first: the ones that just gained a part.
  const series = getAllSeries(locale)
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.updated.localeCompare(a.item.updated))
    .slice(0, 3);
  const homeUrl = `${SITE_URL}/${locale}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${homeUrl}#website`,
        url: homeUrl,
        name: SITE_NAME,
        description: tFooter("description"),
        inLanguage: contentLanguage[locale],
        author: { "@id": authorJsonLd["@id"] },
        publisher: { "@id": authorJsonLd["@id"] },
      },
      authorJsonLd,
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero stats={getBlogStats(locale)} months={getWritingRhythm(locale)} featured={posts[0]} />

      <section aria-labelledby="latest-title" className="wrap pt-20 md:pt-28">
        <SectionHeading
          id="latest-title"
          title={t("latestTitle")}
          subtitle={t("latestSubtitle")}
          action={{ href: `/${locale}/blog`, label: tCommon("viewAll") }}
        />
        <div>
          {posts.slice(1, 5).map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {series.length > 0 ? (
        <section aria-labelledby="series-title" className="wrap pt-20 md:pt-28">
          <SectionHeading
            id="series-title"
            title={tSeries("home.title")}
            subtitle={tSeries("home.subtitle")}
            action={{ href: `/${locale}/series`, label: tCommon("viewAll") }}
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-fx-skip>
            {series.map(({ item, index }) => (
              <SeriesCard key={item.id} series={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="roadmaps-title" className="wrap pt-20 md:pt-28">
        <SectionHeading
          id="roadmaps-title"
          title={tRoadmap("home.title")}
          subtitle={tRoadmap("home.subtitle")}
          action={{ href: `/${locale}/roadmap`, label: tCommon("viewAll") }}
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {getRoadmaps(locale).map((roadmap, index) => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} index={index} compact />
          ))}
        </div>
      </section>

      <LearnSection guides={getGuides(locale)} locale={locale} />

      <TopicsSection posts={posts} />

      <Principles />

      <section aria-labelledby="archive" className="wrap pt-20 md:pt-28">
        <SectionHeading
          id="archive"
          title={t("archiveTitle")}
          subtitle={t("archiveSubtitle")}
          action={{ href: `/${locale}/blog`, label: tCommon("viewAll") }}
        />
        <ArchiveGrid posts={posts} />
      </section>

      <section aria-labelledby="about" className="wrap pt-20 md:pt-28">
        <div
          className="grid items-center gap-8 rounded-3xl border border-line bg-paper p-6 sm:p-10 md:grid-cols-[160px_minmax(0,1fr)] md:gap-12"
          data-fx-head="about"
        >
          <Image
            data-fx="fade"
            src={AUTHOR.avatar}
            alt={AUTHOR.name}
            width={160}
            height={160}
            className="size-28 rounded-2xl border border-line object-cover md:size-40"
          />
          <div>
            <p className="eyebrow" data-fx="item">
              {t("aboutTitle")}
            </p>
            <h2
              id="about"
              data-fx="line"
              className="mt-3 text-2xl font-bold tracking-[-0.03em] text-ink"
            >
              {AUTHOR.name}
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-soft" data-fx="item">
              {t("aboutBody")}
            </p>
            <a
              href={AUTHOR.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ink mt-6"
              data-fx="item"
            >
              <ArrowUpRight className="size-4" />
              {t("aboutCta")}
            </a>
          </div>
        </div>
      </section>

      <MotionController />
    </>
  );
}
