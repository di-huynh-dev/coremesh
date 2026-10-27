import type { Localized } from "@/lib/i18n";

/**
 * Mirrors the CV. Bullets use `**text**` for emphasis; rendered by <RichText />.
 * Client and product names stay out of public copy.
 */

export type ExperienceItem = {
  company: string;
  role: Localized;
  logo: string;
  period: Localized;
  employmentType?: Localized;
  current?: boolean;
  bullets: Localized<string[]>;
  tags: string[];
};

export const experiences: ExperienceItem[] = [
  {
    company: "Estuary Solutions JSC",
    role: { en: "Frontend Developer", vi: "Frontend Developer" },
    logo: "/estuary-logo.jpg",
    period: { en: "10.2023 - Present", vi: "10.2023 - Nay" },
    employmentType: { en: "Full-time", vi: "Toàn thời gian" },
    current: true,
    bullets: {
      en: [
        "Designed, developed and maintained scalable production frontends with **React, Next.js and Vite**, focused on maintainability and performance.",
        "Owned **end-to-end feature delivery** with Product, Design, Backend and QA teams.",
        "Developed and scaled a **CRM platform** with real-time chat, instant notifications and **i18n across 10+ countries**.",
        "Migrated the build system from **Webpack to Vite**, cutting hot-reload and startup time by **~70%**.",
        "Optimized Core Web Vitals (LCP, FCP, CLS), raising **Google PageSpeed from 30+ to 98+** through SSR/ISR.",
        "Built reusable UI components and frontend patterns, and ran **code reviews** to improve consistency and quality.",
      ],
      vi: [
        "Thiết kế, phát triển và duy trì các frontend production có khả năng mở rộng với **React, Next.js và Vite**, chú trọng khả năng bảo trì và hiệu năng.",
        "**Làm chủ tính năng từ đầu đến cuối**, phối hợp cùng Product, Design, Backend và QA.",
        "Phát triển và mở rộng **nền tảng CRM** với chat real-time, thông báo tức thì và **đa ngôn ngữ cho hơn 10 quốc gia**.",
        "Chuyển hệ thống build từ **Webpack sang Vite**, giảm **~70%** thời gian khởi động và hot-reload.",
        "Tối ưu Core Web Vitals (LCP, FCP, CLS), nâng **Google PageSpeed từ 30+ lên 98+** nhờ SSR/ISR.",
        "Xây dựng UI component và pattern frontend tái sử dụng, thực hiện **code review** để code nhất quán và chất lượng hơn.",
      ],
    },
    tags: ["TypeScript", "React", "Next.js", "Vite", "WebSocket", "i18n", "SSR/ISR"],
  },
  {
    company: "AMIT Group",
    role: { en: "Intern & Fresher Frontend Developer", vi: "Thực tập sinh & Fresher Frontend Developer" },
    logo: "/amit-logo.webp",
    period: { en: "03.2022 - 09.2023", vi: "03.2022 - 09.2023" },
    bullets: {
      en: [
        "Built and maintained frontend features with **React.js, Next.js, Zustand and TanStack Query**.",
        "Developed reusable, responsive UI components aligned with **Figma designs** and team coding standards.",
        "Improved server-state handling and asynchronous data flows with **TanStack Query**.",
        "Took part in code reviews, QA testing, Agile ceremonies and retrospectives across the full SDLC.",
      ],
      vi: [
        "Xây dựng và duy trì các tính năng frontend với **React.js, Next.js, Zustand và TanStack Query**.",
        "Phát triển UI component tái sử dụng, responsive, bám sát **thiết kế Figma** và chuẩn code của team.",
        "Cải thiện việc quản lý server state và luồng dữ liệu bất đồng bộ bằng **TanStack Query**.",
        "Tham gia code review, kiểm thử QA, các buổi Agile và retrospective trong suốt vòng đời phát triển phần mềm.",
      ],
    },
    tags: ["React", "Next.js", "Zustand", "TanStack Query", "Figma", "Agile"],
  },
];

export const education = {
  school: {
    en: "Ho Chi Minh City University of Technology and Engineering (HCM-UTE)",
    vi: "Trường Đại học Công nghệ Kỹ thuật TP. Hồ Chí Minh (HCM-UTE)",
  } satisfies Localized,
  logo: "/ute_logo.png",
  degree: {
    en: "Bachelor of Engineering in Information Technology",
    vi: "Kỹ sư Công nghệ Thông tin",
  } satisfies Localized,
  period: "2020 - 2024",
  details: "GPA 3.34/4",
};
