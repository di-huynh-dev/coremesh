"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const navLinks = [
  { href: "#about", label: "About", id: "about" },
  { href: "#techstack", label: "Tech Stack", id: "techstack" },
  { href: "#experience", label: "Experience", id: "experience" },
  { href: "#projects", label: "Projects", id: "projects" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);

      let nextActiveSection = "";

      for (const link of navLinks) {
        const element = document.getElementById(link.id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom >= 140) {
          nextActiveSection = link.id;
        }
      }

      setActiveSection(nextActiveSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentIndicator = useMemo(
    () => hoveredLink ?? activeSection,
    [hoveredLink, activeSection],
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <motion.div
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-5xl"
      >
        <motion.div
          animate={{
            width: scrolled ? "min(100%, 860px)" : "min(100%, 920px)",
            y: scrolled ? 0 : 2,
          }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="mx-auto"
        >
          <div className="relative overflow-hidden rounded-[24px] border border-black/5 bg-white/78 px-2 py-2 shadow-[0_14px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/6 dark:bg-black/55 dark:shadow-[0_14px_50px_rgba(0,0,0,0.28)] md:rounded-full md:px-3">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.46),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />

            <div className="relative flex min-w-0 items-center justify-between gap-2 md:gap-3">
              <Link
                href="/"
                className="group flex min-w-0 items-center gap-2 rounded-full px-2 py-1.5 md:gap-3 md:px-3 md:py-2"
              >
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-black/6 bg-white shadow-sm transition-transform duration-300 group-hover:scale-[1.04] dark:border-white/8 dark:bg-white/5 md:h-9 md:w-9">
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.14),transparent_58%)]" />
                  <span className="text-xs font-semibold tracking-tight text-foreground md:text-sm">
                    DI
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium tracking-[0.18em] text-foreground md:hidden">
                    HUYNH TIEN DI
                  </p>
                  <p className="hidden text-[11px] uppercase tracking-[0.34em] text-muted-foreground md:block">
                    Huynh Tien Di
                  </p>
                  <p className="hidden text-sm font-medium text-foreground md:block">
                    Frontend Engineer
                  </p>
                </div>
              </Link>

              <nav
                className="relative hidden items-center rounded-full bg-black/[0.03] p-1 dark:bg-white/[0.04] md:flex"
                onMouseLeave={() => setHoveredLink(null)}
              >
                {navLinks.map((link) => {
                  const isActive = currentIndicator === link.id;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onMouseEnter={() => setHoveredLink(link.id)}
                      className={`relative z-10 rounded-full px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 -z-10 rounded-full border border-black/5 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.06)] dark:border-white/6 dark:bg-white/8"
                          transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 28,
                          }}
                        />
                      ) : null}
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex shrink-0 items-center gap-1">
                <ModeToggle />
                <button
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/8 md:hidden"
                  onClick={() => setMobileOpen((value) => !value)}
                  aria-label="Toggle navigation"
                >
                  {mobileOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mx-auto mt-2 max-w-5xl md:hidden"
            >
              <div className="overflow-hidden rounded-[24px] border border-black/5 bg-white/88 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/6 dark:bg-black/72">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-[18px] px-4 py-3.5 text-sm transition-colors ${
                        activeSection === link.id
                          ? "bg-black/5 text-foreground dark:bg-white/8"
                          : "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/8"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
