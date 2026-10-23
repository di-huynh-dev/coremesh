import { SourceNote } from "@/components/guides/source-note";
import { MotionController } from "@/components/motion/motion-controller";
import { ToolCard } from "@/components/tools/tool-card";
import { TOOL_EXPLAINERS } from "@/components/tools/registry";
import { TOOL_ICON_COMPONENTS } from "@/components/tools/tool-icons";
import { ToolLoader } from "@/components/tools/tool-loader";
import { isBlogLocale } from "@/lib/content/text";
import { TOOLS, getTool } from "@/lib/content/tools";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ToolPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Not found" };
  const copy = tool.copy[isBlogLocale(locale) ? locale : "en"];
  return { title: copy.title, description: copy.description, keywords: tool.keywords };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = isBlogLocale(rawLocale) ? rawLocale : "en";
  const tool = getTool(slug);
  const Explainer = tool ? TOOL_EXPLAINERS[tool.slug] : undefined;
  if (!tool || !Explainer) notFound();

  const t = await getTranslations({ locale, namespace: "tools" });
  const tPost = await getTranslations({ locale, namespace: "post" });
  const copy = tool.copy[locale];
  const Icon = TOOL_ICON_COMPONENTS[tool.icon];
  const others = TOOLS.filter((item) => item.slug !== tool.slug)
    .sort((a, b) => Number(b.category === tool.category) - Number(a.category === tool.category))
    .slice(0, 3);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="wrap pt-10 md:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="mb-10" data-fx-head="page">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-faint" data-fx="item">
          <Link href={`/${locale}`} className="hover:text-ink">
            {tPost("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/tools`} className="hover:text-ink">
            {t("breadcrumb")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-soft">{copy.shortTitle}</span>
        </nav>
        <div className="mt-6 flex items-start gap-4">
          <span
            className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-cobalt-soft text-cobalt sm:flex"
            data-fx="fade"
          >
            <Icon aria-hidden strokeWidth={1.6} className="size-7" />
          </span>
          <div>
            <h1 data-fx="line" className="text-[2rem] leading-tight font-bold tracking-[-0.035em] text-ink md:text-[2.6rem]">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-2xl text-lg leading-8 text-soft" data-fx="item">
              {copy.tagline}
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-topic-performance" data-fx="item">
              <ShieldCheck aria-hidden className="size-4" />
              {t("browserOnly")}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl">
        <ToolLoader slug={tool.slug} />
      </div>

      <section aria-labelledby="how-title" className="mt-16 max-w-4xl border-t border-line pt-10">
        <h2 id="how-title" className="eyebrow mb-6">
          {t("howItWorks")}
        </h2>
        <div lang="en" className="[&_code]:rounded [&_code]:bg-paper [&_code]:px-1 [&_h3]:text-ink [&_h4]:text-ink">
          <Explainer />
        </div>
      </section>

      <section aria-labelledby="faq-title" className="mt-14 max-w-4xl">
        <h2 id="faq-title" className="text-2xl font-bold tracking-[-0.03em] text-ink">
          {t("faq")}
        </h2>
        <div lang="en" className="mt-5 divide-y divide-line border-y border-line">
          {tool.faqs.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span aria-hidden className="font-mono text-faint transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-3xl leading-7 text-soft">{faq.answer}</p>
            </details>
          ))}
        </div>
        <SourceNote
          namespace="tools"
          originalUrl={`https://devops-daily.com/tools/${tool.slug}`}
          className="mt-6"
        />
      </section>

      <section aria-labelledby="other-tools" className="mt-16">
        <h2 id="other-tools" className="text-2xl font-bold tracking-[-0.03em] text-ink">
          {t("others")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((item) => (
            <ToolCard key={item.slug} tool={item} locale={locale} />
          ))}
        </div>
      </section>

      <MotionController />
    </div>
  );
}
