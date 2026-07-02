import CategoryLayout from "@/components/layouts/CategoryLayout";
import { FiMail, FiMessageSquare, FiExternalLink } from "react-icons/fi";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have a question about a question, feedback, or want to contribute? Reach out to FrontendPrep support.",
  alternates: {
    canonical: "/contact",
  },
};

const Contact = () => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Contact" },
  ];
  const backLink = {
    label: "Back to Home",
    href: "/",
  };

  return (
    <CategoryLayout breadcrumbs={breadcrumbs} backLink={backLink}>
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-24 relative flex flex-col items-center justify-center min-h-[60vh]">
        {/* Decorative background ambient glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />

        {/* Decorative Badge */}
        <div className="z-10 text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-wide uppercase shadow-xs">
            <FiMessageSquare className="w-3.5 h-3.5" />
            <span>Contact</span>
          </span>
        </div>

        {/* Main Header */}
        <div className="text-center max-w-xl mx-auto mb-12 z-10">
          <h1 className="font-brand font-extrabold text-4xl md:text-5xl tracking-tight bg-gradient-to-b from-foreground to-foreground/75 bg-clip-text text-transparent mb-4 leading-tight">
            Get in Touch.
          </h1>
          <p className="text-text-muted text-sm md:text-base leading-relaxed">
            Have questions about our questions or study guides, spotted a bug, or
            want to suggest a topic? We&apos;re here to help.
          </p>
        </div>

        {/* Contact Method Card */}
        <div className="w-full max-w-md relative rounded-2xl border border-card-border p-8 bg-card-bg/60 backdrop-blur-md flex flex-col items-center text-center shadow-xs z-10 hover:border-transparent transition-all duration-300 group overflow-hidden">
          {/* Rotating Border Beam on Card Hover */}
          <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
          <div className="absolute inset-[1.5px] bg-card-bg/90 dark:bg-card-bg/60 rounded-[14.5px] -z-10 group-hover:bg-card-bg/95 transition-colors duration-300" />

          {/* Mail Icon Wrapper */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 shadow-xs mb-6 group-hover:scale-105 transition-all duration-300 z-10">
            <FiMail className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-foreground font-brand tracking-tight mb-2 z-10">
            Email Us
          </h3>

          <p className="text-xs md:text-sm text-text-muted leading-relaxed mb-6 px-2 z-10">
            For general questions, editorial corrections, content suggestions, or
            training collaborations.
          </p>

          {/* Clickable Mail Anchor */}
          <a
            href="mailto:contact@frontendprep.io"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-card-border bg-background hover:border-sky-500/30 text-foreground hover:text-sky-400 font-medium text-sm transition-all duration-300 shadow-2xs hover:shadow-[0_0_15px_-3px_rgba(14,165,233,0.15)] group/link z-10"
          >
            <span>contact@frontendprep.io</span>
            <FiExternalLink className="w-4 h-4 text-text-muted group-hover/link:text-sky-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all duration-200" />
          </a>
        </div>
      </div>
    </CategoryLayout>
  );
};

export default Contact;
