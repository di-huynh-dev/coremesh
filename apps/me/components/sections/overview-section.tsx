"use client";

import { useI18n } from "@/components/i18n-provider";
import { AnimatedName } from "@/components/ui/animated-name";
import { DrumBanner } from "@/components/ui/drum-banner";
import { Reveal } from "@/components/ui/reveal";
import { GithubDark } from "@/components/ui/svgs/githubDark";
import { Linkedin } from "@/components/ui/svgs/linkedin";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { TiktokIconDark } from "@/components/ui/svgs/tiktokIconDark";
import { blogUrl, profile, rotatingTitles, SITE_URL, socials } from "@/lib/data/profile";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Code2,
  Globe,
  Mail,
  MapPin,
  PenLine,
} from "lucide-react";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useState } from "react";

type OverviewSectionProps = {
  latestPost?: { slug: string; title: string };
};

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

const socialItems = [
  {
    label: "LinkedIn",
    handle: socials.linkedin.handle,
    href: socials.linkedin.href,
    Icon: Linkedin,
    iconClassName: "bg-white",
  },
  {
    label: "GitHub",
    handle: socials.github.handle,
    href: socials.github.href,
    Icon: GithubDark,
    iconClassName: "bg-zinc-950 p-2.5",
  },
  {
    label: "TikTok",
    handle: socials.tiktok.handle,
    href: socials.tiktok.href,
    Icon: TiktokIconDark,
    iconClassName: "bg-zinc-950 p-2",
  },
  {
    label: "Blog",
    handle: socials.blog.handle,
    href: null,
    Icon: NextjsIconDark,
    iconClassName: "bg-white p-2",
  },
] satisfies Array<{
  label: string;
  handle: string;
  /** null: resolved per locale (the blog). */
  href: string | null;
  Icon: SvgIcon;
  iconClassName: string;
}>;

export function OverviewSection({ latestPost }: OverviewSectionProps) {
  const { locale, t } = useI18n();
  const titles = rotatingTitles[locale];
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSubtitleIndex((index) => (index + 1) % titles.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [titles.length]);

  const overviewItems = [
    {
      label: t.overview.role,
      icon: Code2,
      content: (
        <>
          {profile.role}{" "}
          <a
            href={profile.company.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            @{profile.company.name}
          </a>
        </>
      ),
    },
    { label: t.overview.location, icon: MapPin, content: profile.location[locale] },
    {
      label: t.overview.email,
      icon: Mail,
      content: (
        <a
          href={`mailto:${profile.email}`}
          className="underline-offset-4 hover:text-brand hover:underline"
        >
          {profile.email}
        </a>
      ),
    },
    {
      label: t.overview.website,
      icon: Globe,
      content: (
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:text-brand hover:underline"
        >
          {SITE_URL.replace(/^https?:\/\//, "")}
        </a>
      ),
    },
  ];

  return (
    <>
      {/* Banner: interactive bronze drum */}
      <section className="profile-rail rail-box screen-line-after">
        <DrumBanner />
      </section>

      {/* Identity */}
      <section className="profile-rail rail-box screen-line-after flex">
        <div className="relative w-[164px] shrink-0 max-sm:w-[112px]">
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={160}
            height={160}
            className="-mt-px size-32 rounded-full bg-background object-cover ring-1 ring-border ring-offset-2 ring-offset-background sm:size-40"
            priority
          />
          <span
            className="absolute bottom-1 right-5 flex size-8 items-center justify-center rounded-full bg-brand text-base text-yellow-300 shadow-md ring-2 ring-background max-sm:right-2 max-sm:size-7 sm:bottom-2 sm:right-4"
            aria-hidden="true"
          >
            ★
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="diagonal-pattern flex grow items-end justify-between gap-2 border-b border-edge py-1.5 pl-4 pr-4">
            <p className="line-clamp-1 font-mono text-xs text-muted-foreground/60 select-none max-sm:hidden">
              ~/steven-huynh
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-background px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              {t.overview.status}
            </span>
          </div>

          <div>
            <h1 className="font-display pl-4 text-4xl leading-[1.15] font-medium sm:text-5xl">
              <span>
                <AnimatedName text="Huỳnh Tiến" />{" "}
                <em className="pr-1 text-brand">
                  <AnimatedName text="Dĩ" />
                </em>
              </span>
            </h1>
            <div className="h-12 overflow-hidden border-t border-edge py-1.5 pl-4 sm:h-[34px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={titles[subtitleIndex]}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="caret line-clamp-1 font-mono text-sm leading-5 text-muted-foreground"
                >
                  <span className="mr-2 text-brand">&gt;</span>
                  {titles[subtitleIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <div className="diagonal-pattern h-8 screen-line-after" />

      <section className="profile-rail rail-box screen-line-after">
        <Reveal>
          <dl className="space-y-2 p-4">
            {overviewItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-4 font-mono text-sm"
                >
                  <dt className="mini-icon" title={item.label}>
                    <Icon className="size-4" />
                    <span className="sr-only">{item.label}</span>
                  </dt>
                  <dd className="text-balance">{item.content}</dd>
                </div>
              );
            })}
            {latestPost ? (
              <div className="flex items-center gap-4 font-mono text-sm">
                <dt className="mini-icon" title={t.overview.latestPost}>
                  <PenLine className="size-4" />
                  <span className="sr-only">{t.overview.latestPost}</span>
                </dt>
                <dd className="min-w-0">
                  <a
                    href={blogUrl(locale, `/blog/${latestPost.slug}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor={t.overview.readPost}
                    className="group inline-flex max-w-full items-center gap-2 underline-offset-4 hover:text-brand hover:underline"
                  >
                    <span className="shrink-0 text-muted-foreground">
                      {t.overview.latestPrefix}
                    </span>
                    <span className="truncate">{latestPost.title}</span>
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </Reveal>
      </section>

      <div className="diagonal-pattern h-8 screen-line-after" />

      <section className="profile-rail rail-box screen-line-after">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {socialItems.map((item, index) => {
            const SocialIcon = item.Icon;

            return (
              <a
                key={item.label}
                href={item.href ?? blogUrl(locale, "/blog")}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor={t.overview.open(item.label)}
                className={`group relative flex h-20 cursor-pointer items-center gap-4 overflow-hidden p-4 pr-3 transition-colors duration-200 hover:bg-brand/[0.06] ${
                  index % 2 === 0 ? "sm:border-r sm:border-edge" : ""
                } ${index < socialItems.length - 1 ? "border-b border-edge" : ""} ${
                  index === 2 ? "sm:border-b-0" : ""
                }`}
              >
                <span className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-brand transition-transform duration-300 group-hover:scale-y-100" />
                <span className="flex size-12 items-center justify-center overflow-hidden rounded-xl ring-1 ring-border transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                  <SocialIcon
                    aria-hidden="true"
                    className={`size-12 object-contain ${item.iconClassName}`}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display flex items-center text-lg font-medium">
                    {item.label}
                  </span>
                  <span className="block truncate font-mono text-xs text-muted-foreground">
                    {item.handle}
                  </span>
                </span>
                <ArrowUpRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
