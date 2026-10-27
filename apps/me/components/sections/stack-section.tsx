"use client";

import { useI18n } from "@/components/i18n-provider";
import { AntDesignDarkTheme } from "@/components/ui/svgs/antDesignDarkTheme";
import { Cloudflare } from "@/components/ui/svgs/cloudflare";
import { CssOld } from "@/components/ui/svgs/cssOld";
import { Docker } from "@/components/ui/svgs/docker";
import { ExpressjsDark } from "@/components/ui/svgs/expressjsDark";
import { Firebase } from "@/components/ui/svgs/firebase";
import { Git } from "@/components/ui/svgs/git";
import { Html5 } from "@/components/ui/svgs/html5";
import { Javascript } from "@/components/ui/svgs/javascript";
import { MarkdownDark } from "@/components/ui/svgs/markdownDark";
import { MaterialUi } from "@/components/ui/svgs/materialUi";
import { MysqlDark } from "@/components/ui/svgs/mysqlDark";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Nginx } from "@/components/ui/svgs/nginx";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { Sass } from "@/components/ui/svgs/sass";
import { ShadcnUi } from "@/components/ui/svgs/shadcnUi";
import { Svelte } from "@/components/ui/svgs/svelte";
import { Swagger } from "@/components/ui/svgs/swagger";
import { Tailwindcss } from "@/components/ui/svgs/tailwindcss";
import { ThreejsDark } from "@/components/ui/svgs/threejsDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Vite } from "@/components/ui/svgs/vite";
import { Vue } from "@/components/ui/svgs/vue";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Dictionary } from "@/lib/dictionary";
import { BadgeCheck, Bot, Bug, FlaskConical, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type TechnologyItem = {
  name: string;
  className: string;
  Icon?: IconComponent;
};

type TechnologyGroup = {
  key: keyof Dictionary["stack"]["groups"];
  technologies: TechnologyItem[];
};

const technologyGroups: TechnologyGroup[] = [
  {
    key: "core",
    technologies: [
      { name: "HTML5", Icon: Html5, className: "bg-[#f16529] text-white" },
      { name: "CSS3", Icon: CssOld, className: "bg-[#2965f1] text-white" },
      {
        name: "Javascript",
        Icon: Javascript,
        className: "bg-[#f7df1e] text-zinc-950",
      },
      {
        name: "Typescript",
        Icon: Typescript,
        className: "bg-[#3178c6] text-white",
      },
      {
        name: "Reactjs",
        Icon: ReactLight,
        className: "bg-[#20232a] text-white",
      },
      {
        name: "Nextjs",
        Icon: NextjsIconDark,
        className: "bg-[#111111] text-white",
      },
      { name: "Vuejs", Icon: Vue, className: "bg-[#42b883] text-white" },
      { name: "Svelte", Icon: Svelte, className: "bg-[#ff3e00] text-white" },
    ],
  },
  {
    key: "ui",
    technologies: [
      { name: "SASS", Icon: Sass, className: "bg-[#d7aec3] text-white" },
      { name: "LESS", className: "bg-[#1d365d] text-white" },
      {
        name: "Tailwindcss",
        Icon: Tailwindcss,
        className: "bg-[#72bddd] text-white",
      },
      {
        name: "shadcn/ui",
        Icon: ShadcnUi,
        className: "bg-[#18181b] text-white",
      },
      {
        name: "AntDesign",
        Icon: AntDesignDarkTheme,
        className: "bg-[#1677ff] text-white",
      },
      {
        name: "Material UI",
        Icon: MaterialUi,
        className: "bg-[#e9f3ff] text-[#007fff]",
      },
      {
        name: "Markdown",
        Icon: MarkdownDark,
        className: "bg-[#111111] text-white",
      },
    ],
  },

  {
    key: "data",
    technologies: [
      { name: "TanStack Query", className: "bg-[#ff4154] text-white" },
      { name: "Zustand", className: "bg-[#433e38] text-white" },
      { name: "Redux", className: "bg-[#764abc] text-white" },
      { name: "React Router", className: "bg-[#ca4245] text-white" },
      { name: "WebSocket", className: "bg-[#111827] text-white" },
      { name: "Nodejs", Icon: Nodejs, className: "bg-[#5fa04e] text-white" },
      {
        name: "Expressjs",
        Icon: ExpressjsDark,
        className: "bg-[#6aa84f] text-white",
      },
      { name: "NestJS", className: "bg-[#e0234e] text-white" },
      {
        name: "Firebase",
        Icon: Firebase,
        className: "bg-[#1d9bf0] text-white",
      },
      {
        name: "Swagger",
        Icon: Swagger,
        className: "bg-[#173647] text-white",
      },
      {
        name: "PostgreSQL",
        Icon: Postgresql,
        className: "bg-[#f5f8fb] text-[#336791]",
      },
      { name: "MySQL", Icon: MysqlDark, className: "bg-[#00546b] text-white" },
    ],
  },
  {
    key: "ai",
    technologies: [
      { name: "AI Agents", Icon: Bot, className: "bg-[#0f766e] text-white" },
      { name: "Claude Code", className: "bg-[#d97757] text-white" },
      { name: "Codex", className: "bg-[#10a37f] text-white" },
      { name: "AI Code Review", className: "bg-[#334155] text-white" },
    ],
  },
  {
    key: "build",
    technologies: [
      { name: "Vitejs", Icon: Vite, className: "bg-[#7c3aed] text-white" },
      { name: "Webpack", className: "bg-[#1e88e5] text-white" },
      {
        name: "Cloudflare",
        Icon: Cloudflare,
        className: "bg-[#fff7ed] text-[#f48120]",
      },
      { name: "Docker", Icon: Docker, className: "bg-[#2496ed] text-white" },
      { name: "Nginx", Icon: Nginx, className: "bg-[#5aae47] text-white" },
      { name: "Git", Icon: Git, className: "bg-[#f05133] text-white" },
      { name: "GitHub/GitLab CI/CD", className: "bg-[#fc6d26] text-white" },
    ],
  },
  {
    key: "testing",
    technologies: [
      {
        name: "Jest",
        Icon: FlaskConical,
        className: "bg-[#99425b] text-white",
      },
      { name: "Cypress", Icon: Bug, className: "bg-[#111827] text-white" },
      {
        name: "Unit Testing",
        Icon: BadgeCheck,
        className: "bg-[#1d4ed8] text-white",
      },
      {
        name: "E2E Testing",
        Icon: BadgeCheck,
        className: "bg-[#047857] text-white",
      },
    ],
  },
  {
    key: "motion",
    technologies: [
      {
        name: "Three.js",
        Icon: ThreejsDark,
        className: "bg-[#0f172a] text-white",
      },
      { name: "GSAP", Icon: Zap, className: "bg-[#88ce02] text-zinc-950" },
    ],
  },
];

const RELATION_PAIRS: Array<[string, string[]]> = [
  ["Reactjs", ["Nextjs", "Typescript", "Javascript", "Vitejs", "Tailwindcss", "shadcn/ui", "AntDesign", "Material UI", "Three.js"]],
  ["Nextjs", ["Typescript", "Tailwindcss", "shadcn/ui", "Nodejs", "Cloudflare"]],
  ["Typescript", ["Javascript", "Vuejs", "Nodejs", "NestJS", "Jest"]],
  ["Javascript", ["Vuejs", "Svelte", "Nodejs", "Three.js", "GSAP"]],
  ["HTML5", ["CSS3", "Javascript"]],
  ["CSS3", ["SASS", "LESS", "Tailwindcss"]],
  ["Vuejs", ["Vitejs"]],
  ["Svelte", ["Vitejs"]],
  ["Vitejs", ["Webpack"]],
  ["Nodejs", ["Expressjs", "NestJS", "Swagger", "PostgreSQL", "MySQL", "Firebase", "Docker"]],
  ["NestJS", ["Expressjs", "Swagger", "PostgreSQL", "MySQL"]],
  ["Docker", ["Nginx", "Git", "Cloudflare"]],
  ["Jest", ["Unit Testing"]],
  ["Cypress", ["E2E Testing"]],
  ["Three.js", ["GSAP"]],
  ["Reactjs", ["TanStack Query", "Zustand", "Redux", "React Router"]],
  ["TanStack Query", ["WebSocket"]],
  ["AI Agents", ["Claude Code", "Codex", "AI Code Review"]],
  ["Git", ["GitHub/GitLab CI/CD", "AI Code Review"]],
];

const RELATED = new Map<string, Set<string>>();
for (const [name, others] of RELATION_PAIRS) {
  for (const other of others) {
    if (!RELATED.has(name)) RELATED.set(name, new Set());
    if (!RELATED.has(other)) RELATED.set(other, new Set());
    RELATED.get(name)!.add(other);
    RELATED.get(other)!.add(name);
  }
}

export function StackSection() {
  const { t } = useI18n();
  const [focused, setFocused] = useState<string | null>(null);
  const related = useMemo(
    () => (focused ? (RELATED.get(focused) ?? new Set<string>()) : null),
    [focused],
  );

  return (
    <section
      id="techstack"
      className="profile-rail rail-box screen-line-after scroll-mt-16 px-4 py-8"
    >
      <SectionHeading index="02" title={t.headings.stack.title} alt={t.headings.stack.alt} />
      <p
        className="mt-3 min-h-8 font-mono text-xs leading-5 text-muted-foreground"
        aria-live="polite"
      >
        {focused ? (
          <>
            <span className="text-brand">{focused}</span>
            {related && related.size > 0 ? (
              <>
                {" "}
                <span className="text-brand">→</span>{" "}
                {Array.from(related).join(" · ")}
              </>
            ) : null}
          </>
        ) : (
          t.stack.hint
        )}
      </p>

      <div
        className="mt-3 border border-edge"
        onMouseLeave={() => setFocused(null)}
      >
        {technologyGroups.map((group, groupIndex) => (
          <Reveal key={group.key} delay={groupIndex * 0.04}>
            <div
              className={`grid gap-3 px-4 py-4 sm:grid-cols-[150px_1fr] ${
                groupIndex > 0 ? "border-t border-edge" : ""
              }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="mr-2 text-brand">
                  {String(groupIndex + 1).padStart(2, "0")}
                </span>
                {t.stack.groups[group.key]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.technologies.map((tech) => {
                  const state = !focused
                    ? undefined
                    : tech.name === focused || related?.has(tech.name)
                      ? "lit"
                      : "dim";
                  return (
                    <span
                      key={tech.name}
                      tabIndex={0}
                      data-state={state}
                      onMouseEnter={() => setFocused(tech.name)}
                      onFocus={() => setFocused(tech.name)}
                      onBlur={() => setFocused(null)}
                      className={`stack-chip inline-flex h-7 items-center gap-1.5 rounded-[2px] px-2 font-sans text-[11px] font-medium leading-none shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.14)] ${tech.className}`}
                    >
                      {tech.Icon ? (
                        <tech.Icon className="size-3.5 shrink-0" />
                      ) : null}
                      {tech.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
