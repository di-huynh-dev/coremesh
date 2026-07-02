import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type { ClassValue };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function withProtocol(url: string, protocol = "https://") {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${protocol}${url}`;
}

export function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function getSiteUrl({
  primary,
  fallback,
}: {
  primary?: string | null | undefined;
  fallback: string;
}) {
  return stripTrailingSlash(withProtocol(primary || fallback));
}
