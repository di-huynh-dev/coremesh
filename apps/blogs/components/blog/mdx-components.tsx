import { ClsCalculator } from "@/components/blog/mdx/cls-calculator";
import { Figure } from "@/components/blog/mdx/figure";
import { Info, Lightbulb, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

// Components available inside content/posts/**/*.mdx. Styling lives in .article-body (globals.css).

function Lead({ children }: { children: ReactNode }) {
  return <p className="lead">{children}</p>;
}

type CalloutType = "note" | "tip" | "warning" | "danger";

const CALLOUT_ICONS: Record<CalloutType, LucideIcon> = {
  note: Info,
  tip: Lightbulb,
  warning: TriangleAlert,
  danger: OctagonAlert,
};

/** `<Callout>` stays the plain cobalt box; `type` adds a tone, an icon and a title. */
function Callout({
  type,
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const t = useTranslations("callout");
  if (!type || !(type in CALLOUT_ICONS)) return <div className="callout">{children}</div>;
  const Icon = CALLOUT_ICONS[type];

  return (
    <div className="callout" data-type={type}>
      <p className="callout-title">
        <Icon aria-hidden className="size-4 shrink-0" />
        {title ?? t(type)}
      </p>
      {children}
    </div>
  );
}

function Checklist({ children }: { children: ReactNode }) {
  return <div className="checklist">{children}</div>;
}

export const mdxComponents: MDXComponents = {
  Lead,
  Callout,
  Figure,
  Checklist,
  ClsCalculator,
  a: ({ href = "", children, ...props }) =>
    /^https?:\/\//.test(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ) : (
      <a href={href} {...props}>
        {children}
      </a>
    ),
};
