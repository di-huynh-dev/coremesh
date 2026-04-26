import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiCodeWeb | Engineering Notes & Systems Thinking",
  description:
    "A personal blog about frontend engineering, system design, and developer growth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
