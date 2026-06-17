import { MDXContent } from '@content-collections/mdx/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Layers3, Sparkles } from 'lucide-react';
import { BlogListItem, SeriesItem, WhatsNewCard } from '@/components/blog/blog-cards';
import { blogMdxComponents } from '@/components/blog/mdx-components';
import { getAllPosts, getAllSeries, getAllSeriesSlugs, getSeriesBySlug } from '@/lib/blog';

type BlogSeriesPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDisplayDate(value?: string) {
  if (!value) return 'Recently';

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function generateStaticParams() {
  return getAllSeriesSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogSeriesPageProps) {
  const resolvedParams = await params;
  const series = getSeriesBySlug(resolvedParams.slug);

  if (!series) {
    return {
      title: 'Series Not Found',
    };
  }

  return {
    title: `${series.title} | DiCodeWeb Series`,
    description: series.description,
  };
}

export default async function BlogSeriesPage({ params }: BlogSeriesPageProps) {
  const resolvedParams = await params;
  const series = getSeriesBySlug(resolvedParams.slug);

  if (!series) {
    notFound();
  }

  const latestPosts = getAllPosts()
    .filter((post) => post.series?.slug !== series.slug)
    .slice(0, 3);
  const siblingSeries = getAllSeries()
    .filter((seriesEntry) => seriesEntry.posts.length > 0 && seriesEntry.slug !== series.slug)
    .slice(0, 5);

  return (
    <main className="bg-background min-h-screen pb-24 pt-24 md:pb-32 md:pt-32">
      <div className="editorial-grid">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_22px_60px_rgba(15,68,122,0.08)]">
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#071B3A_0%,#123F70_100%)] px-6 py-8 text-[#F5F0EA] md:px-8 md:py-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,214,63,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(65,215,249,0.16),transparent_34%)]" />
              <div className="relative">
                <p className="text-xs font-semibold tracking-[0.16em] text-[#AAF85D] uppercase">
                  Editorial series
                </p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-6xl">
                  {series.title}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[#D7E2FF]/86 md:text-lg">
                  {series.description}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#D7E2FF]/70 uppercase">
                      Posts
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">{series.posts.length}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#D7E2FF]/70 uppercase">
                      Level
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">{series.level}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#D7E2FF]/70 uppercase">
                      Updated
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {formatDisplayDate(series.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="blog-prose prose prose-sm max-w-none md:prose-lg prose-headings:text-foreground prose-p:text-foreground prose-p:leading-[1.9] prose-strong:text-foreground prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
                <MDXContent code={series.code} components={blogMdxComponents} />
              </div>
            </div>
          </div>

          <aside
            className="rounded-[1.8rem] border border-border bg-card p-6 shadow-[0_18px_45px_rgba(15,68,122,0.06)] xl:sticky"
            style={{ top: 'var(--site-nav-offset, 96px)' }}
          >
            <div className="mb-5 flex items-center gap-2 text-[#202124] dark:text-[#F5F7FB]">
              <Layers3 className="h-4 w-4 text-accent" />
              <h2 className="text-lg font-semibold">Series map</h2>
            </div>

            <div className="space-y-3">
              {series.posts.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-[1.2rem] border border-border bg-background px-4 py-4 transition-all hover:border-accent/35 hover:bg-accent/[0.04]"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#071B3A]/7 text-xs font-semibold text-[#071B3A] dark:bg-white/8 dark:text-[#F5F7FB]">
                      {post.series?.position ?? index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium leading-6 text-[#202124] dark:text-[#F5F7FB]">
                        {post.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{post.readingTime} min read</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-[1.9rem] border border-border bg-card p-6 shadow-[0_18px_45px_rgba(15,68,122,0.06)] md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Reading path
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#202124] dark:text-[#F5F7FB]">
                Every article in this series
              </h2>
            </div>

            <Link href="/blog/series" className="inline-flex items-center gap-2 text-sm font-medium text-[#202124] dark:text-[#F5F7FB]">
              All series
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {series.posts.map((post) => (
              <BlogListItem key={post.slug} post={post} />
            ))}
          </div>
        </section>

        {(latestPosts.length > 0 || siblingSeries.length > 0) && (
          <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            {latestPosts.length > 0 ? (
              <div className="rounded-[1.9rem] border border-border bg-card p-6 shadow-[0_16px_45px_rgba(15,68,122,0.05)] md:p-8">
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
                        New posts from the wider editorial stream beyond this series.
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
              </div>
            ) : null}

            {siblingSeries.length > 0 ? (
              <aside
                className="rounded-[1.9rem] border border-border bg-card p-6 shadow-[0_16px_45px_rgba(15,68,122,0.05)] xl:sticky"
                style={{ top: 'var(--site-nav-offset, 96px)' }}
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#202124] dark:text-[#F5F7FB]">
                      Browse series
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Jump to other connected learning paths with the same compact series cards from
                      the blog landing page.
                    </p>
                  </div>

                  <Link
                    href="/blog/series"
                    className="hidden items-center gap-1.5 text-sm font-medium text-[#202124] md:inline-flex dark:text-[#F5F7FB]"
                  >
                    See all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {siblingSeries.map((seriesEntry, index) => (
                    <SeriesItem key={seriesEntry.slug} index={index} series={seriesEntry} />
                  ))}
                </div>
              </aside>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
