export type TikTokVideo = {
  url: string;
  title: string;
  thumbnail: string;
};

/** Title + thumbnail via TikTok's public oEmbed endpoint. Videos that fail are skipped. */
export async function getTikTokVideos(urls: string[]): Promise<TikTokVideo[]> {
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
          // Thumbnail URLs are signed and expire, so refresh them regularly.
          next: { revalidate: 60 * 60 * 12 },
        });
        if (!res.ok) return null;
        const json = (await res.json()) as { title?: string; thumbnail_url?: string };
        if (!json.thumbnail_url) return null;
        return { url, title: json.title ?? "", thumbnail: json.thumbnail_url };
      } catch {
        return null;
      }
    }),
  );
  return results.filter((video): video is TikTokVideo => video !== null);
}
