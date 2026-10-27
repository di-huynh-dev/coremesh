import { ContactForm } from "@/components/ui/contact-form";
import { CopyButton } from "@/components/ui/copy-button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { TimezoneOverlap } from "@/components/ui/timezone-overlap";
import { TrackedLink } from "@/components/ui/tracked-link";
import { profile, socials } from "@/lib/data/profile";
import { mentoringUrl } from "@/lib/data/teaching";
import { dictionaries } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { ArrowUpRight, Github, Linkedin, Mail, MapPin } from "lucide-react";

const EMAIL = profile.email;

const contactMethods = [
  {
    label: "LinkedIn",
    value: socials.linkedin.handle,
    href: socials.linkedin.href,
    Icon: Linkedin,
  },
  {
    label: "GitHub",
    value: socials.github.handle,
    href: socials.github.href,
    Icon: Github,
  },
];

export function ContactSection({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];

  return (
    <section
      id="contact"
      className="profile-rail rail-box screen-line-after scroll-mt-16 px-4 py-8"
    >
      <SectionHeading index="06" title={t.headings.contact.title} alt={t.headings.contact.alt} />

      <Reveal>
        <div className="corner-ticks mt-6 border border-edge bg-card/60 p-5 sm:p-8">
          <h3 className="font-display max-w-xl text-3xl leading-[1.15] font-medium sm:text-4xl">
            {t.contact.titleBefore}{" "}
            <em className="text-brand-gradient pr-1">{t.contact.titleEmphasis}</em>
            {t.contact.titleAfter}
          </h3>
          <p className="mt-3 max-w-xl font-mono text-sm leading-6 text-muted-foreground">
            {t.contact.body}
          </p>

          <div className="mt-6">
            <ContactForm />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-edge pt-4 font-mono text-xs text-muted-foreground">
            <span>{t.contact.preferEmail}</span>
            <TrackedLink
              href={`mailto:${EMAIL}`}
              event="contact_click"
              eventProps={{ method: "email" }}
              data-cursor={t.contact.sayHello}
              className="inline-flex items-center gap-1.5 text-foreground underline decoration-brand/60 underline-offset-4 hover:text-brand"
            >
              <Mail className="size-3.5" />
              {EMAIL}
            </TrackedLink>
            <CopyButton value={EMAIL} label={t.contact.copyEmail} />
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid gap-0 border border-edge sm:grid-cols-[1.2fr_0.8fr]">
        <div className="divide-y divide-edge">
          {contactMethods.map((item) => {
            const Icon = item.Icon;
            return (
              <TrackedLink
                key={item.label}
                href={item.href}
                event="contact_click"
                eventProps={{ method: item.label.toLowerCase() }}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-brand/[0.05]"
              >
                <span className="mini-icon">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="block font-medium">{item.value}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
              </TrackedLink>
            );
          })}
        </div>

        <div className="space-y-3 border-t border-edge px-4 py-4 font-mono text-sm leading-6 text-muted-foreground sm:border-t-0 sm:border-l">
          <div className="flex items-center gap-3">
            <span className="mini-icon">
              <MapPin className="size-4" />
            </span>
            <span>{t.contact.basedIn(profile.location[locale])}</span>
          </div>
          <TimezoneOverlap />
          {mentoringUrl ? (
            <div className="border-t border-edge pt-3">
              <p className="font-medium text-foreground">{t.contact.mentoring.title}</p>
              <p className="mt-1">{t.contact.mentoring.body}</p>
              <TrackedLink
                href={mentoringUrl}
                event="contact_click"
                eventProps={{ method: "mentoring" }}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-foreground underline decoration-brand/60 underline-offset-4 hover:text-brand"
              >
                {t.contact.mentoring.cta}
                <ArrowUpRight className="size-3.5" />
              </TrackedLink>
            </div>
          ) : null}
          <p>
            {t.contact.bestFit}
          </p>
        </div>
      </div>
    </section>
  );
}
