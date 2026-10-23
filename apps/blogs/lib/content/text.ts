// Client-safe text helpers (no filesystem access): usable from client components.
import type { BlogHeading, BlogLocale } from "./types";

export function isBlogLocale(value: string): value is BlogLocale {
  return value === "en" || value === "vi";
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Hands out unique heading ids within one document ("setup", "setup-2", ...). */
export function createHeadingIds() {
  const used = new Set<string>();
  return (text: string) => {
    const base = slugify(text) || "section";
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    return id;
  };
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function stripTags(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => HTML_ENTITIES[m]!)
    .replace(/\s+/g, " ")
    .trim();
}

/** Gives every h2/h3 in rendered HTML a stable id and returns the outline for the TOC. */
export function withHeadingIds(html: string) {
  const headings: BlogHeading[] = [];
  const nextId = createHeadingIds();

  const contentHtml = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g,
    (_match, level: string, attrs: string, inner: string) => {
      const text = stripTags(inner);
      const id = attrs.match(/\sid="([^"]+)"/)?.[1] ?? nextId(text);
      headings.push({ id, text, level: Number(level) as 2 | 3 });
      const nextAttrs = attrs.includes(' id="') ? attrs : `${attrs} id="${id}"`;
      return `<h${level}${nextAttrs}>${inner}</h${level}>`;
    },
  );

  return { contentHtml, headings };
}

export function formatPostDate(
  date: string,
  locale: string,
  style: "short" | "long" | "numeric" = "short",
) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  const options: Intl.DateTimeFormatOptions =
    style === "numeric"
      ? { day: "2-digit", month: "2-digit", year: "numeric" }
      : { day: "numeric", month: style, year: "numeric" };

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    ...options,
    timeZone: "UTC",
  }).format(parsed);
}

/** Accent-insensitive lowercase, so "ghi chep" matches "Ghi chép". */
export function normalizeSearch(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

/** Every whitespace-separated term of `query` must appear somewhere in `fields`. */
export function matchesTerms(fields: string[], query: string) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalizeSearch(fields.join(" "));
  return terms.every((term) => haystack.includes(term));
}
