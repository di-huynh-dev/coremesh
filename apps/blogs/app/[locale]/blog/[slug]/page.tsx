import { ArticleContent } from "@/components/blog/article-content";
import { getPostBySlug } from "@/lib/blog";
import { notFound } from "next/navigation";

interface BlogPostPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = getPostBySlug(
    resolvedParams.slug,
    resolvedParams.locale as "en" | "vi",
  );

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | DiCodeWeb Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = getPostBySlug(
    resolvedParams.slug,
    resolvedParams.locale as "en" | "vi",
  );

  if (!post) {
    notFound();
  }

  return <ArticleContent post={post} />;
}
