"use client";

import { BookOpen, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";

export interface GuideCardData {
  slug: string;
  title: string;
  description: string;
  category: { name: string; slug: string };
  chapters: number;
  readingTime: number;
  tags: string[];
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d");
}

function GuideCard({ guide, index }: { guide: GuideCardData; index: number }) {
  const locale = useLocale();
  const t = useTranslations("guides");

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-background p-6 transition-colors hover:border-ink/25">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-cobalt">{String(index + 1).padStart(2, "0")}</span>
        <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.68rem] tracking-wider text-soft uppercase">
          {guide.category.name}
        </span>
      </div>
      <h3 lang={locale} className="mt-5 text-xl font-semibold tracking-[-0.02em] text-ink transition-colors group-hover:text-cobalt">
        <Link href={`/${locale}/guides/${guide.slug}`} className="after:absolute after:inset-0">
          {guide.title}
        </Link>
      </h3>
      <p lang={locale} className="mt-2 line-clamp-3 text-[0.95rem] leading-7 text-soft">
        {guide.description}
      </p>
      <p className="mt-auto flex items-center gap-3 pt-5 font-mono text-xs text-faint">
        <BookOpen aria-hidden className="glyph size-4" />
        <span>{t("chapters", { count: guide.chapters })}</span>
        <span aria-hidden>·</span>
        <span>{t("minutes", { count: guide.readingTime })}</span>
      </p>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-cobalt transition-transform duration-500 ease-[var(--ease-site)] group-hover:scale-x-100"
      />
    </article>
  );
}

export function GuidesIndex({
  guides,
  categories,
}: {
  guides: GuideCardData[];
  categories: { name: string; slug: string; count: number }[];
}) {
  const t = useTranslations("guides");
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return guides.filter((guide) => {
      if (category && guide.category.slug !== category) return false;
      if (terms.length === 0) return true;
      const haystack = normalize(
        [guide.title, guide.description, guide.category.name, ...guide.tags].join(" "),
      );
      return terms.every((term) => haystack.includes(term));
    });
  }, [guides, category, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("title")}>
          <button type="button" className="chip" aria-pressed={category === null} onClick={() => setCategory(null)}>
            {t("all")}
            <span className="chip-count">{guides.length}</span>
          </button>
          {categories.map((item) => (
            <button
              key={item.slug}
              type="button"
              className="chip"
              aria-pressed={category === item.slug}
              onClick={() => setCategory(category === item.slug ? null : item.slug)}
            >
              {item.name}
              <span className="chip-count">{item.count}</span>
            </button>
          ))}
        </div>
        <label className="relative block lg:w-72">
          <span className="sr-only">{t("search")}</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search")}
            className="h-10 w-full rounded-full border border-line bg-background pr-3 pl-10 text-sm text-ink outline-none placeholder:text-faint focus:border-cobalt focus:ring-3 focus:ring-cobalt/15"
          />
        </label>
      </div>

      <p className="mt-6 font-mono text-xs text-soft" aria-live="polite">
        {t("results", { count: visible.length })}
      </p>

      {visible.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} index={guides.indexOf(guide)} />
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-line px-6 py-14 text-center text-soft">
          {t("empty")}
        </p>
      )}
    </div>
  );
}
