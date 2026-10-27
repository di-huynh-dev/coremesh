import { Reveal } from "@/components/ui/reveal";
import { RichText } from "@/components/ui/rich-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { highlights, profile } from "@/lib/data/profile";
import { dictionaries } from "@/lib/dictionary";
import { getContributions } from "@/lib/github";
import type { Locale } from "@/lib/i18n";
import { GithubCalendarSection } from "./github-calendar-section";

export async function AboutSection({ locale }: { locale: Locale }) {
  const contributions = await getContributions();
  const heading = dictionaries[locale].headings.summary;

  return (
    <>
      <section
        id="about"
        className="profile-rail rail-box screen-line-after scroll-mt-16 px-4 py-8"
      >
        <SectionHeading index="01" title={heading.title} alt={heading.alt} />

        <Reveal>
          <div className="corner-ticks mt-6 grid grid-cols-2 border border-edge bg-card/60 sm:grid-cols-4">
            {highlights.map((item, index) => (
              <div
                key={item.value}
                className={`px-4 py-4 ${index % 2 === 1 ? "border-l border-edge" : ""} ${
                  index > 0 ? "sm:border-l sm:border-edge" : ""
                } ${index > 1 ? "max-sm:border-t max-sm:border-edge" : ""}`}
              >
                <p className="font-display text-3xl leading-none font-medium text-brand sm:text-4xl">
                  {item.value}
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {item.label[locale]}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="pt-6 font-mono text-sm leading-7 text-foreground">
            <p>
              <RichText
                text={profile.summary[locale]}
                strongClassName="summary-highlight px-0.5"
              />
            </p>
          </div>
        </Reveal>
      </section>

      <GithubCalendarSection data={contributions} />
    </>
  );
}
