import { profile, SITE_URL } from "@/lib/data/profile";
import { homePath, LOCALES, ogLocale, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export const siteTitle = `${profile.englishName} (${profile.name}) | ${profile.title}`;

/** Per-locale metadata for the home page, with hreflang alternates. */
export function homeMetadata(locale: Locale): Metadata {
  const url = homePath(locale);
  const description = profile.description[locale];

  return {
    title: siteTitle,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, homePath(l)])),
        "x-default": "/",
      },
    },
    openGraph: {
      title: siteTitle,
      description,
      url: `${SITE_URL}${url === "/" ? "" : url}`,
      locale: ogLocale[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => ogLocale[l]),
    },
    twitter: { title: siteTitle, description },
  };
}
