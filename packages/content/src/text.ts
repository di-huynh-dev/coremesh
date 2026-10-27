// Client-safe text helpers (no filesystem access): usable from client components.
import type { BlogLocale } from "./types.js";

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
