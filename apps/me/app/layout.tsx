import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { profile, SITE_URL, socials } from "@/lib/data/profile";
import { siteTitle } from "@/lib/metadata";
import { Providers } from "./providers";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
});

const displaySerif = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  variable: "--font-display-serif",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

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
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${displaySerif.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
