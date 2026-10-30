import { SectionHeading } from "@/components/home/section-heading";
import { MotionController } from "@/components/motion/motion-controller";
import { RoleRow } from "@/components/role-map/role-row";
import { PhaseLegend } from "@/components/role-map/stage-bar";
import { isBlogLocale } from "@/lib/content/text";
import { getRoleMaps, type RolePhase } from "@/lib/content/role-maps";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

interface RoleMapIndexProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: RoleMapIndexProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "roleMap" });
  return pageMetadata({ locale, path: "/role-map", title: t("title"), description: t("lead") });
}

export default async function RoleMapIndexPage({ params }: RoleMapIndexProps) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "roleMap" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const roleMaps = getRoleMaps(locale);
  const phaseLabels = t.raw("phases") as Record<RolePhase, string>;
  const readingSteps = t.raw("readingSteps") as { title: string; detail: string }[];

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
        <p className="mt-3 max-w-[64ch] text-lg leading-8 text-soft" data-fx="item">
          {t("lead")}
        </p>
      </header>

      <section aria-labelledby="roles-title">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="roles-title" className="text-[1.75rem] font-bold tracking-[-0.03em] text-ink md:text-[2rem]">
              {t("listTitle")}
            </h2>
            <p className="mt-1.5 text-soft">{t("listSubtitle")}</p>
          </div>
          <div aria-label={t("legend")}>
            <PhaseLegend labels={phaseLabels} />
          </div>
        </div>
        <div>
          {roleMaps.map((roleMap) => (
            <RoleRow key={roleMap.id} roleMap={roleMap} />
          ))}
        </div>
      </section>

      <section aria-labelledby="reading-title" className="pt-20 md:pt-28">
        <SectionHeading id="reading-title" title={t("readingTitle")} />
        <ol className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {readingSteps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-ink pt-5">
              <span className="font-mono text-sm text-faint">{index + 1}</span>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.01em] text-ink">{step.title}</h3>
              <p className="mt-2 leading-7 text-soft">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <MotionController />
    </div>
  );
}
