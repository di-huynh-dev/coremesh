"use client";

import { GithubCalendarSection } from "./github-calendar-section";

const emphasisClass =
  "summary-highlight px-2 py-0.5 font-semibold italic text-white";
const strongClass = "font-semibold text-foreground";

export function AboutSection() {
  return (
    <>
      <section
        id="about"
        className="profile-rail rail-box screen-line-after px-4 py-0"
      >
        <h2 className="text-3xl font-semibold leading-9 text-foreground">
          Summary
        </h2>

        <div className="py-6 font-mono text-sm leading-6 text-foreground">
          <p>
            <strong className={emphasisClass}>3+ years of experience</strong>{" "}
            building and scaling high-performance web applications, including{" "}
            <strong className={strongClass}>
              CMS, CRM, and enterprise-grade SPA platforms
            </strong>{" "}
            across <strong className={emphasisClass}>11+ countries</strong>.
            Proficient in{" "}
            <strong className={emphasisClass}>
              React, TypeScript, Next.js
            </strong>
            , Monorepo and Micro-frontend architectures, with experience
            designing maintainable frontend systems, reusable UI components,
            and responsive interfaces using Antd, ShadcnUI. Strong focus on
            performance, scalability, and UX, including SSR, ISR, Core Web
            Vitals, async data flows, WebSocket real-time features, and payment
            integrations. Experienced in cross-functional collaboration,
            architecture discussions, code reviews, and refactoring to deliver
            scalable digital products.
          </p>
        </div>
      </section>

      <GithubCalendarSection />
    </>
  );
}
