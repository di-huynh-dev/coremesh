import { AUTHOR } from "@/lib/site";
import { BLOG_TOPICS } from "@/lib/content/types";
import { type WritingMonth } from "@repo/content/posts";
import { formatPostDate } from "@repo/content/text";
import type { BlogPostSummary } from "@/lib/content/types";
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
  featured,
}: {
  stats: HeroStats;
  months: WritingMonth[];
  featured?: BlogPostSummary;
}) {
  const locale = useLocale();
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tTopics = useTranslations("topics");
  const topicTitle = (topic: BlogPostSummary["topic"]) => tTopics(`${topic}.title`);

  const statItems = [
    { value: stats.postCount, label: t("stats.posts"), href: `/${locale}/blog` },
    { value: Math.round(stats.readingMinutes / 60), label: t("stats.hours"), href: "#archive" },
    { value: stats.topicCount, label: t("stats.topics"), href: "#topics" },
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
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
          <div>
            <Link
              href={AUTHOR.url}
              className="inline-flex items-center gap-3 rounded-full py-1 pr-4 pl-1 text-sm ring-1 ring-white/15 transition-colors hover:bg-white/[0.06]"
              data-fx="item"
            >
              <Image
                src={AUTHOR.avatar}
                alt=""
                width={64}
                height={64}
                preload
                className="size-8 rounded-full bg-[#e9e8ee] object-cover"
              />
              <span>
                <span className="font-semibold">{AUTHOR.name}</span>
                <span className="hidden text-white/55 sm:inline">, {t("byline")}</span>
              </span>
            </Link>
            <h1
              id="hero-title"
              data-fx="line"
              className="mt-7 max-w-3xl text-[2.5rem] leading-[1.06] font-bold tracking-[-0.035em] text-balance sm:text-[3.6rem]"
            >
              {t("title")}
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg leading-8 text-white/70" data-fx="item">
              {t("lead")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3" data-fx="item">
              <Link href={`/${locale}/blog`} className="btn btn-primary">
                {t("startHere")}
              </Link>
              <Link href={`/${locale}/series`} className="btn btn-ghost">
                {t("exploreSeries")}
              </Link>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-4" data-fx="fade">
              {statItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="group flex flex-col">
                    <span className="text-3xl font-bold tracking-[-0.03em] tabular-nums">{item.value}</span>
                    <span className="text-sm text-white/55 transition-colors group-hover:text-white/80">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {featured ? (
            <article
              className="group relative rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/12 transition-colors hover:bg-white/[0.07] sm:p-7"
              data-fx="fade"
            >
              <p className="text-sm text-white/55">{t("featured")}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/75">
                <span className={cn("topic-dot", topicStyles[featured.topic].dot)} />
                {topicTitle(featured.topic)}
              </p>
              <h2 className="mt-2 text-2xl leading-snug font-semibold tracking-[-0.02em] text-balance">
                <Link
                  href={`/${locale}/blog/${featured.slug}`}
                  className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
                >
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-3 line-clamp-4 leading-7 text-white/65">{featured.excerpt}</p>
              <p className="mt-6 flex items-center justify-between text-sm text-white/55">
                <time dateTime={featured.date}>{formatPostDate(featured.date, locale, "long")}</time>
                <span>{tCommon("minRead", { minutes: featured.readingTime })}</span>
              </p>
            </article>
          ) : null}
        </div>

        <WritingRhythm months={months} />
      </div>
    </section>
  );
}
