import { locales } from "@/intl.config";
import { isBlogLocale } from "@/lib/content/text";
import { BLOG_TOPICS } from "@/lib/content/types";
import { ogSize, renderSiteOgImage } from "@/lib/og-image";
import { SITE_TITLE } from "@/lib/site";
import { getTranslations } from "next-intl/server";

export const alt = SITE_TITLE;
export const size = ogSize;
export const contentType = "image/png";

// Image routes don't inherit the layout's params: list them so the cards render at build time.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const [tFooter, tTopics] = await Promise.all([
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "topics" }),
  ]);

  return renderSiteOgImage({
    description: tFooter("description"),
    topics: BLOG_TOPICS.map((topic) => ({ topic, title: tTopics(`${topic}.title`) })),
  });
}
