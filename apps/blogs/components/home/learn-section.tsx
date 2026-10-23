import { SectionHeading } from "@/components/home/section-heading";
import { TOOL_ICON_COMPONENTS } from "@/components/tools/tool-icons";
import type { BlogLocale } from "@/lib/content/types";
import type { GuideSummary } from "@/lib/content/guides";
import { TOOLS } from "@/lib/content/tools";
import { useTranslations } from "next-intl";
import Link from "next/link";

/** Home-page teaser for the guides library and the browser tools. */
export function LearnSection({ guides, locale }: { guides: GuideSummary[]; locale: BlogLocale }) {
  const t = useTranslations("guides");
  const tTools = useTranslations("tools");
  const tCommon = useTranslations("common");

  return (
    <div className="wrap grid gap-16 pt-20 md:pt-28 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14">
      <section aria-labelledby="home-guides" className="min-w-0">
        <SectionHeading
          id="home-guides"
          title={t("home.title")}
          subtitle={t("home.subtitle")}
          action={{ href: `/${locale}/guides`, label: tCommon("viewAll") }}
        />
        <ol className="border-t border-line">
          {guides.slice(0, 6).map((guide, index) => (
            <li key={guide.slug} className="border-b border-line">
              <Link
                href={`/${locale}/guides/${guide.slug}`}
                className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-3 py-4"
              >
                <span className="font-mono text-xs text-cobalt">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span lang={locale} className="block truncate font-semibold text-ink transition-colors group-hover:text-cobalt">
                    {guide.title}
                  </span>
                  <span className="font-mono text-[0.7rem] tracking-wider text-faint uppercase">
                    {guide.category.name}
                  </span>
                </span>
                <span className="font-mono text-xs whitespace-nowrap text-faint">
                  {t("chapters", { count: guide.parts.length })}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="home-tools" className="min-w-0">
        <SectionHeading
          id="home-tools"
          title={tTools("home.title")}
          subtitle={tTools("home.subtitle")}
          action={{ href: `/${locale}/tools`, label: tCommon("viewAll") }}
        />
        <ul className="grid grid-cols-2 gap-2">
          {TOOLS.map((tool) => {
            const Icon = TOOL_ICON_COMPONENTS[tool.icon];
            return (
              <li key={tool.slug}>
                <Link
                  href={`/${locale}/tools/${tool.slug}`}
                  className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:border-cobalt/40 hover:text-cobalt"
                >
                  <Icon aria-hidden strokeWidth={1.7} className="glyph size-4 shrink-0 text-cobalt" />
                  <span className="truncate">{tool.copy[locale].shortTitle}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
