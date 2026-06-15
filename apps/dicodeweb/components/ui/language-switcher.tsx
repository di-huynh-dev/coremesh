"use client";

import { cn } from "@/lib/utils";
import type { HomeLocale } from "@/lib/home-content";

type LanguageSwitcherProps = {
  currentLocale: HomeLocale;
  locales: readonly HomeLocale[];
  onChange: (locale: HomeLocale) => void;
  label: string;
  className?: string;
};

const localeLabels: Record<HomeLocale, string> = {
  en: "EN",
  vi: "VI",
  ja: "JP",
};

export function LanguageSwitcher({
  currentLocale,
  locales,
  onChange,
  label,
  className,
}: LanguageSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card/80 p-1 shadow-[0_10px_40px_rgba(7,27,58,0.06)] backdrop-blur",
        className
      )}
      aria-label={label}
    >
      <span className="px-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {locales.map((locale) => {
          const active = locale === currentLocale;

          return (
            <button
              key={locale}
              type="button"
              onClick={() => onChange(locale)}
              className={cn(
                "rounded-full px-3 py-2 text-xs font-semibold tracking-[0.16em] transition-all uppercase",
                active
                  ? "bg-[#071B3A] text-[#F5F0EA] shadow-[0_8px_20px_rgba(7,27,58,0.18)]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {localeLabels[locale]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
