import { MotionController } from "@/components/motion/motion-controller";
import { getAllTags } from "@/lib/content/tags";
import { isBlogLocale } from "@/lib/content/text";
import { pageMetadata } from "@/lib/seo";
import { topicAccent } from "@/lib/topic-style";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

interface TagsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TagsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "tags" });

  return pageMetadata({ locale, path: "/tags", title: t("title"), description: t("lead") });
}

export default async function TagsIndexPage({ params }: TagsPageProps) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "tags" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const tags = getAllTags(locale);

  return (
    <div className="wrap pt-10 md:pt-14">
      <header className="mb-12 border-b border-line pb-10" data-fx-head="page">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-faint" data-fx="item">
          <Link href={`/${locale}`} className="hover:text-ink">
            {tPost("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-soft">{t("breadcrumb")}</span>
        </nav>
        <h1
          data-fx="line"
          className="mt-4 text-4xl font-bold tracking-[-0.035em] text-ink md:text-5xl"
        >
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-soft" data-fx="item">
          {t("lead")}
        </p>
      </header>

      <ul className="flex flex-wrap gap-3" data-fx-skip>
        {tags.map((item) => (
          <li key={item.tag} style={topicAccent(item.topic)}>
            <Link
              href={`/${locale}/tags/${item.tag}`}
              className="group inline-flex items-baseline gap-2 rounded-full border border-line px-4 py-2 transition-colors hover:border-[var(--accent)]"
            >
              <span className="font-mono text-sm text-ink transition-colors group-hover:text-[var(--accent)]">
                #{item.tag}
              </span>
              <span className="font-mono text-xs text-faint">{t("posts", { count: item.posts.length })}</span>
            </Link>
          </li>
        ))}
      </ul>

      <MotionController />
    </div>
  );
}
