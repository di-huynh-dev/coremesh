import React from "react";
import CategoryLayout from "@/components/layouts/CategoryLayout";
import { FiShield, FiLock, FiEye, FiMail } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | FrontendPrep",
  description:
    "Review how FrontendPrep protects and handles visitor information. Read details regarding dynamic content access, cookies, links, and contact parameters.",
  alternates: {
    canonical: "/privacy",
  },
};

const PrivacyPage = () => {
  const lastUpdated = "June 8, 2026";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Privacy Policy" },
  ];
  const backLink = {
    label: "Back to Home",
    href: "/",
  };

  return (
    <CategoryLayout breadcrumbs={breadcrumbs} backLink={backLink}>
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 relative">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-sky-500/5 dark:bg-sky-500/3 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Hero Title */}
        <div className="mb-12 pb-6 border-b border-card-border/60">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4 uppercase tracking-wide">
            <FiShield className="w-3.5 h-3.5" />
            <span>Compliance & Terms</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-brand">
            Privacy Policy
          </h1>
          <p className="mt-3 text-xs text-text-muted">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content body */}
        <div className="space-y-10 text-sm md:text-base text-text-muted leading-relaxed font-normal">
          {/* Section 1: Overview */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground font-brand flex items-center gap-2">
              <FiEye className="w-4 h-4 text-sky-400" />
              <span>1. Overview</span>
            </h2>
            <p>
              We built <strong>FrontendPrep</strong> as an open, client-side study resource. You don&apos;t need to create an account, log in, or pay anything to use the site. Because of this, you can browse all questions, solutions, and guides completely anonymously.
            </p>
          </section>

          {/* Section 2: Data Collection */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground font-brand flex items-center gap-2">
              <FiLock className="w-4 h-4 text-emerald-400" />
              <span>2. What We Collect</span>
            </h2>
            <p>
              We keep data collection to the absolute minimum required to run the site and find out how visitors use it:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-text-muted">
              <li>
                <strong className="text-foreground">Email Contact:</strong> If you use our contact page or email links to reach out, we only use your email address to reply to you. We won&apos;t add you to a mailing list or share your contact info.
              </li>
              <li>
                <strong className="text-foreground">Usage Analytics:</strong> We track basic anonymous metrics—like page views, filter clicks, search terms, and page load speeds—to understand which topics are most popular and improve our search filters.
              </li>
              <li>
                <strong className="text-foreground">Local Storage:</strong> We save small settings (like whether you prefer dark mode or your layout choices) directly in your browser&apos;s local storage so you don&apos;t have to re-select them on your next visit.
              </li>
            </ul>
          </section>

          {/* Section 3: Third-Party & External Integrations */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground font-brand flex items-center gap-2">
              <FiShield className="w-4 h-4 text-purple-400" />
              <span>3. External Services & Sharing</span>
            </h2>
            <p>
              Our guides and questions include social sharing buttons. If you choose to share a page on Twitter/X, LinkedIn, or Reddit, those platforms may set their own cookies and tracking parameters. We don&apos;t control these external services, so please check their respective privacy policies.
            </p>
          </section>

          {/* Section 4: Contact & LinkedIn Link */}
          <section className="mt-12 pt-8 border-t border-card-border/60">
            <div className="rounded-2xl border border-card-border bg-card-bg/40 backdrop-blur-md p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-md">
                <h3 className="text-base font-bold text-foreground font-brand flex items-center gap-2 mb-1.5">
                  <FiMail className="w-4 h-4 text-sky-400" />
                  <span>Questions or Feedback?</span>
                </h3>
                <p className="text-xs text-text-muted leading-relaxed font-normal">
                  Found a typo, want to suggest an interview question, or discuss the guides? Reach out to Arvind M directly on LinkedIn.
                </p>
              </div>

              <a
                href="https://www.linkedin.com/in/arvind-m-ab2a71148/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-xs font-bold bg-[#0a66c2]/10 hover:bg-[#0a66c2]/15 border border-[#0a66c2]/30 hover:border-[#0a66c2]/50 text-sky-400 transition-all duration-200 cursor-pointer self-stretch md:self-auto justify-center"
              >
                <FaLinkedin className="w-4 h-4 text-[#0a66c2]" />
                <span>Contact on LinkedIn</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </CategoryLayout>
  );
};

export default PrivacyPage;
