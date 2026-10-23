import { TOOL_ICON_COMPONENTS } from "@/components/tools/tool-icons";
import type { BlogLocale } from "@/lib/content/types";
import type { ToolEntry } from "@/lib/content/tools";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function ToolCard({ tool, locale }: { tool: ToolEntry; locale: BlogLocale }) {
  const t = useTranslations("tools");
  const Icon = TOOL_ICON_COMPONENTS[tool.icon];
  const copy = tool.copy[locale];

  return (
    <article className="group relative flex flex-col rounded-2xl border border-line bg-background p-6 transition-colors hover:border-ink/25">
      <span className="flex size-11 items-center justify-center rounded-xl bg-cobalt-soft text-cobalt">
        <Icon aria-hidden strokeWidth={1.6} className="glyph size-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-ink transition-colors group-hover:text-cobalt">
        <Link href={`/${locale}/tools/${tool.slug}`} className="after:absolute after:inset-0">
          {copy.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-6 text-soft">{copy.tagline}</p>
      <span className="arrow-link mt-auto pt-5 text-sm">{t("open")}</span>
    </article>
  );
}
