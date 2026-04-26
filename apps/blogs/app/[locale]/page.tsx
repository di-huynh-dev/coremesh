"use client";

import { Footer } from "@/components/layout/footer";
import { BoilerplateHero } from "@/components/sections/boilerplate-hero";
import { CTASection } from "@/components/sections/cta-section";
import { ThinkingSection } from "@/components/sections/why-this-stack";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import dynamic from "next/dynamic";

const Navbar = dynamic(
  () =>
    import("@/components/layout/navbar").then((mod) => ({
      default: mod.Navbar,
    })),
  {
    ssr: false,
  },
);

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <BoilerplateHero />
      <ThinkingSection />
      <CTASection />
      <Footer />
      <ScrollToTop />
    </main>
  );
}
