import { SectionHeading } from "@/components/home/section-heading";
import { MotionController } from "@/components/motion/motion-controller";
import { RoadmapCard } from "@/components/roadmap/roadmap-card";
import { isBlogLocale } from "@/lib/content/text";
import { getRoadmaps } from "@/lib/content/roadmaps";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

interface RoadmapIndexProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: RoadmapIndexProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "roadmap" });
  return pageMetadata({ locale, path: "/roadmap", title: t("title"), description: t("lead") });
}

export default async function RoadmapIndexPage({ params }: RoadmapIndexProps) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "roadmap" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const roadmaps = getRoadmaps(locale);
  const flowSteps = t.raw("flowSteps") as string[];
  const flowNotes = t.raw("flowNotes") as string[];
  const fullStackItems = t.raw("fullStackItems") as string[];

  return (
    <div className="wrap pt-10 md:pt-14">
      <header className="mb-14 border-b border-line pb-10" data-fx-head="page">
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

      <section aria-labelledby="paths-title">
        <SectionHeading id="paths-title" title={t("pathsTitle")} subtitle={t("pathsSubtitle")} />
        <div className="grid gap-5 lg:grid-cols-2">
          {roadmaps.map((roadmap, index) => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} index={index} />
          ))}
          <article className="flex flex-col rounded-2xl border border-dashed border-line p-6 md:p-8 lg:col-span-2 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div>
              <p className="eyebrow">{t("comingSoon")}</p>
              <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-ink">
                {t("fullStackTitle")}
              </h3>
              <p className="mt-2 max-w-2xl leading-7 text-soft">{t("fullStackSummary")}</p>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2 lg:mt-0 lg:max-w-sm lg:justify-end">
              {fullStackItems.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-dashed border-line px-3 py-1 font-mono text-xs text-soft"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section aria-labelledby="flow-title" className="pt-20 md:pt-28">
        <SectionHeading id="flow-title" title={t("flowTitle")} subtitle={t("flowSubtitle")} />
        <ol
          data-method
          data-fx-skip
          className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {flowSteps.map((step, index) => (
            <li
              key={step}
              className="step flex flex-col"
              style={{ "--s": index * 0.6 } as React.CSSProperties}
            >
              <div className="step-node flex items-center" aria-hidden>
                <i className="size-2.5 bg-cobalt" />
              </div>
              <span className="mt-5 font-mono text-sm font-medium text-cobalt">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-semibold tracking-[-0.01em] text-ink">{step}</h3>
              <p className="mt-1 text-sm leading-6 text-soft">{flowNotes[index]}</p>
            </li>
          ))}
        </ol>
      </section>

      <MotionController />
    </div>
  );
}
