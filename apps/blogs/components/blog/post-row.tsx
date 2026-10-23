import { TopicTag } from "@/components/blog/topic-tag";
import { formatPostDate } from "@/lib/content/text";
import { type BlogPostSummary } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ViewTransition } from "react";

/** Editorial list row: date column, title + excerpt, topic and reading time. */
export function PostRow({
  post,
  compact = false,
  headingLevel = "h3",
}: {
  post: BlogPostSummary;
  compact?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const locale = useLocale();
  const t = useTranslations("common");
  const Heading = headingLevel;

  return (
    <article className="group relative grid gap-x-8 gap-y-2 border-t border-line py-6 first:border-t-0 md:grid-cols-[132px_minmax(0,1fr)_auto] md:py-7">
      <time
        dateTime={post.date}
        className="pt-1 font-mono text-xs text-faint tabular-nums"
      >
        {formatPostDate(post.date, locale)}
      </time>

      <div className="min-w-0">
        <ViewTransition name={`post-title-${post.slug}`} share="post-title" default="none">
        <Heading
          className={cn(
            "font-semibold tracking-[-0.02em] text-ink text-balance transition-colors group-hover:text-cobalt",
            compact ? "text-lg leading-snug" : "text-xl leading-snug md:text-[1.4rem]",
          )}
        >
          <Link
            href={`/${locale}/blog/${post.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </Heading>
        </ViewTransition>
        {!compact ? (
          <p className="mt-2 max-w-[62ch] text-[0.97rem] leading-7 text-soft">
            {post.excerpt}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <TopicTag topic={post.topic} />
          <span className="font-mono text-xs text-faint">
            {t("minutes", { minutes: post.readingTime })}
          </span>
        </div>
      </div>

      <ArrowUpRight
        aria-hidden
        className="glyph hidden size-5 text-faint transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cobalt md:block"
      />
      {/* Ring for keyboard focus on the stretched link */}
      <span className="pointer-events-none absolute inset-0 -mx-3 rounded-xl ring-cobalt group-has-[a:focus-visible]:ring-2" />
    </article>
  );
}
