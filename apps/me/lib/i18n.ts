/** Home page locales: English at `/`, Vietnamese at `/vi`. The 3D story stays Vietnamese-only. */

export const LOCALES = ["en", "vi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** A value written once per locale. */
export type Localized<T = string> = Record<Locale, T>;

export function homePath(locale: Locale) {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}

export const htmlLang: Record<Locale, string> = { en: "en", vi: "vi" };
export const ogLocale: Record<Locale, string> = { en: "en_US", vi: "vi_VN" };
