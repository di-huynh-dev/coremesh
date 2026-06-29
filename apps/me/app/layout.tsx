import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Steven Huynh | Software Engineer",
  description:
    "Love to work and build anything with Js <3. Software Engineer at Estuary Solutions. Based in Ho Chi Minh, Viet Nam.",
  keywords: [
    "Steven Huynh",
    "Software Engineer",
    "JavaScript",
    "TypeScript",
    "Next.js",
    "React",
    "Full Stack",
  ],
  authors: [{ name: "Steven Huynh", url: "https://github.com/di-huynh-dev" }],
  icons: {
    icon: "/round-avatar.svg",
    apple: "/round-avatar.svg",
  },
  openGraph: {
    title: "Steven Huynh — Software Engineer",
    description:
      "Love to work and build anything with Js <3. Software Engineer at Estuary Solutions.",
    type: "website",
    url: "https://me.nextdi.io.vn",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steven Huynh — Software Engineer",
    description: "Love to work and build anything with Js <3.",
    creator: "@di-huynh-dev",
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
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
