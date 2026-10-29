import { SeriesLine } from "@/components/series/series-track";
import type { Series } from "@/lib/content/series";
import { topicAccent } from "@/lib/topic-style";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const PREVIEW_PARTS = 3;

export function SeriesCard({ series, index }: { series: Series; index: number }) {
  const locale = useLocale();
  const t = useTranslations("series");
  const tTopics = useTranslations("topics");
  const hidden = series.posts.length - PREVIEW_PARTS;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-background p-6 transition-colors hover:border-ink/25 md:p-7"
      style={topicAccent(series.topic)}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-sm font-medium text-[var(--accent)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="font-mono text-xs text-faint">
          {t("parts", { count: series.posts.length })} · {t("minutes", { count: series.readingTime })}
        </span>
      </div>

      <p className="eyebrow mt-5 before:bg-[var(--accent)]">{tTopics(`${series.topic}.title`)}</p>
      <h3 className="mt-2 text-xl font-bold tracking-[-0.025em] text-ink transition-colors group-hover:text-[var(--accent)] md:text-2xl">
        <Link href={`/${locale}/series/${series.id}`} className="after:absolute after:inset-0">
          {series.title}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 leading-7 text-soft">{series.description}</p>

      <SeriesLine posts={series.posts} className="mt-6" />

      <ol className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
        {series.posts.slice(0, PREVIEW_PARTS).map((post, part) => (
          <li key={post.slug} className="flex gap-3 text-ink/80">
            <span className="font-mono text-xs leading-5 text-faint">{part + 1}</span>
            <span className="truncate">{post.title}</span>
          </li>
        ))}
        {hidden > 0 ? (
          <li className="pl-6 font-mono text-xs text-faint">{t("moreParts", { count: hidden })}</li>
        ) : null}
      </ol>

      <span className="arrow-link mt-auto pt-6 text-[var(--accent)]">{t("view")}</span>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-500 ease-[var(--ease-site)] group-hover:scale-x-100"
      />
    </article>
  );
}
