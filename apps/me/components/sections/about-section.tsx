import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getContributions } from "@/lib/github";
import { GithubCalendarSection } from "./github-calendar-section";

const emphasisClass = "summary-highlight px-0.5";
const strongClass = "font-semibold text-foreground";

const highlights = [
  { value: "3+", label: "years shipping" },
  { value: "11+", label: "countries reached" },
  { value: "30k+", label: "monthly active users" },
  { value: "98+", label: "PageSpeed score" },
];

export async function AboutSection() {
  const contributions = await getContributions();

  return (
    <>
      <section
        id="about"
        className="profile-rail rail-box screen-line-after scroll-mt-16 px-4 py-8"
      >
        <SectionHeading index="01" title="Summary" vi="Tóm tắt" />

        <Reveal>
          <div className="corner-ticks mt-6 grid grid-cols-2 border border-edge bg-card/60 sm:grid-cols-4">
            {highlights.map((item, index) => (
              <div
                key={item.label}
                className={`px-4 py-4 ${index % 2 === 1 ? "border-l border-edge" : ""} ${
                  index > 0 ? "sm:border-l sm:border-edge" : ""
                } ${index > 1 ? "max-sm:border-t max-sm:border-edge" : ""}`}
              >
                <p className="font-display text-3xl leading-none font-medium text-brand sm:text-4xl">
                  {item.value}
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="pt-6 font-mono text-sm leading-7 text-foreground">
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
              Vitals, async data flows, WebSocket real-time features, and
              payment integrations. Experienced in cross-functional
              collaboration, architecture discussions, code reviews, and
              refactoring to deliver scalable digital products.
            </p>
          </div>
        </Reveal>
      </section>

      <GithubCalendarSection data={contributions} />
    </>
  );
}
