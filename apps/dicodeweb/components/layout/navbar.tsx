"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import type { HomeLocale } from "@/lib/home-content";

type NavbarProps = {
  labels?: {
    about: string;
    tracks: string;
    blog: string;
    contact: string;
  };
  locale?: HomeLocale;
  localeLabel?: string;
  onLocaleChange?: (locale: HomeLocale) => void;
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
        <Sun className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

export function Navbar({
  labels,
  locale,
  localeLabel,
  onLocaleChange,
}: NavbarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks = [
    { href: "/#features", label: labels?.about ?? "Highlights" },
    { href: "/#questions", label: labels?.tracks ?? "Questions" },
    { href: "/blog", label: labels?.blog ?? "Blog" },
    { href: "/#faq", label: labels?.contact ?? "FAQ" },
  ];

  const handleLogoClick = () => {
    if (pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      router.push("/");
    }
    setMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2">
      <nav
        className="flex items-center justify-between rounded-full px-4 py-3 md:px-6"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--nav-border)",
          boxShadow: "var(--nav-shadow)",
        }}
      >
        <button
          onClick={handleLogoClick}
          className="flex shrink-0 items-center gap-3 rounded-full"
        >
          <Image
            src="/d-logo.webp"
            alt="Dicodeweb"
            width={64}
            height={64}
            className="h-10 w-10 rounded-full border border-border bg-card p-1 md:h-12 md:w-12"
          />
          <span
            className="hidden items-baseline text-[1.9rem] font-extrabold leading-none tracking-[-0.06em] md:inline-flex"
            aria-label="DiCodeWeb"
          >
            <span className="text-[#0F447A]">DiCode</span>
            <span className="text-[#79C700]">Web</span>
          </span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-[#071B3A] dark:hover:text-[#AAF85D]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {locale && localeLabel && onLocaleChange ? (
            <LanguageSwitcher
              currentLocale={locale}
              locales={["en", "vi", "ja"]}
              onChange={onLocaleChange}
              label={localeLabel}
              className="hidden md:inline-flex"
            />
          ) : null}

          <ThemeToggle />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="paper-card mt-2 space-y-1 rounded-3xl p-4 md:hidden"
          style={{
            background: "var(--nav-bg)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="block rounded-2xl px-4 py-3 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
