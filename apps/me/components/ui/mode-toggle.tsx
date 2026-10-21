"use client";

import { motion } from "framer-motion";
import { Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { useEffect, useRef, useState } from "react";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

const THEMES = ["light", "dark", "night"] as const;
type ThemeName = (typeof THEMES)[number];

const THEME_META: Record<ThemeName, { label: string; Icon: typeof Sun }> = {
  light: { label: "Giấy dó", Icon: Sun },
  dark: { label: "Mực tàu", Icon: Moon },
  night: { label: "Đêm Sài Gòn", Icon: Sparkles },
};

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current: ThemeName =
    mounted && THEMES.includes(theme as ThemeName) ? (theme as ThemeName) : "light";
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
  const { Icon, label } = THEME_META[current];

  const toggleTheme = async () => {
    if (!buttonRef.current || isAnimatingRef.current) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const transitionDocument = document as ViewTransitionDocument;

    if (
      prefersReducedMotion ||
      typeof transitionDocument.startViewTransition !== "function"
    ) {
      setTheme(next);
      return;
    }

    isAnimatingRef.current = true;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    const radius = Math.hypot(maxX, maxY);
    const root = document.documentElement;
    const revealFrames = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${radius}px at ${x}px ${y}px)`,
    ];

    try {
      const transition = transitionDocument.startViewTransition(() => {
        flushSync(() => {
          setTheme(next);
        });
      });

      await transition.ready;

      const animation = root.animate(
        { clipPath: revealFrames },
        {
          duration: 900,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );

      await Promise.allSettled([transition.finished, animation.finished]);
    } catch {
      setTheme(next);
    } finally {
      requestAnimationFrame(() => {
        isAnimatingRef.current = false;
      });
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      aria-label={`Theme: ${label}. Switch to ${THEME_META[next].label}`}
      title={label}
      data-cursor={label}
      onClick={() => void toggleTheme()}
      whileTap={{ scale: 0.96 }}
      className="group relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-edge bg-background text-foreground transition-all duration-300 hover:border-brand/50 hover:bg-muted"
    >
      <motion.span
        suppressHydrationWarning
        animate={{ opacity: current === "light" ? 0.08 : 0.2 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute inset-[8px] rounded-full bg-brand/40 blur-md"
      />
      <motion.span
        key={current}
        suppressHydrationWarning
        initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 inline-flex items-center justify-center"
      >
        <Icon className="size-[18px]" strokeWidth={1.8} />
      </motion.span>
    </motion.button>
  );
}
