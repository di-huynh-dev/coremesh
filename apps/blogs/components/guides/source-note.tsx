import type { AdaptedGuideSource } from "@/lib/content/guides";
import { cn } from "@/lib/utils";
import { Scale } from "lucide-react";
import { useTranslations } from "next-intl";

const SOURCE_URL = "https://devops-daily.com";
const LICENSE_URL = "https://github.com/The-DevOps-Daily/devops-daily/blob/main/LICENSE";

export function SourceNote({
  namespace,
  originalUrl,
  adaptedFrom,
  className,
}: {
  namespace: "guides" | "tools";
  originalUrl?: string;
  adaptedFrom?: AdaptedGuideSource | null;
  className?: string;
}) {
  const t = useTranslations(namespace);
  const tGuides = useTranslations("guides");

  if (adaptedFrom) {
    return (
      <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-faint", className)}>
        <Scale aria-hidden className="size-3.5 shrink-0" />
        <span>
          {tGuides.rich("adaptedNote", {
            name: adaptedFrom.name,
            license: adaptedFrom.license,
            source: (chunks) => (
              <a href={adaptedFrom.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                {chunks}
              </a>
            ),
            licenseLink: (chunks) => (
              <a href={adaptedFrom.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                {chunks}
              </a>
            ),
          })}
        </span>
      </p>
    );
  }

  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-faint", className)}>
      <Scale aria-hidden className="size-3.5 shrink-0" />
      <span>
        {t.rich("sourceNote", {
          source: (chunks) => (
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
              {chunks}
            </a>
          ),
          license: (chunks) => (
            <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
              {chunks}
            </a>
          ),
        })}
      </span>
      {originalUrl ? (
        <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="arrow-link text-xs">
          {tGuides("viewOriginal")}
        </a>
      ) : null}
    </p>
  );
}
