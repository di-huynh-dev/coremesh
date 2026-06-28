import { getAllPosts } from '@/lib/blog';

export function GET() {
  const posts = getAllPosts();

  const items = posts
    .map(
      (post) => `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <description><![CDATA[${post.excerpt}]]></description>
          <link>https://dicodeweb.com/blog/${post.slug}</link>
          <guid>https://dicodeweb.com/blog/${post.slug}</guid>
          <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        </item>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>DiCodeWeb Journal</title>
        <description>Frontend notes, interview patterns, and product engineering write-ups from DiCodeWeb.</description>
        <link>https://dicodeweb.com/blog</link>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
