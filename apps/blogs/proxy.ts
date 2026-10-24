import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "vi"],
  defaultLocale: "vi",
  localePrefix: "always",
  // Vietnamese first: don't redirect by the browser's Accept-Language.
  // A locale picked with the language switcher is still remembered via cookie.
  localeDetection: false,
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
