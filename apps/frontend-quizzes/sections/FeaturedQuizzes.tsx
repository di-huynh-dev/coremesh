import Link from "next/link";
import { FiArrowRight, FiPlay } from "react-icons/fi";
import { FaReact, FaCss3Alt } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import { SiTypescript, SiNextdotjs } from "react-icons/si";
import { FiLayers } from "react-icons/fi";
import QuizCard from "@/components/QuizCard";
import { getAllQuizzes } from "@/lib/quizzes";

const getCategoryIcon = (category: string) => {
  const norm = category.toLowerCase();
  switch (norm) {
    case "javascript":
      return <IoLogoJavascript className="w-5 h-5 text-yellow-500" />;
    case "react":
      return <FaReact className="w-5 h-5 text-sky-400" />;
    case "typescript":
      return <SiTypescript className="w-5 h-5 text-blue-500" />;
    case "css":
      return <FaCss3Alt className="w-5 h-5 text-purple-500" />;
    case "nextjs":
      return <SiNextdotjs className="w-5 h-5 text-white" />;
    default:
      return <FiLayers className="w-5 h-5 text-text-muted" />;
  }
};

const FeaturedQuizzes = () => {
  // Fetch all quizzes and select a few to feature
  const allQuizzes = getAllQuizzes();
  
  // Try to pick 3 diverse quizzes if possible, or just the first 3
  const featured = allQuizzes.slice(0, 3).map((q) => ({
    id: q.id,
    category: q.category,
    title: q.title,
    description: q.description,
    difficulty: q.difficulty as "Easy" | "Medium" | "Hard",
    questionCount: q.questions.length,
    icon: getCategoryIcon(q.category),
  }));

  return (
    <section className="section-wrapper relative border-t border-card-border/50">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between max-w-5xl mx-auto mb-12 gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FiPlay className="text-sky-400" />
            Featured Quizzes
          </h2>
          <p className="mt-3 text-sm md:text-base text-text-muted leading-relaxed font-normal">
            Test your knowledge with bite-sized, interactive quizzes. Get instant feedback and solidify your frontend fundamentals.
          </p>
        </div>

        <Link
          href="/quizzes"
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-foreground hover:opacity-90 group/btn transition-all self-start md:self-auto"
        >
          <span>View All Quizzes</span>
          <FiArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {featured.length > 0 ? (
          featured.map((quiz) => <QuizCard key={quiz.id} {...quiz} />)
        ) : (
          <div className="col-span-full text-center py-12 border border-dashed border-card-border rounded-3xl bg-card-bg/25">
            <p className="text-sm text-text-muted">No quizzes available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedQuizzes;
