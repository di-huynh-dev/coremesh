"use client";

import { SearchDialog } from "@/components/layout/search-dialog";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import type { SearchEntry } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("navigation");

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex size-9 items-center justify-center rounded-full text-ink/75 transition-colors hover:bg-paper hover:text-ink"
      aria-label={t("toggleTheme")}
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </button>
  );
}

export function Navbar({ searchIndex }: { searchIndex: SearchEntry[] }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}/blog`, label: t("explore"), match: `/${locale}/blog` },
    { href: `/${locale}/roadmap`, label: t("roadmaps"), match: `/${locale}/roadmap` },
    { href: `/${locale}/guides`, label: t("guides"), match: `/${locale}/guides` },
    { href: `/${locale}/tools`, label: t("tools"), match: `/${locale}/tools` },
    { href: `/${locale}#about`, label: t("about") },
  ];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing =
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-xl [view-transition-name:site-header]">
      <nav className="wrap flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-10">
          <Link
            href={`/${locale}`}
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Image
              src="/round-avatar.svg"
              alt=""
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="text-[1.05rem] font-bold tracking-[-0.02em] text-ink">
              DiCodeWeb
            </span>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => {
              const active = link.match ? pathname.startsWith(link.match) : false;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    active ? "text-ink" : "text-soft hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mr-1 hidden h-9 items-center gap-2 rounded-full border border-line pr-2 pl-3.5 text-sm text-soft transition-colors hover:border-ink/25 hover:text-ink sm:inline-flex"
          >
            <Search className="size-4" />
            <span>{t("search")}</span>
            <kbd className="rounded-md border border-line bg-paper px-1.5 py-0.5 font-mono text-[0.65rem] text-faint">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t("search")}
            className="flex size-9 items-center justify-center rounded-full text-ink/75 hover:bg-paper sm:hidden"
          >
            <Search className="size-4" />
          </button>
          <ThemeToggle />
          <Suspense fallback={<span className="w-15" />}>
            <LanguageSwitcher />
          </Suspense>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-full text-ink/75 hover:bg-paper lg:hidden"
            aria-label={t("menu")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen ? (
        <div className="border-t border-line bg-background lg:hidden">
          <div className="wrap flex flex-col py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg py-3 text-base font-medium text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        entries={searchIndex}
      />
    </header>
  );
}
