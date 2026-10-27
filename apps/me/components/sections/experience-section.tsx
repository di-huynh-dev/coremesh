import { Reveal } from "@/components/ui/reveal";
import { RichText } from "@/components/ui/rich-text";
import { ScrollLine } from "@/components/ui/scroll-line";
import { SectionHeading } from "@/components/ui/section-heading";
import { education, experiences } from "@/lib/data/experience";
import { dictionaries } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { Code2, GraduationCap } from "lucide-react";
import Image from "next/image";

export function ExperienceSection({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];

  return (
    <section
      id="experience"
      className="profile-rail rail-box screen-line-after scroll-mt-16 px-4 py-8"
    >
      <SectionHeading
        index="03"
        title={t.headings.experience.title}
        alt={t.headings.experience.alt}
      />

      <div className="mt-6">
        <ScrollLine>
        {experiences.map((exp) => (
          <Reveal key={exp.company}>
          <article className="screen-line-after space-y-4 py-5">
            <span
              aria-hidden="true"
              className="absolute -left-7 top-[1.65rem] z-10 size-[11px] rounded-full border-2 border-brand bg-background"
            />
            <div className="flex items-center gap-3">
              <Image
                src={exp.logo}
                alt={exp.company}
                width={24}
                height={24}
                className="size-6 rounded-full object-contain"
              />
              <h3 className="font-display text-2xl leading-snug font-medium">{exp.company}</h3>
              {exp.current ? (
                <span
                  className="relative flex size-3 items-center justify-center"
                  title={t.experience.current}
                  aria-label={t.experience.current}
                >
                  <span className="absolute size-3 animate-ping rounded-full bg-brand/55" />
                  <span className="relative size-2 rounded-full bg-brand" />
                </span>
              ) : null}
            </div>

            <div className="relative space-y-4 pl-0 before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-border">
              <div className="relative">
                <div className="relative z-10 mb-1 flex items-center gap-3 bg-background">
                  <span className="mini-icon">
                    <Code2 className="size-4" />
                  </span>
                  <h4 className="font-semibold">{exp.role[locale]}</h4>
                </div>

                <div className="flex flex-wrap items-center gap-2 pl-9 text-sm text-muted-foreground">
                  {exp.employmentType ? (
                    <>
                      <span>{exp.employmentType[locale]}</span>
                      <span className="text-brand">/</span>
                    </>
                  ) : null}
                  <span className="font-mono text-xs">{exp.period[locale]}</span>
                </div>

                <div className="mt-4 pl-9 font-mono text-sm leading-6">
                  <ul className="space-y-1">
                    {exp.bullets[locale].map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-3 size-1 shrink-0 rotate-45 bg-brand/70" />
                        <span>
                          <RichText text={bullet} strongClassName="font-semibold" />
                        </span>
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
          </Reveal>
        ))}

        <article className="relative pt-5">
          <span
            aria-hidden="true"
            className="absolute -left-7 top-[1.9rem] z-10 size-[11px] rotate-45 border-2 border-bronze bg-background"
          />
          <div className="flex items-center gap-3">
            <h3 className="font-display text-2xl leading-snug font-medium">{t.experience.education}</h3>
          </div>

          <div className="mt-5 flex items-start gap-3">
            <span className="mini-icon">
              <GraduationCap className="size-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src={education.logo}
                  alt={education.school[locale]}
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                />
                <p className="font-medium">{education.school[locale]}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {education.degree[locale]} / {education.period} / {education.details}
              </p>
            </div>
          </div>
        </article>
        </ScrollLine>
      </div>
    </section>
  );
}
