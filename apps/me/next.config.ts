import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // The home pages are ISR and read the blog's posts from disk when they revalidate.
  outputFileTracingIncludes: {
    "/": ["../blogs/content/posts/**/*"],
    "/vi": ["../blogs/content/posts/**/*"],
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
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.estuarysolutions.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
