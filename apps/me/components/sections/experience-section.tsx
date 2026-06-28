import { Code2, GraduationCap } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

type ExperienceItem = {
  company: string;
  role: string;
  logo: string;
  period: string;
  employmentType: string;
  highlight?: string;
  bullets: ReactNode[];
  tags: string[];
};

const experiences: ExperienceItem[] = [
  {
    company: "Estuary Solutions JSC",
    role: "Junior to Middle Frontend Developer",
    logo: "/estuary-logo.jpg",
    period: "10.2023 - Present",
    employmentType: "Full-time",
    highlight: "Current Employer",
    bullets: [
      <>
        Architected and developed scalable web applications using React.js,
        Next.js, and Vite, ensuring high maintainability.
      </>,
      <>
        Developed a <strong className="font-semibold">CRM platform</strong>{" "}
        serving{" "}
        <strong className="font-semibold">
          30,000+ monthly active users
        </strong>
        , integrating WebSockets for real-time messaging and instant live
        notifications.
      </>,
      <>
        Migrated build system from{" "}
        <strong className="font-semibold">Webpack to Vite</strong>, resulting in
        a{" "}
        <strong className="font-semibold">~70% reduction</strong> in hot module
        reloading and startup time.
      </>,
      <>
        Optimized{" "}
        <strong className="font-semibold">Core Web Vitals (LCP, FCP, CLS)</strong>
        , boosting{" "}
        <strong className="font-semibold">
          Google PageSpeed scores from 30+ to 98+
        </strong>{" "}
        via hybrid rendering (SSR/ISR).
      </>,
      "Built responsive, cross-platform UIs and optimized performance.",
      <>
        Integrated third-party libraries and{" "}
        <strong className="font-semibold">
          OAuth providers (Google, Microsoft)
        </strong>
        .
      </>,
      <>
        <strong className="font-semibold">Collaborated in Agile teams</strong>{" "}
        across design, product, and backend.
      </>,
      "Implemented a real-time chat application module.",
      <>
        Successfully led the front-end internationalization (i18n) strategy for
        Engage X,{" "}
        <strong className="font-semibold">
          enabling the platform&apos;s expansion into 10+ countries across SEA,
          APAC, North America, and LATAM
        </strong>
        .
      </>,
      <>
        Conducted <strong className="font-semibold">code reviews</strong> for
        team members to ensure code quality and consistency.
      </>,
    ],
    tags: ["TypeScript", "React", "Next.js", "Vite", "WebSockets", "i18n", "Agile"],
  },
  {
    company: "AMIT Group",
    role: "Intern & Fresher Frontend Developer",
    logo: "/amit-logo.webp",
    period: "03.2022 - 09.2023",
    employmentType: "Full-time",
    bullets: [
      "Implemented state and server-state flows with Zustand and TanStack Query.",
      "Developed reusable UI components from Figma specs and shared team standards.",
      "Joined code reviews, QA cycles and Agile retrospectives across the product lifecycle.",
    ],
    tags: ["React", "Zustand", "TanStack Query", "Figma", "QA", "SDLC"],
  },
];

const education = {
  school: "HCMC University of Technology and Education",
  logo: "/ute_logo.png",
  degree: "Software Engineering",
  period: "09.2020 - 06.2024",
  details: "GPA 3.34/4",
};

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="profile-rail rail-box screen-line-after px-4 py-8"
    >
      <h2 className="mb-5 text-3xl font-semibold leading-9">Experience</h2>

      <div className="space-y-0">
        {experiences.map((exp) => (
          <article
            key={`${exp.company}-${exp.role}`}
            className="screen-line-after space-y-4 py-4"
          >
            <div className="flex items-center gap-3">
              <Image
                src={exp.logo}
                alt={exp.company}
                width={24}
                height={24}
                className="size-6 rounded-full object-contain"
              />
              <h3 className="text-lg font-medium leading-snug">{exp.company}</h3>
              {exp.highlight ? (
                <span
                  className="relative flex size-3 items-center justify-center"
                  title={exp.highlight}
                  aria-label={exp.highlight}
                >
                  <span className="absolute size-3 animate-ping rounded-full bg-sky-500/55" />
                  <span className="relative size-2 rounded-full bg-sky-500" />
                </span>
              ) : null}
            </div>

            <div className="relative space-y-4 pl-0 before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-border">
              <div className="relative">
                <div className="relative z-10 mb-1 flex items-center gap-3 bg-background">
                  <span className="mini-icon">
                    <Code2 className="size-4" />
                  </span>
                  <h4 className="font-semibold">{exp.role}</h4>
                </div>

                <div className="flex flex-wrap items-center gap-2 pl-9 text-sm text-muted-foreground">
                  <span>{exp.employmentType}</span>
                  <span>/</span>
                  <span>{exp.period}</span>
                </div>

                <div className="mt-4 pl-9 font-mono text-sm leading-6">
                  <ul className="space-y-1">
                    {exp.bullets.map((bullet, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="mt-3 size-1 shrink-0 rounded-full bg-zinc-300" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {exp.tags.map((tag) => (
                      <span key={tag} className="company-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}

        <article className="pt-4">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-zinc-300" />
            <h3 className="text-lg font-medium leading-snug">Education</h3>
          </div>

          <div className="mt-5 flex items-start gap-3">
            <span className="mini-icon">
              <GraduationCap className="size-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src={education.logo}
                  alt={education.school}
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                />
                <p className="font-medium">{education.school}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {education.degree} / {education.period} / {education.details}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
