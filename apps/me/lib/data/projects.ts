import type { Localized } from "@/lib/i18n";

/**
 * Work projects mirror the CV; client and product names are kept confidential.
 * Text fields support `**emphasis**` and `code`.
 */

export type ProjectLink = { label: Localized; href: string };

export type Project = {
  slug: string;
  title: Localized;
  kind: "Work" | "Personal";
  context: Localized;
  role?: Localized;
  team?: string;
  summary: Localized;
  highlights: Localized<string[]>;
  outcomes: { value: string; label: Localized }[];
  stack: string[];
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    slug: "uid-loyalty-platform",
    title: { en: "UID Management & Loyalty Platform", vi: "Nền tảng quản lý UID & Loyalty" },
    kind: "Work",
    context: { en: "FMCG client", vi: "Khách hàng ngành FMCG" },
    role: { en: "Frontend Developer · led 2 juniors", vi: "Frontend Developer · dẫn dắt 2 junior" },
    team: "25+",
    summary: {
      en: "An enterprise UID platform: a Warehouse Panel for inbound/outbound operations and an Admin Panel for UID lifecycle, loyalty campaigns and system management.",
      vi: "Nền tảng UID cấp doanh nghiệp gồm Warehouse Panel cho nghiệp vụ nhập/xuất kho và Admin Panel quản lý vòng đời UID, chiến dịch loyalty và hệ thống.",
    },
    highlights: {
      en: [
        "**Architected the frontend from scratch** and led two junior developers, delivering both panels in **2.5 months**.",
        "Engineered complex warehouse workflows with **real-time UID tracking** across thousands of SKUs.",
        "Built centralized UID, loyalty campaign, monitoring, reporting and admin capabilities.",
        "Set up **AI-assisted workflows with AI agents** to speed up development and enforce architectural consistency.",
        "Defined API contracts with a 25+ member team and created reusable UI patterns that cut later feature work by **~30%**.",
        "Led task allocation and code reviews for a stable go-live with **zero P1/P2 incidents**.",
      ],
      vi: [
        "**Dựng kiến trúc frontend từ đầu** và dẫn dắt 2 junior, hoàn thành cả hai panel trong **2,5 tháng**.",
        "Xây dựng các luồng nghiệp vụ kho phức tạp với **theo dõi UID real-time** trên hàng nghìn SKU.",
        "Phát triển các chức năng quản lý UID, chiến dịch loyalty, giám sát, báo cáo và quản trị tập trung.",
        "Thiết lập **quy trình phát triển có AI agent hỗ trợ** để tăng tốc và giữ kiến trúc nhất quán.",
        "Thống nhất API contract với team hơn 25 người và tạo các UI pattern tái sử dụng, giúp các tính năng sau làm nhanh hơn **~30%**.",
        "Phân chia công việc và review code, go-live ổn định với **0 sự cố P1/P2**.",
      ],
    },
    outcomes: [
      { value: "2.5 mo", label: { en: "to deliver both panels", vi: "để hoàn thành 2 panel" } },
      { value: "0", label: { en: "P1/P2 incidents at go-live", vi: "sự cố P1/P2 khi go-live" } },
    ],
    stack: ["React 19", "TypeScript", "Vite", "Zustand", "TanStack Query", "Ant Design", "Firebase", "Recharts", "WebSocket"],
    links: [],
  },
  {
    slug: "regional-admin-platform",
    title: { en: "Admin Panel Management System", vi: "Hệ thống quản trị Admin Panel" },
    kind: "Work",
    context: { en: "Retail & membership client", vi: "Khách hàng bán lẻ & hội viên" },
    role: { en: "Frontend Developer", vi: "Frontend Developer" },
    team: "25+",
    summary: {
      en: "A regional platform for admins and staff to manage memberships, customer profiles, products, events, training and operations across 12 countries.",
      vi: "Nền tảng khu vực giúp quản trị viên và nhân viên quản lý hội viên, hồ sơ khách hàng, sản phẩm, sự kiện, đào tạo và vận hành tại 12 quốc gia.",
    },
    highlights: {
      en: [
        "Engineered **E-learning, Inventory, Product, Operations, CRM and Growth** modules for training, stock sync, order processing and marketing campaigns.",
        "Designed **analytics dashboards** with Recharts and Google Analytics for business KPIs and engagement.",
        "Integrated a **payment gateway** and **real-time WebSocket stock synchronization** for large-scale workflows.",
        "Migrated the legacy system to **React 18 and Vite**, cutting build time by **~70%**.",
      ],
      vi: [
        "Xây dựng các module **E-learning, Kho, Sản phẩm, Vận hành, CRM và Growth** cho đào tạo, đồng bộ tồn kho, xử lý đơn hàng và chiến dịch marketing.",
        "Thiết kế **dashboard phân tích** với Recharts và Google Analytics để theo dõi KPI và mức độ tương tác.",
        "Tích hợp **cổng thanh toán** và **đồng bộ tồn kho real-time qua WebSocket** cho các nghiệp vụ quy mô lớn.",
        "Chuyển hệ thống cũ sang **React 18 và Vite**, giảm **~70%** thời gian build.",
      ],
    },
    outcomes: [
      { value: "12", label: { en: "countries", vi: "quốc gia" } },
      { value: "~70%", label: { en: "faster builds", vi: "build nhanh hơn" } },
    ],
    stack: ["React 18", "TypeScript", "Vite", "Zustand", "TanStack Query", "Ant Design", "Firebase", "Recharts", "i18n", "GSAP", "WebSocket"],
    links: [],
  },
  {
    slug: "brand-website",
    title: { en: "Consumer Brand Website", vi: "Website thương hiệu tiêu dùng" },
    kind: "Work",
    context: { en: "FMCG brand", vi: "Thương hiệu FMCG" },
    role: { en: "Frontend Developer", vi: "Frontend Developer" },
    team: "15+",
    summary: {
      en: "A visually rich, high-performance branding website with 1M+ monthly visitors, built on Next.js.",
      vi: "Website thương hiệu giàu hình ảnh, hiệu năng cao với hơn 1 triệu lượt truy cập mỗi tháng, xây dựng bằng Next.js.",
    },
    highlights: {
      en: [
        "Engineered **smooth animations and interactive transitions** for playful, on-brand storytelling.",
        "Improved SEO and UX with **hybrid rendering (SSR, ISR)** and Core Web Vitals work (LCP, FCP, CLS), raising **PageSpeed from 30+ to 98+**.",
        "Shipped a **responsive, mobile-first** layout that works across all devices and screen sizes.",
        "Turned intricate creative concepts from UI/UX designers into clean, maintainable, SEO-friendly code.",
      ],
      vi: [
        "Làm **animation và hiệu ứng chuyển cảnh mượt mà** để kể câu chuyện thương hiệu vui tươi, đúng tinh thần brand.",
        "Cải thiện SEO và UX bằng **hybrid rendering (SSR, ISR)** cùng tối ưu Core Web Vitals (LCP, FCP, CLS), nâng **PageSpeed từ 30+ lên 98+**.",
        "Làm giao diện **responsive, ưu tiên mobile**, hiển thị tốt trên mọi thiết bị.",
        "Biến các ý tưởng sáng tạo phức tạp của designer thành code sạch, dễ bảo trì và thân thiện SEO.",
      ],
    },
    outcomes: [
      { value: "1M+", label: { en: "monthly visitors", vi: "lượt truy cập/tháng" } },
      { value: "30 → 98", label: { en: "PageSpeed score", vi: "điểm PageSpeed" } },
    ],
    stack: ["Next.js 14", "Emotion", "Material UI", "Swiper", "reCAPTCHA"],
    links: [],
  },
  {
    slug: "coremesh",
    title: { en: "CoreMesh monorepo", vi: "Monorepo CoreMesh" },
    kind: "Personal",
    context: { en: "This site, the blog & shared packages", vi: "Trang này, blog & các package dùng chung" },
    summary: {
      en: "The Bun + Turborepo workspace behind this portfolio and the nextdi.io.vn blog.",
      vi: "Workspace Bun + Turborepo đứng sau portfolio này và blog nextdi.io.vn.",
    },
    highlights: {
      en: [
        "Split shared code into workspace packages: **UI, content, utils, auth** plus ESLint, Tailwind and TS config.",
        "Built a **bilingual MDX blog** with roadmaps, guides and browser tools; this portfolio reads its latest posts at build time.",
        "Each app builds and deploys independently through Turborepo.",
      ],
      vi: [
        "Tách code dùng chung thành các package: **UI, content, utils, auth** cùng cấu hình ESLint, Tailwind và TypeScript.",
        "Xây dựng **blog MDX song ngữ** với roadmap, guide và công cụ chạy trên trình duyệt; portfolio này đọc bài mới nhất lúc build.",
        "Mỗi app build và deploy độc lập nhờ Turborepo.",
      ],
    },
    outcomes: [
      { value: "3", label: { en: "Next.js apps", vi: "app Next.js" } },
      { value: "7", label: { en: "shared packages", vi: "package dùng chung" } },
    ],
    stack: ["Bun", "Turborepo", "Next.js", "MDX", "Tailwind CSS"],
    links: [{ label: { en: "Read the blog", vi: "Đọc blog" }, href: "https://nextdi.io.vn" }],
  },
];
