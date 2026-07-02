import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Logo from "./Logo";

interface FooterLink {
  href: string;
  label: string;
  isExternal?: boolean;
}

const topicsLinks: FooterLink[] = [
  { href: "/questions/react", label: "React" },
  { href: "/questions/javascript", label: "JavaScript" },
  { href: "/questions/css", label: "CSS & Layouts" },
  { href: "/questions/dsa", label: "Data Structures" },
  { href: "/questions/system-design", label: "System Design" },
];

const guidesLinks: FooterLink[] = [
  {
    href: "/guides/react/react-19-server-components",
    label: "React 19 Server Components",
  },
  { href: "/guides/javascript/js-event-loop", label: "JavaScript Event Loop" },
];

const infoLinks: FooterLink[] = [
  { href: "/about", label: "About Us" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-card-border/60 bg-background/50 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column (spans 2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-text-muted leading-relaxed font-normal max-w-sm">
              Accelerate your frontend engineering career with deep-dive
              technical knowledge, practical interview challenge blueprints, and
              structured learning tracks.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://github.com/judis07"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-card-border bg-card-bg/40 text-text-muted hover:border-neutral-500/80 hover:bg-neutral-800/10 hover:text-foreground hover:scale-105 transition-all duration-200"
                aria-label="GitHub"
              >
                <FaGithub className="w-4 h-4" />
              </a>
              {/* <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-card-border bg-card-bg/40 text-text-muted hover:border-sky-400/80 hover:bg-sky-400/5 hover:text-sky-400 hover:scale-105 transition-all duration-200"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a> */}
              <a
                href="https://www.linkedin.com/in/arvind-m-ab2a71148/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-card-border bg-card-bg/40 text-text-muted hover:border-blue-600/80 hover:bg-blue-600/5 hover:text-blue-500 hover:scale-105 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Topics Column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Topics
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {topicsLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides Column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Few Guides
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {guidesLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-foreground transition-colors line-clamp-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/guides"
                  className="text-foreground/90 font-medium hover:text-foreground transition-colors flex items-center gap-1 mt-1 group"
                >
                  <span>View All Guides</span>
                  <span className="transform group-hover:translate-x-0.5 transition-transform duration-200">
                    →
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Useful Info Column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Useful Info
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  {link.isExternal ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-text-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-card-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-center sm:text-left">
            <span>&copy; {currentYear} FrontendPrep. All rights reserved.</span>
            <span className="px-2 text-sm hidden md:block">|</span>
            <span>
              Made by{" "}
              <a
                href="https://www.linkedin.com/in/arvind-m-ab2a71148/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground/80 hover:text-sky-500 transition-colors duration-200 underline decoration-card-border/50 hover:decoration-sky-500/50 underline-offset-2"
              >
                Arvind M
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
