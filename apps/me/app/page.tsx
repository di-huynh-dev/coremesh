import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AboutSection } from "@/components/sections/about-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { OverviewSection } from "@/components/sections/overview-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { StackSection } from "@/components/sections/stack-section";
import { getAllPosts } from "../../blogs/lib/blog";
import type { BlogPost } from "@repo/ui/types/post";

const blogsBaseUrl =
  process.env.NEXT_PUBLIC_BLOGS_URL?.replace(/\/$/, "") ??
  "http://localhost:3003/en";

export default function Home() {
  const posts: BlogPost[] = getAllPosts("en")
    .slice(0, 3)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      readingTime: post.readingTime,
      category: post.category,
      tags: post.tags,
      image: post.image,
    }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <OverviewSection posts={posts} blogsBaseUrl={blogsBaseUrl} />
      <AboutSection />
      <StackSection />
      <ExperienceSection />
      <ProjectsSection />
      <Footer />
    </main>
  );
}
