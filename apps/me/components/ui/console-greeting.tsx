"use client";

import { useI18n } from "@/components/i18n-provider";
import { profile, SITE_URL } from "@/lib/data/profile";
import { useEffect } from "react";

const DRUM = String.raw`
        .-~~~~~~~~-.
     .'  ✦  .--.  ✦  '.
    /   .' /\  /\ '.   \
   |   (  <  ()  >  )   |
    \   '. \/  \/ .'   /
     '.  ✦  '--'  ✦  .'
        '-~~~~~~~~-'`;

let greeted = false;

/** A hello for developers who open DevTools. Logged once per page load. */
export function ConsoleGreeting() {
  const { locale, t } = useI18n();

  useEffect(() => {
    if (greeted) return;
    greeted = true;
    const c = t.console;
    console.log(`%c${DRUM}`, "color:#C52F1B;font-family:monospace;line-height:1.15");
    console.log(
      `%c${c.title}%c\n${c.body}`,
      "font:600 15px/1.6 Georgia,serif;color:#AD7015",
      "font:12px/1.6 monospace",
    );
    console.log(
      `%c${c.colophon}%c ${SITE_URL}${locale === "vi" ? "/vi" : ""}/colophon\n%c${c.email}%c ${profile.email}`,
      "color:#C52F1B",
      "color:inherit",
      "color:#C52F1B",
      "color:inherit",
    );
  }, [locale, t]);

  return null;
}
