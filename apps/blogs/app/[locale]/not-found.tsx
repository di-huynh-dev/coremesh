import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();

  return (
    <section className="wrap flex flex-col items-start py-24 md:py-32">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-[-0.035em] text-ink md:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-lg text-lg text-soft">{t("body")}</p>
      <Link href={`/${locale}/blog`} className="btn btn-primary mt-8">
        {t("cta")} <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
