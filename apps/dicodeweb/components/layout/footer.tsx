'use client';

import { Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GitHubIcon, LinkedInIcon } from '@/components/ui/social-icons';

const footerLinks = [
  { href: '/questions', label: 'Questions' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/free-assessment', label: 'Assessment' },
  { href: '/blog', label: 'Blog' },
];

const socialLinks = [
  { href: 'https://github.com/di-huynh-dev', icon: GitHubIcon, label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/huynhtiendi/', icon: LinkedInIcon, label: 'LinkedIn' },
  { href: 'mailto:dihuynhdev.contact@gmail.com', icon: Mail, label: 'Email' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.25fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/d-logo.svg"
                alt="DiCodeWeb"
                width={44}
                height={44}
                className="h-11 w-11 rounded-full border border-border bg-card p-1"
              />
              <span className="text-xl font-bold">DiCodeWeb</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
              Questions, roadmaps and assessments for frontend developers moving
              toward senior-level judgment.
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-foreground">Navigate</p>
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Connect</p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:text-foreground"
                    aria-label={social.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Copyright {currentYear} DiCodeWeb. Built for engineers who want sharper signal.</p>
          <p>Excellent 4.9 out of 5 - learning outcomes depend on practice.</p>
        </div>
      </div>
    </footer>
  );
}
