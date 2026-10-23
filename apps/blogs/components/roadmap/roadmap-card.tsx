import { LibraryIcon, SkillChip } from "@/components/roadmap/library-icon";
import { ROADMAP_ECOSYSTEMS } from "@/lib/library-icons";
import { type Roadmap } from "@/lib/content/roadmaps";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export function RoadmapCard({
  roadmap,
  index,
  compact = false,
}: {
  roadmap: Roadmap;
  index: number;
  compact?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("roadmap");
  const [mainIcon] = ROADMAP_ECOSYSTEMS[roadmap.id];

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-background p-6 transition-colors hover:border-ink/25 md:p-8"
      style={{ "--accent": roadmap.accent } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-sm font-medium text-[var(--accent)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        {mainIcon ? <LibraryIcon id={mainIcon} size={30} /> : null}
      </div>

      <p className="eyebrow mt-6 before:bg-[var(--accent)]">
        {roadmap.track} · {roadmap.role}
      </p>
      <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-ink transition-colors group-hover:text-[var(--accent)] md:text-[1.75rem]">
        <Link
          href={`/${locale}/roadmap/${roadmap.id}`}
          className="after:absolute after:inset-0"
        >
          {roadmap.name}
        </Link>
      </h3>
      <p className={cn("mt-3 leading-7 text-soft", compact && "line-clamp-3")}>
        {roadmap.summary}
      </p>

      <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-faint">
        <span>{t("stages", { count: roadmap.totals.milestones })}</span>
        <span aria-hidden>·</span>
        <span>{t("focusPoints", { count: roadmap.totals.topics })}</span>
        <span aria-hidden>·</span>
        <span>{t("practice", { count: roadmap.totals.questions })}</span>
      </p>

      {!compact ? (
        <ol className="mt-6 flex flex-wrap items-center gap-y-2" aria-label={t("skills")}>
          {roadmap.previewNodes.map((node, i) => (
            <li key={node} className="flex items-center">
              <SkillChip label={node} />
              {i < roadmap.previewNodes.length - 1 ? (
                <span aria-hidden className="h-px w-4 bg-line" />
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}

      <span className="arrow-link mt-auto pt-6 text-[var(--accent)]">{t("view")}</span>

      {/* Accent rule that sweeps in on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-500 ease-[var(--ease-site)] group-hover:scale-x-100"
      />
    </article>
  );
}
