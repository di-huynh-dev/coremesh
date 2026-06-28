"use client";

import { GithubDark } from "@/components/ui/svgs/githubDark";
import { Linkedin } from "@/components/ui/svgs/linkedin";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { TiktokIconDark } from "@/components/ui/svgs/tiktokIconDark";
import { Code2, ExternalLink, Globe, Mail, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useState } from "react";

type OverviewSectionProps = {
  blogsBaseUrl: string;
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
          className="font-medium underline-offset-4 hover:underline"
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
        className="underline-offset-4 hover:underline"
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
        className="underline-offset-4 hover:underline"
      >
        me.nextdi.io.vn
      </a>
    ),
  },
];

const socialItems = [
  {
    label: "LinkedIn",
    handle: "huynh-tiendi",
    href: "https://www.linkedin.com/in/huynh-tiendi/",
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
  "TypeScript Interface Builder",
  "CMS & CRM Platform Engineer",
  "Realtime Web App Developer",
  "Performance-minded UI Developer",
  "Micro-frontend Practitioner",
];

export function OverviewSection({ blogsBaseUrl }: OverviewSectionProps) {
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
      <section className="profile-rail rail-box screen-line-after">
        <div className="dot-pattern relative flex h-64 items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[250px] w-[420px] -translate-x-1/2 overflow-hidden opacity-[0.09] mix-blend-multiply dark:mix-blend-screen">
            <div
              className="trongdong-spin absolute left-0 top-0 size-[420px] bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/trongdong.png')" }}
              aria-hidden="true"
            />
          </div>
          <Image
            src="/round-avatar.svg"
            alt="Huynh Tien Di monogram"
            width={64}
            height={64}
            className="size-16 select-none"
            priority
          />
        </div>
      </section>

      <section className="profile-rail rail-box screen-line-after flex">
        <div className="relative w-[164px] shrink-0 max-sm:w-[112px]">
          <span className="absolute left-0 top-0 z-10 flex h-9 w-14 items-center justify-center bg-red-600 text-lg text-yellow-300">
            ★
          </span>
          <Image
            src="https://avatars.githubusercontent.com/u/103420884?v=4"
            alt="Huỳnh Tiến Dĩ"
            width={160}
            height={160}
            className="-mt-px size-32 rounded-full bg-background object-cover ring-1 ring-border ring-offset-2 ring-offset-background sm:size-40"
            priority
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="diagonal-pattern flex grow items-end border-b border-edge pb-1 pl-4">
            <p className="line-clamp-1 font-mono text-xs text-zinc-300 select-none dark:text-zinc-700 max-sm:hidden">
              text-3xl text-zinc-950 font-medium
            </p>
          </div>

          <div>
            <h1 className="flex items-center gap-2 pl-4 text-3xl font-semibold leading-9">
              Huỳnh Tiến Dĩ
              <span className="group/verified relative inline-flex">
                <span
                  className="inline-flex size-5 items-center justify-center rounded-full bg-sky-500 text-[13px] font-bold leading-none text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]"
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
            <div className="h-12 overflow-hidden border-t border-edge py-1 pl-4 sm:h-[29px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={subtitles[subtitleIndex]}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="line-clamp-1 font-mono text-sm leading-5 text-muted-foreground"
                >
                  {subtitles[subtitleIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <div className="diagonal-pattern h-8 screen-line-after" />

      <section className="profile-rail rail-box screen-line-after">
        <div className="space-y-2 p-4">
          {overviewItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-4 font-mono text-sm"
              >
                <span className="mini-icon">
                  <Icon className="size-4" />
                </span>
                <p className="text-balance">{item.content}</p>
              </div>
            );
          })}
        </div>
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
                className={`group flex h-20 cursor-pointer items-center gap-4 p-4 pr-2 transition-colors duration-150 hover:bg-muted/40 ${
                  index % 2 === 0 ? "sm:border-r sm:border-edge" : ""
                } ${index < socialItems.length - 1 ? "border-b border-edge" : ""} ${
                  index === 2 ? "sm:border-b-0" : ""
                }`}
              >
                <span className="flex size-12 items-center justify-center overflow-hidden rounded-xl ring-1 ring-border">
                  <SocialIcon
                    aria-hidden="true"
                    className={`size-12 object-contain ${item.iconClassName}`}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center font-medium underline-offset-4 group-hover:underline">
                    {item.label}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {item.handle}
                  </span>
                </span>
                <ExternalLink className="size-4 text-muted-foreground" />
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
