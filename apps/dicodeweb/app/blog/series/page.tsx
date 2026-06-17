import Link from 'next/link';
import { ArrowRight, BookOpen, Layers3, Sparkles } from 'lucide-react';
import { SeriesItem, WhatsNewCard } from '@/components/blog/blog-cards';
import { getAllPosts, getAllSeries } from '@/lib/blog';

function formatDisplayDate(value?: string) {
  if (!value) return 'Recently';

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const metadata = {
  title: 'Blog Series | DiCodeWeb',
  description:
    'Editorial series that group related frontend articles into clearer learning paths.',
};

export default function BlogSeriesIndexPage() {
  const posts = getAllPosts();
  const series = getAllSeries().filter((seriesEntry) => seriesEntry.posts.length > 0);
  const latestPosts = posts.slice(0, 3);

  return (
    <main className="bg-background min-h-screen pb-24 pt-24 md:pb-32 md:pt-32">
      <div className="editorial-grid">
        <div className="mb-10 max-w-3xl space-y-3">
          <p className="text-sm font-semibold tracking-[0.16em] text-accent uppercase">Series</p>
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#202124] md:text-5xl dark:text-[#F5F7FB]">
            Structured learning paths for modern frontend work.
          </h1>
          <p className="text-base leading-8 text-muted-foreground md:text-lg">
            Instead of isolated posts, these series connect related ideas into cleaner editorial
            arcs so you can follow one theme with more continuity.
          </p>
        </div>

        <section className="mb-8 rounded-[1.9rem] border border-border bg-card p-6 shadow-[0_16px_45px_rgba(15,68,122,0.05)] md:p-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071B3A]/8 text-[#071B3A] dark:bg-[#D7E2FF]/10 dark:text-[#D7E2FF]">
                <Sparkles className="h-5 w-5" />
              </span>

              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#202124] dark:text-[#F5F7FB]">
                  What&apos;s new
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Fresh additions from the blog before you jump into a full series.
                </p>
              </div>
            </div>

            <Link
              href="/blog"
              className="hidden items-center gap-1.5 text-sm font-medium text-[#202124] md:inline-flex dark:text-[#F5F7FB]"
            >
              See all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {latestPosts.map((post) => (
              <WhatsNewCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-[1.9rem] border border-border bg-card p-6 shadow-[0_16px_45px_rgba(15,68,122,0.05)] md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#202124] dark:text-[#F5F7FB]">
                Browse series
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Explore grouped learning paths with the same compact card pattern used across the
                main blog index.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {series.slice(0, 5).map((seriesEntry, index) => (
              <SeriesItem key={seriesEntry.slug} index={index} series={seriesEntry} />
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          {series.map((seriesEntry) => (
            <Link
              key={seriesEntry.slug}
              href={`/blog/series/${seriesEntry.slug}`}
              className="group rounded-[1.8rem] border border-border bg-card p-6 shadow-[0_18px_45px_rgba(15,68,122,0.05)] transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[0_24px_60px_rgba(15,68,122,0.1)]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Editorial series
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#202124] dark:text-[#F5F7FB]">
                    {seriesEntry.title}
                  </h2>
                </div>

                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-accent/45 group-hover:text-accent">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>

              <p className="text-sm leading-7 text-muted-foreground">{seriesEntry.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] bg-muted px-4 py-3">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Posts
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#202124] dark:text-[#F5F7FB]">
                    {seriesEntry.posts.length}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-muted px-4 py-3">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Level
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#202124] dark:text-[#F5F7FB]">
                    {seriesEntry.level}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-muted px-4 py-3">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Updated
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#202124] dark:text-[#F5F7FB]">
                    {formatDisplayDate(seriesEntry.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-border pt-5">
                {seriesEntry.posts.slice(0, 3).map((post, index) => (
                  <div key={post.slug} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#071B3A]/7 text-xs font-semibold text-[#071B3A] dark:bg-white/8 dark:text-[#F5F7FB]">
                      {index + 1}
                    </span>
                    <span className="line-clamp-1 text-[#202124] dark:text-[#E7EDF8]">{post.title}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-accent">
                <Layers3 className="h-4 w-4" />
                Explore this series
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-[1.8rem] border border-border bg-card p-6 text-sm leading-7 text-muted-foreground shadow-[0_18px_45px_rgba(15,68,122,0.05)] md:p-8">
          <div className="flex items-center gap-2 text-[#202124] dark:text-[#F5F7FB]">
            <BookOpen className="h-4 w-4 text-accent" />
            <p className="font-semibold">Adding a new series later</p>
          </div>
          <p className="mt-2">
            Create a new file in `content/series`, then point related posts to that `series.slug` in
            their frontmatter. No hardcoded series registry is needed.
          </p>
        </div>
      </div>
    </main>
  );
}
