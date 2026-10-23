"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Check, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const languages = [
  { code: "en", name: "English" },
  { code: "vi", name: "Tiếng Việt" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("navigation");

  const handleLanguageChange = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const query = searchParams.toString();
    router.push(`${segments.join("/")}${query ? `?${query}` : ""}`);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-ink/75 transition-colors hover:bg-paper hover:text-ink"
          aria-label={t("language")}
        >
          <Languages className="size-4" />
          <span className="font-mono text-xs font-medium uppercase">
            {locale}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-xl border border-line bg-card p-1 shadow-lg"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-ink outline-none focus:bg-paper",
              lang.code === locale && "font-semibold",
            )}
          >
            <span className="flex items-center gap-2.5">
              <span className="w-5 font-mono text-[0.7rem] text-faint uppercase">
                {lang.code}
              </span>
              {lang.name}
            </span>
            {lang.code === locale ? (
              <Check className="size-4 text-cobalt" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
