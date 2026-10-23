import { ClsCalculator } from "@/components/blog/mdx/cls-calculator";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";

// Components available inside content/posts/**/*.mdx. Styling lives in .article-body (globals.css).

function Lead({ children }: { children: ReactNode }) {
  return <p className="lead">{children}</p>;
}

function Callout({ children }: { children: ReactNode }) {
  return <div className="callout">{children}</div>;
}

function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure>
      {/* Plain img: post figures are local SVG diagrams with intrinsic sizing. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
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
