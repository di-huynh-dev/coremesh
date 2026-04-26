"use client";

import { BookOpen, ExternalLink, FolderOpen, Tag } from "lucide-react";
import Link from "next/link";

const navItems = [
  { label: "All Posts", href: "#blog", icon: BookOpen },
  { label: "Categories", href: "#blog", icon: FolderOpen },
  { label: "Tags", href: "#blog", icon: Tag },
];

type BlogNavbarProps = {
  blogsBaseUrl: string;
};

export function BlogNavbar({ blogsBaseUrl }: BlogNavbarProps) {
  return (
    <div className="mb-8">
      <nav
        className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 md:px-6"
        style={{
          background: "var(--nav-bg, rgba(255, 255, 255, 0.7))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "var(--nav-shadow, 0 8px 32px rgba(0, 0, 0, 0.08))",
        }}
      >
        <div className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <a
          href={`${blogsBaseUrl}/blog`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
        >
          Open blogs
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </nav>
    </div>
  );
}
