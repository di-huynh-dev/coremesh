import { Footer } from "@/components/layout/footer";
import { SITE_URL } from "@/lib/data/profile";
import { dictionaries } from "@/lib/dictionary";
import { homePath, htmlLang, type Locale } from "@/lib/i18n";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

type Commit = { hash: string; date: string; subject: string };

/** Versions straight from package.json, so the page never drifts from the real stack. */
function readVersions() {
  try {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    return (name: string) => all[name]?.replace(/^[\^~]/, "") ?? "";
  } catch {
    return () => "";
  }
}

/** Recent commits touching this app, read at build time. Empty when git history is unavailable. */
function readChangelog(limit = 12): Commit[] {
  try {
    const out = execSync(`git log -n ${limit} --date=short --format=%h%x09%ad%x09%s -- .`, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash = "", date = "", subject = ""] = line.split("\t");
        return { hash, date, subject };
      });
  } catch {
    return [];
  }
}

export function ColophonPage({ locale }: { locale: Locale }) {
  const t = dictionaries[locale].colophon;
  const version = readVersions();
  const commits = readChangelog();
  const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(SITE_URL)}`;

  const stack = [
    { name: "Next.js", detail: `${version("next")} · App Router, Turbopack` },
    { name: "React", detail: version("react") },
    { name: "TypeScript", detail: version("typescript") },
    { name: "Tailwind CSS", detail: version("tailwindcss") },
    { name: "Framer Motion", detail: version("framer-motion") },
    { name: "Three.js / React Three Fiber", detail: `${version("three")} / ${version("@react-three/fiber")}` },
    { name: "Bun + Turborepo", detail: t.monorepo },
    { name: "Vercel", detail: t.hosting },
  ];

  return (
    <main lang={htmlLang[locale]} className="min-h-screen bg-background px-2 pt-6 text-foreground">
      <div className="profile-rail rail-box screen-line-after px-4 py-4">
        <Link
          href={homePath(locale)}
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          {t.back}
        </Link>
      </div>

      <article className="profile-rail rail-box screen-line-after px-4 py-10 font-mono text-sm leading-7">
        <p className="text-[11px] uppercase tracking-[0.22em] text-brand">Colophon</p>
        <h1 className="font-display mt-2 text-4xl leading-tight font-medium sm:text-5xl">
          {t.title}
          <span className="text-brand">.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t.intro}</p>

        <h2 className="font-display mt-10 text-2xl font-medium">{t.stackTitle}</h2>
        <dl className="mt-3 divide-y divide-edge border-y border-edge">
          {stack.map((item) => (
            <div key={item.name} className="flex flex-wrap justify-between gap-x-4 py-2">
              <dt>{item.name}</dt>
              <dd className="text-muted-foreground">{item.detail}</dd>
            </div>
          ))}
        </dl>

        <h2 className="font-display mt-10 text-2xl font-medium">{t.principlesTitle}</h2>
        <ul className="mt-3 space-y-2">
          {t.principles.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-3 size-1 shrink-0 rotate-45 bg-brand/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <a
          href={pageSpeedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-foreground underline decoration-brand/60 underline-offset-4 hover:text-brand"
        >
          {t.measure}
          <ArrowUpRight className="size-4" />
        </a>

        <h2 className="font-display mt-10 text-2xl font-medium">{t.creditsTitle}</h2>
        <ul className="mt-3 space-y-2">
          {t.credits.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-3 size-1 shrink-0 rotate-45 bg-brand/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {commits.length > 0 ? (
          <>
            <h2 className="font-display mt-10 text-2xl font-medium">{t.changelogTitle}</h2>
            <ol className="mt-3 divide-y divide-edge border-y border-edge">
              {commits.map((commit) => (
                <li key={commit.hash} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2 max-sm:grid-cols-1 max-sm:gap-0">
                  <span className="text-muted-foreground">{commit.date}</span>
                  <span>{commit.subject}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </article>

      <Footer locale={locale} />
    </main>
  );
}
