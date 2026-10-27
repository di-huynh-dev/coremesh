"use client";

import { dictionaries, type Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { createContext, useContext, type ReactNode } from "react";

const I18nContext = createContext<{ locale: Locale; t: Dictionary }>({
  locale: "en",
  t: dictionaries.en,
});

/** Gives client components the page locale; server components take `locale` as a prop. */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, t: dictionaries[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
