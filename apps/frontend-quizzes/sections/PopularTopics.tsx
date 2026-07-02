import Link from "next/link";
import TopicCard from "@/components/TopicCard";
import { TOPICS } from "@/data/topics";
import { getQuestionCountByCategory } from "@/lib/mdx";

const PopularTopics = () => {
  // Show a subset of the top 6 topics on the homepage
  const topicsWithCounts = TOPICS.slice(0, 6).map((topic) => ({
    ...topic,
    questionCount: getQuestionCountByCategory(topic.slug),
  }));

  return (
    <section id="topics" className="section-wrapper relative">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Popular Topics
        </h2>
        <p className="mt-3 text-sm md:text-base text-text-muted leading-relaxed font-normal">
          Explore curated learning tracks covering the absolute core requirements of high-quality frontend engineering interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {topicsWithCounts.map((topic) => (
          <TopicCard key={topic.slug} {...topic} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/topics">
          <button className="px-8 py-3.5 bg-btn-secondary-bg border border-btn-secondary-border hover:border-foreground/30 text-btn-secondary-text hover:bg-foreground/5 font-semibold rounded-xl text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-xs">
            Explore All Topics
          </button>
        </Link>
      </div>
    </section>
  );
};

export default PopularTopics;

