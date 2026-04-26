"use client";

import { motion } from "framer-motion";
import { ChevronRight, GraduationCap } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

type ExperienceItem = {
  company: string;
  role: string;
  logo: string;
  period: string;
  employmentType?: string;
  highlight?: string;
  bullets: ReactNode[];
  tags: string[];
};

const experiences: ExperienceItem[] = [
  {
    company: "Estuary Solutions JSC",
    role: "Junior -> Middle Frontend Developer",
    logo: "/estuary-logo.jpg",
    period: "Oct 2023 - Present",
    employmentType: "Full-time",
    highlight: "Current",
    bullets: [
      "Architected and developed scalable web applications using React.js, Next.js, and Vite, ensuring high maintainability.",
      <>
        Developed a <strong className="font-semibold text-foreground">CRM platform</strong> serving{" "}
        <strong className="font-semibold text-foreground">
          30,000+ monthly active users
        </strong>
        , integrating WebSockets for real-time messaging and instant live
        notifications.
      </>,
      <>
        Migrated build system from{" "}
        <strong className="font-semibold text-foreground">
          Webpack to Vite
        </strong>
        , resulting in a{" "}
        <strong className="font-semibold text-foreground">
          ~70% reduction
        </strong>{" "}
        in hot module reloading and startup time.
      </>,
      <>
        Optimized{" "}
        <strong className="font-semibold text-foreground">
          Core Web Vitals (LCP, FCP, CLS)
        </strong>
        , boosting{" "}
        <strong className="font-semibold text-foreground">
          Google PageSpeed scores from 30+ to 98+
        </strong>{" "}
        via hybrid rendering (SSR/ISR).
      </>,
      "Built responsive, cross-platform UIs and optimized performance.",
      <>
        Integrated third-party libraries and{" "}
        <strong className="font-semibold text-foreground">
          OAuth providers (Google, Microsoft)
        </strong>
        .
      </>,
      <>
        <strong className="font-semibold text-foreground">
          Collaborated in Agile teams
        </strong>{" "}
        across design, product, and backend.
      </>,
      "Implemented a real-time chat application module.",
      <>
        Successfully led the front-end internationalization (i18n) strategy
        for Engage X,{" "}
        <strong className="font-semibold text-foreground">
          enabling the platform&apos;s expansion into 10+ countries across SEA,
          APAC, North America, and LATAM
        </strong>
        .
      </>,
      <>
        Conducted <strong className="font-semibold text-foreground">code reviews</strong> for
        team members to ensure code quality and consistency.
      </>,
    ],
    tags: [
      "React.js",
      "Next.js",
      "Vite",
      "TypeScript",
      "WebSockets",
      "OAuth",
      "i18n",
      "Core Web Vitals",
      "PageSpeed",
      "Agile",
    ],
  },
  {
    company: "AMIT Group",
    role: "Intern & Fresher Frontend Developer",
    logo: "/amit-logo.webp",
    period: "March 2022 - Sep 2023",
    bullets: [
      <>
        Implemented efficient state management and server-state handling using{" "}
        <strong className="font-semibold text-foreground">
          Zustand and TanStack Query
        </strong>
        .
      </>,
      <>
        Developed reusable UI components strictly adhering to{" "}
        <strong className="font-semibold text-foreground">
          Figma design specs
        </strong>{" "}
        and team coding standards.
      </>,
      <>
        Contributed to the full{" "}
        <strong className="font-semibold text-foreground">
          Software Development Life Cycle (SDLC)
        </strong>{" "}
        through active participation in Code Reviews, QA, and Agile
        retrospectives.
      </>,
    ],
    tags: [
      "React.js",
      "Zustand",
      "TanStack Query",
      "Figma",
      "QA",
      "Agile",
      "SDLC",
    ],
  },
];

const education = {
  school: "HCMC University of Technology and Education",
  logo: "/ute_logo.png",
  degree: "Software Engineering",
  period: "Sep 2020 - June 2024",
  details: "GPA: 3.34/4 (8.41/10)",
};

export function ExperienceSection() {
  return (
    <section id="experience" className="py-12 section-divider">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-6 text-foreground">
            <span className="font-mono-data text-muted-foreground">
              experience
            </span>
          </h2>

          <div className="space-y-5">
            {experiences.map((exp) => (
              <article
                key={`${exp.company}-${exp.role}`}
                className="overflow-hidden rounded-[22px] border border-border bg-background"
              >
                <div className="border-b border-border px-5 py-4 md:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-white">
                        <Image
                          src={exp.logo}
                          alt={exp.company}
                          width={38}
                          height={38}
                          className="h-8 w-8 object-contain"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-lg font-semibold text-foreground">
                            {exp.company}
                          </h3>
                          {exp.highlight ? (
                            <span className="rounded-full bg-sky-500/12 px-2.5 py-1 text-[11px] font-medium text-sky-600">
                              {exp.highlight}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {exp.role}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {exp.employmentType ? <span>{exp.employmentType}</span> : null}
                    {exp.employmentType ? <span>&middot;</span> : null}
                    <span>{exp.period}</span>
                  </div>
                </div>

                <div className="px-5 py-5 md:px-6">
                  <ul className="space-y-2.5 text-sm leading-7 text-muted-foreground">
                    {exp.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-muted/25 px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="mb-4 text-sm font-mono-data text-muted-foreground">
              education
            </h3>

            <div className="rounded-[22px] border border-border bg-background p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-white">
                  {education.logo ? (
                    <Image
                      src={education.logo}
                      alt={education.school}
                      width={38}
                      height={38}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {education.school}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {education.degree}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span>{education.period}</span>
                    <span>&middot;</span>
                    <span>{education.details}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
