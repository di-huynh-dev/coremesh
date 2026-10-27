/**
 * Teaching & mentoring. Both blocks stay hidden until these are filled in.
 *
 * tiktokVideos: full video URLs, newest first, e.g.
 *   "https://www.tiktok.com/@dicodeweb/video/7400000000000000000"
 *   Title and thumbnail come from TikTok's public oEmbed endpoint at build time.
 * tiktokFollowers: shown as-is (TikTok has no public follower API), e.g. "12.5K".
 * mentoringUrl: a booking link such as https://cal.com/<you>/mentoring
 */
export const tiktokVideos: string[] = [];
export const tiktokFollowers: string | null = null;
export const mentoringUrl: string | null = null;
