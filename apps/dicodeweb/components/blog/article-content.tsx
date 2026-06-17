'use client';

import { MDXContent } from '@content-collections/mdx/react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ListTree,
  Pause,
  Play,
  Settings,
  SkipBack,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { BlogPost, SeriesNavigation, TopicCluster } from '@/lib/blog';
import { blogMdxComponents } from '@/components/blog/mdx-components';
import { FeaturedPostCard } from '@/components/blog/blog-cards';

interface ArticleContentProps {
  post: BlogPost;
  topicCluster: TopicCluster | null;
  seriesNavigation: SeriesNavigation | null;
}

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

function createHeadingId(value: string, counts: Map<string, number>) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
  const base = normalized || 'section';
  const duplicateCount = counts.get(base) ?? 0;
  counts.set(base, duplicateCount + 1);

  return duplicateCount === 0 ? base : `${base}-${duplicateCount}`;
}

function extractTocItems(content: string): TocItem[] {
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---/, '').trim();
  const lines = withoutFrontmatter.split(/\r?\n/);
  const items: TocItem[] = [];
  const headingCounts = new Map<string, number>();
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      continue;
    }

    const match = /^(##|###)\s+(.+)$/.exec(line.trim());

    if (!match) {
      continue;
    }

    const level = match[1].length as 2 | 3;
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .replace(/<[^>]+>/g, '')
      .trim();

    if (!text) {
      continue;
    }

    items.push({
      id: createHeadingId(text, headingCounts),
      text,
      level,
    });
  }

  return items;
}

function TableOfContentsRail({ items, activeId }: { items: TocItem[]; activeId: string | null }) {
  return (
    <aside
      className="hidden self-start xl:sticky xl:block"
      style={{
        top: 'var(--site-nav-offset, 96px)',
      }}
    >
      <div className="w-[240px]">
        <div className="mb-4 flex items-center gap-2 text-[#202124] dark:text-[#F5F7FB]">
          <ListTree className="text-accent h-4 w-4" />
          <h2 className="text-sm font-semibold tracking-[0.08em] uppercase">Contents</h2>
        </div>
        <nav
          aria-label="Table of contents"
          className="toc-scroll overflow-y-auto border-l border-border pr-1 pl-3"
          style={{ maxHeight: 'calc(100vh - var(--site-nav-offset, 96px) - 6rem)' }}
        >
          <ol className="space-y-1">
            {items.map((item) => {
              const isActive = item.id === activeId;

              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block rounded-sm px-3 py-1.5 text-sm leading-6 transition-colors ${
                      item.level === 3 ? 'ml-4' : ''
                    } ${
                      isActive
                        ? 'border-l-2 border-accent bg-accent/[0.05] font-semibold text-accent'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </aside>
  );
}

export function ArticleContent({ post, topicCluster, seriesNavigation }: ArticleContentProps) {
  const authorInitials = post.author.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tocItems = useMemo(() => extractTocItems(post.content), [post.content]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  // Reading progress
  const [progress, setProgress] = useState(0);

  // TTS state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showPlayer, setShowPlayer] = useState(false);

  // Voice & Speed settings
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Refs
  const articleRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ttsSupported = useSyncExternalStore(
    () => () => {},
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    () => false,
  );
  const words = post.content ? post.content.split(/\s+/).filter((word) => word.length > 0) : [];
  const seriesNavigationSlugs = useMemo(
    () =>
      new Set(
        [seriesNavigation?.previous?.slug, seriesNavigation?.next?.slug].filter(
          (slug): slug is string => Boolean(slug),
        ),
      ),
    [seriesNavigation?.next?.slug, seriesNavigation?.previous?.slug],
  );
  const relatedPosts = useMemo(
    () =>
      (topicCluster?.posts ?? [])
        .filter((relatedPost) => relatedPost.slug !== post.slug)
        .filter((relatedPost) => !seriesNavigationSlugs.has(relatedPost.slug))
        .slice(0, 2),
    [post.slug, seriesNavigationSlugs, topicCluster],
  );

  useEffect(() => {
    if (!ttsSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length === 0) return;

      const englishVoices = availableVoices.filter((voice) => voice.lang.startsWith('en'));
      const voicesToUse = englishVoices.length > 0 ? englishVoices : availableVoices;
      setVoices(voicesToUse);

      if (!selectedVoice) {
        const preferredVoice =
          voicesToUse.find(
            (voice) =>
              voice.name.includes('Google') ||
              voice.name.includes('Microsoft') ||
              voice.name.includes('Natural') ||
              voice.name.includes('Samantha'),
          ) || voicesToUse[0];
        setSelectedVoice(preferredVoice);
      }
    };

    loadVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [ttsSupported, selectedVoice]);

  useEffect(() => {
    if (tocItems.length === 0) {
      return;
    }

    const handleActiveHeading = () => {
      const headings = tocItems
        .map((item) => document.getElementById(item.id))
        .filter((heading): heading is HTMLElement => Boolean(heading));

      if (headings.length === 0) {
        setActiveHeadingId(tocItems[0]?.id ?? null);
        return;
      }

      const offset = 140;
      let activeId = headings[0]?.id ?? null;

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - offset <= 0) {
          activeId = heading.id;
        } else {
          break;
        }
      }

      setActiveHeadingId(activeId);
    };

    window.addEventListener('scroll', handleActiveHeading, { passive: true });
    window.addEventListener('resize', handleActiveHeading);
    handleActiveHeading();

    return () => {
      window.removeEventListener('scroll', handleActiveHeading);
      window.removeEventListener('resize', handleActiveHeading);
    };
  }, [tocItems]);

  // Reading Progress Bar (scroll-based)
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;

      const article = articleRef.current;
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      const start = articleTop - windowHeight + 100;
      const end = articleTop + articleHeight - windowHeight;
      const current = scrollY - start;
      const total = end - start;

      const percentage = Math.min(Math.max((current / total) * 100, 0), 100);
      setProgress(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize TTS with selected voice and speed
  const initTTS = useCallback(() => {
    if (!ttsSupported || !post.content) return;

    const utterance = new SpeechSynthesisUtterance(post.content);
    utterance.rate = speed;
    utterance.pitch = 1;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    let wordIndex = 0;
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentWordIndex(wordIndex);
        wordIndex++;
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      setShowPlayer(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
    };

    utteranceRef.current = utterance;
  }, [ttsSupported, post.content, selectedVoice, speed]);

  useEffect(() => {
    initTTS();
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, [initTTS]);

  const handlePlay = () => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      speechSynthesis.cancel();
      setCurrentWordIndex(-1);
      initTTS();
      if (utteranceRef.current) {
        speechSynthesis.speak(utteranceRef.current);
        setIsPlaying(true);
        setShowPlayer(true);
      }
    }
  };

  const handlePause = () => {
    speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    setShowPlayer(false);
    setShowSettings(false);
  };

  const handleRestart = () => {
    speechSynthesis.cancel();
    setCurrentWordIndex(-1);
    initTTS();
    if (utteranceRef.current) {
      speechSynthesis.speak(utteranceRef.current);
      setIsPlaying(true);
    }
  };

  // Calculate TTS progress based on word index
  const ttsProgress = words.length > 0 ? (currentWordIndex / words.length) * 100 : 0;
  const hasToc = tocItems.length > 0;
  const currentActiveHeadingId = activeHeadingId ?? tocItems[0]?.id ?? null;

  return (
    <>
      <div className="bg-border/60 fixed top-0 right-0 left-0 z-[200] h-1">
        <div
          className="via-accent h-full bg-linear-to-r from-[#071B3A] to-[#8BD63F] transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="min-h-screen pt-24 pb-24 md:pt-32 md:pb-32">
        <div
          className={
            hasToc
              ? 'editorial-grid xl:grid xl:grid-cols-[250px_minmax(0,1fr)] xl:items-start xl:gap-10'
              : 'reading-width mx-auto px-4 md:px-0'
          }
        >
          {hasToc ? (
            <TableOfContentsRail items={tocItems} activeId={currentActiveHeadingId} />
          ) : null}

          <article className="min-w-0" data-pagefind-body>
            <div className={hasToc ? 'mx-auto max-w-[760px]' : ''}>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors md:mb-8"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>

              <header className="mb-8 md:mb-12">
                <div className="text-muted-foreground mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase md:mb-6 md:gap-x-5">
                  <span className="text-[#071B3A] dark:text-[#D7E2FF]">{post.category}</span>
                  <span className="text-muted-foreground text-xs md:text-sm">
                    {post.readingTime} min read
                  </span>
                  <span className="text-muted-foreground text-xs md:text-sm">{post.date}</span>
                  {seriesNavigation ? (
                    <Link
                      href={`/blog/series/${seriesNavigation.series.slug}`}
                      className="text-accent hover:text-[#071B3A] text-xs font-medium transition-colors md:text-sm"
                    >
                      {seriesNavigation.series.title}
                    </Link>
                  ) : null}
                </div>

                <h1 className="mb-4 text-3xl leading-tight font-bold tracking-[-0.03em] text-[#071B3A] md:mb-6 md:text-5xl dark:text-[#D7E2FF]">
                  {post.title}
                </h1>

                <p className="text-muted-foreground mb-6 text-base leading-8 md:mb-8 md:text-xl">
                  {post.excerpt}
                </p>

                <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center md:pb-8">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#071B3A] text-sm font-semibold text-[#F5F0EA] md:h-12 md:w-12 md:text-base">
                      <span>{authorInitials}</span>
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium md:text-base">
                        {post.author.name}
                      </p>
                      <p className="text-muted-foreground text-xs md:text-sm">Author</p>
                    </div>
                  </div>

                  {ttsSupported && !showPlayer && (
                    <button
                      onClick={handlePlay}
                      className="border-border text-muted-foreground hover:text-foreground hover:border-accent/35 inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 transition-colors sm:w-auto"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Listen</span>
                    </button>
                  )}
                </div>
              </header>

              <div
                ref={articleRef}
                className="blog-prose prose prose-sm md:prose-lg prose-headings:scroll-mt-28 prose-headings:font-semibold prose-headings:text-foreground prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-10 md:prose-h2:mt-14 prose-h2:mb-4 md:prose-h2:mb-6 prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-8 md:prose-h3:mt-10 prose-h3:mb-3 md:prose-h3:mb-4 prose-p:text-sm md:prose-p:text-base prose-p:text-foreground prose-p:leading-relaxed md:prose-p:leading-[1.8] prose-p:mb-4 md:prose-p:mb-6 [&>p:first-of-type]:text-muted-foreground [&>div:first-of-type]:text-muted-foreground prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-semibold prose-code:text-[#24324A] prose-code:bg-[#EEF1F5] prose-code:border prose-code:border-[#DEE4EE] prose-code:px-1.5 md:prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium prose-code:text-xs md:prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:border-0 prose-pre:my-6 md:prose-pre:my-8 prose-pre:p-0 prose-pre:rounded-none prose-pre:shadow-none prose-blockquote:border-l-accent prose-blockquote:border-l-4 prose-blockquote:bg-accent/7 prose-blockquote:py-3 md:prose-blockquote:py-4 prose-blockquote:px-4 md:prose-blockquote:px-6 prose-blockquote:rounded-r-lg md:prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:my-6 md:prose-blockquote:my-8 prose-blockquote:text-foreground prose-ul:my-4 md:prose-ul:my-6 prose-ul:space-y-2 md:prose-ul:space-y-3 prose-ol:my-4 md:prose-ol:my-6 prose-ol:space-y-2 md:prose-ol:space-y-3 prose-li:text-foreground/80 prose-li:leading-relaxed prose-li:text-sm md:prose-li:text-base prose-table:my-8 prose-table:w-full prose-table:overflow-hidden prose-table:rounded-[1.25rem] prose-table:border prose-table:border-border prose-table:bg-card prose-thead:border-border prose-th:border-border prose-th:bg-muted/70 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:tracking-[0.12em] prose-th:text-muted-foreground prose-th:uppercase prose-td:border-border prose-td:px-4 prose-td:py-3.5 prose-td:text-sm prose-td:leading-7 md:prose-td:text-base max-w-none [&>div:first-of-type]:mb-6 [&>div:first-of-type]:text-base [&>div:first-of-type]:leading-relaxed md:[&>div:first-of-type]:mb-8 md:[&>div:first-of-type]:text-xl [&>p:first-of-type]:mb-6 [&>p:first-of-type]:text-base [&>p:first-of-type]:leading-relaxed md:[&>p:first-of-type]:mb-8 md:[&>p:first-of-type]:text-xl"
              >
                <MDXContent code={post.code} components={blogMdxComponents} />
              </div>

              <footer className="border-border mt-12 border-t pt-8 md:mt-16 md:pt-10">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                      Keep reading
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#202124] dark:text-[#F5F7FB]">
                      Better navigation for the next step.
                    </h2>
                    {seriesNavigation ? (
                      <p className="text-muted-foreground mt-2 text-sm leading-7">
                        This article is part of{' '}
                        <Link
                          href={`/blog/series/${seriesNavigation.series.slug}`}
                          className="text-accent hover:underline"
                        >
                          {seriesNavigation.series.title}
                        </Link>
                        , so you can keep moving through the same learning path.
                      </p>
                    ) : null}
                  </div>

                  <Link
                    href="/blog"
                    className="text-accent inline-flex items-center gap-2 text-sm font-medium hover:underline md:text-base"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    More articles
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {seriesNavigation?.previous ? (
                    <FeaturedPostCard
                      post={seriesNavigation.previous}
                      label="Previous in series"
                    />
                  ) : null}

                  {seriesNavigation?.next ? (
                    <FeaturedPostCard post={seriesNavigation.next} label="Next in series" />
                  ) : null}

                  {relatedPosts[0] ? (
                    <FeaturedPostCard
                      post={relatedPosts[0]}
                      label={topicCluster ? `Related from ${topicCluster.label}` : 'Related article'}
                    />
                  ) : null}
                </div>
              </footer>
            </div>
          </article>
        </div>
      </main>

      {showPlayer && (
        <div className="fixed right-0 bottom-0 left-0 z-[200]">
          <div className="bg-border h-1 cursor-pointer">
            <div
              className="bg-accent h-full transition-all duration-300"
              style={{ width: `${ttsProgress}%` }}
            />
          </div>

          <div className="bg-background/95 border-border safe-area-inset-bottom border-t px-3 py-3 backdrop-blur-xl md:px-6 md:py-4">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 md:gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#071B3A]">
                  <Volume2 className="h-5 w-5 text-[#F5F0EA]" />
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="text-foreground max-w-[120px] truncate text-xs font-medium md:max-w-none md:text-sm">
                    {post.title}
                  </p>
                  <p className="text-muted-foreground text-xs">{speed}x</p>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-4">
                <button
                  onClick={handleRestart}
                  className="text-muted-foreground hover:text-foreground p-1.5 transition-colors md:p-2"
                  title="Restart"
                >
                  <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
                </button>

                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8BD63F] text-[#071B3A] transition-colors hover:bg-[#7BC335] md:h-12 md:w-12"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4 md:h-5 md:w-5" />
                  )}
                </button>

                <button
                  onClick={handleStop}
                  className="text-muted-foreground hover:text-foreground p-1.5 transition-colors md:p-2"
                  title="Stop"
                >
                  <Square className="h-3 w-3 md:h-4 md:w-4" />
                </button>
              </div>

              <div className="flex flex-1 items-center justify-end gap-1">
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`rounded-full p-1.5 transition-colors md:p-2 ${
                      showSettings
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Settings"
                  >
                    <Settings className="h-4 w-4 md:h-5 md:w-5" />
                  </button>

                  {showSettings && (
                    <div className="paper-card absolute right-0 bottom-full mb-3 w-64 rounded-xl p-3 md:w-72 md:rounded-2xl md:p-4">
                      <div className="mb-3 flex items-center justify-between md:mb-4">
                        <h4 className="text-foreground text-sm font-semibold md:text-base">
                          Playback Settings
                        </h4>
                        <button
                          onClick={() => setShowSettings(false)}
                          className="hover:bg-muted rounded-full p-1"
                        >
                          <X className="text-muted-foreground h-4 w-4" />
                        </button>
                      </div>

                      <div className="mb-4 md:mb-5">
                        <label className="text-foreground mb-2 flex items-center justify-between text-xs font-medium md:mb-3 md:text-sm">
                          <span>Speed</span>
                          <span className="text-accent">{speed}x</span>
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.25"
                          value={speed}
                          onChange={(event) => {
                            const newSpeed = parseFloat(event.target.value);
                            setSpeed(newSpeed);
                          }}
                          className="bg-muted accent-accent h-2 w-full cursor-pointer appearance-none rounded-full"
                        />
                        <div className="text-muted-foreground mt-1 flex justify-between text-xs md:mt-2">
                          <span>0.5x</span>
                          <span>1x</span>
                          <span>1.5x</span>
                          <span>2x</span>
                        </div>
                      </div>

                      {voices.length > 0 && (
                        <div>
                          <label className="text-foreground mb-2 block text-xs font-medium md:text-sm">
                            Voice
                          </label>
                          <select
                            value={selectedVoice?.name || ''}
                            onChange={(event) => {
                              const voice = voices.find((item) => item.name === event.target.value);
                              setSelectedVoice(voice || null);
                            }}
                            className="border-border bg-card text-foreground focus:ring-accent w-full cursor-pointer rounded-lg border p-2 text-xs focus:ring-2 md:rounded-xl md:p-2.5 md:text-sm"
                          >
                            {voices.map((voice) => (
                              <option key={voice.name} value={voice.name}>
                                {voice.name
                                  .replace('Microsoft ', '')
                                  .replace('Google ', '')
                                  .replace(' (Natural)', '')}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <p className="text-muted-foreground mt-3 text-xs md:mt-4">
                        Changes apply when you restart
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleStop}
                  className="text-muted-foreground hover:text-foreground p-1.5 transition-colors md:p-2"
                  title="Close player"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
