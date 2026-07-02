import {
  getGuideBySlug,
  getAllGuides,
  slugify,
  getAllQuestionsWithMetadata,
} from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import GuideLayout, {
  GuideFrontmatter,
} from "@/components/layouts/GuideLayout";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import QuestionCard from "@/components/QuestionCard";
import {
  FiBookmark,
  FiCpu,
  FiChevronRight,
  FiGrid,
  FiSettings,
  FiImage,
  FiCode,
  FiGlobe,
  FiAlertTriangle,
  FiZap,
  FiCheckCircle,
  FiAward,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { SiReact, SiJavascript } from "react-icons/si";
import { JSX, ReactNode, ComponentType, HTMLAttributes, isValidElement } from "react";

type Props = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

// 1. Static Parameter Generation for SSG
export async function generateStaticParams() {
  const guides = getAllGuides();
  return guides.map((guide) => ({
    category: guide.category,
    slug: guide.slug,
  }));
}

// 2. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const { frontmatter } = getGuideBySlug(category, slug);

  return {
    title: frontmatter.title,
    description:
      frontmatter.description ||
      `Deep-dive conceptual frontend engineering interview guide on ${category}.`,
    alternates: {
      canonical: `/guides/${category}/${slug}`,
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: "article",
      url: `/guides/${category}/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
    },
  };
}

// MDX Text Extraction helper
function getChildrenText(children: ReactNode): string {
  if (!children) return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) {
    return children.map(getChildrenText).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(children) && children.props.children) {
    return getChildrenText(children.props.children);
  }
  return "";
}

// 14 Core Section Heading Mapping with Icons
const headingIconMap: Record<
  string,
  { icon: ComponentType<{ className?: string }>; color: string; bg: string; border: string }
> = {
  introduction: {
    icon: FiBookmark,
    color: "text-sky-500",
    bg: "bg-sky-500/5 dark:bg-sky-500/3",
    border: "border-sky-500/20",
  },
  "why this matters": {
    icon: FiCpu,
    color: "text-emerald-500",
    bg: "bg-emerald-500/5 dark:bg-emerald-500/3",
    border: "border-emerald-500/20",
  },
  prerequisites: {
    icon: FiChevronRight,
    color: "text-amber-500",
    bg: "bg-amber-500/5 dark:bg-amber-500/3",
    border: "border-amber-500/20",
  },
  "mental model": {
    icon: FiGrid,
    color: "text-indigo-500",
    bg: "bg-indigo-500/5 dark:bg-indigo-500/3",
    border: "border-indigo-500/20",
  },
  "how it works": {
    icon: FiSettings,
    color: "text-rose-500",
    bg: "bg-rose-500/5 dark:bg-rose-500/3",
    border: "border-rose-500/20",
  },
  "visual diagram": {
    icon: FiImage,
    color: "text-cyan-500",
    bg: "bg-cyan-500/5 dark:bg-cyan-500/3",
    border: "border-cyan-500/20",
  },
  "simple example": {
    icon: FiCode,
    color: "text-amber-500",
    bg: "bg-amber-500/5 dark:bg-amber-500/3",
    border: "border-amber-500/20",
  },
  "real world example": {
    icon: FiGlobe,
    color: "text-sky-500",
    bg: "bg-sky-500/5 dark:bg-sky-500/3",
    border: "border-sky-500/20",
  },
  "common mistakes": {
    icon: FiAlertTriangle,
    color: "text-rose-500",
    bg: "bg-rose-500/5 dark:bg-rose-500/3",
    border: "border-rose-500/20",
  },
  "performance considerations": {
    icon: FiZap,
    color: "text-emerald-500",
    bg: "bg-emerald-500/5 dark:bg-emerald-500/3",
    border: "border-emerald-500/20",
  },
  "best practices": {
    icon: FiCheckCircle,
    color: "text-teal-500",
    bg: "bg-teal-500/5 dark:bg-teal-500/3",
    border: "border-teal-500/20",
  },
  "production recommendations": {
    icon: FiAward,
    color: "text-yellow-500",
    bg: "bg-yellow-500/5 dark:bg-yellow-500/3",
    border: "border-yellow-500/20",
  },
  "summary & key takeaways": {
    icon: FiStar,
    color: "text-purple-500",
    bg: "bg-purple-500/5 dark:bg-purple-500/3",
    border: "border-purple-500/20",
  },
};

// Premium MDX Heading Renderer
const mdxComponents = {
  h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
    const text = getChildrenText(children);
    const id = slugify(text);
    const textLower = text.toLowerCase();

    let matchedKey = "";
    for (const key of Object.keys(headingIconMap)) {
      if (textLower.includes(key)) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      const config = headingIconMap[matchedKey];
      const Icon = config.icon;
      let sectionId = matchedKey.replace(/\s+/g, "-");
      if (sectionId === "summary-&-key-takeaways") {
        sectionId = "summary-key-takeaways";
      }
      return (
        <div
          id={sectionId}
          className={`my-10 p-6 rounded-2xl border ${config.border} ${config.bg} backdrop-blur-md relative overflow-hidden group transition-all duration-300`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          <h2 className="text-xl font-extrabold tracking-tight text-foreground font-brand flex items-center gap-3 border-none pb-0 m-0 relative z-10 scroll-margin-top-24">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg bg-background border ${config.border} ${config.color} group-hover:scale-105 transition-transform duration-300 shadow-2xs`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span>{text}</span>
          </h2>
        </div>
      );
    }

    return (
      <h2 id={id} className="scroll-margin-top-24" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
    const text = getChildrenText(children);
    const id = slugify(text);
    return (
      <h3 id={id} className="scroll-margin-top-24" {...props}>
        {children}
      </h3>
    );
  },
};

// 3. Dynamic Page Controller
export default async function GuidePage({ params }: Props) {
  const { category, slug } = await params;
  const { frontmatter, content } = getGuideBySlug(category, slug);

  // Dynamic lookup for linked related questions
  const allQs = getAllQuestionsWithMetadata();
  const relatedSlugs = (frontmatter.relatedQuestions || []) as string[];
  const relatedQs = allQs.filter((q) => relatedSlugs.includes(q.slug));

  const categoryIcons: Record<string, JSX.Element> = {
    react: <SiReact className="w-5 h-5 text-sky-400" />,
    javascript: <SiJavascript className="w-5 h-5 text-yellow-500" />,
    behavioral: <FiUsers className="w-5 h-5 text-teal-400" />,
  };

  const relatedQuestionsCards =
    relatedQs.length > 0 ? (
      <>
        {relatedQs.map((q) => (
          <QuestionCard
            key={q.slug}
            id={q.slug}
            slug={q.slug}
            title={q.title}
            category={q.category}
            difficulty={q.difficulty as "Easy" | "Medium" | "Hard"}
            timeEstimation="15 min read"
            summary={q.description}
            icon={categoryIcons[q.category] || <FiCode className="w-5 h-5" />}
          />
        ))}
      </>
    ) : undefined;

  return (
    <GuideLayout
      frontmatter={frontmatter as GuideFrontmatter}
      relatedQuestionsCards={relatedQuestionsCards}
    >
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              [
                rehypePrettyCode,
                {
                  theme: "one-dark-pro",
                  keepBackground: true,
                },
              ],
            ],
          },
        }}
      />
    </GuideLayout>
  );
}
