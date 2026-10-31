import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const withNextIntl = createNextIntlPlugin();
const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  // Guides are read from disk at request time; ship the markdown with the server build.
  // Content is read from disk at request time (ISR home page, RSS, fallback renders):
  // ship it with every server function under /[locale]. assets/og holds the social-card fonts.
  outputFileTracingIncludes: {
    "/[locale]": ["./content/**/*", "./assets/og/**/*"],
    "/[locale]/**": ["./content/**/*", "./assets/og/**/*"],
  },
  async redirects() {
    return [
      { source: "/:locale(vi|en)/roadmap/react", destination: "/:locale/roadmap/frontend", permanent: true },
      { source: "/:locale(vi|en)/roadmap/nestjs", destination: "/:locale/roadmap/backend", permanent: true },
      { source: "/:locale(vi|en)/role-map/:path*", destination: "/:locale/roadmap/:path*", permanent: true },
      // Posts merged into longer editions
      {
        source: "/:locale(vi|en)/blog/micro-frontends-tradeoffs",
        destination: "/:locale/blog/micro-frontends-module-federation",
        permanent: true,
      },
      {
        source: "/:locale(vi|en)/blog/frontend-observability-with-opentelemetry",
        destination: "/:locale/blog/frontend-observability-rum",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: path.join(configDir, "..", ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.licdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.hailuoai.video",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
