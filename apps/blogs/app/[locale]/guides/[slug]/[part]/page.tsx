import { CodeCopy } from "@/components/blog/code-copy";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { SourceNote } from "@/components/guides/source-note";
import { GUIDES_SOURCE, getGuidePart, getGuides } from "@/lib/content/guides";
import { isBlogLocale } from "@/lib/content/text";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface GuidePartPageProps {
  params: Promise<{ locale: string; slug: string; part: string }>;
}

export function generateStaticParams() {
  return getGuides().flatMap((guide) =>
    guide.parts.map((part) => ({ slug: guide.slug, part: part.slug })),
  );
}

export async function generateMetadata({ params }: GuidePartPageProps): Promise<Metadata> {
  const { locale, slug, part } = await params;
  const data = getGuidePart(slug, part, locale);
  if (!data) return { title: "Not found" };
  return pageMetadata({
    locale: isBlogLocale(locale) ? locale : "en",
    path: `/guides/${data.guide.slug}/${data.part.slug}`,
    title: `${data.part.title} · ${data.guide.title}`,
    description: data.part.description || data.guide.description,
    // Republished content: point search engines at the original to avoid duplicate-content issues.
    canonical: `${GUIDES_SOURCE.url}/${data.guide.slug}/${data.part.slug}`,
  });
}

export default async function GuidePartPage({ params }: GuidePartPageProps) {
  const { locale, slug, part } = await params;
  setRequestLocale(locale);
  const data = getGuidePart(slug, part, locale);
  if (!data) notFound();

  const { guide, index, previous, next, content } = data;
  const t = await getTranslations({ locale, namespace: "guides" });
  const base = `/${locale}/guides/${guide.slug}`;

  const chapterList = (
    <ol className="space-y-0.5 border-l border-line">
      {guide.parts.map((item, i) => (
        <li key={item.slug}>
          <Link
            href={`${base}/${item.slug}`}
            lang={locale}
            aria-current={i === index ? "page" : undefined}
            className={cn(
              "-ml-px flex gap-2.5 border-l-2 py-1.5 pl-3 text-[0.82rem] leading-snug transition-colors",
              i === index
                ? "border-cobalt font-medium text-ink"
                : i < index
                  ? "border-transparent text-ink/65 hover:text-ink"
                  : "border-transparent text-soft hover:text-ink",
            )}
          >
            <span className="font-mono text-[0.7rem] text-faint">{String(i + 1).padStart(2, "0")}</span>
            {item.title}
          </Link>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <ReadingProgress targetId="guide-body" />

      <div className="wrap grid gap-10 pt-10 md:pt-14 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,720px)_200px] xl:gap-12">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6" aria-label={t("chaptersTitle")}>
            <Link href={base} lang={locale} className="block text-sm font-semibold text-ink hover:text-cobalt">
              {guide.title}
            </Link>
            <p className="mt-1 mb-4 font-mono text-[0.7rem] text-faint">
              {t("chapterOf", { n: index + 1, total: guide.parts.length })}
            </p>
            {chapterList}
          </nav>
        </aside>

        <article className="min-w-0">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-faint">
            <Link href={`/${locale}/guides`} className="hover:text-ink">
              {t("breadcrumb")}
            </Link>
            <span className="mx-2">/</span>
            <Link href={base} lang={locale} className="hover:text-ink">
              {guide.title}
            </Link>
          </nav>

          <details className="mt-5 rounded-xl border border-line px-4 py-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-medium text-ink">
              {t("chapterOf", { n: index + 1, total: guide.parts.length })}
            </summary>
            <div className="mt-3">{chapterList}</div>
          </details>

          <p className="eyebrow mt-6">{t("chapterLabel", { n: index + 1 })}</p>
          <h1 lang={locale} className="mt-3 text-[2rem] leading-[1.15] font-bold tracking-[-0.035em] text-ink text-balance md:text-[2.6rem]">
            {data.part.title}
          </h1>
          {data.part.description ? (
            <p lang={locale} className="mt-4 text-lg leading-8 text-soft">
              {data.part.description}
            </p>
          ) : null}
          <p className="mt-4 font-mono text-xs text-faint">
            {t("minutes", { count: data.part.readingTime })}
          </p>

          <div
            id="guide-body"
            lang={locale}
            className="article-body mt-10 border-t border-line pt-10"
            // Vendored MIT content from content/guides, sanitized in lib/markdown.ts.
            dangerouslySetInnerHTML={{ __html: content.contentHtml }}
          />

          <nav className="mt-14 grid gap-4 sm:grid-cols-2" aria-label={t("chaptersTitle")}>
            {previous ? (
              <Link
                href={`${base}/${previous.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-line p-5 transition-colors hover:border-ink/25"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-faint">
                  <ArrowLeft className="size-3.5" /> {t("previous")}
                </span>
                <span lang={locale} className="font-semibold text-ink group-hover:text-cobalt">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <Link
                href={base}
                className="group flex flex-col gap-2 rounded-2xl border border-line p-5 transition-colors hover:border-ink/25"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-faint">
                  <ArrowLeft className="size-3.5" /> {t("backToGuide")}
                </span>
                <span lang={locale} className="font-semibold text-ink group-hover:text-cobalt">
                  {guide.title}
                </span>
              </Link>
            )}
            {next ? (
              <Link
                href={`${base}/${next.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-line p-5 transition-colors hover:border-ink/25 sm:items-end sm:text-right"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-faint">
                  {t("next")} <ArrowRight className="size-3.5" />
                </span>
                <span lang={locale} className="font-semibold text-ink group-hover:text-cobalt">
                  {next.title}
                </span>
              </Link>
            ) : (
              <Link
                href={`/${locale}/guides`}
                className="group flex flex-col gap-2 rounded-2xl border border-cobalt/30 bg-cobalt-soft p-5 sm:items-end sm:text-right"
              >
                <span className="font-mono text-xs text-soft">{t("finished")}</span>
                <span className="font-semibold text-ink group-hover:text-cobalt">
                  {t("allGuides")} →
                </span>
              </Link>
            )}
          </nav>

          <SourceNote
            namespace="guides"
            originalUrl={`${GUIDES_SOURCE.url}/${guide.slug}/${data.part.slug}`}
            className="mt-10 border-t border-line pt-6"
          />
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <TableOfContents headings={content.headings} />
          </div>
        </aside>
      </div>

      <CodeCopy targetId="guide-body" label={t("copy")} copiedLabel={t("copied")} />
    </>
  );
}
