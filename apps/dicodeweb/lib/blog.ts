import { allPosts, allSeries } from '../.content-collections/generated';

export type BlogPost = (typeof allPosts)[number];
export type BlogSeriesDocument = (typeof allSeries)[number];
export type BlogSeries = BlogSeriesDocument & {
  posts: BlogPost[];
};
export type TopicCluster = {
  label: string;
  posts: BlogPost[];
};

export function getAllPosts() {
  return [...allPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getAllSlugs() {
  return getAllPosts().map((post) => post.slug);
}

export function getAllSeriesSlugs() {
  return allSeries.map((series) => series.slug);
}

function sortBySeriesPosition(posts: BlogPost[]) {
  return [...posts].sort((a, b) => {
    const positionA = a.series?.position ?? Number.MAX_SAFE_INTEGER;
    const positionB = b.series?.position ?? Number.MAX_SAFE_INTEGER;

    if (positionA !== positionB) {
      return positionA - positionB;
    }

    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

function ensureCurrentPostInSlice(posts: BlogPost[], currentPost: BlogPost, limit: number) {
  const visiblePosts = posts.slice(0, limit);

  if (visiblePosts.some((post) => post.slug === currentPost.slug)) {
    return visiblePosts;
  }

  const currentIndex = posts.findIndex((post) => post.slug === currentPost.slug);

  if (currentIndex === -1) {
    return visiblePosts;
  }

  const start = Math.max(0, currentIndex - limit + 1);
  return posts.slice(start, start + limit);
}

export function getAllSeries(posts = getAllPosts()): BlogSeries[] {
  return [...allSeries]
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map((series) => ({
      ...series,
      posts: sortBySeriesPosition(posts.filter((post) => post.series?.slug === series.slug)),
    }));
}

export function getSeriesBySlug(slug: string, posts = getAllPosts()) {
  return getAllSeries(posts).find((series) => series.slug === slug);
}

export function getTopicCluster(currentPost: BlogPost, limit = 5): TopicCluster | null {
  const posts = getAllPosts();

  if (currentPost.series?.slug) {
    const series = getSeriesBySlug(currentPost.series.slug, posts);
    const seriesPosts = series?.posts ?? [];

    if (seriesPosts.length >= 2) {
      return {
        label: series?.title ?? currentPost.category,
        posts: ensureCurrentPostInSlice(seriesPosts, currentPost, limit),
      };
    }
  }

  const bestTagMatch = (currentPost.tags ?? [])
    .map((tag) => ({
      tag,
      count: posts.filter((post) => post.slug !== currentPost.slug && post.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.count - a.count)[0];

  let label: string = currentPost.category;
  let matchingPosts = posts.filter((post) => post.category === currentPost.category);

  if (bestTagMatch && bestTagMatch.count > 0) {
    label = bestTagMatch.tag;
    matchingPosts = posts.filter((post) => post.tags.includes(bestTagMatch.tag));

    if (matchingPosts.length < 2) {
      label = currentPost.category;
      matchingPosts = posts.filter((post) => post.category === currentPost.category);
    }
  }

  if (matchingPosts.length < 2) {
    return null;
  }

  return {
    label,
    posts: ensureCurrentPostInSlice(matchingPosts, currentPost, limit),
  };
}
