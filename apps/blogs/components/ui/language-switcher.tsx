"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const languages = [
    { code: "en", name: "English", src: "/flags/united-kingdom.png" },
    { code: "vi", name: "Tiếng Việt", src: "/flags/vietnam.png" },
  ];

  const handleLanguageChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPathname = segments.join("/");
    router.push(newPathname);
  };

  const currentLang = languages.find((lang) => lang.code === locale) || languages[0];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-border/50 h-10 w-[150px] rounded-full px-4 py-2 shadow-sm backdrop-blur transition-all duration-200 flex items-center justify-between cursor-pointer focus:outline-none">
          <span className="flex items-center gap-2">
            <Image
              src={currentLang.src}
              alt={currentLang.name}
              width={24}
              height={16}
              className="rounded-sm border border-black/5 object-cover shadow-sm"
            />
            <span className="text-foreground/80 text-sm font-medium">
              {currentLang.name}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card/80 w-[150px] min-w-[150px] rounded-2xl border p-1.5 shadow-lg backdrop-blur-md">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium focus:bg-black/5 dark:focus:bg-white/10 focus:text-foreground outline-none transition-colors",
              lang.code === locale && "bg-black/10 dark:bg-white/15 text-foreground font-semibold"
            )}
          >
            <Image
              src={lang.src}
              alt={lang.name}
              width={24}
              height={16}
              className="rounded-sm border border-black/5 object-cover shadow-sm"
            />
            <span className="text-sm font-medium">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
