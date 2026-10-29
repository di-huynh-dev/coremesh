import { ExploreView } from "@/components/blog/explore-view";
import { PostRow } from "@/components/blog/post-row";
import { MotionController } from "@/components/motion/motion-controller";
import { getPostSummaries } from "@repo/content/posts";
import { isBlogLocale } from "@/lib/content/text";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "explore" });

  return pageMetadata({ locale, path: "/blog", title: t("title"), description: t("subtitle") });
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "explore" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const posts = getPostSummaries(locale);

  return (
    <div className="wrap pt-10 md:pt-14">
      <header className="mb-10 border-b border-line pb-10 md:mb-12" data-fx-head="page">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-faint" data-fx="item">
          <Link href={`/${locale}`} className="hover:text-ink">
            {tPost("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-soft">{t("title")}</span>
        </nav>
        <h1 data-fx="line" className="mt-4 text-4xl font-bold tracking-[-0.035em] text-ink md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-soft" data-fx="item">
          {t("subtitle")}
        </p>
        <Link href={`/${locale}/series`} className="arrow-link mt-5" data-fx="item">
          {t("seriesLink")}
        </Link>
      </header>

      {/* useSearchParams makes ExploreView client-only under static rendering;
          the fallback keeps the full, unfiltered list in the HTML. */}
      <Suspense
        fallback={
          <div>
            {posts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
        }
      >
        <ExploreView posts={posts} />
      </Suspense>
      <MotionController />
    </div>
  );
}
