import { withContentCollections } from '@content-collections/next';
import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(configDir, "..", ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.hailuoai.video',
        pathname: '/**',
      },
    ],
  },
};

export default withContentCollections(nextConfig);
