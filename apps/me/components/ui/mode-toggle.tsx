"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <motion.button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileTap={{ scale: 0.96 }}
      className="group relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full border-[0.5px] border-border bg-background/90 text-foreground shadow-[inset_0_0.5px_0_rgba(255,255,255,0.72)] transition-all duration-300 hover:border-foreground/22 hover:bg-muted/60 dark:shadow-[inset_0_0.5px_0_rgba(255,255,255,0.08)] dark:hover:bg-muted/80"
    >
      <span className="absolute inset-[3px] rounded-full border-[0.5px] border-white/32 bg-gradient-to-b from-white/90 to-zinc-100/80 dark:border-white/[0.06] dark:from-white/[0.04] dark:to-white/[0.01]" />
      <motion.span
        suppressHydrationWarning
        animate={{
          scale: isDark ? 1.08 : 0.96,
          opacity: isDark ? 0.22 : 0.16,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute inset-[7px] rounded-full bg-sky-400/50 blur-md dark:bg-sky-500/40"
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
