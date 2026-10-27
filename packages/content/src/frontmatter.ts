import { load as parseYaml } from "js-yaml";

/** Splits a `---` YAML frontmatter block from the document body. */
export function splitFrontmatter<T>(source: string): { data: T; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {} as T, body: source };
  return { data: (parseYaml(match[1]!) ?? {}) as T, body: match[2]! };
}

export function readYaml<T>(source: string): T {
  return (parseYaml(source) ?? {}) as T;
}

/** YAML turns unquoted dates into Date objects; normalize to "YYYY-MM-DD". */
export function toIsoDate(value: string | Date | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}
