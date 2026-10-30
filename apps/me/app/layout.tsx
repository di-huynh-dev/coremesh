import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource-variable/playfair-display/wght.css";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "./globals.css";
import { profile, SITE_URL, socials } from "@/lib/data/profile";
import { siteTitle } from "@/lib/metadata";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: siteTitle,
  description: profile.description.en,
  applicationName: `${profile.englishName} | ${profile.title}`,
  keywords: [
    profile.englishName,
    profile.name,
    profile.title,
    "Frontend Developer",
    "React",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: profile.name, url: socials.github.href }],
  creator: profile.name,
  openGraph: {
    title: siteTitle,
    description: profile.description.en,
    type: "website",
    siteName: profile.name,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: profile.description.en,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased font-sans"
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
