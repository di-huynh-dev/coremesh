import nestjsRoadmap from "@/content/roadmaps/nestjs.json";
import reactRoadmap from "@/content/roadmaps/react.json";
import { getAllPosts, slugify, toSummary, type BlogLocale, type BlogTopic } from "@repo/content/posts";

// Source data is shared with apps/dicodeweb (content/roadmaps); keep the JSON shape identical.

export const ROADMAP_IDS = ["react", "nestjs"] as const;
export type RoadmapId = (typeof ROADMAP_IDS)[number];

export interface RoadmapMilestone {
  step: string;
  title: string;
  description: string;
  tags: string[];
}

interface RoadmapLocaleContent {
  name: string;
  shortName: string;
  track: string;
  role: string;
  level: string;
  summary: string;
  durationText: string;
  topicCountText: string;
  questionCountText: string;
  skills: string[];
  previewNodes: string[];
  milestones: RoadmapMilestone[];
  outcomes: string[];
  support: { title: string; description: string; items: string[] };
}

interface RoadmapSource {
  id: RoadmapId;
  theme: { accent: string; soft: string; border: string };
  totals: { weeks: number; topics: number; questions: number; milestones: number };
  locales: Record<BlogLocale, RoadmapLocaleContent>;
}

export interface Roadmap extends RoadmapLocaleContent {
  id: RoadmapId;
  accent: string;
  totals: RoadmapSource["totals"];
  /** Blog topics whose articles pair well with this path */
  topics: BlogTopic[];
}

const sources: Record<RoadmapId, RoadmapSource> = {
  react: reactRoadmap as RoadmapSource,
  nestjs: nestjsRoadmap as RoadmapSource,
};

const relatedTopics: Record<RoadmapId, BlogTopic[]> = {
  react: ["frontend", "performance", "systems"],
  nestjs: ["systems", "tooling"],
};

export function isRoadmapId(value: string): value is RoadmapId {
  return (ROADMAP_IDS as readonly string[]).includes(value);
}

export function getRoadmap(id: RoadmapId, locale: BlogLocale): Roadmap {
  const source = sources[id];
  return {
    ...source.locales[locale],
    id,
    accent: source.theme.accent,
    totals: source.totals,
    topics: relatedTopics[id],
  };
}

export function getRoadmaps(locale: BlogLocale) {
  return ROADMAP_IDS.map((id) => getRoadmap(id, locale));
}

/** Splits milestones into three phases (warm-up, foundation, advanced). */
export function getRoadmapPhases(milestones: RoadmapMilestone[]) {
  const total = milestones.length;
  const first = Math.ceil(total / 3);
  const second = Math.ceil((total - first) / 2);
  const sizes = [first, second, Math.max(total - first - second, 1)];
  let start = 0;

  return sizes.map((size) => {
    const phase = { start, end: start + size - 1, milestones: milestones.slice(start, start + size) };
    start += size;
    return phase;
  });
}

/** Articles that share tags with the roadmap's skills, then same-topic articles. */
export function getRoadmapPosts(roadmap: Roadmap, locale: BlogLocale, limit = 3) {
  const keywords = new Set(
    [...roadmap.skills, ...roadmap.milestones.flatMap((m) => m.tags)].map(slugify),
  );

  return getAllPosts(locale)
    .map((post) => ({
      post,
      score:
        post.tags.filter((tag) => keywords.has(slugify(tag))).length * 2 +
        (roadmap.topics.includes(post.topic) ? 1 : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => toSummary(post));
}
