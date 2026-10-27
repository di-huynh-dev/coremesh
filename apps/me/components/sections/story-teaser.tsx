import { dictionaries } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** Entry point to the 3D story, right under the hero. */
export function StoryTeaser({ locale }: { locale: Locale }) {
  const t = dictionaries[locale].story;

  return (
    <section className="profile-rail rail-box screen-line-after p-2">
      <Link
        href="/story"
        data-cursor={t.cta}
        className="group relative block overflow-hidden border border-edge"
      >
        <Image
          src="/story-assets/artwork/village.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/55 to-zinc-950/10"
        />
        <div className="relative flex min-h-56 flex-col justify-end gap-3 p-5 text-white sm:min-h-64 sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-200/90">
            ✦ {t.eyebrow}
          </p>
          <h2 className="font-display max-w-md text-3xl leading-[1.1] font-medium sm:text-4xl">
            {t.title}
          </h2>
          <p className="max-w-md font-mono text-sm leading-6 text-white/80">
            {t.body}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 font-mono text-sm text-zinc-950 transition-colors group-hover:bg-amber-200">
              {t.cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="font-mono text-xs text-white/60">{t.note}</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
