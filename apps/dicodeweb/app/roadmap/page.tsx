'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Languages, Layers3, Rocket, Sparkles, Workflow } from 'lucide-react';
import Link from 'next/link';
import { startTransition, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ClassicRoadmapJourney } from '@/components/roadmap/classic-roadmap-journey';
import {
  SvglLibraryIcon,
  findLibraryIconId,
  getRoadmapLibraryIconIds,
} from '@/components/roadmap/svgl-library-icon';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { homeLocales, type HomeLocale } from '@/lib/home-content';
import {
  defaultRoadmapId,
  getRoadmapDocument,
  getRoadmapPageCopy,
  roadmapCatalog,
  type RoadmapId,
} from '@/lib/roadmap-content';
import { getPreferredLocale, setPreferredLocale, subscribeToLocaleChange } from '@/lib/site-locale';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.48, delay },
});

function RoadmapIcon({ roadmapId, className }: { roadmapId: RoadmapId; className?: string }) {
  if (roadmapId === 'react') {
    return (
      <SvglLibraryIcon
        id="react"
        size={className?.includes('h-7') ? 28 : 16}
        className={className}
      />
    );
  }

  return (
    <SvglLibraryIcon
      id="nestjs"
      size={className?.includes('h-7') ? 28 : 16}
      className={className}
    />
  );
}

function PreviewRailRow({
  label,
  items,
  accent,
  highlightedIndex = 1,
}: {
  label: string;
  items: string[];
  accent: string;
  highlightedIndex?: number | null;
}) {
  return (
    <div className="border-border/70 grid gap-3 rounded-[1.25rem] border bg-white/75 p-3 lg:grid-cols-[120px_1fr] lg:items-center dark:bg-white/5">
      <div
        className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
        style={{ background: `${accent}1A`, color: accent }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
        {label}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {items.map((item, index) => (
          <div key={`${label}-${item}`} className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium"
              style={{
                borderColor: index === highlightedIndex ? accent : 'var(--border)',
                background: index === highlightedIndex ? `${accent}14` : 'var(--card)',
                color: index === highlightedIndex ? accent : 'var(--foreground)',
              }}
            >
              {findLibraryIconId(item) ? (
                <SvglLibraryIcon id={findLibraryIconId(item)!} size={16} className="h-4 w-4" />
              ) : null}
              {item}
            </span>
            {index < items.length - 1 ? <span className="bg-border h-px w-5" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const locale = useSyncExternalStore<HomeLocale>(
    subscribeToLocaleChange,
    getPreferredLocale,
    () => 'en',
  );
  const copy = getRoadmapPageCopy(locale);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<RoadmapId>(defaultRoadmapId);
  const detailRef = useRef<HTMLElement>(null);
  const catalogRef = useRef<HTMLElement>(null);
  const shouldScrollToDetailRef = useRef(false);

  const activeRoadmapId = roadmapCatalog.some((roadmap) => roadmap.id === selectedRoadmapId)
    ? selectedRoadmapId
    : defaultRoadmapId;
  const selectedRoadmap = getRoadmapDocument(activeRoadmapId);
  const selectedContent = selectedRoadmap.locales[locale];
  const otherRoadmapId = activeRoadmapId === 'react' ? 'nestjs' : 'react';
  const otherRoadmap = getRoadmapDocument(otherRoadmapId);
  const otherContent = otherRoadmap.locales[locale];
  const totalMilestones = roadmapCatalog.reduce(
    (total, roadmap) => total + roadmap.totals.milestones,
    0,
  );
  const totalQuestions = roadmapCatalog.reduce(
    (total, roadmap) => total + roadmap.totals.questions,
    0,
  );

  useEffect(() => {
    if (!shouldScrollToDetailRef.current) {
      return;
    }

    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    shouldScrollToDetailRef.current = false;
  }, [selectedRoadmapId]);

  const handleSelectRoadmap = (roadmapId: RoadmapId) => {
    if (roadmapId === activeRoadmapId) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    shouldScrollToDetailRef.current = true;
    startTransition(() => setSelectedRoadmapId(roadmapId));
  };

  const statItems = [
    { icon: BookOpen, value: roadmapCatalog.length.toString(), label: copy.hero.stats.roadmaps },
    { icon: Languages, value: homeLocales.length.toString(), label: copy.hero.stats.locales },
    { icon: Workflow, value: totalMilestones.toString(), label: copy.hero.stats.milestones },
    { icon: Layers3, value: `${totalQuestions}+`, label: copy.hero.stats.questions },
  ];

  return (
    <main className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <section className="relative overflow-hidden px-4 pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-16 left-[6%] h-64 w-64 rounded-full bg-[#8BD63F]/14 blur-3xl" />
          <div className="absolute top-24 right-[7%] h-80 w-80 rounded-full bg-[#59A6FF]/14 blur-3xl" />
          <div className="absolute bottom-6 left-1/3 h-72 w-72 rounded-full bg-[#FF7A7A]/10 blur-3xl" />
        </div>

        <div className="editorial-grid relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div {...fadeUp(0)} className="space-y-8">
            <div className="space-y-4">
              <LanguageSwitcher
                currentLocale={locale}
                locales={homeLocales}
                onChange={setPreferredLocale}
                label={copy.localeLabel}
                className="w-fit md:hidden"
              />

              <div className="tag-chip inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                {copy.hero.badge}
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl leading-[0.96] font-black tracking-[-0.07em] text-[#071B3A] md:text-7xl dark:text-[#F5F0EA]">
                {copy.hero.title}
              </h1>

              <p className="text-muted-foreground max-w-2xl text-lg leading-8 md:text-xl">
                {copy.hero.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
              >
                {copy.hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="border-border hover:bg-muted inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold transition-colors"
              >
                {copy.hero.secondaryCta}
              </button>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.12)}>
            <div className="paper-card rounded-[2rem] border border-white/60 p-5 shadow-[0_24px_80px_rgba(15,68,122,0.12)] md:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#071B3A] dark:text-[#F5F0EA]">
                    {copy.hero.previewTitle}
                  </p>
                  <p className="text-muted-foreground mt-1 max-w-lg text-sm leading-6">
                    {copy.hero.previewDescription}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <PreviewRailRow
                  label={selectedContent.track}
                  items={selectedContent.previewNodes}
                  accent={selectedRoadmap.theme.accent}
                />
                <PreviewRailRow
                  label={otherContent.track}
                  items={otherContent.previewNodes}
                  accent={otherRoadmap.theme.accent}
                />
                <PreviewRailRow
                  label={copy.hero.practiceRow.label}
                  items={copy.hero.practiceRow.items}
                  accent="#FF9A4A"
                  highlightedIndex={null}
                />
                <PreviewRailRow
                  label={copy.hero.deliveryRow.label}
                  items={copy.hero.deliveryRow.items}
                  accent="#8BD63F"
                  highlightedIndex={null}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="editorial-grid">
          <div className="paper-card grid gap-4 rounded-[1.75rem] p-5 md:grid-cols-4 md:p-6">
            {statItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  {...fadeUp(index * 0.05)}
                  className="border-border/70 flex items-center gap-3 rounded-[1.25rem] border bg-white/70 px-4 py-4 dark:bg-white/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8BD63F]/14 text-[#0F447A]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#071B3A] dark:text-[#F5F0EA]">
                      {item.value}
                    </div>
                    <div className="text-muted-foreground text-sm">{item.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={catalogRef} className="scroll-mt-32 px-4 pb-12">
        <div className="editorial-grid">
          <motion.div {...fadeUp(0)} className="mb-8 max-w-3xl space-y-3">
            <p className="text-sm font-semibold tracking-[0.16em] text-[#79C700] uppercase">
              {copy.catalog.eyebrow}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-[#071B3A] md:text-4xl dark:text-[#F5F0EA]">
              {copy.catalog.title}
            </h2>
            <p className="text-muted-foreground text-base leading-7">{copy.catalog.description}</p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {roadmapCatalog.map((roadmap, index) => {
              const roadmapCopy = roadmap.locales[locale];
              const isSelected = roadmap.id === activeRoadmapId;

              return (
                <motion.button
                  key={roadmap.id}
                  type="button"
                  {...fadeUp(index * 0.08)}
                  onClick={() => handleSelectRoadmap(roadmap.id)}
                  className="paper-card paper-card-hover rounded-[1.9rem] p-6 text-left"
                  style={{
                    borderColor: isSelected ? roadmap.theme.border : undefined,
                    boxShadow: isSelected ? `0 18px 48px ${roadmap.theme.glow}` : undefined,
                    background: isSelected
                      ? `linear-gradient(180deg, ${roadmap.theme.soft} 0%, color-mix(in srgb, var(--card) 92%, white 8%) 100%)`
                      : undefined,
                  }}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-[1.25rem]"
                        style={{ background: roadmap.theme.soft, color: roadmap.theme.accent }}
                      >
                        <RoadmapIcon roadmapId={roadmap.id} className="h-7 w-7" />
                      </div>

                      <div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: roadmap.theme.accent }}
                        >
                          {roadmapCopy.role}
                        </div>
                        <h3 className="mt-1 text-2xl font-bold text-[#071B3A] dark:text-[#F5F0EA]">
                          {roadmapCopy.shortName}
                        </h3>
                      </div>
                    </div>

                    <div
                      className="rounded-full border px-3 py-1 text-xs font-semibold"
                      style={{
                        borderColor: isSelected ? roadmap.theme.border : 'var(--border)',
                        background: isSelected ? roadmap.theme.soft : 'transparent',
                        color: isSelected ? roadmap.theme.accent : 'var(--muted-foreground)',
                      }}
                    >
                      {isSelected ? copy.catalog.selected : roadmapCopy.level}
                    </div>
                  </div>

                  <p className="text-muted-foreground min-h-[84px] text-base leading-7">
                    {roadmapCopy.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {roadmapCopy.skills.map((skill) => (
                      <span
                        key={`${roadmap.id}-${skill}`}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                        style={{
                          borderColor: roadmap.theme.border,
                          background: roadmap.theme.soft,
                          color: roadmap.theme.accent,
                        }}
                      >
                        {findLibraryIconId(skill) ? (
                          <SvglLibraryIcon
                            id={findLibraryIconId(skill)!}
                            size={14}
                            className="h-3.5 w-3.5"
                          />
                        ) : null}
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    {getRoadmapLibraryIconIds(roadmap.id).map((iconId) => (
                      <div
                        key={`${roadmap.id}-${iconId}`}
                        className="border-border/70 flex h-10 w-10 items-center justify-center rounded-2xl border bg-white/80 shadow-sm dark:bg-white/5"
                      >
                        <SvglLibraryIcon id={iconId} size={20} className="h-5 w-5" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      roadmapCopy.durationText,
                      roadmapCopy.topicCountText,
                      roadmapCopy.questionCountText,
                    ].map((stat) => (
                      <div
                        key={stat}
                        className="border-border/70 rounded-2xl border bg-white/75 px-4 py-3 text-sm font-medium dark:bg-white/5"
                      >
                        {stat}
                      </div>
                    ))}
                  </div>

                  <div
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: roadmap.theme.accent }}
                  >
                    {copy.catalog.action}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </motion.button>
              );
            })}

            <motion.div
              {...fadeUp(0.16)}
              className="paper-card rounded-[1.9rem] border border-dashed p-6 text-left"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#8BD63F]/14 text-[#0F447A]">
                    <Workflow className="h-7 w-7" />
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-[#79C700]">
                      {copy.catalog.comingSoon}
                    </div>
                    <h3 className="mt-1 text-2xl font-bold text-[#071B3A] dark:text-[#F5F0EA]">
                      {copy.catalog.fullStackCard.title}
                    </h3>
                  </div>
                </div>

                <div className="text-muted-foreground rounded-full border border-dashed px-3 py-1 text-xs font-semibold">
                  {copy.catalog.fullStackCard.status}
                </div>
              </div>

              <p className="text-muted-foreground min-h-[84px] text-base leading-7">
                {copy.catalog.fullStackCard.summary}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {copy.catalog.fullStackCard.items.map((item) => (
                  <span
                    key={`fullstack-${item}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[#8BD63F]/30 bg-[#8BD63F]/10 px-3 py-1 text-xs font-semibold text-[#0F447A]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#79C700]">
                {copy.catalog.fullStackCard.action}
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section ref={detailRef} className="scroll-mt-32 px-4 pb-16">
        <div className="editorial-grid">
          <div>
            <ClassicRoadmapJourney
              key={activeRoadmapId}
              roadmapId={activeRoadmapId}
              roadmap={selectedRoadmap}
              content={selectedContent}
              copy={copy}
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="editorial-grid">
          <motion.div
            {...fadeUp(0)}
            className="overflow-hidden rounded-[2rem] border border-[#8BD63F]/30 px-6 py-8 md:px-8 md:py-10"
            style={{
              background:
                'linear-gradient(135deg, rgba(139,214,63,0.12) 0%, rgba(89,166,255,0.08) 52%, rgba(255,122,122,0.08) 100%)',
            }}
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#8BD63F]/35 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#0F447A] dark:bg-white/10">
                  <Rocket className="h-3.5 w-3.5" />
                  DiCodeWeb
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-[#071B3A] dark:text-[#F5F0EA]">
                  {copy.cta.title}
                </h2>
                <p className="text-muted-foreground max-w-3xl text-base leading-7">
                  {copy.cta.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                  style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
                >
                  {copy.cta.primary}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  href="/questions"
                  className="border-border hover:bg-muted inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors"
                >
                  {copy.cta.secondary}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
