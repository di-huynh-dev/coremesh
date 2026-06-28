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
