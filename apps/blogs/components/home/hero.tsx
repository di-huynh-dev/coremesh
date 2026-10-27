import { AUTHOR } from "@/lib/site";
import { BLOG_TOPICS } from "@/lib/content/types";
import { type WritingMonth } from "@repo/content/posts";
import { topicStyles } from "@/lib/topic-style";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

interface HeroStats {
  firstYear: number;
  postCount: number;
  topicCount: number;
  tagCount: number;
  readingMinutes: number;
}

function WritingRhythm({ months }: { months: WritingMonth[] }) {
  const locale = useLocale();
  const t = useTranslations("home.rhythm");
  const tTopics = useTranslations("topics");
  const monthFormat = new Intl.DateTimeFormat(
    locale === "vi" ? "vi-VN" : "en-US",
    { month: "short", year: "numeric", timeZone: "UTC" },
  );

  // Running index of every bar, so the growth animation sweeps left to right.
  const barOffsets = months.reduce<number[]>(
    (acc, month, i) => [...acc, i === 0 ? 0 : acc[i - 1]! + months[i - 1]!.posts.length],
    [],
  );

  return (
    <figure
      className="mt-12 border-t border-white/10 pt-6"
      data-fx="fade"
      data-timeline
    >
      <figcaption className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="eyebrow">{t("title")}</span>
        <span className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/55">
          {BLOG_TOPICS.map((topic) => (
            <span key={topic} className="inline-flex items-center gap-1.5">
              <span className={cn("topic-dot", topicStyles[topic].dot)} />
              {tTopics(`${topic}.title`)}
            </span>
          ))}
        </span>
      </figcaption>

      <div className="mt-5 overflow-x-auto pb-1">
        <ol className="flex min-w-max items-end gap-[3px] sm:min-w-0">
          {months.map((month, index) => {
            const showYear = month.month === 0 || index === 0;
            const monthLabel = monthFormat.format(Date.UTC(month.year, month.month, 1));
            const label = t("postsIn", { count: month.posts.length, month: monthLabel });
            const firstBar = barOffsets[index]!;

            return (
              <li
                key={month.key}
                className="group relative flex w-4 flex-col items-center rounded-sm transition-colors hover:bg-white/[0.06] sm:w-auto sm:min-w-3 sm:flex-1"
                data-tip={month.posts.length > 0 ? t("count", { count: month.posts.length }) : t("none")}
                data-tip-meta={monthLabel}
                data-tip-rows={JSON.stringify(
                  month.posts.map((post) => ({
                    label: post.title,
                    color: `var(--topic-${post.topic})`,
                  })),
                )}
              >
                <div className="flex h-16 w-full flex-col-reverse gap-[3px]">
                  <span className="sr-only">{label}</span>
                  {month.posts.length === 0 ? (
                    <span className="h-[3px] w-full rounded-full bg-white/12" />
                  ) : (
                    month.posts.map((post, i) => (
                      <Link
                        key={post.slug}
                        href={`/${locale}/blog/${post.slug}`}
                        aria-label={post.title}
                        style={{ "--i": firstBar + i } as React.CSSProperties}
                        className={cn("tl-bar h-3 w-full rounded-[3px]", topicStyles[post.topic].dot)}
                      />
                    ))
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 h-3 font-mono text-[0.6rem] text-white/40",
                    !showYear && "invisible",
                  )}
                >
                  {showYear ? `'${String(month.year).slice(2)}` : "·"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}

export function Hero({
  stats,
  months,
}: {
  stats: HeroStats;
  months: WritingMonth[];
}) {
  const locale = useLocale();
  const t = useTranslations("home");

  const statItems = [
    { value: stats.firstYear, label: t("stats.since"), href: `/${locale}/blog?sort=oldest` },
    { value: stats.postCount, label: t("stats.posts"), href: `/${locale}/blog` },
    { value: stats.topicCount, label: t("stats.topics"), href: "#topics" },
    { value: stats.tagCount, label: t("stats.tags"), href: `/${locale}/blog` },
    { value: stats.readingMinutes, label: t("stats.minutes"), href: "#archive" },
  ];

  return (
    <section
      aria-labelledby="hero-title"
      className="on-dark relative overflow-hidden bg-night text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]"
      />
      <div className="wrap relative py-16 md:py-24" data-fx-head="hero">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="eyebrow" data-fx="item">
              {t("eyebrow")}
            </p>
            <h1
              id="hero-title"
              data-fx="line"
              className="mt-5 max-w-3xl text-[2.6rem] leading-[1.08] font-bold tracking-[-0.035em] text-balance sm:text-6xl"
            >
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70" data-fx="item">
              {t("lead")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3" data-fx="item">
              <Link href={`/${locale}/blog`} className="btn btn-primary">
                {t("startHere")} <span aria-hidden className="btn-arrow">→</span>
              </Link>
              <Link href="#topics" className="btn btn-ghost">
                {t("exploreTopics")}
              </Link>
            </div>
          </div>

          <figure
            className="w-full max-w-[200px] sm:max-w-[260px] lg:max-w-none"
            data-fx="fade"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#e9e8ee]">
              <Image
                src={AUTHOR.avatar}
                alt={AUTHOR.name}
                width={640}
                height={640}
                preload
                sizes="(min-width: 1024px) 320px, 280px"
                className="aspect-square w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 flex flex-col text-sm">
              <span className="font-semibold">{AUTHOR.name}</span>
              <span className="text-white/55">{t("portraitRole")}</span>
            </figcaption>
          </figure>
        </div>

        <ul data-fx="fade" className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-5">
          {statItems.map((item) => (
            <li key={item.label} className="bg-night first:col-span-2 sm:first:col-span-1">
              <Link
                href={item.href}
                className="flex h-full flex-col gap-1 px-5 py-5 transition-colors hover:bg-white/[0.04]"
              >
                <span className="text-3xl font-bold tracking-[-0.03em] tabular-nums">
                  {item.value}
                </span>
                <span className="text-sm text-white/55">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <WritingRhythm months={months} />
      </div>
    </section>
  );
}
