/**
 * Utility to get the dynamic base URL of the website.
 * Resolves to NEXT_PUBLIC_SITE_URL (custom domain), Vercel's automatically
 * injected NEXT_PUBLIC_VERCEL_URL (preview or custom environments), or a fallback.
 */
export function getSiteUrl(): string {
  let url = process.env.NEXT_PUBLIC_SITE_URL || 
            process.env.NEXT_PUBLIC_VERCEL_URL || 
            "frontendprep.vercel.app";

  // Ensure the URL starts with a protocol
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Remove any trailing slash
  return url.replace(/\/$/, "");
}
