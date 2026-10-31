import { BLOG_TOPICS } from "@/lib/content/types";
import { topicStyles } from "@/lib/topic-style";
import { cn } from "@/lib/utils";
import { Github, Linkedin, Rss } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const socialLinks = [
  { href: "https://github.com/di-huynh-dev", label: "GitHub", icon: Github },
  { href: "https://www.linkedin.com/feed/", label: "LinkedIn", icon: Linkedin },
  { href: "https://www.tiktok.com/@dicodeweb", label: "TikTok", icon: null },
];

export function Footer() {
  const locale = useLocale();
  const t = useTranslations("footer");
  const tNav = useTranslations("navigation");
  const tTopics = useTranslations("topics");
  const rssHref = `/${locale}/rss.xml`;

  return (
    <footer className="on-dark mt-24 bg-night text-white">
      <div className="wrap">
        <section
          aria-labelledby="follow-title"
          className="flex flex-col gap-6 border-b border-white/10 py-12 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2
              id="follow-title"
              className="text-2xl font-semibold tracking-[-0.02em]"
            >
              {t("followTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-white/60">{t("followBody")}</p>
          </div>
          <a href={rssHref} className="btn btn-primary self-start md:self-auto">
            <Rss className="size-4" />
            RSS
          </a>
        </section>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href={`/${locale}`} className="text-xl font-bold">
              DiCodeWeb
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">
              {t("description")}
            </p>
          </div>

          <div>
            <h2 className="eyebrow">{t("topics")}</h2>
            <ul className="mt-4 space-y-2.5">
              {BLOG_TOPICS.map((topic) => (
                <li key={topic}>
                  <Link
                    href={`/${locale}/blog?topic=${topic}`}
                    className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <span className={cn("topic-dot", topicStyles[topic].dot)} />
                    {tTopics(`${topic}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow">{t("explore")}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>
                <Link href={`/${locale}/blog`} className="hover:text-white">
                  {t("allArticles")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/roadmap`} className="hover:text-white">
                  {tNav("roleMaps")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/guides`} className="hover:text-white">
                  {tNav("guides")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools`} className="hover:text-white">
                  {tNav("tools")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#topics`} className="hover:text-white">
                  {tNav("topics")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tags`} className="hover:text-white">
                  {tNav("tags")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#about`} className="hover:text-white">
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <a href={rssHref} className="hover:text-white">
                  RSS
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="eyebrow">{t("connect")}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {t("rights")}
          </span>
          <span className="italic">{t("italicText")}</span>
        </div>
      </div>
    </footer>
  );
}
