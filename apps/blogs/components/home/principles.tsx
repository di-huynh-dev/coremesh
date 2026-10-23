import { useTranslations } from "next-intl";

const ITEMS = [1, 2, 3, 4, 5, 6] as const;

export function Principles() {
  const t = useTranslations("thinking");

  return (
    <section aria-labelledby="principles-title" className="wrap pt-20 md:pt-28">
      <div
        className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end"
        data-fx-head="section"
      >
        <div>
          <h2
            id="principles-title"
            data-fx="line"
            className="max-w-2xl text-[1.75rem] leading-tight font-bold tracking-[-0.03em] text-ink md:text-[2.4rem]"
          >
            {t("title")}
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-soft" data-fx="item">
            {t("subtitle")}
          </p>
        </div>
        <p
          className="border-l-2 border-cobalt pl-4 text-sm leading-6 text-soft"
          data-fx="item"
        >
          {t("footerText")}
        </p>
      </div>

      <ol
        data-method
        data-fx-skip
        className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
      >
        {ITEMS.map((n, index) => (
          <li
            key={n}
            className="step flex flex-col"
            style={{ "--s": index } as React.CSSProperties}
          >
            <div className="step-node flex items-center" aria-hidden>
              <i className="size-2.5 bg-cobalt" />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="font-mono text-sm font-medium text-cobalt">
                {String(n).padStart(2, "0")}
              </span>
              <span className="font-mono text-[0.68rem] tracking-wider text-faint uppercase">
                {t(`item${n}Tag`)}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-ink">
              {t(`item${n}Title`)}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-7 text-soft">
              {t(`item${n}Desc`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
