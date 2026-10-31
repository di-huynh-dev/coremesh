import { PostRow } from "@/components/blog/post-row";
import { MotionController } from "@/components/motion/motion-controller";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllTags, getRelatedTags, getTag } from "@/lib/content/tags";
import { formatPostDate, isBlogLocale } from "@/lib/content/text";
import { authorJsonLd, contentLanguage, pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { topicAccent } from "@/lib/topic-style";
import { locales } from "@/intl.config";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TagDetailProps {
  params: Promise<{ locale: string; tag: string }>;
}

// Only tags with enough posts in the locale get a page (see lib/content/tags.ts).
export function generateStaticParams({ params }: { params: { locale: string } }) {
  return getAllTags(isBlogLocale(params.locale) ? params.locale : "en").map((item) => ({
    tag: item.tag,
  }));
}

async function resolve(params: TagDetailProps["params"]) {
  const { tag, locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  return { locale, tag: getTag(decodeURIComponent(tag), locale) };
}

export async function generateMetadata({ params }: TagDetailProps): Promise<Metadata> {
  const { locale, tag } = await resolve(params);
  if (!tag) return { title: "Not found" };
  const t = await getTranslations({ locale, namespace: "tags" });

  return pageMetadata({
    locale,
    path: `/tags/${tag.tag}`,
    title: t("tagTitle", { tag: tag.tag }),
    description: t("tagDescription", { tag: tag.tag, count: tag.posts.length }),
    keywords: [tag.tag, ...getRelatedTags(tag, locale, 8)],
    available: locales.filter((l) => getTag(tag.tag, l) !== undefined),
  });
}

export default async function TagDetailPage({ params }: TagDetailProps) {
  const { locale, tag } = await resolve(params);
  if (!tag) notFound();

  const t = await getTranslations({ locale, namespace: "tags" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const tTopics = await getTranslations({ locale, namespace: "topics" });
  const related = getRelatedTags(tag, locale);

  const url = `${SITE_URL}/${locale}/tags/${tag.tag}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#tag`,
    url,
    name: t("tagTitle", { tag: tag.tag }),
    description: t("tagDescription", { tag: tag.tag, count: tag.posts.length }),
    inLanguage: contentLanguage[locale],
    author: { "@id": authorJsonLd["@id"] },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tag.posts.length,
      itemListElement: tag.posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/${locale}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="wrap pt-10 md:pt-14" style={topicAccent(tag.topic)}>
      <JsonLd data={jsonLd} />

      <header className="max-w-3xl" data-fx-head="page">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-faint" data-fx="item">
          <Link href={`/${locale}`} className="hover:text-ink">
            {tPost("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/tags`} className="hover:text-ink">
            {t("breadcrumb")}
          </Link>
        </nav>
        <p className="eyebrow mt-6 before:bg-[var(--accent)]" data-fx="item">
          {tTopics(`${tag.topic}.title`)}
        </p>
        <h1
          data-fx="line"
          className="mt-3 font-mono text-4xl font-bold tracking-[-0.035em] text-balance text-ink md:text-5xl"
        >
          #{tag.tag}
        </h1>
        <p className="mt-4 text-lg leading-8 text-soft" data-fx="item">
          {t("tagDescription", { tag: tag.tag, count: tag.posts.length })}
        </p>
        <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-faint" data-fx="item">
          <span>{t("posts", { count: tag.posts.length })}</span>
          <span aria-hidden>·</span>
          <span>{t("updated", { date: formatPostDate(tag.updated, locale) })}</span>
        </p>
      </header>

      <section aria-labelledby="tag-posts" className="mt-10 max-w-4xl border-t border-line">
        <h2 id="tag-posts" className="sr-only">
          {t("postsTitle")}
        </h2>
        {tag.posts.map((post) => (
          <PostRow key={post.slug} post={post} />
        ))}
      </section>

      {related.length > 0 ? (
        <section aria-labelledby="related-tags" className="pt-16">
          <div className="flex items-end justify-between border-b border-line pb-4">
            <h2 id="related-tags" className="text-2xl font-bold tracking-[-0.03em] text-ink">
              {t("related")}
            </h2>
            <Link href={`/${locale}/tags`} className="arrow-link">
              {t("all")}
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {related.map((name) => (
              <li key={name}>
                <Link
                  href={`/${locale}/tags/${name}`}
                  className="rounded-full border border-line px-3 py-1 font-mono text-xs text-soft transition-colors hover:border-ink/30 hover:text-ink"
                >
                  #{name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <MotionController />
    </div>
  );
}
