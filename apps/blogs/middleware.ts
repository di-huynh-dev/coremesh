import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  // A list of all locales that are supported
  locales: ["en", "vi"],

  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: "en",

  // The locale prefix path strategy
  localePrefix: "always",
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - _vercel (Vercel deployment files)
    // - all files containing a dot (e.g. favicon.ico, images, svg, robots.txt, etc.)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
