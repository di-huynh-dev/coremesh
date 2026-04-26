import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Steven Huynh — Software Engineer",
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
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
