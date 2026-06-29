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
import { BadgeCheck, Bug, FlaskConical, Zap } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type TechnologyItem = {
  name: string;
  className: string;
  Icon?: IconComponent;
};

type TechnologyGroup = {
  label: string;
  technologies: TechnologyItem[];
};

const technologyGroups: TechnologyGroup[] = [
  {
    label: "Core Frontend",
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
    label: "UI & Styling",
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
    label: "App & Data",
    technologies: [
      { name: "Nodejs", Icon: Nodejs, className: "bg-[#5fa04e] text-white" },
      {
        name: "Expressjs",
        Icon: ExpressjsDark,
        className: "bg-[#6aa84f] text-white",
      },
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
    label: "Build & Infra",
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
    ],
  },
  {
    label: "Testing & Code Quality",
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
    label: "Motion & Rendering",
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

export function StackSection() {
  return (
    <section
      id="techstack"
      className="profile-rail rail-box screen-line-after px-4 py-8"
    >
      <h2 className="mb-5 text-3xl font-semibold leading-9">Stack</h2>

      <div className="dot-pattern space-y-4 px-6 py-4 max-sm:px-4">
        {technologyGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.technologies.map((tech) => (
                <span
                  key={tech.name}
                  className={`inline-flex h-7 items-center gap-1.5 rounded-[2px] px-2 font-sans text-[11px] font-medium leading-none shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.14)] ${tech.className}`}
                >
                  {tech.Icon ? (
                    <tech.Icon className="size-3.5 shrink-0" />
                  ) : null}
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
