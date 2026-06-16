'use client';

import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import type { HomeLocale } from '@/lib/home-content';

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

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <button className="border-border bg-card flex h-10 w-10 items-center justify-center rounded-full border">
        <Sun className="text-muted-foreground h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="border-border bg-card text-muted-foreground hover:text-foreground flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function Navbar({ labels, locale, localeLabel, onLocaleChange }: NavbarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks = [
    { href: '/questions', label: labels?.questions ?? labels?.tracks ?? 'Questions' },
    { href: '/roadmap', label: labels?.roadmap ?? 'Lộ trình' },
    { href: '/blog', label: labels?.blog ?? 'Blog' },
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

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2">
      <nav
        className="flex items-center justify-between rounded-full px-4 py-3 md:px-6"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--nav-border)',
          boxShadow: 'var(--nav-shadow)',
        }}
      >
        <button onClick={handleLogoClick} className="flex shrink-0 items-center gap-3 rounded-full">
          <Image
            src="/d-logo.webp"
            alt="Dicodeweb"
            width={64}
            height={64}
            className="border-border bg-card h-10 w-10 rounded-full border p-1 md:h-12 md:w-12"
          />
          <span
            className="hidden items-baseline text-[1.9rem] leading-none font-extrabold tracking-[-0.06em] md:inline-flex"
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
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === link.href
                  ? 'font-semibold text-[#071B3A] dark:text-[#AAF85D]'
                  : 'text-muted-foreground hover:text-[#071B3A] dark:hover:text-[#AAF85D]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {locale && localeLabel && onLocaleChange ? (
            <LanguageSwitcher
              currentLocale={locale}
              locales={['en', 'vi', 'ja']}
              onChange={onLocaleChange}
              label={localeLabel}
              className="hidden md:inline-flex"
            />
          ) : null}

          <ThemeToggle />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="border-border bg-card text-muted-foreground hover:text-foreground rounded-full border p-2 transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="paper-card mt-2 space-y-1 rounded-3xl p-4 md:hidden"
          style={{
            background: 'var(--nav-bg)',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-2xl px-4 py-3 font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
