import { SkillChip } from "@/components/role-map/library-icon";
import { StageBar } from "@/components/role-map/stage-bar";
import type { RoleMap } from "@/lib/content/role-maps";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export function RoleRow({ roleMap, compact = false }: { roleMap: RoleMap; compact?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("roleMap");

  return (
    <article
      className="group relative grid gap-5 border-t border-line py-7 first:border-t-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-center lg:gap-12"
      style={{ "--accent": roleMap.accent } as React.CSSProperties}
    >
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-xl font-bold tracking-[-0.025em] text-ink transition-colors group-hover:text-[var(--accent)] md:text-2xl">
            <Link href={`/${locale}/roadmap/${roleMap.id}`} className="after:absolute after:inset-0">
              {roleMap.name}
            </Link>
          </h3>
          {roleMap.isPrimary ? (
            <span className="rounded-full border border-[var(--accent)]/40 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
              {t("primary")}
            </span>
          ) : null}
        </div>
        <p className={cn("mt-1.5 leading-7 text-soft", compact && "line-clamp-2")}>{roleMap.tagline}</p>
      </div>

      <div>
        <StageBar stages={roleMap.stages} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="text-sm text-soft tabular-nums">
            {t("stages", { count: roleMap.totals.stages })}, {t("topics", { count: roleMap.totals.topics })},{" "}
            {t("weeks", { count: roleMap.totals.weeks })}
          </p>
          {!compact ? (
            <ul className="flex flex-wrap gap-1.5">
              {roleMap.ecosystem.slice(0, 4).map((tool) => (
                <li key={tool}>
                  <SkillChip label={tool} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}
