'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  Search,
  TrendingUp,
} from 'lucide-react';
import type { BlogPost } from '@/lib/blog';

// ─── Pagefind types ──────────────────────────────────────────────────────────
type PagefindResultData = { url: string };
type PagefindModule = {
  search: (query: string) => Promise<{
    results: Array<{ data: () => Promise<PagefindResultData> }>;
  }>;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Engineering: { bg: 'rgba(7,27,58,0.08)', text: '#071B3A' },
  Design: { bg: 'color-mix(in srgb, var(--accent) 14%, transparent)', text: 'var(--accent)' },
  Framework: { bg: 'rgba(139,214,63,0.18)', text: '#3E6E0C' },
};

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  Starter: { bg: 'rgba(139,214,63,0.18)', text: '#3E6E0C' },
  Intermediate: { bg: 'rgba(34,199,232,0.14)', text: 'var(--accent)' },
  Advanced: { bg: 'rgba(7,27,58,0.08)', text: '#071B3A' },
};

const POPULAR_TOPICS = [
  { label: 'JavaScript', count: 12 },
  { label: 'React', count: 9 },
  { label: 'UI Design', count: 7 },
  { label: 'System Design', count: 5 },
  { label: 'CSS', count: 8 },
  { label: 'Next.js', count: 6 },
];

const FAQ_ITEMS = [
  {
    q: 'How often is the blog updated?',
    a: 'New articles are published weekly, focusing on practical engineering, design systems, and modern frontend frameworks.',
  },
  {
    q: 'Can I contribute an article?',
    a: 'Yes — reach out through the contact page with your draft or pitch. We review all submissions.',
  },
  {
    q: 'Are there docs available for engineers?',
    a: 'Each article links to source material and companion docs where relevant. Deeper technical references are in the roadmap section.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeUrlToSlug(url: string) {
  return url.replace(/^\/+|\/+$/g, '').replace(/^blog\//, '');
}

function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] ?? { bg: 'rgba(7,27,58,0.08)', text: '#071B3A' };
}

function getLevelStyle(level: string) {
  return LEVEL_COLORS[level] ?? LEVEL_COLORS['Intermediate'];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Large hero card — first featured post */
function FeaturedCard({ post }: { post: BlogPost }) {
  const cat = getCategoryStyle(post.category);
  const level = getLevelStyle(post.level);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group paper-card paper-card-hover block overflow-hidden rounded-[2rem]"
    >
      {/* Thumbnail placeholder */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-[#071B3A] to-[#0e2c5e] md:h-64">
        <div className="absolute inset-0 flex items-end p-5">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase"
            style={{ background: cat.bg, color: cat.text }}
          >
            {post.category}
          </span>
        </div>
        {/* decorative dot grid */}
        <svg
          className="absolute right-0 top-0 h-full w-1/2 opacity-10"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          {Array.from({ length: 10 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={c * 24 + 12} cy={r * 22 + 12} r={1.5} fill="#8BD63F" />
            )),
          )}
        </svg>
      </div>

      <div className="p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ background: level.bg, color: level.text }}
          >
            {post.level}
          </span>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {post.readingTime} min read
          </span>
          <span className="text-muted-foreground text-xs">{post.date}</span>
        </div>

        <h2 className="mb-2 text-xl font-bold leading-snug tracking-[-0.02em] text-[#071B3A] transition-colors group-hover:text-accent md:text-2xl dark:text-[#D7E2FF]">
          {post.title}
        </h2>

        <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-7">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#071B3A] text-[10px] font-semibold text-[#F5F0EA]">
              {post.author.name
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="text-muted-foreground text-xs">{post.author.name}</span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-accent transition-all group-hover:gap-2">
            Read article
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Compact horizontal list item for sidebar */
function SidebarPostItem({ post, index }: { post: BlogPost; index: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-start gap-3 py-3 transition-colors first:pt-0 last:pb-0"
    >
      <span className="mt-0.5 shrink-0 text-lg font-bold leading-none text-border">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className="line-clamp-2 text-xs font-medium leading-5 text-[#071B3A] transition-colors group-hover:text-accent dark:text-[#D7E2FF]">
          {post.title}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{post.date}</p>
      </div>
    </Link>
  );
}

/** Standard article card for the main grid */
function ArticleCard({ post }: { post: BlogPost }) {
  const cat = getCategoryStyle(post.category);
  const level = getLevelStyle(post.level);

  return (
    <article className="group">
      <Link
        href={`/blog/${post.slug}`}
        className="paper-card paper-card-hover block h-full overflow-hidden rounded-[1.75rem]"
      >
        {/* Compact colour band */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${cat.text}, var(--accent))` }}
        />

        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase"
              style={{ background: cat.bg, color: cat.text }}
            >
              {post.category}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase"
              style={{ background: level.bg, color: level.text }}
            >
              {post.level}
            </span>
          </div>

          <h2 className="mb-2 text-base font-semibold leading-snug tracking-[-0.015em] text-[#071B3A] transition-colors group-hover:text-accent dark:text-[#D7E2FF]">
            {post.title}
          </h2>

          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-6">
            {post.excerpt}
          </p>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-chip rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Clock className="h-3 w-3" />
              {post.readingTime} min · {post.date}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-accent opacity-0 transition-all group-hover:opacity-100" />
          </div>
        </div>
      </Link>
    </article>
  );
}

/** Editor's picks horizontal scroller */
function EditorPickCard({ post }: { post: BlogPost }) {
  const cat = getCategoryStyle(post.category);
  const level = getLevelStyle(post.level);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group paper-card paper-card-hover block w-52 shrink-0 overflow-hidden rounded-[1.5rem] md:w-64"
    >
      <div
        className="h-24 w-full"
        style={{
          background: `linear-gradient(135deg, #071B3A 0%, color-mix(in srgb, #071B3A 70%, var(--accent)) 100%)`,
        }}
      />
      <div className="p-4">
        <div className="mb-2 flex gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] uppercase"
            style={{ background: cat.bg, color: cat.text }}
          >
            {post.category}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] uppercase"
            style={{ background: level.bg, color: level.text }}
          >
            {post.level}
          </span>
        </div>
        <p className="line-clamp-2 text-xs font-semibold leading-5 text-[#071B3A] transition-colors group-hover:text-accent dark:text-[#D7E2FF]">
          {post.title}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">{post.readingTime} min read</p>
      </div>
    </Link>
  );
}

/** Simple accordion FAQ item */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-[#071B3A] transition-colors hover:text-accent dark:text-[#D7E2FF]"
      >
        {q}
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-accent" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <p className="pb-4 text-sm leading-7 text-muted-foreground">{a}</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const PAGE_SIZE = 6;

export function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [pagefindSlugs, setPagefindSlugs] = useState<string[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [email, setEmail] = useState('');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts],
  );

  // Pagefind search
  useEffect(() => {
    let ignore = false;

    async function runSearch() {
      if (query.trim().length < 2) {
        setPagefindSlugs(null);
        return;
      }
      try {
        // @ts-ignore – pagefind is a runtime-generated bundle served from /public/pagefind/
        const pagefind = (await import(/* webpackIgnore: true */ '/pagefind/pagefind.js')) as PagefindModule;
        const response = await pagefind.search(query.trim());
        const resolved = await Promise.all(response.results.map((r) => r.data()));
        if (!ignore) {
          setPagefindSlugs(resolved.map((e) => normalizeUrlToSlug(e.url)));
        }
      } catch {
        if (!ignore) setPagefindSlugs(null);
      }
    }

    void runSearch();
    return () => { ignore = true; };
  }, [query]);

  const filteredPosts = useMemo(() => {
    const byCategory =
      activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

    if (!query.trim()) return byCategory;

    if (pagefindSlugs && pagefindSlugs.length > 0) {
      const order = new Map(pagefindSlugs.map((slug, i) => [slug, i]));
      return byCategory
        .filter((p) => order.has(p.slug))
        .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
    }

    const q = query.toLowerCase();
    return byCategory.filter((p) =>
      [p.title, p.excerpt, p.category, ...(p.tags ?? [])].join(' ').toLowerCase().includes(q),
    );
  }, [activeCategory, pagefindSlugs, posts, query]);

  const [featured, ...restPosts] = filteredPosts;
  const latestForSidebar = posts.slice(0, 5);
  const visiblePosts = restPosts.slice(0, visibleCount);
  const hasMore = visibleCount < restPosts.length;

  // Reset pagination on filter change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeCategory, query]);

  return (
    <div className="pb-24">
      {/* ── Hero / Header ──────────────────────────────────────────────────── */}
      <section className="mb-10 space-y-4 pt-2">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Blog</p>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-[-0.03em] text-[#071B3A] md:text-5xl dark:text-[#D7E2FF]">
          Insights, tutorials, and interview tips for front-end engineers.
        </h1>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
          Practical picks, expert insights, and balanced analysis to help you build better web
          experiences and learn what matters morning.
        </p>
      </section>

      {/* ── Filters + Search ────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  borderColor: active ? 'var(--accent)' : 'var(--border)',
                  background: active
                    ? 'color-mix(in srgb, var(--accent) 12%, transparent)'
                    : 'var(--card)',
                  color: active ? 'var(--accent)' : 'var(--muted-foreground)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="paper-card flex items-center gap-2 rounded-full px-4 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter posts…"
            className="w-40 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* ── Main layout: featured + sidebar ─────────────────────────────────── */}
      {filteredPosts.length > 0 ? (
        <>
          <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Featured post */}
            {featured && <FeaturedCard post={featured} />}

            {/* Sidebar */}
            <aside className="flex flex-col gap-5">
              {/* Latest */}
              <div className="paper-card rounded-[1.5rem] p-5">
                <p className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Latest
                </p>
                <div className="divide-y divide-border">
                  {latestForSidebar.map((p, i) => (
                    <SidebarPostItem key={p.slug} post={p} index={i} />
                  ))}
                </div>
              </div>

              {/* Popular topics */}
              <div className="paper-card rounded-[1.5rem] p-5">
                <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Popular Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TOPICS.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setQuery(t.label)}
                      className="tag-chip rounded-full px-3 py-1 text-xs font-medium transition-colors hover:border-accent/50"
                    >
                      {t.label}
                      <span className="ml-1.5 text-muted-foreground">{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="rounded-[1.5rem] bg-[#071B3A] p-5">
                <p className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-[#8BD63F] uppercase">
                  Stay in the loop
                </p>
                <p className="mb-4 text-sm leading-6 text-[#D7E2FF]/80">
                  Get the latest tips and tutorials delivered to your inbox every week.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-2 text-xs text-[#F5F0EA] placeholder:text-[#D7E2FF]/40 outline-none focus:ring-1 focus:ring-[#8BD63F]"
                  />
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-xl bg-[#8BD63F] px-3 py-2 text-xs font-semibold text-[#071B3A] transition-colors hover:bg-[#7BC335]"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Subscribe
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {/* ── Article grid ──────────────────────────────────────────────── */}
          {restPosts.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Latest Articles
                </p>
                <span className="text-xs text-muted-foreground">{restPosts.length} articles</span>
              </div>

              <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visiblePosts.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>

              {hasMore && (
                <div className="mb-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    Load more articles
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Editor's picks ────────────────────────────────────────────── */}
          {posts.length >= 2 && (
            <section className="mb-14">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Editor&apos;s Picks
                </p>
                <Link
                  href="/blog"
                  className="text-xs font-medium text-accent hover:underline"
                  onClick={() => { setActiveCategory('All'); setQuery(''); }}
                >
                  View all
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {posts.slice(0, 6).map((post) => (
                  <EditorPickCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="paper-card mb-12 rounded-[1.75rem] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[#071B3A] dark:text-[#D7E2FF]">
            No posts matched that filter.
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-7">
            Try another keyword, clear the category, or search for broader terms.
          </p>
        </div>
      )}

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="paper-card rounded-[2rem] p-6 md:p-10">
        <p className="mb-1 text-center text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          FAQ
        </p>
        <h2 className="mb-8 text-center text-xl font-bold tracking-[-0.02em] text-[#071B3A] md:text-2xl dark:text-[#D7E2FF]">
          Your commonly asked questions, answered.
        </h2>
        <div className="mx-auto max-w-2xl">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>
    </div>
  );
}
