import { getSiteUrl as resolveSiteUrl } from "@repo/utils";

export function getSiteUrl(): string {
  return resolveSiteUrl({
    primary:
      process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL,
    fallback: "frontendprep.vercel.app",
  });
}
