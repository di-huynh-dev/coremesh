import { Reveal } from "@/components/ui/reveal";
import { RichText } from "@/components/ui/rich-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { projects, type Project } from "@/lib/data/projects";
import { dictionaries } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";

function ProjectLinkButton({ label, href }: { label: string; href: string }) {
  const className =
    "group inline-flex items-center gap-1.5 font-mono text-sm text-foreground underline decoration-brand/60 underline-offset-4 transition-colors hover:text-brand";
  const content = (
    <>
      {label}
      <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </>
  );

  return href.startsWith("/") ? (
    <Link href={href} data-cursor={label} className={className}>
      {content}
    </Link>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor={label}
      className={className}
    >
      {content}
    </a>
  );
}

function ProjectCard({
  project,
  index,
  locale,
}: {
  project: Project;
  index: number;
  locale: Locale;
}) {
  const t = dictionaries[locale].projects;

  return (
    <article className="corner-ticks border border-edge bg-card/60">
      <div className="p-5 sm:p-6">
        <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="text-brand">{String(index + 1).padStart(2, "0")}</span>
          <span className="h-px w-4 bg-brand/60" />
          <span>{t.kind[project.kind]}</span>
          <span className="text-brand">/</span>
          <span className="normal-case tracking-normal">{project.context[locale]}</span>
        </p>
        <h3 className="font-display mt-2 text-2xl leading-snug font-medium sm:text-3xl">
          {project.title[locale]}
        </h3>
        <p className="mt-2 font-mono text-sm leading-6 text-muted-foreground">
          {project.summary[locale]}
        </p>
        {project.role || project.team ? (
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
            {project.role ? (
              <span>
                <span className="text-brand">{t.role}</span> {project.role[locale]}
              </span>
            ) : null}
            {project.team ? (
              <span>
                <span className="text-brand">{t.team}</span> {project.team}
              </span>
            ) : null}
          </p>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 border-t border-edge">
        {project.outcomes.map((outcome, outcomeIndex) => (
          <div
            key={outcome.value}
            className={`px-5 py-4 sm:px-6 ${outcomeIndex > 0 ? "border-l border-edge" : ""}`}
          >
            <dt className="sr-only">{outcome.label[locale]}</dt>
            <dd>
              <span className="font-display block text-3xl leading-none font-medium text-brand">
                {outcome.value}
              </span>
              <span className="mt-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {outcome.label[locale]}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <details className="group border-t border-edge">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-mono text-sm text-muted-foreground transition-colors hover:bg-brand/[0.05] hover:text-foreground sm:px-6 [&::-webkit-details-marker]:hidden">
          {t.details}
          <ChevronDown className="size-4 transition-transform duration-300 group-open:rotate-180" />
        </summary>
        <ul className="space-y-1.5 px-5 pb-5 font-mono text-sm leading-6 sm:px-6">
          {project.highlights[locale].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2.5 size-1 shrink-0 rotate-45 bg-brand/70" />
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge px-5 py-3 sm:px-6">
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span key={tech} className="company-tag">
              {tech}
            </span>
          ))}
        </div>
        {project.links.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {project.links.map((link) => (
              <ProjectLinkButton key={link.href} label={link.label[locale]} href={link.href} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ProjectsSection({ locale }: { locale: Locale }) {
  const heading = dictionaries[locale].headings.projects;

  return (
    <section
      id="projects"
      className="profile-rail rail-box screen-line-after scroll-mt-16 px-4 py-8"
    >
      <SectionHeading index="04" title={heading.title} alt={heading.alt} />

      <div className="mt-6 space-y-4">
        {projects.map((project, index) => (
          <Reveal key={project.slug} delay={Math.min(index, 2) * 0.04}>
            <ProjectCard project={project} index={index} locale={locale} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
