'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { GitHubIcon, LinkedInIcon, XIcon } from '@/components/ui/social-icons';
import { useSyncExternalStore } from 'react';
import type { HomeLocale } from '@/lib/home-content';
import { homeLocales } from '@/lib/home-content';

const storageKey = 'dicodeweb-home-locale';

function getPreferredLocale(): HomeLocale {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const storedLocale = window.localStorage.getItem(storageKey);

  if (storedLocale && homeLocales.includes(storedLocale as HomeLocale)) {
    return storedLocale as HomeLocale;
  }

  const browserLanguage = window.navigator.language.toLowerCase();

  if (browserLanguage.startsWith('vi')) {
    return 'vi';
  }

  if (browserLanguage.startsWith('ja')) {
    return 'ja';
  }

  return 'en';
}

function subscribeToLocaleChange(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('dicodeweb-locale-change', handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('dicodeweb-locale-change', handler);
  };
}

type FooterCopy = {
  description: string;
  navigate: string;
  links: Array<{ href: string; label: string }>;
  connect: string;
  copyright: string;
  tagline: string;
};

const footerContent: Record<HomeLocale, FooterCopy> = {
  en: {
    description:
      'A premium editorial learning system for developers and digital creators who want practical depth without visual noise.',
    navigate: 'Navigate',
    links: [
      { href: '#features', label: 'Highlights' },
      { href: '#questions', label: 'Questions' },
      { href: '/blog', label: 'Blog' },
      { href: '#faq', label: 'FAQ' },
    ],
    connect: 'Connect',
    copyright: 'DiCodeWeb. All rights reserved.',
    tagline: 'Paper, ink, code, and real learning momentum.',
  },
  vi: {
    description:
      'Hệ thống học tập biên tập cao cấp dành cho lập trình viên và nhà sáng tạo số muốn đào sâu thực tế mà không bị nhiễu thị giác.',
    navigate: 'Điều hướng',
    links: [
      { href: '#features', label: 'Điểm nhấn' },
      { href: '#questions', label: 'Câu hỏi' },
      { href: '/blog', label: 'Blog' },
      { href: '#faq', label: 'Hỏi đáp' },
    ],
    connect: 'Kết nối',
    copyright: 'DiCodeWeb. Mọi quyền được bảo lưu.',
    tagline: 'Giấy, mực, mã nguồn và động lực học tập thực sự.',
  },
  ja: {
    description:
      '実践的な深さを求める開発者やデジタルクリエイターのための、プレミアムなエディトリアル学習システム。',
    navigate: 'ナビゲート',
    links: [
      { href: '#features', label: 'ハイライト' },
      { href: '#questions', label: '質問' },
      { href: '/blog', label: 'ブログ' },
      { href: '#faq', label: 'よくある質問' },
    ],
    connect: '接続',
    copyright: 'DiCodeWeb. 全著作権所有。',
    tagline: '紙、インク、コード、そして本物の学習の勢い。',
  },
};

const socialLinks = [
  { href: 'https://github.com', icon: GitHubIcon, label: 'GitHub' },
  { href: 'https://www.linkedin.com', icon: LinkedInIcon, label: 'LinkedIn' },
  { href: 'https://twitter.com', icon: XIcon, label: 'X' },
  { href: 'mailto:hello@dicodeweb.com', icon: Mail, label: 'Email' },
];

export function Footer() {
  const locale = useSyncExternalStore<HomeLocale>(
    subscribeToLocaleChange,
    getPreferredLocale,
    () => 'en',
  );
  const copy = footerContent[locale];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#0F2C57] bg-[#071B3A] px-6 py-16 text-[#F5F0EA]">
      <div className="editorial-grid">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="inline-flex items-baseline text-[1.9rem] leading-none font-extrabold tracking-[-0.06em]">
                <span className="text-[#D7E2FF]">DiCode</span>
                <span className="text-[#79C700]">Web</span>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-6 text-[#D7E2FF]/75">{copy.description}</p>
          </div>

          <nav className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-[#F5F0EA]">{copy.navigate}</p>
            {copy.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#D7E2FF]/75 transition-colors hover:text-[#8BD63F]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#F5F0EA]">{copy.connect}</p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:border-accent hover:text-accent flex h-10 w-10 items-center justify-center rounded-full border border-[#21446F] bg-white/5 text-[#D7E2FF]/75 transition-all hover:-translate-y-0.5"
                    aria-label={social.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#21446F] pt-6 text-sm text-[#D7E2FF]/70 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {currentYear} {copy.copyright}
          </p>
          <p>{copy.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
