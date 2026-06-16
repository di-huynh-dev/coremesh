'use client';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import type { HomeLocale } from '@/lib/home-content';
import { getRoadmapPageCopy } from '@/lib/roadmap-content';
import { getPreferredLocale, setPreferredLocale, subscribeToLocaleChange } from '@/lib/site-locale';
import { useSyncExternalStore } from 'react';

export function RoadmapLayoutShell({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore<HomeLocale>(subscribeToLocaleChange, getPreferredLocale, () => 'en');
  const copy = getRoadmapPageCopy(locale);

  return (
    <>
      <Navbar
        labels={{
          questions: copy.nav.questions,
          roadmap: copy.nav.roadmap,
          blog: copy.nav.blog,
        }}
        locale={locale}
        localeLabel={copy.localeLabel}
        onLocaleChange={setPreferredLocale}
      />
      {children}
      <Footer />
    </>
  );
}
