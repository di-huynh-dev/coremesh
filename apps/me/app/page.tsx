import { BlogSection } from "@/components/sections/blog-section";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AboutSection } from "@/components/sections/about-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { OverviewSection } from "@/components/sections/overview-section";
import { StackSection } from "@/components/sections/stack-section";
import { ContactSection } from "@/components/sections/contact-section";
import { CommandPalette } from "@/components/ui/command-palette";
import { CursorLabel } from "@/components/ui/cursor-label";
import { EasterEgg } from "@/components/ui/easter-egg";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import path from "node:path";
import { getAllPosts } from "../../blogs/lib/content/posts";
import type { BlogPost } from "@repo/ui/types/post";

// Latest posts come straight from the blog's content folder in this monorepo.
const BLOG_POSTS_DIR = path.join(process.cwd(), "..", "blogs", "content", "posts");

const blogsBaseUrl =
  process.env.NEXT_PUBLIC_BLOGS_URL?.replace(/\/$/, "") ??
  "http://localhost:3002/en";

export default function Home() {
  const posts: BlogPost[] = getAllPosts("en", BLOG_POSTS_DIR)
    .slice(0, 3)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      readingTime: post.readingTime,
      category: post.topic,
      tags: post.tags,
      image: post.image,
    }));

  return (
    <main className="min-h-screen max-w-screen overflow-x-hidden bg-background px-2 pt-14 text-foreground">
      <ScrollProgress />
      <Navbar />
      <OverviewSection
        blogsBaseUrl={blogsBaseUrl}
        latestPost={
          posts[0] ? { slug: posts[0].slug, title: posts[0].title } : undefined
        }
      />
      <AboutSection />
      <StackSection />
      <ExperienceSection />
      <BlogSection posts={posts} blogsBaseUrl={blogsBaseUrl} />
      <ContactSection />
      <Footer />
      <ScrollToTop />
      <CommandPalette blogsBaseUrl={blogsBaseUrl} />
      <CursorLabel />
      <EasterEgg />
    </main>
  );
}
