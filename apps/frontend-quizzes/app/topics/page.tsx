import CategoryLayout from "@/components/layouts/CategoryLayout";
import TopicCard from "@/components/TopicCard";
import { TOPICS } from "@/data/topics";
import { getQuestionCountByCategory, getAllQuestionsWithMetadata } from "@/lib/mdx";
import { FiHelpCircle, FiLayers, FiFolder, FiClock } from "react-icons/fi";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Core Topics",
  description:
    "Sharpen your skills with curated frontend engineering topics. Breakdown the concepts to master each topic.",
  alternates: {
    canonical: "/topics",
  },
};

const TopicsPage = () => {
  // 1. Fetch counts dynamically on the server
  const topicsWithCounts = TOPICS.map((topic) => {
    const questionCount = getQuestionCountByCategory(topic.slug);
    return {
      ...topic,
      questionCount: questionCount > 0 ? questionCount : undefined, // 0 or undefined shows "Coming Soon"
    };
  });

  // 2. Compute aggregate metrics
  const totalQuestions = getAllQuestionsWithMetadata().length;
  const liveTracksCount = topicsWithCounts.filter(t => t.questionCount !== undefined).length;
  const totalTracksCount = topicsWithCounts.length;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Topics" },
  ];
  const backLink = {
    label: "Back to Home",
    href: "/",
  };

  return (
    <CategoryLayout breadcrumbs={breadcrumbs} backLink={backLink}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Header Section */}
        <div className="text-center md:text-left mb-12 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            <FiHelpCircle className="w-3.5 h-3.5" />
            <span>Core Knowledge frameworks & tools</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-text-muted bg-clip-text text-transparent mb-4">
            Core Knowledge Frameworks & Tools
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-2xl leading-relaxed">
            Sharpen your skills with curated frontend engineering topics.
            Breakdown the concepts to master each topic.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-card-bg/40 border border-card-border backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <FiLayers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalTracksCount}</div>
              <div className="text-xs text-text-muted">Total Learning Tracks</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-card-bg/40 border border-card-border backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FiFolder className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalQuestions}</div>
              <div className="text-xs text-text-muted">Live Interview Questions</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-card-bg/40 border border-card-border backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{liveTracksCount} / {totalTracksCount}</div>
              <div className="text-xs text-text-muted">Active Content Modules</div>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="border-t border-card-border my-10" />

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicsWithCounts.map((topic) => (
            <TopicCard key={topic.slug} {...topic} />
          ))}
        </div>
      </div>
    </CategoryLayout>
  );
};

export default TopicsPage;
