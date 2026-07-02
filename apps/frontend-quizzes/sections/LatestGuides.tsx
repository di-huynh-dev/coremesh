import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { FiBookOpen } from "react-icons/fi";
import GuideCard from "@/components/GuideCard";
import { getAllGuidesWithMetadata } from "@/lib/mdx";

export default function LatestGuides() {
  const allGuides = getAllGuidesWithMetadata();

  return (
    <section className="section-wrapper relative border-t border-card-border/50">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between max-w-5xl mx-auto mb-12 gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Latest Guides
          </h2>
          <p className="mt-3 text-sm md:text-base text-text-muted leading-relaxed font-normal">
            Deep-dive technical articles written to build production-grade web
            concepts and software engineering mental models.
          </p>
        </div>

        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-foreground hover:opacity-90 group/btn transition-all self-start md:self-auto"
        >
          <span>Explore All Guides</span>
          <FiArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto ">
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
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
