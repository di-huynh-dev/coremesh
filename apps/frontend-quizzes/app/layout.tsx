import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteUrl } from "@/utils/seo";
import { GoogleAnalytics } from "@next/third-parties/google";
import MicrosoftClarity from "@/components/MicrosoftClarity";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manRope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FrontendPrep | Crack Frontend Interviews",
    template: "%s | FrontendPrep",
  },
  description:
    "Master React, JavaScript, CSS, Next.js and frontend system design interview questions with practical explanations.",
  keywords: [
    "Frontend",
    "Interview",
    "JavaScript",
    "React",
    "Next.js",
    "System Design",
    "HTML",
    "CSS",
    "Software Engineer",
  ],
  authors: [{ name: "FrontendPrep" }],
  creator: "FrontendPrep",
  publisher: "FrontendPrep",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FrontendPrep | Crack Frontend Interviews",
    description:
      "Master React, JavaScript, CSS, Next.js and frontend system design interview questions with practical explanations.",
    url: siteUrl,
    siteName: "FrontendPrep",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FrontendPrep | Crack Frontend Interviews",
    description:
      "Master React, JavaScript, CSS, Next.js and frontend system design interview questions with practical explanations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${manRope.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const theme = savedTheme || 'dark';
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {
                  // Fallback to dark if any error (e.g. cookies/localstorage disabled)
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      <MicrosoftClarity />
    </html>
  );
}
