import { cn } from "@/lib/utils";
import { Scale } from "lucide-react";
import { useTranslations } from "next-intl";

const SOURCE_URL = "https://devops-daily.com";
const LICENSE_URL = "https://github.com/The-DevOps-Daily/devops-daily/blob/main/LICENSE";

/** Attribution required by the MIT license of the republished guides and tools. */
export function SourceNote({
  namespace,
  originalUrl,
  className,
}: {
  namespace: "guides" | "tools";
  originalUrl?: string;
  className?: string;
}) {
  const t = useTranslations(namespace);
  const tGuides = useTranslations("guides");

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
