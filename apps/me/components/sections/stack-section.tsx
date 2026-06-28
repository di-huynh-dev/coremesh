import Image from "next/image";

const technologies = [
  { name: "html5", iconUrl: "https://svgl.app/library/html5.svg", tone: "bg-orange-600" },
  { name: "css3", iconUrl: "https://svgl.app/library/css.svg", tone: "bg-blue-600" },
  { name: "Javascript", iconUrl: "https://svgl.app/library/javascript.svg", tone: "bg-zinc-950" },
  { name: "Typescript", iconUrl: "https://svgl.app/library/typescript.svg", tone: "bg-blue-500" },
  { name: "Reactjs", iconUrl: "https://svgl.app/library/react_light.svg", tone: "bg-zinc-950" },
  { name: "Nextjs", iconUrl: "https://svgl.app/library/nextjs_icon_dark.svg", tone: "bg-black" },
  { name: "Vuejs", iconUrl: "https://svgl.app/library/vue.svg", tone: "bg-emerald-700" },
  { name: "Nestjs", iconUrl: "https://svgl.app/library/nestjs.svg", tone: "bg-red-600" },
  { name: "Tailwindcss", iconUrl: "https://svgl.app/library/tailwindcss.svg", tone: "bg-cyan-600" },
  { name: "AntDesign", iconUrl: "https://svgl.app/library/ant-design-dark-theme.svg", tone: "bg-blue-700" },
  { name: "Firebase", iconUrl: "https://svgl.app/library/firebase.svg", tone: "bg-sky-500" },
  { name: "Docker", iconUrl: "https://svgl.app/library/docker.svg", tone: "bg-cyan-600" },
  { name: "Git", iconUrl: "https://svgl.app/library/git.svg", tone: "bg-orange-600" },
  { name: "Vitejs", iconUrl: "https://svgl.app/library/vite.svg", tone: "bg-violet-600" },
  { name: "Nodejs", iconUrl: "https://svgl.app/library/nodejs.svg", tone: "bg-green-700" },
];

export function StackSection() {
  return (
    <section
      id="techstack"
      className="profile-rail rail-box screen-line-after px-4 py-8"
    >
      <h2 className="mb-5 text-3xl font-semibold leading-9">Stack</h2>

      <div className="dot-pattern flex flex-wrap justify-center gap-1.5 px-6 py-4">
        {technologies.map((tech) => (
          <span key={tech.name} className={`tech-badge ${tech.tone}`}>
            <Image
              src={tech.iconUrl}
              alt=""
              width={14}
              height={14}
              unoptimized
              className="size-3.5 shrink-0"
            />
            {tech.name}
          </span>
        ))}
      </div>
    </section>
  );
}
