import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import { countWords, renderMarkdown } from "./markdown";

/*
 * Multi-part guides copied from The DevOps Daily (MIT, see content/guides/LICENSE).
 * Each guide is a folder: index.md (overview) plus NN-part.md chapters.
 */

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");
const VI_GUIDES_DIR = path.join(process.cwd(), "content", "guides-localized", "vi");
export const GUIDES_SOURCE = {
  name: "DevOps Daily",
  url: "https://devops-daily.com/guides",
  repo: "https://github.com/The-DevOps-Daily/devops-daily",
  license: "MIT",
} as const;

interface GuideFrontmatter {
  title: string;
  description?: string;
  category?: { name: string; slug: string };
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  tags?: string[];
}

interface PartFrontmatter {
  title: string;
  description?: string;
  order?: number;
}

export interface GuidePartSummary {
  slug: string;
  title: string;
  description: string;
  order: number;
  readingTime: number;
}

export interface GuideSummary {
  slug: string;
  title: string;
  description: string;
  category: { name: string; slug: string };
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  readingTime: number;
  parts: GuidePartSummary[];
}

function splitFrontmatter<T>(source: string): { data: T; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {} as T, body: source };
  return { data: (parseYaml(match[1]!) ?? {}) as T, body: match[2]! };
}

function toIsoDate(value: string | Date | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function readingMinutes(markdown: string) {
  return Math.max(1, Math.round(countWords(markdown) / 220));
}

interface LoadedGuide extends GuideSummary {
  body: string;
  partBodies: Map<string, string>;
}

const cache = new Map<string, { version: number; guides: LoadedGuide[] }>();

/** Latest mtime of any guide file: adding or editing a guide invalidates the cache without a restart. */
function contentVersion(root: string) {
  let latest = 0;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(root, entry.name);
    for (const file of fs.readdirSync(dir)) {
      latest = Math.max(latest, fs.statSync(path.join(dir, file)).mtimeMs);
    }
  }
  return latest;
}

function loadGuides(locale = "en"): LoadedGuide[] {
  const language = locale === "vi" ? "vi" : "en";
  const version =
    contentVersion(GUIDES_DIR) +
    (language === "vi" && fs.existsSync(VI_GUIDES_DIR) ? contentVersion(VI_GUIDES_DIR) : 0);
  const cached = cache.get(language);
  if (cached?.version === version) return cached.guides;

  const guides = fs
    .readdirSync(GUIDES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(language === "vi" ? VI_GUIDES_DIR : GUIDES_DIR, entry.name);
      const index = splitFrontmatter<GuideFrontmatter>(
        fs.readFileSync(path.join(dir, "index.md"), "utf8"),
      );
      const partBodies = new Map<string, string>();

      const parts = fs
        .readdirSync(dir)
        .filter((file) => file.endsWith(".md") && file !== "index.md")
        .map((file) => {
          const slug = file.replace(/\.md$/, "");
          const { data, body } = splitFrontmatter<PartFrontmatter>(
            fs.readFileSync(path.join(dir, file), "utf8"),
          );
          partBodies.set(slug, body);
          // Some chapters omit `order`; the NN- filename prefix is the fallback.
          const prefix = Number.parseInt(file, 10);
          return {
            slug,
            title: data.title ?? slug,
            description: data.description ?? "",
            order: data.order ?? (Number.isNaN(prefix) ? 999 : prefix),
            readingTime: readingMinutes(body),
          };
        })
        .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));

      const meta = index.data;
      return {
        slug: entry.name,
        title: meta.title,
        description: meta.description ?? "",
        category: meta.category ?? { name: "DevOps", slug: "devops" },
        publishedAt: toIsoDate(meta.publishedAt),
        updatedAt: toIsoDate(meta.updatedAt ?? meta.publishedAt),
        tags: meta.tags ?? [],
        readingTime: parts.reduce((sum, part) => sum + part.readingTime, 0),
        parts,
        body: index.body,
        partBodies,
      };
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  cache.set(language, { version, guides });
  return guides;
}

function toSummary({ body, partBodies, ...summary }: LoadedGuide): GuideSummary {
  void body;
  void partBodies;
  return summary;
}

export function getGuides(locale = "en"): GuideSummary[] {
  return loadGuides(locale).map(toSummary);
}

export function getGuide(slug: string, locale = "en") {
  const guide = loadGuides(locale).find((item) => item.slug === slug);
  if (!guide) return undefined;
  return { ...toSummary(guide), intro: renderMarkdown(guide.body) };
}

export function getGuidePart(slug: string, partSlug: string, locale = "en") {
  const guide = loadGuides(locale).find((item) => item.slug === slug);
  const body = guide?.partBodies.get(partSlug);
  if (!guide || body === undefined) return undefined;

  const index = guide.parts.findIndex((part) => part.slug === partSlug);
  return {
    guide: toSummary(guide),
    part: guide.parts[index]!,
    index,
    previous: guide.parts[index - 1],
    next: guide.parts[index + 1],
    content: renderMarkdown(body),
  };
}

export function getGuideCategories(locale = "en") {
  const counts = new Map<string, { name: string; slug: string; count: number }>();
  loadGuides(locale).forEach(({ category }) => {
    const entry = counts.get(category.slug) ?? { ...category, count: 0 };
    entry.count++;
    counts.set(category.slug, entry);
  });
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
