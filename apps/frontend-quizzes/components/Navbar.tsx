"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiSun,
  FiMoon,
  FiBookOpen,
  FiHelpCircle,
  FiGrid,
  FiMenu,
  FiX,
  FiCheckSquare,
} from "react-icons/fi";
import { GiTrophyCup } from "react-icons/gi";
import Logo from "./Logo";

const Navbar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage or system preference to sync the correct icon state
    const isDark = document.documentElement.classList.contains("dark");
    const handle = requestAnimationFrame(() => {
      setTheme(isDark ? "dark" : "light");
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    // Update document styles
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("theme", nextTheme);
  };

  const navLinks = [
    { href: "/topics", label: "Topics", icon: <FiGrid className="w-4 h-4" /> },
    {
      href: "/questions",
      label: "Questions",
      icon: <FiHelpCircle className="w-4 h-4" />,
    },
    {
      href: "/guides",
      label: "Guides",
      icon: <FiBookOpen className="w-4 h-4" />,
    },
    {
      href: "/quizzes",
      label: "Quizzes",
      icon: <FiCheckSquare className="w-4 h-4" />,
    },
  ];

  // Helper to check if a link is active
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/70 border-b border-card-border/80 transition-colors duration-300 flex flex-col">
      {/* Dynamic Announcement Bar */}
      <div className="w-full bg-gradient-to-r from-sky-500/8 via-blue-500/4 to-sky-500/8 dark:from-sky-500/12 dark:via-blue-500/8 dark:to-sky-500/12 border-b border-sky-500/10 dark:border-sky-500/15 py-2 px-4 text-center transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-foreground/80 dark:text-foreground/95 flex-wrap font-medium">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block animate-pulse">🔥</span>
            <span>
              New Questions and Guides Added Every Week. Stay Ahead of Your Next
              Frontend Interview.
            </span>
          </span>
          <Link
            href="/questions/behavioral"
            className="inline-flex items-center gap-1 ml-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20 hover:bg-sky-500/20 hover:text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 dark:hover:bg-sky-500/20 dark:hover:text-sky-300 transition-all duration-200 group/cta cursor-pointer"
          >
            <span>See What&apos;s New</span>
            <span className="transform group-hover/cta:translate-x-0.5 transition-transform duration-150">
              &rarr;
            </span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between w-full">
        {/* Brand Logo */}
        <Logo />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1.5 text-sm font-medium transition-colors duration-200 hover:text-foreground cursor-pointer ${
                isActive(link.href)
                  ? "text-foreground font-semibold"
                  : "text-text-muted"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-sky-500" />
              )}
            </Link>
          ))}

          {/* Challenges Link (Desktop - Coming Soon) */}
          <div className="flex items-center gap-1.5 opacity-60 select-none text-sm font-medium text-text-muted">
            <span>Challenges</span>
            <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Soon
            </span>
          </div>
        </nav>

        {/* Action Controls (Theme, Hamburger) */}
        <div className="flex items-center gap-4 z-50">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-card-border bg-card-bg/40 backdrop-blur-md hover:bg-foreground/5 text-foreground hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <FiSun className="w-4.5 h-4.5 text-yellow-400 rotate-0 transition-transform duration-300" />
            ) : (
              <FiMoon className="w-4.5 h-4.5 text-indigo-500 rotate-0 transition-transform duration-300" />
            )}
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center border border-card-border bg-card-bg/40 backdrop-blur-md hover:bg-foreground/5 text-foreground hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <FiX className="w-4.5 h-4.5 transition-transform duration-200 rotate-90" />
            ) : (
              <FiMenu className="w-4.5 h-4.5 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Smooth Dropdown/Overlay) */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-card-border/80 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
          isOpen
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-4">
          <div className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-1">
            Menu
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-foreground/5 cursor-pointer ${
                isActive(link.href)
                  ? "bg-foreground/5 border border-card-border font-semibold text-foreground"
                  : "border border-transparent text-text-muted"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive(link.href)
                    ? "bg-sky-500/20 text-sky-500"
                    : "bg-card-bg border border-card-border text-text-muted"
                }`}
              >
                {link.icon}
              </div>
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}

          {/* Challenges Link (Mobile - Coming Soon) */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-transparent opacity-65 select-none bg-foreground/3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-card-bg border border-card-border text-text-muted">
                <GiTrophyCup className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-text-muted">
                Challenges
              </span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Soon
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
