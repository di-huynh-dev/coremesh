'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { GitHubIcon, LinkedInIcon, XIcon } from '@/components/ui/social-icons';

const footerLinks = [
  { href: '#features', label: 'Highlights' },
  { href: '#questions', label: 'Questions' },
  { href: '/blog', label: 'Blog' },
  { href: '#faq', label: 'FAQ' },
];

const socialLinks = [
  { href: 'https://github.com', icon: GitHubIcon, label: 'GitHub' },
  { href: 'https://www.linkedin.com', icon: LinkedInIcon, label: 'LinkedIn' },
  { href: 'https://twitter.com', icon: XIcon, label: 'X' },
  { href: 'mailto:hello@dicodeweb.com', icon: Mail, label: 'Email' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#0F2C57] bg-[#071B3A] px-6 py-16 text-[#F5F0EA]">
      <div className="editorial-grid">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="inline-flex items-baseline text-[1.9rem] font-extrabold leading-none tracking-[-0.06em]">
                <span className="text-[#D7E2FF]">DiCode</span>
                <span className="text-[#79C700]">Web</span>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-6 text-[#D7E2FF]/75">
              A premium editorial learning system for developers and digital
              creators who want practical depth without visual noise.
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-[#F5F0EA]">Navigate</p>
            {footerLinks.map((link) => (
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
            <p className="text-sm font-semibold text-[#F5F0EA]">Connect</p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#21446F] bg-white/5 text-[#D7E2FF]/75 transition-all hover:-translate-y-0.5 hover:border-[#22C7E8] hover:text-[#22C7E8]"
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
          <p>&copy; {currentYear} DiCodeWeb. All rights reserved.</p>
          <p>Paper, ink, code, and real learning momentum.</p>
        </div>
      </div>
    </footer>
  );
}
