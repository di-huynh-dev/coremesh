"use client";

import { AnimatedName } from "@/components/ui/animated-name";
import { DrumBanner } from "@/components/ui/drum-banner";
import { Reveal } from "@/components/ui/reveal";
import { GithubDark } from "@/components/ui/svgs/githubDark";
import { Linkedin } from "@/components/ui/svgs/linkedin";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { TiktokIconDark } from "@/components/ui/svgs/tiktokIconDark";
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
  blogsBaseUrl: string;
  latestPost?: { slug: string; title: string };
};

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

const overviewItems = [
  {
    label: "Role",
    icon: Code2,
    content: (
      <>
        Frontend Developer{" "}
        <a
          href="https://estuary.solutions/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          @Estuary Solutions
        </a>
      </>
    ),
  },
  { label: "Location", icon: MapPin, content: "Ho Chi Minh City, Viet Nam" },
  {
    label: "Email",
    icon: Mail,
    content: (
      <a
        href="mailto:dihuynhdev.contact@gmail.com"
        className="underline-offset-4 hover:text-brand hover:underline"
      >
        dihuynhdev.contact@gmail.com
      </a>
    ),
  },
  {
    label: "Website",
    icon: Globe,
    content: (
      <a
        href="https://me.nextdi.io.vn"
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-4 hover:text-brand hover:underline"
      >
        me.nextdi.io.vn
      </a>
    ),
  },
];

const socialItems = [
  {
    label: "LinkedIn",
    handle: "Huynh Tien Di",
    href: "https://www.linkedin.com/in/huynhtiendi/",
    Icon: Linkedin,
    iconClassName: "bg-white",
  },
  {
    label: "GitHub",
    handle: "di-huynh-dev",
    href: "https://github.com/di-huynh-dev",
    Icon: GithubDark,
    iconClassName: "bg-zinc-950 p-2.5",
  },
  {
    label: "TikTok",
    handle: "@dicodeweb",
    href: "https://www.tiktok.com/@dicodeweb",
    Icon: TiktokIconDark,
    iconClassName: "bg-zinc-950 p-2",
  },
  {
    label: "Blog",
    handle: "nextdi.io.vn",
    href: "https://nextdi.io.vn",
    Icon: NextjsIconDark,
    iconClassName: "bg-white p-2",
  },
] satisfies Array<{
  label: string;
  handle: string;
  href: string;
  Icon: SvgIcon;
  iconClassName: string;
}>;

const subtitles = [
  "Frontend Developer",
  "React / Next.js Engineer",
  "Performance-minded UI Developer",
  "Micro-frontend Practitioner",
];

export function OverviewSection({
  blogsBaseUrl,
  latestPost,
}: OverviewSectionProps) {
  const blogUrl = blogsBaseUrl.replace(/\/$/, "");
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSubtitleIndex((index) => (index + 1) % subtitles.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

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
            src="https://avatars.githubusercontent.com/u/103420884?v=4"
            alt="Huỳnh Tiến Dĩ"
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
              Open to collab
            </span>
          </div>

          <div>
            <h1 className="font-display flex flex-wrap items-center gap-x-3 pl-4 text-4xl leading-[1.15] font-medium sm:text-5xl">
              <span>
                <AnimatedName text="Huỳnh Tiến" />{" "}
                <em className="pr-1 text-brand">
                  <AnimatedName text="Dĩ" />
                </em>
              </span>
              <span className="group/verified relative inline-flex">
                <span
                  className="inline-flex size-5 items-center justify-center rounded-full bg-brand text-[13px] font-bold leading-none text-white"
                  aria-label="Verified"
                >
                  ✓
                </span>
                <span className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg bg-zinc-950 px-3 py-2 font-mono text-sm font-medium leading-5 text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-150 group-hover/verified:-translate-y-[calc(100%+14px)] group-hover/verified:opacity-100">
                  Verified
                  <span className="absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-zinc-950" />
                </span>
              </span>
            </h1>
            <div className="h-12 overflow-hidden border-t border-edge py-1.5 pl-4 sm:h-[34px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={subtitles[subtitleIndex]}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="caret line-clamp-1 font-mono text-sm leading-5 text-muted-foreground"
                >
                  <span className="mr-2 text-brand">&gt;</span>
                  {subtitles[subtitleIndex]}
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
                <dt className="mini-icon" title="Writing">
                  <PenLine className="size-4" />
                  <span className="sr-only">Latest post</span>
                </dt>
                <dd className="min-w-0">
                  <a
                    href={`${blogUrl}/blog/${latestPost.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="Đọc bài"
                    className="group inline-flex max-w-full items-center gap-2 underline-offset-4 hover:text-brand hover:underline"
                  >
                    <span className="shrink-0 text-muted-foreground">
                      Mới viết:
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
            const href = item.label === "Blog" ? `${blogUrl}/blog` : item.href;
            const SocialIcon = item.Icon;

            return (
              <a
                key={item.label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor={`Mở ${item.label}`}
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
