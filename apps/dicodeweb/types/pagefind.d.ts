// Ambient declaration for the runtime-generated pagefind bundle.
// The file is built by `scripts/build-pagefind.ts` and served from /public/pagefind/.
// TypeScript cannot resolve the URL path at compile time, so we declare it here.

declare module '/pagefind/pagefind.js' {
  export interface PagefindSearchResult {
    id: string;
    data: () => Promise<PagefindSearchResultData>;
    words: number[];
    locations: number[];
  }

  export interface PagefindSearchResultData {
    url: string;
    content: string;
    excerpt: string;
    meta: Record<string, string>;
    filters: Record<string, string[]>;
    word_count: number;
    locations: number[];
    weighted_locations: Array<{ weight: number; balanced_score: number; location: number }>;
    score: number;
  }

  export interface PagefindSearchResponse {
    results: PagefindSearchResult[];
    filters: Record<string, Record<string, number>>;
    totalFilters: Record<string, Record<string, number>>;
    timings: { preload: number; search: number; total: number };
  }

  export function search(
    query: string,
    options?: {
      filters?: Record<string, string | string[]>;
      sort?: Record<string, 'asc' | 'desc'>;
    },
  ): Promise<PagefindSearchResponse>;

  export function preload(query: string): Promise<void>;
  export function init(): Promise<void>;
}
