import {
  getQuestionBySlug,
  getAllQuestions,
  getAllQuestionsWithMetadata,
  getQuestionsByCategory,
  extractHeadings,
  slugify,
} from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import ArticleLayout from "@/components/layouts/ArticleLayout";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import { ReactNode, HTMLAttributes, isValidElement, JSX } from "react";
import QuestionCard from "@/components/QuestionCard";
import { SiReact, SiJavascript, SiTypescript, SiCss } from "react-icons/si";
import { FiCode, FiShield, FiZap, FiLayers, FiUsers } from "react-icons/fi";

type Props = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const { frontmatter } = getQuestionBySlug(category, slug);

  return {
    title: frontmatter.title,
    description:
      frontmatter.description ||
      `Master this senior-level ${category} frontend interview question with practical, first-principles explanations.`,
    alternates: {
      canonical: `/questions/${category}/${slug}`,
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: "article",
      url: `/questions/${category}/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
    },
  };
}

export async function generateStaticParams() {
  const questions = getAllQuestions();

  return questions.map((question) => ({
    category: question.category,
    slug: question.slug,
  }));
}

function getChildrenText(children: ReactNode): string {
  if (!children) return "";
  if (typeof children === "string" || typeof children === "number")
    return String(children);
  if (Array.isArray(children)) {
    return children.map(getChildrenText).join("");
  }
  if (
    isValidElement<{ children?: ReactNode }>(children) &&
    children.props.children
  ) {
    return getChildrenText(children.props.children);
  }
  return "";
}

const mdxComponents = {
  h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
    const text = getChildrenText(children);
    const id = slugify(text);
    return (
      <h2 id={id} {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
    const text = getChildrenText(children);
    const id = slugify(text);
    return (
      <h3 id={id} {...props}>
        {children}
      </h3>
    );
  },
};

export default async function QuestionPage({ params }: Props) {
  const { category, slug } = await params;

  const { frontmatter, content } = getQuestionBySlug(category, slug);
  const tocItems = extractHeadings(content);

  // Dynamic lookup for more questions in the same category
  const allCategoryQuestions = getQuestionsByCategory(category);
  let otherQuestions = allCategoryQuestions.filter((q) => q.slug !== slug);

  // If we have less than 2, fill with other random/sequential questions
  if (otherQuestions.length < 2) {
    const allQuestions = getAllQuestionsWithMetadata();
    const fillQuestions = allQuestions.filter(
      (q) =>
        q.slug !== slug && q.category.toLowerCase() !== category.toLowerCase(),
    );
    otherQuestions = [...otherQuestions, ...fillQuestions].slice(0, 2);
  } else {
    otherQuestions = otherQuestions.slice(0, 2);
  }

  const categoryIcons: Record<string, JSX.Element> = {
    react: <SiReact className="w-5 h-5 text-sky-400" />,
    javascript: <SiJavascript className="w-5 h-5 text-yellow-500" />,
    typescript: <SiTypescript className="w-5 h-5 text-blue-400" />,
    css: <SiCss className="w-5 h-5 text-purple-400" />,
    nextjs: <FiLayers className="w-5 h-5 text-slate-400" />,
    performance: <FiZap className="w-5 h-5 text-orange-400" />,
    security: <FiShield className="w-5 h-5 text-red-400" />,
    behavioral: <FiUsers className="w-5 h-5 text-teal-400" />,
  };

  const moreQuestionsCards = otherQuestions.map((q) => (
    <QuestionCard
      key={q.slug}
      id={q.slug}
      slug={q.slug}
      title={q.title}
      category={q.category}
      difficulty={q.difficulty as "Easy" | "Medium" | "Hard"}
      timeEstimation={`${q.readingTime || 5} min read`}
      summary={q.description}
      isNew={q.isNew}
      icon={
        categoryIcons[q.category.toLowerCase()] || (
          <FiCode className="w-5 h-5" />
        )
      }
    />
  ));

  return (
    <ArticleLayout
      frontmatter={frontmatter}
      tocItems={tocItems}
      moreQuestionsCards={moreQuestionsCards}
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
    </ArticleLayout>
  );
}
