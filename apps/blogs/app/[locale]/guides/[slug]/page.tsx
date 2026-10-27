import { CodeCopy } from "@/components/blog/code-copy";
import { SourceNote } from "@/components/guides/source-note";
import { MotionController } from "@/components/motion/motion-controller";
import { formatPostDate, isBlogLocale } from "@/lib/content/text";
import { GUIDES_SOURCE, getGuide, getGuides } from "@/lib/content/guides";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface GuidePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return getGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuide(slug, locale);
  if (!guide) return { title: "Not found" };
  return pageMetadata({
    locale: isBlogLocale(locale) ? locale : "en",
    path: `/guides/${guide.slug}`,
    title: guide.title,
    description: guide.description,
    keywords: guide.tags,
    // Republished content: point search engines at the original to avoid duplicate-content issues.
    canonical: `${GUIDES_SOURCE.url}/${guide.slug}`,
  });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const guide = getGuide(slug, locale);
  if (!guide) notFound();

  const t = await getTranslations({ locale, namespace: "guides" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const first = guide.parts[0];

  return (
    <>
      <header className="on-dark relative overflow-hidden bg-night text-white">
        <div className="wrap relative py-14 md:py-20" data-fx-head="page">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-white/50" data-fx="item">
            <Link href={`/${locale}`} className="hover:text-white">
              {tPost("breadcrumbHome")}
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/${locale}/guides`} className="hover:text-white">
              {t("breadcrumb")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">{guide.category.name}</span>
          </nav>
          <p className="eyebrow mt-8" data-fx="item">
            {guide.category.name}
          </p>
          <h1
            lang={locale}
            data-fx="line"
            className="mt-4 max-w-3xl text-[2.4rem] leading-[1.08] font-bold tracking-[-0.035em] sm:text-6xl"
          >
            {guide.title}
          </h1>
          <p lang={locale} className="mt-5 max-w-3xl text-lg leading-8 text-white/70" data-fx="item">
            {guide.description}
          </p>
          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-white/55" data-fx="item">
            <span>{t("chapters", { count: guide.parts.length })}</span>
            <span aria-hidden>·</span>
            <span>{t("minutes", { count: guide.readingTime })}</span>
            <span aria-hidden>·</span>
            <span>
              {t("updated")} {formatPostDate(guide.updatedAt, locale)}
            </span>
          </p>
          {first ? (
            <div className="mt-8" data-fx="item">
              <Link href={`/${locale}/guides/${guide.slug}/${first.slug}`} className="btn btn-primary">
                {t("start")} <span aria-hidden className="btn-arrow">→</span>
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      <div className="wrap grid gap-12 pt-12 md:pt-16 lg:grid-cols-[minmax(0,720px)_minmax(0,1fr)] lg:gap-16">
        <div>
          <div
            id="guide-intro"
            lang={locale}
            className="article-body"
            // Vendored MIT content from content/guides, sanitized in lib/markdown.ts.
            dangerouslySetInnerHTML={{ __html: guide.intro.contentHtml }}
          />
          <SourceNote
            namespace="guides"
            originalUrl={`${GUIDES_SOURCE.url}/${guide.slug}`}
            className="mt-12 border-t border-line pt-6"
          />
        </div>

        <aside>
          <nav aria-labelledby="chapters-title" className="lg:sticky lg:top-24">
            <h2 id="chapters-title" className="eyebrow">
              {t("chaptersTitle")}
            </h2>
            <ol data-method data-fx-skip className="mt-5">
              {guide.parts.map((part, index) => (
                <li
                  key={part.slug}
                  className="step relative pb-5 pl-8 last:pb-0"
                  style={{ "--s": index * 0.3 } as React.CSSProperties}
                >
                  <span aria-hidden className="absolute top-1.5 left-0 font-mono text-xs text-cobalt">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={`/${locale}/guides/${guide.slug}/${part.slug}`}
                    lang={locale}
                    className="group block"
                  >
                    <span className="font-medium text-ink transition-colors group-hover:text-cobalt">
                      {part.title}
                    </span>
                    {part.description ? (
                      <span className="mt-0.5 line-clamp-2 block text-sm leading-6 text-soft">
                        {part.description}
                      </span>
                    ) : null}
                    <span className="mt-1 block font-mono text-[0.7rem] text-faint">
                      {t("minutes", { count: part.readingTime })}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>

      <CodeCopy targetId="guide-intro" label={t("copy")} copiedLabel={t("copied")} />
      <MotionController />
    </>
  );
}
