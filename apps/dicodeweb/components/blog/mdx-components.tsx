import Link from 'next/link';
import type { ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import { AlertCircle, CheckCircle2, Lightbulb, TriangleAlert } from 'lucide-react';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: 'note' | 'tip' | 'warning' | 'success';
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    note: {
      icon: Lightbulb,
      shell:
        'border-[color:color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color:color-mix(in_srgb,var(--accent)_10%,white)] text-foreground dark:bg-[color:color-mix(in_srgb,var(--accent)_16%,transparent)]',
      iconWrap: 'bg-accent/14 text-accent',
      title: 'text-[#071B3A] dark:text-[#D7E2FF]',
    },
    tip: {
      icon: CheckCircle2,
      shell:
        'border-[color:rgba(139,214,63,0.38)] bg-[rgba(139,214,63,0.12)] text-foreground dark:bg-[rgba(139,214,63,0.1)]',
      iconWrap: 'bg-[#8BD63F]/18 text-[#3E6E0C] dark:text-[#AAF85D]',
      title: 'text-[#21440A] dark:text-[#D9FFB2]',
    },
    warning: {
      icon: TriangleAlert,
      shell:
        'border-[color:rgba(245,158,11,0.34)] bg-[rgba(245,158,11,0.12)] text-foreground dark:bg-[rgba(245,158,11,0.08)]',
      iconWrap: 'bg-[rgba(245,158,11,0.18)] text-[rgb(180,83,9)] dark:text-[rgb(253,224,71)]',
      title: 'text-[rgb(146,64,14)] dark:text-[rgb(254,240,138)]',
    },
    success: {
      icon: CheckCircle2,
      shell:
        'border-[color:rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.1)] text-foreground dark:bg-[rgba(34,197,94,0.08)]',
      iconWrap: 'bg-[rgba(34,197,94,0.16)] text-[rgb(21,128,61)] dark:text-[rgb(134,239,172)]',
      title: 'text-[rgb(21,128,61)] dark:text-[rgb(187,247,208)]',
    },
  } as const;

  const selected = styles[type];
  const Icon = selected.icon;

  return (
    <div className={cx('my-8 rounded-[1.5rem] border p-5 shadow-[0_10px_30px_rgba(7,27,58,0.06)]', selected.shell)}>
      <div className="flex items-start gap-4">
        <div className={cx('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', selected.iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          {title ? (
            <p className={cx('mb-2 text-sm font-semibold tracking-[0.14em] uppercase', selected.title)}>
              {title}
            </p>
          ) : null}
          <div className="[&>*:last-child]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return <div className="my-10 space-y-4">{children}</div>;
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="paper-card rounded-[1.75rem] p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#071B3A] text-sm font-semibold text-[#F5F0EA]">
          {number}
        </div>
        <div className="min-w-0">
          <h3 className="mb-2 text-lg font-semibold text-[#071B3A] dark:text-[#D7E2FF]">{title}</h3>
          <div className="[&>*:last-child]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Compare({
  leftTitle,
  rightTitle,
  left,
  right,
}: {
  leftTitle: string;
  rightTitle: string;
  left: string[];
  right: string[];
}) {
  return (
    <div className="my-10 grid gap-4 md:grid-cols-2">
      <div className="paper-card rounded-[1.75rem] p-5 md:p-6">
        <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {leftTitle}
        </p>
        <ul className="space-y-3">
          {left.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-7 text-foreground/85">
              <AlertCircle className="mt-1 h-4 w-4 shrink-0 text-[#071B3A] dark:text-[#D7E2FF]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="paper-card rounded-[1.75rem] border-[color:rgba(139,214,63,0.45)] bg-[rgba(139,214,63,0.1)] p-5 md:p-6 dark:bg-[rgba(139,214,63,0.08)]">
        <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-[#3E6E0C] uppercase dark:text-[#D9FFB2]">
          {rightTitle}
        </p>
        <ul className="space-y-3">
          {right.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-7 text-foreground/85">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#5C990E] dark:text-[#AAF85D]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetricCards({
  items,
}: {
  items: Array<{ label: string; value: string; detail: string }>;
}) {
  return (
    <div className="my-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="paper-card rounded-[1.5rem] p-5">
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {item.label}
          </p>
          <p className="mb-2 text-3xl font-semibold tracking-[-0.04em] text-[#071B3A] dark:text-[#D7E2FF]">
            {item.value}
          </p>
          <p className="text-sm leading-7 text-muted-foreground">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

export const blogMdxComponents: MDXComponents = {
  a: ({ href, children, ...props }) => {
    if (typeof href === 'string' && href.startsWith('/')) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
  blockquote: ({ children, ...props }) => <blockquote {...props}>{children}</blockquote>,
  // Use div instead of p to avoid invalid nesting when MDX wraps block-level
  // custom components (Callout, Steps, etc.) inside a paragraph element.
  p: ({ children, ...props }) => (
    <div className="mb-4 md:mb-6 leading-relaxed md:leading-[1.8] text-sm md:text-base text-foreground" {...(props as React.HTMLAttributes<HTMLDivElement>)}>
      {children}
    </div>
  ),
  Callout,
  Steps,
  Step,
  Compare,
  MetricCards,
};
