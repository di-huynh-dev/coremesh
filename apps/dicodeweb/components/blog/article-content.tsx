'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Square, Volume2, SkipBack, Settings, X } from 'lucide-react';
import { BlogPost } from '@/lib/blog';

// Note: Blog content HTML comes from our own hardcoded lib/blog.ts file,
// not from user input, so it is safe to render.

interface ArticleContentProps {
  post: BlogPost;
}

export function ArticleContent({ post }: ArticleContentProps) {
  const authorInitials = post.author.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
  const ttsSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;
  const words = post.content
    ? post.content.split(/\s+/).filter((word) => word.length > 0)
    : [];

  // Load available voices
  useEffect(() => {
    if (!ttsSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length === 0) return;

      const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      const voicesToUse = englishVoices.length > 0 ? englishVoices : availableVoices;
      setVoices(voicesToUse);

      if (!selectedVoice) {
        const preferredVoice = voicesToUse.find(v =>
          v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural') || v.name.includes('Samantha')
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

  return (
    <>
      {/* Reading Progress Bar - Fixed at very top */}
      <div className="fixed top-0 left-0 right-0 z-[200] h-1 bg-border/60">
        <div
          className="h-full bg-linear-to-r from-[#071B3A] via-accent to-[#8BD63F] transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="min-h-screen pb-24 pt-24 md:pb-32 md:pt-32">
        <article className="reading-width mx-auto px-4 md:px-0">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 md:mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <header className="mb-8 md:mb-12">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <span className="rounded-full bg-accent/12 px-3 py-1 text-xs font-medium text-[#071B3A] md:text-sm dark:text-accent">
                {post.category}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground">
                {post.readingTime} min read
              </span>
              <span className="text-xs md:text-sm text-muted-foreground">
                {post.date}
              </span>
            </div>

            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-[#071B3A] md:mb-6 md:text-5xl dark:text-[#D7E2FF]">
              {post.title}
            </h1>

            <p className="mb-6 text-base leading-8 text-muted-foreground md:mb-8 md:text-xl">
              {post.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 md:pb-8 border-b border-border">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#071B3A] text-sm font-semibold text-[#F5F0EA] md:h-12 md:w-12 md:text-base">
                  <span>{authorInitials}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm md:text-base">{post.author.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Author</p>
                </div>
              </div>

              {ttsSupported && !showPlayer && (
                <button
                  onClick={handlePlay}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#8BD63F] px-4 py-2.5 text-[#071B3A] transition-colors hover:bg-[#7BC335] sm:w-auto"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Listen</span>
                </button>
              )}
            </div>
          </header>

          <div
            ref={articleRef}
            className="
              prose
              prose-sm
              md:prose-lg
              max-w-none

              prose-headings:font-semibold
              prose-headings:text-foreground

              prose-h2:text-xl
              md:prose-h2:text-2xl
              prose-h2:mt-10
              md:prose-h2:mt-14
              prose-h2:mb-4
              md:prose-h2:mb-6

              prose-h3:text-lg
              md:prose-h3:text-xl
              prose-h3:mt-8
              md:prose-h3:mt-10
              prose-h3:mb-3
              md:prose-h3:mb-4

              prose-p:text-sm
              md:prose-p:text-base
              prose-p:text-foreground
              prose-p:leading-relaxed
              md:prose-p:leading-[1.8]
              prose-p:mb-4
              md:prose-p:mb-6

              [&>p:first-of-type]:text-base
              md:[&>p:first-of-type]:text-xl
              [&>p:first-of-type]:text-muted-foreground
              [&>p:first-of-type]:leading-relaxed
              [&>p:first-of-type]:mb-6
              md:[&>p:first-of-type]:mb-8

              prose-a:text-accent
              prose-a:no-underline
              hover:prose-a:underline

              prose-strong:text-foreground
              prose-strong:font-semibold

              prose-code:text-[#071B3A]
              prose-code:bg-accent/10
              prose-code:px-1
              md:prose-code:px-1.5
              prose-code:py-0.5
              prose-code:rounded
              prose-code:font-normal
              prose-code:text-xs
              md:prose-code:text-sm
              prose-code:before:content-none
              prose-code:after:content-none

              prose-pre:bg-[#071B3A]
              prose-pre:border
              prose-pre:border-[#0F2C57]
              prose-pre:rounded-lg
              md:prose-pre:rounded-xl
              prose-pre:my-6
              md:prose-pre:my-8
              prose-pre:text-xs
              md:prose-pre:text-sm

              prose-blockquote:border-l-accent
              prose-blockquote:border-l-4
              prose-blockquote:bg-accent/7
              prose-blockquote:py-3
              md:prose-blockquote:py-4
              prose-blockquote:px-4
              md:prose-blockquote:px-6
              prose-blockquote:rounded-r-lg
              md:prose-blockquote:rounded-r-xl
              prose-blockquote:not-italic
              prose-blockquote:my-6
              md:prose-blockquote:my-8
              prose-blockquote:text-foreground

              prose-ul:my-4
              md:prose-ul:my-6
              prose-ul:space-y-2
              md:prose-ul:space-y-3
              prose-ol:my-4
              md:prose-ol:my-6
              prose-ol:space-y-2
              md:prose-ol:space-y-3
              prose-li:text-foreground/80
              prose-li:leading-relaxed
              prose-li:text-sm
              md:prose-li:text-base
            "
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          <footer className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-border">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline md:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              More articles
            </Link>
          </footer>
        </article>
      </main>

      {showPlayer && (
        <div className="fixed bottom-0 left-0 right-0 z-[200]">
          <div className="h-1 cursor-pointer bg-border">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${ttsProgress}%` }}
            />
          </div>

          <div className="
            bg-background/95
            backdrop-blur-xl
            border-t
            border-border
            px-3
            md:px-6
            py-3
            md:py-4
            safe-area-inset-bottom
          ">
            <div className="flex items-center justify-between gap-2 md:gap-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#071B3A]">
                  <Volume2 className="h-5 w-5 text-[#F5F0EA]" />
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="font-medium text-foreground text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{speed}x</p>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-4">
                <button
                  onClick={handleRestart}
                  className="p-1.5 md:p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Restart"
                >
                  <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8BD63F] text-[#071B3A] transition-colors hover:bg-[#7BC335] md:h-12 md:w-12"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <Play className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleStop}
                  className="p-1.5 md:p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Stop"
                >
                  <Square className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 flex-1 justify-end">
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`rounded-full p-1.5 transition-colors md:p-2 ${showSettings ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Settings"
                  >
                    <Settings className="w-4 h-4 md:w-5 md:h-5" />
                  </button>

                  {showSettings && (
                    <div className="paper-card absolute bottom-full right-0 mb-3 w-64 rounded-xl p-3 md:w-72 md:rounded-2xl md:p-4">
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h4 className="font-semibold text-foreground text-sm md:text-base">Playback Settings</h4>
                        <button
                          onClick={() => setShowSettings(false)}
                          className="rounded-full p-1 hover:bg-muted"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="mb-4 md:mb-5">
                        <label className="text-xs md:text-sm font-medium text-foreground mb-2 md:mb-3 flex items-center justify-between">
                          <span>Speed</span>
                          <span className="text-accent">{speed}x</span>
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.25"
                          value={speed}
                          onChange={(e) => {
                            const newSpeed = parseFloat(e.target.value);
                            setSpeed(newSpeed);
                          }}
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-accent"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1 md:mt-2">
                          <span>0.5x</span>
                          <span>1x</span>
                          <span>1.5x</span>
                          <span>2x</span>
                        </div>
                      </div>

                      {voices.length > 0 && (
                        <div>
                          <label className="text-xs md:text-sm font-medium text-foreground mb-2 block">
                            Voice
                          </label>
                          <select
                            value={selectedVoice?.name || ''}
                            onChange={(e) => {
                              const voice = voices.find(v => v.name === e.target.value);
                              setSelectedVoice(voice || null);
                            }}
                            className="w-full cursor-pointer rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:ring-2 focus:ring-accent md:rounded-xl md:p-2.5 md:text-sm"
                          >
                            {voices.map((voice) => (
                              <option key={voice.name} value={voice.name}>
                                {voice.name.replace('Microsoft ', '').replace('Google ', '').replace(' (Natural)', '')}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-3 md:mt-4">
                        Changes apply when you restart
                      </p>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={handleStop}
                  className="p-1.5 md:p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Close player"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
