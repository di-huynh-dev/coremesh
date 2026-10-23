import { PostActions } from "@/components/blog/post-actions";
import { PostRow } from "@/components/blog/post-row";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { TopicTag } from "@/components/blog/topic-tag";
import { AUTHOR } from "@/lib/site";
import { formatPostDate, isBlogLocale } from "@/lib/content/text";
import { CodeCopy } from "@/components/blog/code-copy";
import { mdxComponents } from "@/components/blog/mdx-components";
import { renderMdx } from "@/lib/content/mdx";
import { getAdjacentPosts, getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/content/posts";
import { type BlogPostSummary } from "@/lib/content/types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

interface BlogPostPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

async function resolve(params: BlogPostPageProps["params"]) {
  const { slug, locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  return { locale, post: getPostBySlug(slug, locale) };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, post } = await resolve(params);
  if (!post) return { title: "Not found" };

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: AUTHOR.name }],
    keywords: post.tags,
    alternates: {
      languages: {
        en: `/en/blog/${post.slug}`,
        vi: `/vi/blog/${post.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [AUTHOR.name],
      tags: post.tags,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

function AdjacentLink({
  post,
  label,
  direction,
  locale,
}: {
  post?: BlogPostSummary;
  label: string;
  direction: "newer" | "older";
  locale: string;
}) {
  if (!post) return <div className="hidden sm:block" />;

  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className={`group flex flex-col gap-2 rounded-2xl border border-line p-5 transition-colors hover:border-ink/25 ${direction === "older" ? "sm:items-end sm:text-right" : ""}`}
    >
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-faint">
        {direction === "newer" ? <ArrowLeft className="size-3.5" /> : null}
        {label}
        {direction === "older" ? <ArrowRight className="size-3.5" /> : null}
      </span>
      <span className="font-semibold text-ink group-hover:text-cobalt">
        {post.title}
      </span>
    </Link>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, post } = await resolve(params);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "post" });
  const tTopics = await getTranslations({ locale, namespace: "topics" });
  const tLevels = await getTranslations({ locale, namespace: "levels" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tGuides = await getTranslations({ locale, namespace: "guides" });
  const { newer, older } = getAdjacentPosts(post.slug, locale);
  const { content, headings } = await renderMdx(post.body, mdxComponents);
  const related = getRelatedPosts(post, locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    inLanguage: locale,
    author: { "@type": "Person", name: AUTHOR.name },
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <ReadingProgress targetId="article-body" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <article className="wrap pt-10 md:pt-14">
        <header className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-faint">
            <Link href={`/${locale}`} className="hover:text-ink">
              {t("breadcrumbHome")}
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/${locale}/blog`} className="hover:text-ink">
              {t("breadcrumbExplore")}
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/${locale}/blog?topic=${post.topic}`}
              className="hover:text-ink"
            >
              {tTopics(`${post.topic}.title`)}
            </Link>
          </nav>

          <ViewTransition name={`post-title-${post.slug}`} share="post-title" default="none">
            <h1 className="mt-5 text-[2.1rem] leading-[1.15] font-bold tracking-[-0.035em] text-ink text-balance md:text-5xl">
              {post.title}
            </h1>
          </ViewTransition>
          <p className="mt-5 text-lg leading-8 text-soft md:text-xl md:leading-9">
            {post.excerpt}
          </p>

          <div className="mt-8 flex flex-col gap-5 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={AUTHOR.avatar}
                alt=""
                width={44}
                height={44}
                className="size-11 rounded-full border border-line object-cover"
              />
              <div className="text-sm">
                <p className="font-semibold text-ink">{AUTHOR.name}</p>
                <p className="flex flex-wrap gap-x-2 text-soft">
                  <span>
                    {t("publishedOn")}{" "}
                    <time dateTime={post.date}>
                      {formatPostDate(post.date, locale, "long")}
                    </time>
                  </span>
                  <span aria-hidden>·</span>
                  <span>{tCommon("minRead", { minutes: post.readingTime })}</span>
                  {post.level ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>{tLevels(post.level)}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
            <PostActions title={post.title} content={post.content} />
          </div>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,720px)_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0">
            <div id="article-body" className="article-body">
              {content}
            </div>
            <CodeCopy targetId="article-body" label={tGuides("copy")} copiedLabel={tGuides("copied")} />

            <footer className="mt-14 space-y-10">
              {post.tags.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="eyebrow mr-2">{t("tags")}</span>
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/${locale}/blog?q=${encodeURIComponent(tag)}`}
                      className="rounded-full border border-line px-3 py-1 font-mono text-xs text-soft transition-colors hover:border-ink/30 hover:text-ink"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}

              <div className="flex items-start gap-4 rounded-2xl bg-paper p-6">
                <Image
                  src={AUTHOR.avatar}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-full border border-line object-cover"
                />
                <div>
                  <p className="font-semibold text-ink">{AUTHOR.name}</p>
                  <p className="mt-1 text-sm leading-6 text-soft">
                    {t("authorBio")}
                  </p>
                </div>
              </div>

              <nav className="grid gap-4 sm:grid-cols-2" aria-label={t("related")}>
                <AdjacentLink post={newer} label={t("newer")} direction="newer" locale={locale} />
                <AdjacentLink post={older} label={t("older")} direction="older" locale={locale} />
              </nav>
            </footer>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <TableOfContents headings={headings} />
              <div className="border-t border-line pt-6">
                <TopicTag topic={post.topic} />
              </div>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="wrap pt-20">
          <div className="flex items-end justify-between border-b border-line pb-4">
            <h2
              id="related-title"
              className="text-2xl font-bold tracking-[-0.03em] text-ink"
            >
              {t("related")}
            </h2>
            <Link href={`/${locale}/blog`} className="arrow-link">
              {t("backToExplore")}
            </Link>
          </div>
          {related.map((item) => (
            <PostRow key={item.slug} post={item} />
          ))}
        </section>
      ) : null}
    </>
  );
}
