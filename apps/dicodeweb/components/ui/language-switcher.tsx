"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HomeLocale } from "@/lib/home-content";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type LanguageSwitcherProps = {
  currentLocale: HomeLocale;
  locales: readonly HomeLocale[];
  onChange: (locale: HomeLocale) => void;
  label?: string;
  className?: string;
};

const localeLabels: Record<HomeLocale, { src: string; name: string }> = {
  en: { src: "/flags/united-kingdom.png", name: "English" },
  vi: { src: "/flags/vietnam.png", name: "Tiếng Việt" },
  ja: { src: "/flags/japan.png", name: "日本語" },
};

export function LanguageSwitcher({
  currentLocale,
  locales,
  onChange,
  className,
}: LanguageSwitcherProps) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="bg-card/80 border border-border hover:bg-muted/50 h-10 w-[150px] rounded-full px-4 py-2 shadow-sm backdrop-blur transition-all duration-200 flex items-center justify-between cursor-pointer focus:outline-none">
            <span className="flex items-center gap-2">
              <Image
                src={localeLabels[currentLocale].src}
                alt={localeLabels[currentLocale].name}
                width={24}
                height={16}
                className="rounded-sm border border-black/5 object-cover shadow-sm"
              />
              <span className="text-foreground/80 text-sm font-medium">
                {localeLabels[currentLocale].name}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card/80 w-[150px] min-w-[150px] rounded-2xl border p-1.5 shadow-lg backdrop-blur-md">
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => onChange(locale)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium focus:bg-black/5 dark:focus:bg-white/10 focus:text-foreground outline-none transition-colors",
                locale === currentLocale && "bg-black/10 dark:bg-white/15 text-foreground font-semibold"
              )}
            >
              <Image
                src={localeLabels[locale].src}
                alt={localeLabels[locale].name}
                width={24}
                height={16}
                className="rounded-sm border border-black/5 object-cover shadow-sm"
              />
              <span className="text-sm font-medium">{localeLabels[locale].name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
