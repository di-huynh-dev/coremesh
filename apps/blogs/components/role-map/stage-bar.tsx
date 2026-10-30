import type { RolePhase, RoleStage } from "@/lib/content/role-maps";
import { cn } from "@/lib/utils";

export const PHASE_OPACITY: Record<RolePhase, number> = {
  foundation: 0.35,
  core: 0.65,
  advanced: 1,
};

export function StageBar({
  stages,
  className,
  linkBase,
}: {
  stages: RoleStage[];
  className?: string;
  linkBase?: string;
}) {
  return (
    <ol className={cn("flex h-3 gap-0.5", className)}>
      {stages.map((stage) => {
        const segmentClass = "block h-full w-full rounded-[2px] bg-[var(--accent)]";
        const segmentStyle = { opacity: PHASE_OPACITY[stage.phase] };

        return (
          <li key={stage.id} className="flex min-w-1 basis-0" style={{ flexGrow: stage.weeks }}>
            {linkBase !== undefined ? (
              <a
                href={`${linkBase}#stage-${stage.id}`}
                title={stage.title}
                aria-label={stage.title}
                className={cn(segmentClass, "transition-transform hover:scale-y-150")}
                style={segmentStyle}
              />
            ) : (
              <span title={stage.title} className={segmentClass} style={segmentStyle} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function PhaseLegend({ labels }: { labels: Record<RolePhase, string> }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-soft">
      {(Object.keys(PHASE_OPACITY) as RolePhase[]).map((phase) => (
        <li key={phase} className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-6 rounded-[2px] bg-[var(--accent,var(--cobalt))]"
            style={{ opacity: PHASE_OPACITY[phase] }}
          />
          {labels[phase]}
        </li>
      ))}
    </ul>
  );
}
