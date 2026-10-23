import Link from "next/link";

export function SectionHeading({
  id,
  title,
  subtitle,
  action,
}: {
  id: string;
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div
      className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      data-fx-head="section"
    >
      <div>
        <h2
          id={id}
          data-fx="line"
          className="text-[1.75rem] font-bold tracking-[-0.03em] text-ink md:text-[2rem]"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 text-soft" data-fx="item">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link href={action.href} className="arrow-link shrink-0" data-fx="item">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
