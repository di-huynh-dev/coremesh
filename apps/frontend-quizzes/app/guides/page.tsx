import CategoryLayout from "@/components/layouts/CategoryLayout";
import { FiBookOpen } from "react-icons/fi";
import type { Metadata } from "next";
import { getAllGuidesWithMetadata } from "@/lib/mdx";
import GuideCard from "@/components/GuideCard";

export const metadata: Metadata = {
  title: "Interview Guides",
  description:
    "Sharpen your skills with curated frontend engineering interview guides. Breakdown the concepts to master each topic.",
  alternates: {
    canonical: "/guides",
  },
};

const GuidesPage = () => {
  const allGuides = getAllGuidesWithMetadata();

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Guides" },
  ];
  const backLink = {
    label: "Back to Home",
    href: "/",
  };

  return (
    <CategoryLayout breadcrumbs={breadcrumbs} backLink={backLink}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center md:text-left mb-12 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            <FiBookOpen className="w-3.5 h-3.5" />
            <span>Step-by-step interview paths</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-text-muted bg-clip-text text-transparent mb-4 font-brand leading-tight">
            Curated Study Blueprints
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-2xl leading-relaxed">
            Deep-dive conceptual frameworks and step-by-step interview
            blueprints. Master complex browser systems, concurrent rendering
            lifecycles, and advanced architectural paradigms.
          </p>
        </div>

        {/* Guides Grid */}
        {allGuides.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-card-border rounded-3xl bg-card-bg/25">
            <FiBookOpen className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground font-brand">
              No Guides Loaded Yet
            </h3>
            <p className="text-xs text-text-muted mt-1">
              We are busy writing first-principles blueprints. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allGuides.map((guide) => (
              <GuideCard
                key={guide.slug}
                id={guide.slug}
                slug={guide.slug}
                title={guide.title}
                category={guide.category}
                readTime={`${guide.readingTime || 10} min read`}
                difficulty={
                  guide.difficulty as "Beginner" | "Intermediate" | "Advanced"
                }
                description={guide.description}
                isNew={guide.isNew}
              />
            ))}
          </div>
        )}
      </div>
    </CategoryLayout>
  );
};

export default GuidesPage;
