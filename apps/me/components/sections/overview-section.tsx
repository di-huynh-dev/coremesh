"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  Volume2,
  Github,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type OverviewSectionProps = {
  blogsBaseUrl: string;
};

type DetailItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  hint?: string;
  live?: boolean;
};

type SocialItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const socialItems: SocialItem[] = [
  {
    label: "GitHub",
    href: "https://github.com/di-huynh-dev",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/huynh-tiendi/",
    icon: Linkedin,
  },
  {
    label: "X",
    href: "https://x.com/dihuynhdev",
    icon: Twitter,
  },
  {
    label: "Discord",
    href: "https://discord.com/users/dihuynh",
    icon: MessageCircle,
  },
];

export function OverviewSection({ blogsBaseUrl }: OverviewSectionProps) {
  const [time, setTime] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const updateTime = () => {
      setTime(formatter.format(new Date()));
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const details = useMemo<DetailItem[]>(
    () => [
      {
        icon: BriefcaseBusiness,
        label: "Role",
        value: "Junior Frontend Developer @ Estuary Solutions",
      },
      {
        icon: Clock3,
        label: "Local time",
        value: time || "--:--",
        hint: "ICT (UTC+7)",
        live: true,
      },
      {
        icon: MapPin,
        label: "Location",
        value: "Ho Chi Minh City, Viet Nam",
      },
      {
        icon: Mail,
        label: "Email",
        value: "dihuynhdev.contact@gmail.com",
        href: "mailto:dihuynhdev.contact@gmail.com",
      },
      {
        icon: Phone,
        label: "Phone",
        value: "0372639623",
        href: "tel:0372639623",
      },
      {
        icon: Globe,
        label: "Website",
        value: "me.nextdi.io.vn",
        href: "https://me.nextdi.io.vn",
      },
    ],
    [time],
  );

  const handlePronunciation = () => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Huynh Tien Di");
    utterance.lang = "vi-VN";
    utterance.rate = 0.85;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="px-4 pb-10 pt-28 md:px-8 md:pb-14 md:pt-36">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-[28px] border border-border bg-background shadow-[0_20px_80px_rgba(15,23,42,0.08)]"
        >
          <div className="bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_55%),linear-gradient(to_right,_rgba(15,23,42,0.06)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(15,23,42,0.06)_1px,_transparent_1px)] bg-[size:auto,24px_24px,24px_24px]">
            <div className="grid border-b border-border md:grid-cols-[228px_minmax(0,1fr)]">
              <div className="flex items-center justify-center border-b border-border p-6 md:border-b-0 md:border-r">
                <div className="rounded-full border border-border bg-background p-1.5 shadow-sm">
                  <Image
                    src="https://avatars.githubusercontent.com/u/103420884?v=4"
                    alt="Huynh Tien Di"
                    width={180}
                    height={180}
                    className="h-[180px] w-[180px] rounded-full object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="flex min-h-[228px] flex-col justify-end">
                <div className="border-b border-border px-6 py-4 md:px-8">
                  <p className="font-mono-data text-muted-foreground">
                    frontend engineer / portfolio
                  </p>
                </div>
                <div className="border-b border-border px-6 py-5 md:px-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                      Huynh Tien Di
                    </h1>
                    <BadgeCheck className="h-7 w-7 text-sky-500" />
                    <button
                      type="button"
                      onClick={handlePronunciation}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Pronounce my name"
                    >
                      <Volume2
                        className={`h-4 w-4 ${isSpeaking ? "text-sky-500" : ""}`}
                      />
                    </button>
                  </div>
                </div>
                <div className="px-6 py-4 md:px-8">
                  <p className="text-lg text-muted-foreground md:text-2xl">
                    Frontend Engineer
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[linear-gradient(135deg,transparent_0,transparent_48%,rgba(15,23,42,0.06)_48%,rgba(15,23,42,0.06)_50%,transparent_50%,transparent_100%)] bg-[length:16px_16px] px-6 py-5 md:px-8" />

          <div className="grid gap-0 border-y border-border md:grid-cols-2">
            {details.map((item, index) => {
              const Icon = item.icon;
              const content = item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-0 items-center gap-2 transition-colors hover:text-foreground"
                >
                  <span className="truncate">{item.value}</span>
                </a>
              ) : (
                <span className="truncate">{item.value}</span>
              );

              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-4 px-4 py-4 md:px-5 ${
                    index < details.length - 2 ? "border-b border-border" : ""
                  } ${index % 2 === 0 ? "md:border-r md:border-border" : ""}`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/30">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 font-mono-data text-muted-foreground">
                      {item.label}
                    </p>
                    <div className="flex items-center gap-2 text-lg text-foreground">
                      {item.label === "Role" ? (
                        <>
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white">
                            <Image
                              src="/estuary-logo.jpg"
                              alt="Estuary Solutions"
                              width={28}
                              height={28}
                              className="h-5 w-5 object-contain"
                            />
                          </span>
                          {content}
                        </>
                      ) : (
                        content
                      )}
                      {item.live ? (
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                      ) : null}
                    </div>
                    {item.hint ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.hint}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            {socialItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center justify-between gap-4 border-border px-5 py-5 transition-colors hover:bg-muted/20 ${
                    index < socialItems.length - 1
                      ? "border-b md:border-b-0"
                      : ""
                  } ${
                    index < socialItems.length - 1
                      ? "md:border-r xl:border-r"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="text-2xl font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
