import { BlogIndex } from '@/components/blog/blog-index';
import { getAllPosts } from '@/lib/blog';

export const metadata = {
  title: 'Blog | DiCodeWeb',
  description:
    'Technical essays, frontend notes, and product engineering articles from the DiCodeWeb editorial system.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="bg-background min-h-screen">
      <div className="editorial-grid pt-24 md:pt-32">
        <BlogIndex posts={posts} />
      </div>
    </main>
  );
}
