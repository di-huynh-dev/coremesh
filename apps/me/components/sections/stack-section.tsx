import { AntDesignDarkTheme } from "@/components/ui/svgs/antDesignDarkTheme";
import { CssOld } from "@/components/ui/svgs/cssOld";
import { Docker } from "@/components/ui/svgs/docker";
import { ExpressjsDark } from "@/components/ui/svgs/expressjsDark";
import { Firebase } from "@/components/ui/svgs/firebase";
import { Git } from "@/components/ui/svgs/git";
import { Html5 } from "@/components/ui/svgs/html5";
import { Javascript } from "@/components/ui/svgs/javascript";
import { MongodbIconLight } from "@/components/ui/svgs/mongodbIconLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Nginx } from "@/components/ui/svgs/nginx";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { RemixLight } from "@/components/ui/svgs/remixLight";
import { Sass } from "@/components/ui/svgs/sass";
import { Solidjs } from "@/components/ui/svgs/solidjs";
import { Svelte } from "@/components/ui/svgs/svelte";
import { Tailwindcss } from "@/components/ui/svgs/tailwindcss";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Vite } from "@/components/ui/svgs/vite";
import { Vue } from "@/components/ui/svgs/vue";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type TechnologyItem = {
  name: string;
  className: string;
  Icon?: IconComponent;
};

const technologies: TechnologyItem[] = [
  { name: "html5", Icon: Html5, className: "bg-[#f16529] text-white" },
  { name: "css3", Icon: CssOld, className: "bg-[#2965f1] text-white" },
  { name: "SASS", Icon: Sass, className: "bg-[#cc6699] text-white" },
  { name: "LESS", className: "bg-[#1d365d] text-white" },
  {
    name: "Tailwindcss",
    Icon: Tailwindcss,
    className: "bg-[#38bdf8] text-white",
  },
  {
    name: "AntDesign",
    Icon: AntDesignDarkTheme,
    className: "bg-[#1677ff] text-white",
  },
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
  { name: "Reactjs", Icon: ReactLight, className: "bg-[#20232a] text-white" },
  {
    name: "Nextjs",
    Icon: NextjsIconDark,
    className: "bg-[#111111] text-white",
  },
  { name: "Remix", Icon: RemixLight, className: "bg-[#121212] text-white" },
  { name: "Solidjs", Icon: Solidjs, className: "bg-[#446bca] text-white" },
  { name: "Vuejs", Icon: Vue, className: "bg-[#42b883] text-white" },
  { name: "Svelte", Icon: Svelte, className: "bg-[#ff3e00] text-white" },
  { name: "Vitejs", Icon: Vite, className: "bg-[#7c3aed] text-white" },
  { name: "Webpack", className: "bg-[#1e88e5] text-white" },
  { name: "Nodejs", Icon: Nodejs, className: "bg-[#5fa04e] text-white" },
  {
    name: "Expressjs",
    Icon: ExpressjsDark,
    className: "bg-[#6aa84f] text-white",
  },
  { name: "Firebase", Icon: Firebase, className: "bg-[#1d9bf0] text-white" },
  {
    name: "MongoDB",
    Icon: MongodbIconLight,
    className: "bg-[#4caf50] text-white",
  },
  { name: "Docker", Icon: Docker, className: "bg-[#2496ed] text-white" },
  { name: "Nginx", Icon: Nginx, className: "bg-[#5aae47] text-white" },
  { name: "Git", Icon: Git, className: "bg-[#f05133] text-white" },
];

export function StackSection() {
  return (
    <section
      id="techstack"
      className="profile-rail rail-box screen-line-after px-4 py-8"
    >
      <h2 className="mb-5 text-3xl font-semibold leading-9">Stack</h2>

      <div className="dot-pattern flex flex-wrap gap-1.5 px-6 py-4 max-sm:px-4">
        {technologies.map((tech) => (
          <span
            key={tech.name}
            className={`inline-flex h-7 items-center gap-1.5 rounded-[2px] px-2 font-sans text-[11px] font-medium leading-none shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.14)] ${tech.className}`}
          >
            {tech.Icon ? <tech.Icon className="size-3.5 shrink-0" /> : null}
            {tech.name}
          </span>
        ))}
      </div>
    </section>
  );
}
