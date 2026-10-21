import { CopyButton } from "@/components/ui/copy-button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ArrowUpRight, Github, Linkedin, Mail, MapPin } from "lucide-react";

const EMAIL = "dihuynhdev.contact@gmail.com";

const contactMethods = [
  {
    label: "LinkedIn",
    value: "huynhtiendi",
    href: "https://www.linkedin.com/in/huynhtiendi/",
    Icon: Linkedin,
  },
  {
    label: "GitHub",
    value: "di-huynh-dev",
    href: "https://github.com/di-huynh-dev",
    Icon: Github,
  },
];

export function ContactSection() {
  return (
    <section
      id="contact"
      className="profile-rail rail-box screen-line-after scroll-mt-16 px-4 py-8"
    >
      <SectionHeading index="05" title="Contact" vi="Liên hệ" />

      <Reveal>
        <div className="corner-ticks mt-6 border border-edge bg-card/60 p-5 sm:p-8">
          <h3 className="font-display max-w-xl text-3xl leading-[1.15] font-medium sm:text-4xl">
            Let&apos;s build something{" "}
            <em className="text-brand-gradient pr-1">useful</em>.
          </h3>
          <p className="mt-3 max-w-xl font-mono text-sm leading-6 text-muted-foreground">
            I&apos;m open to frontend product work, thoughtful collaborations,
            and conversations about performance, UI systems, and modern web
            engineering.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${EMAIL}`}
              data-cursor="Say hello"
              className="group inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 font-mono text-sm text-background transition-transform duration-300 hover:-translate-y-0.5 hover:bg-brand"
            >
              <Mail className="size-4" />
              Say hello
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <CopyButton value={EMAIL} label="Copy email address" />
          </div>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            {EMAIL}
          </p>
        </div>
      </Reveal>

      <div className="mt-4 grid gap-0 border border-edge sm:grid-cols-[1.2fr_0.8fr]">
        <div className="divide-y divide-edge">
          {contactMethods.map((item) => {
            const Icon = item.Icon;
            return (
              <a
                key={item.label}
                href={item.href}
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
              </a>
            );
          })}
        </div>

        <div className="space-y-3 border-t border-edge px-4 py-4 font-mono text-sm leading-6 text-muted-foreground sm:border-t-0 sm:border-l">
          <div className="flex items-center gap-3">
            <span className="mini-icon">
              <MapPin className="size-4" />
            </span>
            <span>Based in Ho Chi Minh City, Viet Nam</span>
          </div>
          <p>
            Best fit: product-minded frontend roles, collaborative teams, and
            systems where craft and clarity matter.
          </p>
        </div>
      </div>
    </section>
  );
}
