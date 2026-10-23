import { PostRow } from "@/components/blog/post-row";
import { ArchiveGrid } from "@/components/home/archive-grid";
import { Hero } from "@/components/home/hero";
import { LearnSection } from "@/components/home/learn-section";
import { Principles } from "@/components/home/principles";
import { SectionHeading } from "@/components/home/section-heading";
import { TopicsSection } from "@/components/home/topics-section";
import { MotionController } from "@/components/motion/motion-controller";
import { RoadmapCard } from "@/components/roadmap/roadmap-card";
import { AUTHOR } from "@/lib/site";
import { getBlogStats, getPostSummaries, getWritingRhythm } from "@/lib/content/posts";
import { isBlogLocale } from "@/lib/content/text";
import { getGuides } from "@/lib/content/guides";
import { getRoadmaps } from "@/lib/content/roadmaps";
import { Github } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

// The writing-rhythm chart runs up to the current month: refresh daily.
export const revalidate = 86400;

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

  const posts = getPostSummaries(locale);

  return (
    <>
      <Hero stats={getBlogStats(locale)} months={getWritingRhythm(locale)} />

      <section aria-labelledby="latest-title" className="wrap pt-20 md:pt-28">
        <SectionHeading
          id="latest-title"
          title={t("latestTitle")}
          subtitle={t("latestSubtitle")}
          action={{ href: `/${locale}/blog`, label: tCommon("viewAll") }}
        />
        <div>
          {posts.slice(0, 4).map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </div>
      </section>

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
              href="https://github.com/di-huynh-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ink mt-6"
              data-fx="item"
            >
              <Github className="size-4" />
              {t("aboutCta")}
            </a>
          </div>
        </div>
      </section>

      <MotionController />
    </>
  );
}
