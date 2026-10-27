import type { ReactNode } from "react";

type SectionHeadingProps = {
  index: string;
  title: string;
  /** The same title in the other language; shown in the eyebrow and on hover. */
  alt: string;
  action?: ReactNode;
};

/** Title swaps to its name in the other language on hover/focus (stacked in one grid cell). */
export function SectionHeading({
  index,
  title,
  alt,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="text-brand">{index}</span>
          <span className="h-px w-6 bg-brand/60" />
          <span>{alt}</span>
        </p>
        <h2
          tabIndex={0}
          className="group font-display mt-2 grid cursor-default overflow-hidden text-4xl leading-[1.1] font-medium outline-none sm:text-5xl"
        >
          <span className="col-start-1 row-start-1 transition-all duration-500 ease-out group-hover:-translate-y-full group-hover:opacity-0 group-focus-visible:-translate-y-full group-focus-visible:opacity-0">
            {title}
            <span className="text-brand">.</span>
          </span>
          <span
            aria-hidden="true"
            className="col-start-1 row-start-1 translate-y-full italic opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          >
            <span className="text-brand-gradient pr-1">{alt}</span>
            <span className="text-brand">.</span>
          </span>
        </h2>
      </div>
      {action}
    </div>
  );
}
