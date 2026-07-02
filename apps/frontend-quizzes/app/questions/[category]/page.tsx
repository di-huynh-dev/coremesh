import CategoryLayout from "@/components/layouts/CategoryLayout"
import CategoryQuestions from "@/components/CategoryQuestions"
import { getQuestionsByCategory } from '@/lib/mdx'
import type { Metadata } from "next"
import { FiHelpCircle, FiBookOpen } from "react-icons/fi"
import { getCategoryDisplayName } from "@/lib/constants"

interface QuestionPageProps {
    params: Promise<{
        category: string
    }>
}



export async function generateMetadata({ params }: QuestionPageProps): Promise<Metadata> {
    const { category } = await params
    const capitalized = getCategoryDisplayName(category)
    return {
        title: `${capitalized} Questions`,
        description: `Practice top ${capitalized} frontend engineering interview questions with detailed, step-by-step explanations and first-principles reasoning.`,
        alternates: {
            canonical: `/questions/${category}`,
        },
    }
}


const QuestionPage = async ({ params }: QuestionPageProps) => {
    const { category } = await params
    const questions = getQuestionsByCategory(category)
    const totalQuestions = questions.length
    const capitalizedCategory = getCategoryDisplayName(category)

    const easyCount = questions.filter(
        (q) => q.difficulty?.toLowerCase() === "easy",
    ).length;
    const mediumCount = questions.filter(
        (q) => q.difficulty?.toLowerCase() === "medium",
    ).length;
    const hardCount = questions.filter(
        (q) => q.difficulty?.toLowerCase() === "hard",
    ).length;

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Questions", href: "/questions" },
        { label: capitalizedCategory },
    ];
    const backLink = {
        label: "Back to Questions",
        href: "/questions",
    };

    return (
        <CategoryLayout breadcrumbs={breadcrumbs} backLink={backLink}>
            <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                {/* Hero Header & Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-12 relative">
                    {/* Column 1: Title & Description */}
                    <div className="md:col-span-2 text-left relative">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4 tracking-wide uppercase">
                            <FiHelpCircle className="w-3.5 h-3.5" />
                            <span>Topic Directory</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-text-muted bg-clip-text text-transparent mb-4 capitalize">
                            {capitalizedCategory} Questions
                        </h1>
                        <p className="text-text-muted text-base md:text-lg max-w-2xl leading-relaxed">
                            Master your {capitalizedCategory} fundamentals, advanced mechanics, and ace your frontend interview challenges.
                        </p>
                    </div>

                    {/* Column 2: Total Directory Card */}
                    <div className="relative overflow-hidden group bg-card-bg/45 backdrop-blur-md border border-card-border hover:border-card-hover-border rounded-2xl p-6 transition-all duration-300 shadow-xs hover:shadow-md">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-foreground/5 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs uppercase font-bold tracking-wider text-text-muted">
                                {capitalizedCategory} Stats
                            </span>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-foreground/5 text-foreground">
                                <FiBookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-foreground">
                                {totalQuestions}
                            </span>
                            <span className="text-xs text-text-muted">questions loaded</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-card-border flex items-center gap-3 text-[11px] text-text-muted">
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {easyCount} Easy
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                {mediumCount} Medium
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                {hardCount} Hard
                            </span>
                        </div>
                    </div>
                </div>

                {/* Interactive list (client component) */}
                <div className="relative pt-8 border-t border-card-border">
                    <CategoryQuestions questions={questions} category={category} />
                </div>
            </div>
        </CategoryLayout>
    )
}

export default QuestionPage