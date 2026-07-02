import { FaReact, FaCss3Alt } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import { TbBinaryTree, TbServerCog } from "react-icons/tb";
import { SiNextdotjs, SiTypescript } from "react-icons/si";
import { FiZap, FiShield, FiUsers } from "react-icons/fi";
import { TopicCardProps } from "@/components/TopicCard";

export const TOPICS: TopicCardProps[] = [
  {
    slug: "react",
    title: "React",
    description:
      "Component architecture, rendering lifecycles, state flow, custom hooks, and rendering optimizations.",
    glowColor:
      "hover:border-neutral-700 hover:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.03)]",
    bgGradient: "from-neutral-900/20 via-transparent to-transparent",
    iconColor: "text-neutral-300",
    badgeClass: "bg-neutral-900/60 text-neutral-400 border-neutral-800/80",
    icon: <FaReact className="w-5 h-5 text-sky-400 dark:text-sky-400" />,
  },
  {
    slug: "javascript",
    title: "JavaScript",
    description:
      "Closures, prototype scopes, asynchronous execution loops, promises, and advanced ESNext features.",
    glowColor:
      "hover:border-neutral-700 hover:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.03)]",
    bgGradient: "from-neutral-900/20 via-transparent to-transparent",
    iconColor: "text-neutral-300",
    badgeClass: "bg-neutral-900/60 text-neutral-400 border-neutral-800/80",
    icon: (
      <IoLogoJavascript className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
    ),
  },
  {
    slug: "typescript",
    title: "TypeScript",
    description:
      "Advanced type systems, generics, conditional types, mapped types, utility types, and structural compatibility.",
    glowColor:
      "hover:border-neutral-700 hover:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.03)]",
    bgGradient: "from-neutral-900/20 via-transparent to-transparent",
    iconColor: "text-neutral-300",
    badgeClass: "bg-neutral-900/60 text-neutral-400 border-neutral-800/80",
    icon: (
      <SiTypescript className="w-4.5 h-4.5 text-blue-500 dark:text-blue-400" />
    ),
  },
  {
    slug: "css",
    title: "CSS & Web Layouts",
    description:
      "Flexbox and grid positioning systems, cascading rules, hardware acceleration, and fluid animations.",
    glowColor:
      "hover:border-neutral-700 hover:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.03)]",
    bgGradient: "from-neutral-900/20 via-transparent to-transparent",
    iconColor: "text-neutral-300",
    badgeClass: "bg-neutral-900/60 text-neutral-400 border-neutral-800/80",
    icon: (
      <FaCss3Alt className="w-5 h-5 text-purple-500 dark:text-purple-400" />
    ),
  },
  {
    slug: "nextjs",
    title: "Next.js & RSCs",
    description:
      "React Server Components (RSC), Suspense streaming, rendering strategies (SSR, SSG, ISR), and hydration dynamics.",
    glowColor:
      "hover:border-neutral-700 hover:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.03)]",
    bgGradient: "from-neutral-900/20 via-transparent to-transparent",
    iconColor: "text-neutral-300",
    badgeClass: "bg-neutral-900/60 text-neutral-400 border-neutral-800/80",
    icon: (
      <SiNextdotjs className="w-5 h-5 text-foreground dark:text-foreground" />
    ),
  },
  {
    slug: "behavioral",
    title: "Behavioral",
    description:
      "Mentorship, leadership, collaboration, conflict resolution, technical decision-making, and communication strategies.",
    glowColor:
      "hover:border-neutral-700 hover:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.03)]",
    bgGradient: "from-neutral-900/20 via-transparent to-transparent",
    iconColor: "text-neutral-300",
    badgeClass: "bg-neutral-900/60 text-neutral-400 border-neutral-800/80",
    icon: <FiUsers className="w-5 h-5 text-teal-500 dark:text-teal-400" />,
    isNew: true,
  },
  {
    slug: "performance",
    title: "Web Performance",
    description:
      "Core Web Vitals (LCP, FID, CLS), Critical Rendering Path, resource prioritization, and runtime profiling.",
    glowColor:
      "hover:border-neutral-700 hover:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.03)]",
    bgGradient: "from-neutral-900/20 via-transparent to-transparent",
    iconColor: "text-neutral-300",
    badgeClass: "bg-neutral-900/60 text-neutral-400 border-neutral-800/80",
    icon: <FiZap className="w-5 h-5 text-orange-500 dark:text-orange-400" />,
  },
  {
    slug: "security",
    title: "Web Security",
    description:
      "Cross-Site Scripting (XSS), CSRF mitigation, Content Security Policy (CSP), CORS, and secure storage patterns.",
    glowColor:
      "hover:border-neutral-700 hover:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.03)]",
    bgGradient: "from-neutral-900/20 via-transparent to-transparent",
    iconColor: "text-neutral-300",
    badgeClass: "bg-neutral-900/60 text-neutral-400 border-neutral-800/80",
    icon: <FiShield className="w-5 h-5 text-red-500 dark:text-red-400" />,
  },
  {
    slug: "dsa",
    title: "Data Structures & Algorithms",
    description:
      "Algorithmic thinking, DOM parsing, lists, trees, graphs, sorting, and browser memory optimization.",
    glowColor:
      "hover:border-neutral-700 hover:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.03)]",
    bgGradient: "from-neutral-900/20 via-transparent to-transparent",
    iconColor: "text-neutral-300",
    badgeClass: "bg-neutral-900/60 text-neutral-400 border-neutral-800/80",
    icon: (
      <TbBinaryTree className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
    ),
  },
  {
    slug: "system-design",
    title: "System Design",
    description:
      "Scalable frontend architectures, cache storage patterns, CDN optimizations, sync protocols, and web security.",
    glowColor:
      "hover:border-neutral-700 hover:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.03)]",
    bgGradient: "from-neutral-900/20 via-transparent to-transparent",
    iconColor: "text-neutral-300",
    badgeClass: "bg-neutral-900/60 text-neutral-400 border-neutral-800/80",
    icon: (
      <TbServerCog className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
    ),
  },
];
