import { socials } from "@/lib/data/profile";
import Link from "next/link";
import { dictionaries } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const t = dictionaries[locale].footer;

  return (
    <footer className="profile-rail rail-box px-4 py-8 text-center font-mono text-xs text-muted-foreground">
      <p className="font-display text-xl text-foreground italic">
        {t.tagline}<span className="text-brand">.</span>
      </p>
      <p className="mt-2">
        © {new Date().getFullYear()} · {t.builtBy}{" "}
        <a
          href={socials.github.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline decoration-brand/60 underline-offset-4 hover:text-brand"
        >
          {socials.github.handle}
        </a>{" "}
        {t.place}{" "}
        <Link
          href={locale === "vi" ? "/vi/colophon" : "/colophon"}
          className="text-foreground underline decoration-brand/60 underline-offset-4 hover:text-brand"
        >
          {t.colophon}
        </Link>
      </p>
    </footer>
  );
}
