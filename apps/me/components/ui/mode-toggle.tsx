"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { useEffect, useRef, useState } from "react";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted
    ? theme === "system"
      ? resolvedTheme
      : theme
    : "light";
  const isDark = currentTheme === "dark";

  const toggleTheme = async () => {
    if (!buttonRef.current || isAnimatingRef.current) {
      return;
    }

    const nextTheme = isDark ? "light" : "dark";
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const transitionDocument = document as ViewTransitionDocument;

    if (
      prefersReducedMotion ||
      typeof transitionDocument.startViewTransition !== "function"
    ) {
      setTheme(nextTheme);
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
      root.style.setProperty("--theme-transition-x", `${x}px`);
      root.style.setProperty("--theme-transition-y", `${y}px`);
      root.style.setProperty("--theme-transition-radius", `${radius}px`);

      const transition = transitionDocument.startViewTransition(() => {
        flushSync(() => {
          setTheme(nextTheme);
        });
      });

      await transition.ready;

      const animation = root.animate(
        {
          clipPath: revealFrames,
        },
        {
          duration: 900,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );

      await Promise.allSettled([transition.finished, animation.finished]);
    } catch {
      setTheme(nextTheme);
    } finally {
      root.style.removeProperty("--theme-transition-x");
      root.style.removeProperty("--theme-transition-y");
      root.style.removeProperty("--theme-transition-radius");
      requestAnimationFrame(() => {
        isAnimatingRef.current = false;
      });
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      onClick={() => void toggleTheme()}
      whileTap={{ scale: 0.96 }}
      className="group relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-black/20 bg-background text-foreground transition-all duration-300 hover:bg-zinc-50 dark:border-white/75 dark:hover:bg-muted/80"
    >
      <span className="absolute inset-[3px] rounded-full bg-zinc-100/80 dark:bg-white/[0.03]" />
      <motion.span
        suppressHydrationWarning
        animate={{
          scale: isDark ? 1.04 : 0.94,
          opacity: isDark ? 0.16 : 0.08,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute inset-[8px] rounded-full bg-sky-400/35 blur-md dark:bg-sky-500/25"
      />
      <motion.span
        suppressHydrationWarning
        animate={{
          rotate: isDark ? 0 : 90,
          scale: isDark ? 1 : 0.92,
          y: isDark ? 0 : 0.5,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 inline-flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="size-[18px]" strokeWidth={1.8} />
        ) : (
          <Sun className="size-[18px]" strokeWidth={1.8} />
        )}
      </motion.span>
    </motion.button>
  );
}
