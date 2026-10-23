import { PostRow } from "@/components/blog/post-row";
import { SectionHeading } from "@/components/home/section-heading";
import { MotionController } from "@/components/motion/motion-controller";
import { LibraryIcon, SkillChip } from "@/components/roadmap/library-icon";
import { RoadmapCard } from "@/components/roadmap/roadmap-card";
import { RoadmapJourney } from "@/components/roadmap/roadmap-journey";
import { isBlogLocale } from "@/lib/content/text";
import { ROADMAP_ECOSYSTEMS } from "@/lib/library-icons";
import { ROADMAP_IDS, getRoadmap, getRoadmapPhases, getRoadmapPosts, isRoadmapId } from "@/lib/content/roadmaps";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface RoadmapPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export function generateStaticParams() {
  return ROADMAP_IDS.map((id) => ({ id }));
}

async function resolve(params: RoadmapPageProps["params"]) {
  const { locale: rawLocale, id } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  return { locale, roadmap: isRoadmapId(id) ? getRoadmap(id, locale) : undefined };
}

export async function generateMetadata({ params }: RoadmapPageProps): Promise<Metadata> {
  const { roadmap } = await resolve(params);
  if (!roadmap) return { title: "Not found" };
  return { title: roadmap.name, description: roadmap.summary };
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
  const { locale, roadmap } = await resolve(params);
  if (!roadmap) notFound();

  const t = await getTranslations({ locale, namespace: "roadmap" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const phaseLabels = t.raw("phases") as string[];
  const phases = getRoadmapPhases(roadmap.milestones).map((phase, i) => ({
    label: phaseLabels[i] ?? "",
    start: phase.start,
    end: phase.end,
  }));
  const otherId = ROADMAP_IDS.find((id) => id !== roadmap.id)!;
  const other = getRoadmap(otherId, locale);
  const posts = getRoadmapPosts(roadmap, locale);

  const stats = [
    { value: roadmap.totals.milestones, label: t("statLabels.stages") },
    { value: roadmap.totals.topics, label: t("statLabels.focus") },
    { value: roadmap.totals.questions, label: t("statLabels.practice") },
    { value: `~${roadmap.totals.weeks}`, label: t("statLabels.weeks") },
  ];

  return (
    <div style={{ "--accent": roadmap.accent } as React.CSSProperties}>
      <header className="on-dark relative overflow-hidden bg-night text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 size-[520px] rounded-full opacity-25 blur-3xl"
          style={{ background: `radial-gradient(circle, ${roadmap.accent}, transparent 65%)` }}
        />
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
            <span className="text-white/70">{roadmap.shortName}</span>
          </nav>

          <p className="eyebrow mt-8 before:bg-[var(--accent)]" data-fx="item">
            {roadmap.track} · {roadmap.role} · {roadmap.level}
          </p>
          <h1
            data-fx="line"
            className="mt-4 max-w-3xl text-[2.6rem] leading-[1.08] font-bold tracking-[-0.035em] sm:text-6xl"
          >
            {roadmap.name}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70" data-fx="item">
            {roadmap.summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3" data-fx="item">
            <a href={`#stage-${roadmap.milestones[0]?.step ?? "01"}`} className="btn btn-primary">
              {t("start")} <span aria-hidden className="btn-arrow">↓</span>
            </a>
            <Link href={`/${locale}/roadmap/${other.id}`} className="btn btn-ghost">
              {other.name}
            </Link>
          </div>

          <ul
            data-fx="fade"
            className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <li key={stat.label} className="bg-night px-5 py-5">
                <span className="block text-3xl font-bold tracking-[-0.03em] tabular-nums">
                  {stat.value}
                </span>
                <span className="text-sm text-white/55">{stat.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4" data-fx="fade">
            <span className="eyebrow before:bg-[var(--accent)]">{t("ecosystem")}</span>
            <ul className="flex flex-wrap gap-2">
              {ROADMAP_ECOSYSTEMS[roadmap.id].map((icon) => (
                <li
                  key={icon}
                  className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white"
                >
                  <LibraryIcon id={icon} size={22} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Mobile phase strip; desktop shows the sticky overview beside the path */}
      <div className="wrap pt-10 lg:hidden">
        <ol className="grid grid-cols-3 gap-2">
          {phases.map((phase, i) => (
            <li key={phase.label} className="text-xs">
              <span
                className={cn(
                  "block h-1 rounded-full bg-[var(--accent)]",
                  i === 0 ? "opacity-40" : i === 1 ? "opacity-70" : "",
                )}
              />
              <span className="mt-2 block font-semibold text-ink">{phase.label}</span>
              <span className="font-mono text-faint">
                {String(phase.start + 1).padStart(2, "0")}–{String(phase.end + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <section aria-labelledby="stages-title" className="wrap pt-14 md:pt-20">
        <h2 id="stages-title" className="sr-only">
          {t("stagesTitle")}
        </h2>
        <RoadmapJourney
          milestones={roadmap.milestones}
          phases={phases}
          overviewLabel={t("overview")}
          stageLabel={t("stageLabel", { step: "{step}" })}
        />
      </section>

      <section aria-labelledby="outcomes-title" className="wrap pt-20 md:pt-28">
        <SectionHeading id="outcomes-title" title={t("outcomes")} />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <ul className="space-y-4">
            {roadmap.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-3 leading-7 text-ink/85">
                <Check className="mt-1.5 size-4 shrink-0 text-[var(--accent)]" strokeWidth={2.5} />
                {outcome}
              </li>
            ))}
          </ul>
          <aside className="rounded-2xl border border-line bg-paper p-6">
            <h3 className="text-lg font-semibold text-ink">{roadmap.support.title}</h3>
            <p className="mt-2 text-sm leading-6 text-soft">{roadmap.support.description}</p>
            <ul className="mt-4 space-y-2.5 border-t border-line pt-4">
              {roadmap.support.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-6 text-ink/80">
                  <span className="mt-2 size-1.5 shrink-0 bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section aria-labelledby="skills-title" className="wrap pt-20 md:pt-28">
        <SectionHeading id="skills-title" title={t("skills")} />
        <ul className="flex flex-wrap gap-2">
          {roadmap.skills.map((skill) => (
            <li key={skill}>
              <SkillChip label={skill} className="px-3.5 py-1.5 text-sm" />
            </li>
          ))}
        </ul>
      </section>

      {posts.length > 0 ? (
        <section aria-labelledby="roadmap-posts" className="wrap pt-20 md:pt-28">
          <SectionHeading
            id="roadmap-posts"
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

      <section aria-labelledby="other-path" className="wrap pt-20 md:pt-28">
        <SectionHeading id="other-path" title={t("otherPath")} />
        <RoadmapCard roadmap={other} index={ROADMAP_IDS.indexOf(other.id)} />
      </section>

      <MotionController />
    </div>
  );
}
