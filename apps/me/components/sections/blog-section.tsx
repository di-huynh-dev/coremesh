import type { BlogPost } from "@repo/ui/types/post";
import { ExternalLink, FileText } from "lucide-react";

type BlogSectionProps = {
  posts: BlogPost[];
  blogsBaseUrl: string;
};

export function BlogSection({ posts, blogsBaseUrl }: BlogSectionProps) {
  const resolvedBlogsBaseUrl = blogsBaseUrl.replace(/\/$/, "");

  return (
    <section
      id="blog"
      className="profile-rail rail-box screen-line-after px-4 py-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-semibold leading-9">Blog</h2>
        <a
          href={`${resolvedBlogsBaseUrl}/blog`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md  px-3 py-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Open blogs
          <ExternalLink className="size-4" />
        </a>
      </div>

      <div className="mt-5 divide-y divide-edge border-y border-edge">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`${resolvedBlogsBaseUrl}/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 py-4 transition-colors hover:bg-muted/30"
          >
            <span className="mini-icon mt-1">
              <FileText className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium underline-offset-4 group-hover:underline">
                {post.title}
              </span>
              <span className="mt-1 line-clamp-2 block font-mono text-sm leading-6 text-muted-foreground">
                {post.excerpt}
              </span>
              <span className="mt-2 block font-mono text-xs text-muted-foreground">
                {post.date} / {post.readingTime}
              </span>
            </span>
            <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground" />
          </a>
        ))}
      </div>
    </section>
  );
}
