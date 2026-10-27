import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { blogUrl, socials } from "@/lib/data/profile";
import { tiktokFollowers, tiktokVideos } from "@/lib/data/teaching";
import { dictionaries } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { getTikTokVideos } from "@/lib/tiktok";
import { formatPostDate } from "@repo/content/text";
import type { BlogPost } from "@repo/ui/types/post";
import { ArrowUpRight, Play } from "lucide-react";

type BlogSectionProps = {
  locale: Locale;
  posts: BlogPost[];
};

export async function BlogSection({ locale, posts }: BlogSectionProps) {
  const t = dictionaries[locale];
  const videos = await getTikTokVideos(tiktokVideos.slice(0, 3));

  return (
    <section
      id="blog"
      className="profile-rail rail-box screen-line-after scroll-mt-16 px-4 py-8"
    >
      <SectionHeading
        index="05"
        title={t.headings.blog.title}
        alt={t.headings.blog.alt}
        action={
          <a
            href={blogUrl(locale, "/blog")}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 pb-1 font-mono text-sm text-muted-foreground transition-colors hover:text-brand"
          >
            {t.blog.allPosts}
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        }
      />

      <div className="mt-6 divide-y divide-edge border-y border-edge">
        {posts.map((post, index) => (
          <Reveal key={post.slug} delay={index * 0.06}>
            <a
              href={blogUrl(locale, `/blog/${post.slug}`)}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor={t.overview.readPost}
              className="group flex items-start gap-4 px-1 py-5 transition-colors hover:bg-brand/[0.05]"
            >
              <span className="font-display w-9 shrink-0 pt-0.5 text-3xl leading-none text-muted-foreground/40 transition-colors group-hover:text-brand">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display block text-xl leading-snug font-medium decoration-brand/60 underline-offset-4 group-hover:underline">
                  {post.title}
                </span>
                <span className="mt-1.5 line-clamp-2 block font-mono text-sm leading-6 text-muted-foreground">
                  {post.excerpt}
                </span>
                <span className="mt-2 block font-mono text-xs text-muted-foreground">
                  {formatPostDate(post.date, locale)} <span className="text-brand">/</span>{" "}
                  {t.blog.minRead(post.readingTime)}
                </span>
              </span>
              <ArrowUpRight className="mt-1.5 size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
            </a>
          </Reveal>
        ))}
      </div>

      {videos.length > 0 ? (
        <div className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-2xl font-medium">
              {t.blog.videos}
              <span className="text-brand">.</span>
            </h3>
            <a
              href={socials.tiktok.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-brand"
            >
              {socials.tiktok.handle}
              {tiktokFollowers ? <span>· {t.blog.followers(tiktokFollowers)}</span> : null}
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {videos.map((video) => (
              <a
                key={video.url}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor={t.blog.watch}
                className="group relative block aspect-[9/16] overflow-hidden border border-edge bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- signed, expiring TikTok CDN URLs on rotating hosts */}
                <img
                  src={video.thumbnail}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/85 to-transparent p-2 pt-10 font-mono text-[11px] leading-4 text-white line-clamp-3 sm:p-3">
                  {video.title}
                </span>
                <span className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-zinc-950/70 text-white">
                  <Play className="size-3.5 fill-current" />
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
