import { useSyncExternalStore } from "react";

/*
 * Per-browser reading memory: how far the reader got, what they finished and what they
 * saved for later. Keyed by slug (shared by both locales) and kept in localStorage only:
 * nothing leaves the device. Other tabs stay in sync through the `storage` event.
 */

const STORAGE_KEY = "dicodeweb:reading";

/** Progress at which a post counts as read. */
export const READ_THRESHOLD = 0.9;
/** Below this a visit is just a glance, not "in progress". */
export const STARTED_THRESHOLD = 0.05;

export interface ReadingEntry {
  /** Last position through the article body, 0..1 */
  progress: number;
  /** ISO time the post was last opened */
  visitedAt: string;
  /** ISO time the reader first reached the end */
  readAt?: string;
  /** ISO time the post was saved for later */
  savedAt?: string;
}

export type ReadingState = Readonly<Record<string, ReadingEntry>>;

const EMPTY: ReadingState = {};
const listeners = new Set<() => void>();
let current: ReadingState | undefined;

function load(): ReadingState {
  if (current) return current;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    current =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as ReadingState)
        : EMPTY;
  } catch {
    // Blocked storage or corrupted JSON: start fresh in memory.
    current = EMPTY;
  }
  return current;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  // key is null when another tab cleared all storage.
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  current = undefined;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function commit(next: ReadingState) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota or privacy mode: keep the in-memory copy for this tab.
  }
  emit();
}

function update(slug: string, change: (entry: ReadingEntry | undefined) => ReadingEntry | undefined) {
  // Re-read before writing: another tab may have written since our copy was cached,
  // and its `storage` event can arrive after this write.
  current = undefined;
  const state = load();
  const entry = change(state[slug]);
  const next = { ...state };
  if (entry) next[slug] = entry;
  else delete next[slug];
  commit(next);
}

const now = () => new Date().toISOString();

export const readingStore = {
  /** Records an open of the post without touching its progress. */
  visit(slug: string) {
    update(slug, (entry) => ({ progress: 0, ...entry, visitedAt: now() }));
  },
  setProgress(slug: string, progress: number) {
    update(slug, (entry) => ({
      ...entry,
      visitedAt: entry?.visitedAt ?? now(),
      progress,
      readAt: entry?.readAt ?? (progress >= READ_THRESHOLD ? now() : undefined),
    }));
  },
  toggleSaved(slug: string) {
    update(slug, (entry) => ({
      progress: 0,
      visitedAt: now(),
      ...entry,
      savedAt: entry?.savedAt ? undefined : now(),
    }));
  },
  /** Drops one post from every list. */
  forget(slug: string) {
    update(slug, () => undefined);
  },
  clear() {
    commit(EMPTY);
  },
  /** Current value outside React (e.g. the entry as it was when a page opened). */
  get(slug: string): ReadingEntry | undefined {
    return load()[slug];
  },
};

export function useReading(): ReadingState {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

export function useReadingEntry(slug: string): ReadingEntry | undefined {
  return useReading()[slug];
}

const noop = () => () => {};

/** False during SSR and hydration, so pages can avoid flashing an empty state. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function isInProgress(entry: ReadingEntry | undefined) {
  return Boolean(entry && !entry.readAt && entry.progress >= STARTED_THRESHOLD);
}

export function countRead(slugs: { slug: string }[], reading: ReadingState) {
  return slugs.filter(({ slug }) => reading[slug]?.readAt).length;
}

/** Index of the first part not read yet, or -1 when every part is done. */
export function nextUnread(slugs: { slug: string }[], reading: ReadingState) {
  return slugs.findIndex(({ slug }) => !reading[slug]?.readAt);
}
