import { BlogIndex } from '@/components/blog/blog-index';
import { getAllPosts, getAllSeries } from '@/lib/blog';

export const metadata = {
  title: 'DiCodeWeb Journal | DiCodeWeb',
  description:
    'Frontend notes, interview patterns, and product engineering write-ups from the DiCodeWeb journal.',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const series = getAllSeries(posts).filter((seriesEntry) => seriesEntry.posts.length > 0);

  return (
    <main className="blog-shell bg-background min-h-screen">
      <div className="editorial-grid pt-24 md:pt-32">
        <BlogIndex posts={posts} series={series} />
      </div>
    </main>
  );
}
