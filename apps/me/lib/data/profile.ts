import type { Locale, Localized } from "@/lib/i18n";

/** Single source of truth for identity, contact and links used across the site. */

export const SITE_URL = "https://me.nextdi.io.vn";

/** Blog origin without locale; override with NEXT_PUBLIC_BLOGS_URL (e.g. http://localhost:3002 in dev). */
export const BLOGS_ORIGIN = (process.env.NEXT_PUBLIC_BLOGS_URL ?? "https://nextdi.io.vn")
  .replace(/\/$/, "")
  .replace(/\/(en|vi)$/, "");

/** The blog in the visitor's language, e.g. https://nextdi.io.vn/vi/blog */
export function blogUrl(locale: Locale, path = "") {
  return `${BLOGS_ORIGIN}/${locale}${path}`;
}

export const profile = {
  name: "Huỳnh Tiến Dĩ",
  englishName: "Steven Huynh",
  /** Professional title (CV headline); the job title lives in experience.ts. */
  title: "Frontend Software Engineer",
  role: "Frontend Developer",
  company: { name: "Estuary Solutions", url: "https://estuary.solutions/" },
  location: {
    en: "Ho Chi Minh City, Viet Nam",
    vi: "TP. Hồ Chí Minh, Việt Nam",
  } satisfies Localized,
  email: "dihuynhdev.contact@gmail.com",
  avatar: "/avatar.webp",
  description: {
    en: "Frontend Software Engineer with 3+ years building production web apps with React, Next.js and TypeScript. Based in Ho Chi Minh City, Viet Nam.",
    vi: "Frontend Software Engineer với hơn 3 năm xây dựng ứng dụng web production bằng React, Next.js và TypeScript. Đang sống tại TP. Hồ Chí Minh.",
  } satisfies Localized,
  /** `**text**` marks emphasis; rendered by <RichText />. Mirrors the CV summary. */
  summary: {
    en: "Frontend Software Engineer with **3+ years of experience** designing, developing and scaling production web applications with **React, JavaScript and TypeScript**. Experienced in **owning end-to-end feature delivery, frontend architecture, code reviews and performance optimization**, and in building maintainable user-facing systems at scale. I work with **AI agents and AI-assisted workflows** every day to ship faster while keeping the architecture consistent, and collaborate closely with **Product, Design, Backend and QA teams** across international projects.",
    vi: "Frontend Software Engineer với **hơn 3 năm kinh nghiệm** thiết kế, phát triển và mở rộng các ứng dụng web production bằng **React, JavaScript và TypeScript**. Có kinh nghiệm **làm chủ tính năng từ đầu đến cuối, kiến trúc frontend, code review và tối ưu hiệu năng**, cùng việc xây dựng những hệ thống dễ bảo trì ở quy mô lớn. Mình dùng **AI agent và quy trình phát triển có AI hỗ trợ** hằng ngày để ra sản phẩm nhanh hơn mà kiến trúc vẫn nhất quán, và phối hợp chặt chẽ với **Product, Design, Backend và QA** trong các dự án quốc tế.",
  } satisfies Localized,
} as const;

export const socials = {
  github: { handle: "di-huynh-dev", href: "https://github.com/di-huynh-dev" },
  linkedin: { handle: "huynhtiendi", href: "https://www.linkedin.com/in/huynhtiendi/" },
  tiktok: { handle: "@dicodeweb", href: "https://www.tiktok.com/@dicodeweb" },
  blog: { handle: "nextdi.io.vn", href: BLOGS_ORIGIN },
} as const;

/** Headline numbers; every one must be backed by the CV (experience.ts / projects.ts). */
export const highlights: { value: string; label: Localized }[] = [
  { value: "3+", label: { en: "years shipping", vi: "năm kinh nghiệm" } },
  { value: "10+", label: { en: "countries reached", vi: "quốc gia" } },
  { value: "1M+", label: { en: "monthly visitors served", vi: "lượt truy cập/tháng" } },
  { value: "98+", label: { en: "PageSpeed score", vi: "điểm PageSpeed" } },
];

export const rotatingTitles: Localized<string[]> = {
  en: [
    "Frontend Software Engineer",
    "React / Next.js Engineer",
    "AI-assisted Developer",
    "Performance-minded UI Developer",
  ],
  vi: [
    "Frontend Software Engineer",
    "Kỹ sư React / Next.js",
    "Lập trình cùng AI agent",
    "Người mê tối ưu hiệu năng",
  ],
};
