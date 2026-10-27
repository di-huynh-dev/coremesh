import { locales } from "@/intl.config";
import { formatPostDate, isBlogLocale } from "@/lib/content/text";
import { ogSize, renderPostOgImage } from "@/lib/og-image";
import { SITE_NAME } from "@/lib/site";
import { getAllPosts, getPostBySlug } from "@repo/content/posts";
import { getTranslations } from "next-intl/server";

export const alt = `${SITE_NAME} article`;
export const size = ogSize;
export const contentType = "image/png";

// Image routes don't inherit the page's params: one card per published post and locale.
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getAllPosts(locale).map((post) => ({ locale, slug: post.slug })),
  );
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const post = getPostBySlug(slug, locale);
  const [tTopics, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "topics" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  return renderPostOgImage({
    title: post.title,
    topic: post.topic,
    topicTitle: tTopics(`${post.topic}.title`),
    meta: `${formatPostDate(post.date, locale, "long")} · ${tCommon("minRead", { minutes: post.readingTime })}`,
    tags: post.tags,
  });
}
