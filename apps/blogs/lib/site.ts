export const SITE_NAME = "DiCodeWeb";
export const SITE_TITLE = "DiCodeWeb | Engineering Notes & Systems Thinking";

/** Public origin (no trailing slash). Set NEXT_PUBLIC_SITE_URL per environment; production is the fallback. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nextdi.io.vn").replace(/\/$/, "");

export const AUTHOR = {
  name: "Huỳnh Tiến Dĩ",
  handle: "@dicodeweb",
  avatar: "/avatar.png",
  /** Portfolio: the author's canonical profile page. */
  url: "https://me.nextdi.io.vn",
  github: "https://github.com/di-huynh-dev",
  sameAs: [
    "https://github.com/di-huynh-dev",
    "https://www.linkedin.com/in/huynhtiendi/",
    "https://www.tiktok.com/@dicodeweb",
  ],
} as const;

export const TWITTER_HANDLE = "@DiCodeWeb";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
