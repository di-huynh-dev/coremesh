import { SectionHeading } from "@/components/home/section-heading";
import { BLOG_TOPICS, type BlogPostSummary, type BlogTopic } from "@/lib/content/types";
import { topicStyles } from "@/lib/topic-style";
import { cn } from "@/lib/utils";
import { Gauge, Network, PanelsTopLeft, Sprout, Wrench, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const topicIcons: Record<BlogTopic, LucideIcon> = {
  systems: Network,
  frontend: PanelsTopLeft,
  performance: Gauge,
  tooling: Wrench,
  growth: Sprout,
};

export function TopicsSection({ posts }: { posts: BlogPostSummary[] }) {
  const locale = useLocale();
  const t = useTranslations("home");
  const tTopics = useTranslations("topics");
  const tCommon = useTranslations("common");

  return (
    <section aria-labelledby="topics" className="wrap pt-20 md:pt-28">
      <SectionHeading
        id="topics"
        title={t("topicsTitle")}
        subtitle={t("topicsSubtitle")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BLOG_TOPICS.map((topic, index) => {
          const topicPosts = posts.filter((post) => post.topic === topic);
          const Icon = topicIcons[topic];

          return (
            <article
              key={topic}
              className={cn(
                "group relative flex flex-col rounded-2xl border border-line bg-background p-6 transition-colors hover:border-ink/25",
                index === 0 && "lg:row-span-2 lg:bg-paper",
              )}
            >
              <div className="flex items-center justify-between">
                <Icon
                  aria-hidden
                  strokeWidth={1.5}
                  className={cn("glyph size-9", topicStyles[topic].text)}
                />
                <span className="font-mono text-xs text-faint">
                  {tCommon("posts", { count: topicPosts.length })}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-ink transition-colors group-hover:text-cobalt">
                <Link
                  href={`/${locale}/blog?topic=${topic}`}
                  className="after:absolute after:inset-0"
                >
                  {tTopics(`${topic}.title`)}
                </Link>
              </h3>
              <p className="mt-2 text-[0.95rem] leading-7 text-soft">
                {tTopics(`${topic}.description`)}
              </p>

              {topicPosts.length > 0 ? (
                <ul className="mt-5 space-y-2 border-t border-line pt-4">
                  {topicPosts.slice(0, index === 0 ? 4 : 2).map((post) => (
                    <li
                      key={post.slug}
                      className="truncate text-sm text-ink/80 before:mr-2 before:text-faint before:content-['→']"
                    >
                      {post.title}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
