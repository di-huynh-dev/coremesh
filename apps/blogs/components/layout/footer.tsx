"use client";

import Link from "next/link";
import { Github, Linkedin, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

const socialLinks = [
  {
    href: "https://github.com/di-huynh-dev",
    icon: Github,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/feed/",
    icon: Linkedin,
    label: "LinkedIn",
  },
  {
    href: "https://www.tiktok.com/@dicodeweb",
    icon: ExternalLink,
    label: "TikTok",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const tNav = useTranslations("navigation");
  const t = useTranslations("footer");

  const footerLinks = [
    { href: "#about", label: tNav("about") },
    { href: "#blog", label: tNav("blog") },
    { href: "#contact", label: tNav("contact") },
  ];

  return (
    <footer id="contact" className="py-16 px-6 bg-[#1C1C1E] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-10">
          {/* ===== Brand ===== */}
          <div className="flex flex-col items-center gap-3 text-center">
            <Link href="/" className="text-2xl font-semibold">
              DiCodeWeb
            </Link>

            <p className="text-white/50 text-sm max-w-md">
              {t("description")}
            </p>
          </div>

          {/* ===== Navigation ===== */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ===== Social ===== */}
          <div className="flex items-center gap-5">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#FF4D8E] hover:bg-white/10 transition-all"
                  aria-label={social.label}
                >
                  <IconComponent className="w-5 h-5" />
                </a>
              );
            })}
          </div>

          {/* ===== Divider ===== */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* ===== Bottom ===== */}
          <div className="text-center space-y-2">
            <p className="text-sm text-white/40">
              © {currentYear} {t("rights")}
            </p>

            <p className="text-xs text-white/30 italic">
              {t("italicText")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
