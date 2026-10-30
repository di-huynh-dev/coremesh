import aiEngineerRoleMap from "@/content/role-maps/ai-engineer.json";
import backendRoleMap from "@/content/role-maps/backend.json";
import devopsRoleMap from "@/content/role-maps/devops.json";
import frontendRoleMap from "@/content/role-maps/frontend.json";
import mobileRoleMap from "@/content/role-maps/mobile.json";
import qaRoleMap from "@/content/role-maps/qa.json";
import { getAllPosts, slugify, toSummary, type BlogLocale, type BlogTopic } from "@repo/content/posts";

export const ROLE_MAP_IDS = ["frontend", "backend", "mobile", "qa", "devops", "ai-engineer"] as const;
export type RoleMapId = (typeof ROLE_MAP_IDS)[number];

export const ROLE_PHASES = ["foundation", "core", "advanced"] as const;
export type RolePhase = (typeof ROLE_PHASES)[number];

export type ResourceKind = "docs" | "book" | "course" | "article" | "tool";

export interface RoleStage {
  id: string;
  phase: RolePhase;
  weeks: number;
  title: string;
  goal: string;
  note: string;
  topics: { title: string; detail: string }[];
  practices: string[];
  pitfalls: string[];
  project: { title: string; brief: string };
  resources: { title: string; url: string; kind: ResourceKind }[];
  tags: string[];
}

export interface RoleInsight {
  title: string;
  detail: string;
}

interface RoleMapLocaleContent {
  name: string;
  tagline: string;
  summary: string;
  story: { intro: string; lessons: string[] };
  stages: RoleStage[];
  trends: { now: RoleInsight[]; next: RoleInsight[] };
  outcomes: string[];
}

interface RoleMapSource {
  id: string;
  ecosystem: string[];
  locales: Record<BlogLocale, RoleMapLocaleContent>;
}

export interface RoleMap extends RoleMapLocaleContent {
  id: RoleMapId;
  accent: string;
  ecosystem: string[];
  topics: BlogTopic[];
  isPrimary: boolean;
  totals: { stages: number; topics: number; weeks: number };
}

const sources: Record<RoleMapId, RoleMapSource> = {
  frontend: frontendRoleMap as RoleMapSource,
  backend: backendRoleMap as RoleMapSource,
  mobile: mobileRoleMap as RoleMapSource,
  qa: qaRoleMap as RoleMapSource,
  devops: devopsRoleMap as RoleMapSource,
  "ai-engineer": aiEngineerRoleMap as RoleMapSource,
};

const roleAccents: Record<RoleMapId, string> = {
  frontend: "#2f5bff",
  backend: "#0b7a55",
  mobile: "#c2410c",
  qa: "#7c3aed",
  devops: "#0e7490",
  "ai-engineer": "#be185d",
};

const relatedTopics: Record<RoleMapId, BlogTopic[]> = {
  frontend: ["frontend", "performance"],
  backend: ["systems", "performance"],
  mobile: ["frontend", "performance"],
  qa: ["tooling", "frontend"],
  devops: ["tooling", "systems"],
  "ai-engineer": ["systems", "tooling"],
};

const PRIMARY_ROLE: RoleMapId = "frontend";

export function isRoleMapId(value: string): value is RoleMapId {
  return (ROLE_MAP_IDS as readonly string[]).includes(value);
}

export function getRoleMap(id: RoleMapId, locale: BlogLocale): RoleMap {
  const source = sources[id];
  const content = source.locales[locale];
  return {
    ...content,
    id,
    accent: roleAccents[id],
    ecosystem: source.ecosystem,
    topics: relatedTopics[id],
    isPrimary: id === PRIMARY_ROLE,
    totals: {
      stages: content.stages.length,
      topics: content.stages.reduce((sum, stage) => sum + stage.topics.length, 0),
      weeks: content.stages.reduce((sum, stage) => sum + stage.weeks, 0),
    },
  };
}

export function getRoleMaps(locale: BlogLocale) {
  return ROLE_MAP_IDS.map((id) => getRoleMap(id, locale));
}

export function getRolePhases(stages: RoleStage[]) {
  return ROLE_PHASES.map((phase) => {
    const members = stages.filter((stage) => stage.phase === phase);
    return {
      phase,
      stages: members,
      weeks: members.reduce((sum, stage) => sum + stage.weeks, 0),
    };
  }).filter((group) => group.stages.length > 0);
}

export function getRoleMapPosts(roleMap: RoleMap, locale: BlogLocale, limit = 3) {
  const keywords = new Set(
    [...roleMap.ecosystem, ...roleMap.stages.flatMap((stage) => stage.tags)].map(slugify),
  );

  return getAllPosts(locale)
    .map((post) => ({
      post,
      score:
        post.tags.filter((tag) => keywords.has(slugify(tag))).length * 2 +
        (roleMap.topics.includes(post.topic) ? 1 : 0),
    }))
    .filter(({ score }) => score > 1)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, limit)
    .map(({ post }) => toSummary(post));
}
