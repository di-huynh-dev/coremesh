"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { GithubDark } from "@/components/ui/svgs/githubDark";
import { GithubLight } from "@/components/ui/svgs/githubLight";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { href: "#about", label: "Summary" },
  { href: "#techstack", label: "Stack" },
  { href: "#experience", label: "Experience" },
  { href: "#blog", label: "Blog" },
  { href: "#contact", label: "Contact" },
  { href: "/story", label: "Story ✦" },
];

const ease = [0.22, 1, 0.36, 1] as const;

function useActiveSection() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const targets = navLinks
      .filter((link) => link.href.startsWith("#"))
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    targets.forEach((target) => observer.observe(target));

    const onScroll = () => {
      if (window.scrollY < 240) setActive("");
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return active;
}

export function Navbar() {
  const [affixed, setAffixed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection();

  useEffect(() => {
    const handleScroll = () => setAffixed(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <header
      data-affix={affixed}
      className="fixed inset-x-0 top-0 z-50 max-w-screen overflow-x-hidden border-b border-edge bg-background/92 px-2 pt-2 backdrop-blur-md transition-shadow duration-300 data-[affix=true]:shadow-[0_0_16px_0_rgba(40,20,0,0.10)] dark:data-[affix=true]:shadow-[0_0_16px_0_rgba(0,0,0,0.5)]"
    >
      <div className="profile-rail rail-box screen-line-after flex h-12 items-center justify-between gap-2 bg-background px-4">
        <Link
          href="/"
          aria-label="Home"
          className="group inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap"
        >
          <Image
            src="/round-avatar.svg"
            alt=""
            width={40}
            height={40}
            className="size-9 transition-transform duration-500 group-hover:rotate-[24deg]"
            priority
          />
          <span className="font-display hidden text-lg font-medium italic sm:inline">
            Di<span className="text-brand">.</span>dev
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <nav
            aria-label="Main navigation"
            className="hidden shrink-0 items-center md:flex"
          >
            {navLinks.map((link) => {
              const isActive = active === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative shrink-0 whitespace-nowrap px-2 py-1.5 font-mono text-[13px] transition-colors duration-300 ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ duration: 0.35, ease }}
                      className="absolute inset-x-2 -bottom-[7px] h-[2px] bg-brand"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="https://github.com/di-huynh-dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-edge bg-background text-foreground transition-all duration-300 hover:border-brand/50 hover:bg-muted"
            >
              <GithubLight className="relative z-10 size-[18px] dark:hidden" />
              <GithubDark className="relative z-10 hidden size-[18px] dark:block" />
            </a>
            <button
              type="button"
              aria-label="Open command palette"
              data-cursor="Ctrl K"
              onClick={() => window.dispatchEvent(new Event("palette:open"))}
              className="inline-flex size-10 items-center justify-center rounded-full border border-edge bg-background text-foreground transition-all duration-300 hover:border-brand/50 hover:bg-muted"
            >
              <Search className="size-4" />
            </button>
            <ModeToggle />
            <motion.button
              ref={menuButtonRef}
              type="button"
              aria-label="Toggle menu"
              aria-controls="mobile-navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              whileTap={{ scale: 0.96 }}
              className="inline-flex size-10 items-center justify-center rounded-full border border-edge bg-background text-foreground transition-all duration-300 hover:border-brand/50 hover:bg-muted md:hidden"
            >
              <motion.span
                animate={{ rotate: mobileOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease }}
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease }}
            className="profile-rail overflow-hidden px-2 pb-2 md:hidden"
          >
            <nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              className="dot-pattern relative max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-edge bg-card p-2 shadow-[0_18px_40px_rgba(40,20,0,0.14)]"
            >
              {navLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 font-mono text-sm text-foreground/85 transition-colors hover:bg-brand/10 hover:text-foreground"
                >
                  <span className="text-xs text-brand">0{i + 1}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
