import { track } from "@vercel/analytics";

export type TrackEvent =
  | "contact_click"
  | "contact_submit"
  | "language_switch"
  | "drum_game_finish";

/** Custom analytics event. Recorded on Vercel plans with custom events; a no-op elsewhere. */
export function trackEvent(name: TrackEvent, properties?: Record<string, string | number>) {
  try {
    track(name, properties);
  } catch {
    // Analytics must never break the page.
  }
}
