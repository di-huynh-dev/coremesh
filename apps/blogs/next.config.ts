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
