import { ExternalLink, Github, Linkedin, Mail, MapPin } from "lucide-react";

const contactMethods = [
  {
    label: "Email",
    value: "dihuynhdev.contact@gmail.com",
    href: "mailto:dihuynhdev.contact@gmail.com",
    Icon: Mail,
  },
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
      className="profile-rail rail-box screen-line-after px-4 py-8"
    >
      <div className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Contact
        </p>
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl font-semibold leading-9">
            Let&apos;s build something useful.
          </h2>
          <p className="font-mono text-sm leading-6 text-muted-foreground">
            I&apos;m open to frontend product work, thoughtful collaborations,
            and conversations about performance, UI systems, and modern web
            engineering.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-0 border-y border-edge sm:grid-cols-[1.2fr_0.8fr]">
        <div className="screen-line-after px-0 py-5 sm:pr-6">
          <div className="space-y-3">
            {contactMethods.map((item) => {
              const Icon = item.Icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    item.href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="group flex items-center gap-4 rounded-md px-1 py-2 transition-colors hover:bg-muted/30"
                >
                  <span className="mini-icon">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="block font-medium underline-offset-4 group-hover:underline">
                      {item.value}
                    </span>
                  </span>
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="px-0 py-5 sm:border-l sm:border-edge sm:pl-6">
          <div className="space-y-3 font-mono text-sm leading-6 text-muted-foreground">
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
      </div>
    </section>
  );
}
