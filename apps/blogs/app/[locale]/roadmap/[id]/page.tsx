import { PostRow } from "@/components/blog/post-row";
import { SectionHeading } from "@/components/home/section-heading";
import { MotionController } from "@/components/motion/motion-controller";
import { SkillChip } from "@/components/role-map/library-icon";
import { RoleRow } from "@/components/role-map/role-row";
import { RoleStages, type RoleStageLabels } from "@/components/role-map/role-stages";
import { PhaseLegend, StageBar } from "@/components/role-map/stage-bar";
import { AUTHOR } from "@/lib/site";
import { isBlogLocale } from "@/lib/content/text";
import {
  ROLE_MAP_IDS,
  getRoleMap,
  getRoleMapPosts,
  isRoleMapId,
  type ResourceKind,
  type RoleInsight,
  type RolePhase,
} from "@/lib/content/role-maps";
import { pageMetadata } from "@/lib/seo";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface RoleMapPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export function generateStaticParams() {
  return ROLE_MAP_IDS.map((id) => ({ id }));
}

async function resolve(params: RoleMapPageProps["params"]) {
  const { locale: rawLocale, id } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  return { locale, roleMap: isRoleMapId(id) ? getRoleMap(id, locale) : undefined };
}

export async function generateMetadata({ params }: RoleMapPageProps): Promise<Metadata> {
  const { locale, roleMap } = await resolve(params);
  if (!roleMap) return { title: "Not found" };
  return pageMetadata({
    locale,
    path: `/roadmap/${roleMap.id}`,
    title: `${roleMap.name} role map`,
    description: roleMap.summary,
    keywords: roleMap.ecosystem,
  });
}

function InsightList({ title, items }: { title: string; items: RoleInsight[] }) {
  return (
    <div>
      <h3 className="border-b-2 border-ink pb-3 text-lg font-semibold text-ink">{title}</h3>
      <ul className="divide-y divide-line">
        {items.map((item) => (
          <li key={item.title} className="py-5">
            <p className="font-medium text-ink">{item.title}</p>
            <p className="mt-1.5 leading-7 text-soft">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function RoleMapPage({ params }: RoleMapPageProps) {
  const { locale, roleMap } = await resolve(params);
  if (!roleMap) notFound();

  const t = await getTranslations({ locale, namespace: "roleMap" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const phaseLabels = t.raw("phases") as Record<RolePhase, string>;
  const posts = getRoleMapPosts(roleMap, locale);
  const otherRoles = ROLE_MAP_IDS.filter((id) => id !== roleMap.id).map((id) => getRoleMap(id, locale));

  const stageLabels: RoleStageLabels = {
    overview: t("overview"),
    stage: t.raw("stageLabel") as string,
    weeks: t.raw("stageWeeks") as string,
    topics: t("topicsTitle"),
    practices: t("practicesTitle"),
    pitfalls: t("pitfallsTitle"),
    project: t("projectTitle"),
    resources: t("resourcesTitle"),
    expandAll: t("expandAll"),
    collapseAll: t("collapseAll"),
    phases: phaseLabels,
    resourceKinds: t.raw("resourceKinds") as Record<ResourceKind, string>,
  };

  const stats = [
    { value: roleMap.totals.stages, label: t("statLabels.stages") },
    { value: roleMap.totals.topics, label: t("statLabels.topics") },
    { value: `~${roleMap.totals.weeks}`, label: t("statLabels.weeks") },
  ];

  return (
    <div style={{ "--accent": roleMap.accent } as React.CSSProperties}>
      <header className="on-dark relative overflow-hidden bg-night text-white">
        <div className="wrap relative py-14 md:py-20" data-fx-head="page">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-white/50" data-fx="item">
            <Link href={`/${locale}`} className="hover:text-white">
              {tPost("breadcrumbHome")}
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/${locale}/roadmap`} className="hover:text-white">
              {t("breadcrumb")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">{roleMap.name}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              {roleMap.isPrimary ? (
                <p className="text-sm font-medium text-white/60" data-fx="item">
                  {t("primary")}
                </p>
              ) : null}
              <h1
                data-fx="line"
                className="mt-2 max-w-3xl text-[2.6rem] leading-[1.08] font-bold tracking-[-0.035em] sm:text-6xl"
              >
                {roleMap.name}
              </h1>
              <p className="mt-4 max-w-[60ch] text-xl leading-8 text-white/85" data-fx="item">
                {roleMap.tagline}
              </p>
              <p className="mt-3 max-w-[64ch] leading-7 text-white/60" data-fx="item">
                {roleMap.summary}
              </p>
              <a href="#stage-01" className="btn btn-primary mt-8" data-fx="item">
                {t("start")}
              </a>
            </div>

            <dl className="grid grid-cols-3 gap-4 border-t border-white/15 pt-5 lg:grid-cols-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8" data-fx="fade">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-3xl font-bold tracking-[-0.03em] tabular-nums">{stat.value}</span>
                    <span className="text-sm text-white/55">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-12" data-fx="fade">
            <StageBar stages={roleMap.stages} linkBase="" className="h-2.5" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="[&_li]:text-white/60">
                <PhaseLegend labels={phaseLabels} />
              </div>
              <ul className="flex flex-wrap gap-1.5" aria-label={t("ecosystem")}>
                {roleMap.ecosystem.map((tool) => (
                  <li key={tool}>
                    <SkillChip label={tool} className="border-transparent bg-white text-night" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="story-title" className="wrap pt-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 id="story-title" className="flex items-center gap-3 text-[1.75rem] font-bold tracking-[-0.03em] text-ink md:text-[2rem]">
              <Image src={AUTHOR.avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
              {t("storyTitle")}
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink/85">{roleMap.story.intro}</p>
          </div>
          <div className="rounded-2xl bg-paper p-6 md:p-8">
            <h3 className="font-semibold text-ink">{t("lessonsTitle")}</h3>
            <ul className="mt-4 space-y-4">
              {roleMap.story.lessons.map((lesson) => (
                <li key={lesson} className="flex gap-3 leading-7 text-ink/85">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  {lesson}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-label={t("overview")} className="wrap pt-16 md:pt-24">
        <RoleStages stages={roleMap.stages} labels={stageLabels} />
      </section>

      <section aria-labelledby="trends-title" className="wrap pt-20 md:pt-28">
        <SectionHeading id="trends-title" title={t("trendsTitle")} subtitle={t("trendsSubtitle")} />
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <InsightList title={t("now")} items={roleMap.trends.now} />
          <InsightList title={t("next")} items={roleMap.trends.next} />
        </div>
      </section>

      <section aria-labelledby="outcomes-title" className="wrap pt-20 md:pt-28">
        <SectionHeading id="outcomes-title" title={t("outcomes")} />
        <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
          {roleMap.outcomes.map((outcome) => (
            <li key={outcome} className="flex gap-3 leading-7 text-ink/85">
              <Check aria-hidden className="mt-1.5 size-4 shrink-0 text-[var(--accent)]" strokeWidth={2.5} />
              {outcome}
            </li>
          ))}
        </ul>
      </section>

      {posts.length > 0 ? (
        <section aria-labelledby="role-posts" className="wrap pt-20 md:pt-28">
          <SectionHeading
            id="role-posts"
            title={t("related")}
            action={{ href: `/${locale}/blog`, label: tPost("backToExplore") }}
          />
          <div>
            {posts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="other-roles" className="wrap pt-20 md:pt-28">
        <SectionHeading
          id="other-roles"
          title={t("otherRoles")}
          action={{ href: `/${locale}/roadmap`, label: t("title") }}
        />
        <div>
          {otherRoles.map((other) => (
            <RoleRow key={other.id} roleMap={other} compact />
          ))}
        </div>
      </section>

      <MotionController />
    </div>
  );
}
