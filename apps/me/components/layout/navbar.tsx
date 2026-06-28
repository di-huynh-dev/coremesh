"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { GithubDark } from "@/components/ui/svgs/githubDark";
import { GithubLight } from "@/components/ui/svgs/githubLight";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#about", label: "Summary" },
  { href: "#techstack", label: "Stack" },
  { href: "#experience", label: "Experience" },
  { href: "#blog", label: "Blog" },
];

const menuPanelVariants = {
  closed: {
    opacity: 0,
    y: -10,
    scaleY: 0.92,
    filter: "blur(8px)",
    transformOrigin: "top",
    transition: {
      duration: 0.18,
      when: "afterChildren",
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    filter: "blur(0px)",
    transformOrigin: "top",
    transition: {
      duration: 0.24,
      when: "beforeChildren",
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const menuItemVariants = {
  closed: { opacity: 0, x: -14 },
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22 },
  },
};

export function Navbar() {
  const [affixed, setAffixed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setAffixed(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  return (
    <header
      data-affix={affixed}
      className="fixed inset-x-0 top-0 z-50 max-w-screen overflow-x-hidden bg-background px-2 pt-2 transition-shadow duration-300 data-[affix=true]:shadow-[0_0_16px_0_rgba(0,0,0,0.08)] dark:data-[affix=true]:shadow-[0_0_16px_0_rgba(0,0,0,0.45)]"
    >
      <div className="profile-rail rail-box screen-line-after flex h-12 items-center justify-between gap-4 px-6 max-sm:px-4">
        <Link
          href="/"
          aria-label="Home"
          className="inline-flex size-10 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105"
        >
          <Image
            src="/round-avatar.svg"
            alt=""
            width={40}
            height={40}
            className="size-10"
            priority
          />
        </Link>

        <div className="flex items-center gap-4 max-sm:gap-2">
          <nav className="hidden items-center gap-4 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/di-huynh-dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-black/20 bg-background text-foreground transition-all duration-300 hover:bg-zinc-50 dark:border-white/75 dark:hover:bg-muted/80"
            >
              <span className="absolute inset-[3px] rounded-full bg-zinc-100/80 dark:bg-white/[0.03]" />
              <GithubLight className="relative z-10 size-[18px] dark:hidden" />
              <GithubDark className="relative z-10 hidden size-[18px] dark:block" />
            </a>
            <ModeToggle />
            <motion.button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              whileTap={{ scale: 0.96 }}
              className="inline-flex size-10 items-center justify-center rounded-full border-[0.5px] border-border bg-background text-foreground transition-all duration-300 hover:border-foreground/22 hover:bg-muted/60 dark:hover:bg-muted/80 sm:hidden"
            >
              <motion.span
                animate={{
                  rotate: mobileOpen ? 180 : 0,
                  scale: mobileOpen ? 0.96 : 1,
                }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center justify-center"
              >
                {mobileOpen ? (
                  <X className="size-4" />
                ) : (
                  <Menu className="size-4" />
                )}
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuPanelVariants}
            className="profile-rail rail-box screen-line-after overflow-hidden bg-background sm:hidden"
          >
            <nav className="dot-pattern relative flex flex-col divide-y divide-edge px-4 py-2">
              <motion.span
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-4 top-0 h-px origin-left bg-gradient-to-r from-sky-500/0 via-sky-500/55 to-sky-500/0"
              />
              {navLinks.map((link) => (
                <motion.div key={link.href} variants={menuItemVariants}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="group block py-3 font-mono text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-sky-500/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
