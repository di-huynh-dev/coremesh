import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { BlogPost } from "@repo/ui/types/post";
import { ArrowUpRight } from "lucide-react";

type BlogSectionProps = {
  posts: BlogPost[];
  blogsBaseUrl: string;
};

export function BlogSection({ posts, blogsBaseUrl }: BlogSectionProps) {
  const resolvedBlogsBaseUrl = blogsBaseUrl.replace(/\/$/, "");

  return (
    <section
      id="blog"
      className="profile-rail rail-box screen-line-after scroll-mt-16 px-4 py-8"
    >
      <SectionHeading
        index="04"
        title="Blog"
        vi="Ghi chép"
        action={
          <a
            href={`${resolvedBlogsBaseUrl}/blog`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 pb-1 font-mono text-sm text-muted-foreground transition-colors hover:text-brand"
          >
            All posts
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        }
      />

      <div className="mt-6 divide-y divide-edge border-y border-edge">
        {posts.map((post, index) => (
          <Reveal key={post.slug} delay={index * 0.06}>
            <a
              href={`${resolvedBlogsBaseUrl}/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Đọc bài"
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
                  {post.date} <span className="text-brand">/</span>{" "}
                  {post.readingTime}
                </span>
              </span>
              <ArrowUpRight className="mt-1.5 size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
