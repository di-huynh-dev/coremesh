// Post types live in @repo/content; search types are specific to this app.
export * from "@repo/content/types";

export type SearchKind = "post" | "series" | "guide" | "chapter" | "role" | "stage" | "tool";

/** One row of the site-wide ⌘K index (built on the server, filtered on the client). */
export interface SearchEntry {
  kind: SearchKind;
  title: string;
  description: string;
  href: string;
  /** Context shown under the title, e.g. the guide a chapter belongs to */
  context?: string;
  keywords: string[];
}
