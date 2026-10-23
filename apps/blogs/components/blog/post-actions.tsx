"use client";

import { cn } from "@/lib/utils";
import {
  Check,
  Link2,
  Pause,
  Play,
  Settings,
  SkipBack,
  Square,
  Volume2,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

function CopyLinkButton() {
  const t = useTranslations("post");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (permissions, insecure origin); nothing useful to do.
    }
  };

  return (
    <button type="button" onClick={copy} className="btn btn-ghost h-9 px-3.5 text-[0.8rem]">
      {copied ? <Check className="size-4 text-topic-performance" /> : <Link2 className="size-4" />}
      <span aria-live="polite">{copied ? t("copied") : t("copyLink")}</span>
    </button>
  );
}

/** Text-to-speech via the Web Speech API, with a docked player while active. */
function ListenPlayer({ title, content }: { title: string; content: string }) {
  const t = useTranslations("post");
  const tp = useTranslations("post.player");
  const locale = useLocale();
  const lang = locale === "vi" ? "vi" : "en";

  const [supported, setSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    setSupported(true);

    const loadVoices = () => {
      const all = speechSynthesis.getVoices();
      if (all.length === 0) return;
      const matching = all.filter((v) => v.lang.toLowerCase().startsWith(lang));
      const list = matching.length > 0 ? matching : all;
      setVoices(list);
      setVoiceName((current) => {
        if (current && list.some((v) => v.name === current)) return current;
        const preferred =
          list.find((v) => /Google|Microsoft|Natural|Samantha/.test(v.name)) ??
          list[0];
        return preferred?.name ?? null;
      });
    };

    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      speechSynthesis.cancel();
    };
  }, [lang]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  }, []);

  const start = useCallback(() => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = lang === "vi" ? "vi-VN" : "en-US";
    utterance.rate = speed;
    const voice = voices.find((v) => v.name === voiceName);
    if (voice) utterance.voice = voice;

    utterance.onboundary = (event) => {
      setProgress(event.charIndex / Math.max(content.length, 1));
    };
    utterance.onend = () => {
      reset();
      setShowPlayer(false);
    };
    utterance.onerror = reset;

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    setShowPlayer(true);
  }, [content, lang, reset, speed, voiceName, voices]);

  const play = () => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      start();
    }
  };

  const pause = () => {
    speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const stop = () => {
    speechSynthesis.cancel();
    reset();
    setShowPlayer(false);
    setShowSettings(false);
  };

  if (!supported) return null;

  return (
    <>
      {!showPlayer ? (
        <button type="button" onClick={play} className="btn btn-ink h-9 px-3.5 text-[0.8rem]">
          <Volume2 className="size-4" />
          {t("listen")}
        </button>
      ) : null}

      {showPlayer ? (
        <div className="fixed inset-x-0 bottom-0 z-200">
          <div className="h-0.5 bg-line">
            <div
              className="h-full origin-left bg-cobalt transition-transform duration-300"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
          <div className="safe-area-inset-bottom border-t border-line bg-background/95 backdrop-blur-xl">
            <div className="wrap flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-night text-white">
                  <Volume2 className="size-4" />
                </span>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-medium text-ink">{title}</p>
                  <p className="font-mono text-xs text-faint">
                    {Math.round(progress * 100)}% · {speed}x
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button type="button" onClick={start} title={tp("restart")} aria-label={tp("restart")} className="rounded-full p-2 text-soft hover:text-ink">
                  <SkipBack className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={isPlaying ? pause : play}
                  aria-label={isPlaying ? tp("pause") : tp("play")}
                  className="flex size-10 items-center justify-center rounded-full bg-ink text-background"
                >
                  {isPlaying ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
                </button>
                <button type="button" onClick={stop} title={tp("stop")} aria-label={tp("stop")} className="rounded-full p-2 text-soft hover:text-ink">
                  <Square className="size-3.5" />
                </button>
              </div>

              <div className="flex flex-1 items-center justify-end gap-1">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSettings((open) => !open)}
                    aria-label={tp("settings")}
                    aria-expanded={showSettings}
                    className={cn(
                      "rounded-full p-2 transition-colors",
                      showSettings ? "bg-cobalt-soft text-cobalt" : "text-soft hover:text-ink",
                    )}
                  >
                    <Settings className="size-4" />
                  </button>

                  {showSettings ? (
                    <div className="absolute right-0 bottom-full mb-3 w-72 rounded-2xl border border-line bg-card p-4 shadow-2xl">
                      <p className="text-sm font-semibold text-ink">{tp("settings")}</p>
                      <label className="mt-4 block text-sm text-ink">
                        <span className="flex justify-between">
                          {tp("speed")}
                          <span className="font-mono text-cobalt">{speed}x</span>
                        </span>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.25"
                          value={speed}
                          onChange={(event) => setSpeed(parseFloat(event.target.value))}
                          className="mt-2 w-full accent-cobalt"
                        />
                      </label>
                      {voices.length > 0 ? (
                        <label className="mt-4 block text-sm text-ink">
                          {tp("voice")}
                          <select
                            value={voiceName ?? ""}
                            onChange={(event) => setVoiceName(event.target.value)}
                            className="mt-2 w-full rounded-lg border border-line bg-paper p-2 text-sm"
                          >
                            {voices.map((voice) => (
                              <option key={voice.name} value={voice.name}>
                                {voice.name.replace(/^(Microsoft|Google) /, "")}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      <p className="mt-3 text-xs text-faint">{tp("applyHint")}</p>
                    </div>
                  ) : null}
                </div>
                <button type="button" onClick={stop} aria-label={tp("close")} className="rounded-full p-2 text-soft hover:text-ink">
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function PostActions({ title, content }: { title: string; content: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyLinkButton />
      <ListenPlayer title={title} content={content} />
    </div>
  );
}
