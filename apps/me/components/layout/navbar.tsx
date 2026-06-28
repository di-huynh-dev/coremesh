"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#blog", label: "Blog" },
  { href: "#experience", label: "Projects" },
];

export function Navbar() {
  const [affixed, setAffixed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setAffixed(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      data-affix={affixed}
      className="fixed inset-x-0 top-0 z-50 max-w-screen overflow-x-hidden bg-background/92 px-2 pt-2 backdrop-blur-sm transition-shadow duration-300 data-[affix=true]:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]"
    >
      <div className="profile-rail rail-box screen-line-after flex h-12 items-center justify-between gap-4 px-6 max-sm:px-3">
        <Link
          href="/"
          aria-label="Home"
          className="inline-flex size-10 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105"
        >
          <Image
            src="/round-avatar.svg"
            alt=""
            width={40}
            height={40}
            className="size-10"
            priority
          />
        </Link>

        <div className="flex items-center gap-4 max-sm:gap-2">
          <nav className="hidden items-center gap-4 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/di-huynh-dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
            >
            <Image
              src="https://cdn.simpleicons.org/github/18181B"
              alt=""
              width={16}
              height={16}
              unoptimized
              className="size-4"
            />
            </a>
            <ModeToggle />
            <button
              type="button"
              aria-label="Toggle menu"
              className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted sm:hidden"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
