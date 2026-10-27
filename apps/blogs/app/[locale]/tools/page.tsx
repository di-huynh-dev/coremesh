import { SourceNote } from "@/components/guides/source-note";
import { SectionHeading } from "@/components/home/section-heading";
import { MotionController } from "@/components/motion/motion-controller";
import { ToolCard } from "@/components/tools/tool-card";
import { isBlogLocale } from "@/lib/content/text";
import { TOOL_CATEGORIES, TOOLS } from "@/lib/content/tools";
import { pageMetadata } from "@/lib/seo";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

interface ToolsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ToolsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "tools" });
  return pageMetadata({ locale, path: "/tools", title: t("title"), description: t("lead") });
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "tools" });
  const tPost = await getTranslations({ locale, namespace: "post" });

  return (
    <div className="wrap pt-10 md:pt-14">
      <header className="mb-4 border-b border-line pb-10" data-fx-head="page">
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
        <div className="mt-5 flex flex-col gap-2" data-fx="item">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-topic-performance">
            <ShieldCheck aria-hidden className="size-4" />
            {t("browserOnly")}
          </p>
          <SourceNote namespace="tools" />
        </div>
      </header>

      {TOOL_CATEGORIES.map((category) => {
        const tools = TOOLS.filter((tool) => tool.category === category);
        if (tools.length === 0) return null;
        return (
          <section key={category} aria-labelledby={`tools-${category}`} className="pt-12">
            <SectionHeading id={`tools-${category}`} title={t(`categories.${category}`)} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} locale={locale} />
              ))}
            </div>
          </section>
        );
      })}

      <MotionController />
    </div>
  );
}
