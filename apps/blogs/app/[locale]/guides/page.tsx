import { GuidesIndex } from "@/components/guides/guides-index";
import { SourceNote } from "@/components/guides/source-note";
import { MotionController } from "@/components/motion/motion-controller";
import { getGuideCategories, getGuides } from "@/lib/content/guides";
import { isBlogLocale } from "@/lib/content/text";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

interface GuidesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: GuidesPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "guides" });
  return pageMetadata({ locale, path: "/guides", title: t("title"), description: t("lead") });
}

export default async function GuidesPage({ params }: GuidesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const guides = getGuides(locale).map((guide) => ({
    slug: guide.slug,
    title: guide.title,
    description: guide.description,
    category: guide.category,
    chapters: guide.parts.length,
    readingTime: guide.readingTime,
    tags: guide.tags,
  }));

  return (
    <div className="wrap pt-10 md:pt-14">
      <header className="mb-10 border-b border-line pb-10" data-fx-head="page">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-faint" data-fx="item">
          <Link href={`/${locale}`} className="hover:text-ink">
            {tPost("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-soft">{t("breadcrumb")}</span>
        </nav>
        <h1 data-fx="line" className="mt-4 text-4xl font-bold tracking-[-0.035em] text-ink md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-soft" data-fx="item">
          {t("lead")}
        </p>
        <div data-fx="item">
          <SourceNote namespace="guides" className="mt-5" />
        </div>
      </header>

      <GuidesIndex guides={guides} categories={getGuideCategories(locale)} />
      <MotionController />
    </div>
  );
}
