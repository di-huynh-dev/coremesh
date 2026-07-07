'use client';

import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { homeLocales, type HomeLocale } from '@/lib/home-content';
import {
  getPreferredLocale,
  setPreferredLocale,
  subscribeToLocaleChange,
} from '@/lib/site-locale';

type NavbarProps = {
  labels?: {
    about?: string;
    tracks?: string;
    questions?: string;
    roadmap?: string;
    blog?: string;
    contact?: string;
  };
  locale?: HomeLocale;
  localeLabel?: string;
  onLocaleChange?: (locale: HomeLocale) => void;
};

const defaultNavbarCopy: Record<
  HomeLocale,
  {
    localeLabel: string;
    questions: string;
    roadmap: string;
    assessment: string;
    blog: string;
  }
> = {
  en: {
    localeLabel: 'Language',
    questions: 'Questions',
    roadmap: 'Roadmap',
    assessment: 'Assessment',
    blog: 'Blog',
  },
  vi: {
    localeLabel: 'Language',
    questions: 'Questions',
    roadmap: 'Roadmap',
    assessment: 'Assessment',
    blog: 'Blog',
  },
  ja: {
    localeLabel: 'Language',
    questions: 'Questions',
    roadmap: 'Roadmap',
    assessment: 'Assessment',
    blog: 'Blog',
  },
};

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function Navbar({ labels, locale, localeLabel, onLocaleChange }: NavbarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const systemLocale = useSyncExternalStore<HomeLocale>(
    subscribeToLocaleChange,
    getPreferredLocale,
    () => 'en',
  );
  const activeLocale = locale ?? systemLocale;
  const activeCopy = defaultNavbarCopy[activeLocale];
  const handleLocaleUpdate = onLocaleChange ?? setPreferredLocale;
  const navLinks = [
    {
      href: '/questions',
      label: labels?.questions ?? labels?.tracks ?? activeCopy.questions,
    },
    { href: '/roadmap', label: labels?.roadmap ?? activeCopy.roadmap },
    { href: '/free-assessment', label: activeCopy.assessment },
    { href: '/blog', label: labels?.blog ?? activeCopy.blog },
  ];

  const handleLogoClick = () => {
    if (pathname === '/') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      router.push('/');
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const updateNavOffset = () => {
      if (!headerRef.current) return;

      const { bottom } = headerRef.current.getBoundingClientRect();
      document.documentElement.style.setProperty('--site-nav-offset', `${Math.ceil(bottom + 12)}px`);
    };

    updateNavOffset();
    const resizeObserver = new ResizeObserver(updateNavOffset);

    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    window.addEventListener('resize', updateNavOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateNavOffset);
    };
  }, [mobileMenuOpen]);

  return (
    <header ref={headerRef} className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2">
      <nav className="flex h-[68px] items-center justify-between rounded-full border border-[var(--nav-border)] bg-[var(--nav-bg)] px-3 shadow-[var(--nav-shadow)] backdrop-blur-xl md:px-4">
        <button onClick={handleLogoClick} className="flex shrink-0 items-center gap-3 rounded-full" type="button">
          <Image
            src="/d-logo.svg"
            alt="Dicodeweb"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border border-border bg-background p-1"
          />
          <span className="hidden items-baseline text-xl font-bold leading-none tracking-[-0.04em] text-foreground md:inline-flex">
            DiCodeWeb
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher
            currentLocale={activeLocale}
            locales={homeLocales}
            onChange={handleLocaleUpdate}
            label={localeLabel ?? activeCopy.localeLabel}
            className="hidden md:inline-flex"
          />

          <ThemeToggle />

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Toggle menu"
            type="button"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen ? (
        <div className="mt-2 overflow-hidden rounded-[28px] border border-border bg-popover p-3 shadow-[var(--nav-shadow)] backdrop-blur-xl md:hidden">
          <LanguageSwitcher
            currentLocale={activeLocale}
            locales={homeLocales}
            onChange={handleLocaleUpdate}
            label={localeLabel ?? activeCopy.localeLabel}
            className="mb-3 w-fit"
          />

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
