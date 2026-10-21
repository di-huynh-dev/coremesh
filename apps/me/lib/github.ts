export type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

export type Contributions = {
  days: ContributionDay[];
  total: number;
};

const USERNAME = "di-huynh-dev";

/**
 * Real contribution data for the last year, via the public
 * github-contributions-api (no token needed). Returns null on any failure so
 * the UI can fall back to a clearly-labelled sample.
 */
export async function getContributions(): Promise<Contributions | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`,
      { next: { revalidate: 60 * 60 * 12 } },
    );
    if (!res.ok) return null;

    const json = (await res.json()) as {
      contributions?: ContributionDay[];
    };
    const days = json.contributions;
    if (!Array.isArray(days) || days.length === 0) return null;

    const clean = days
      .filter((d) => typeof d.date === "string" && typeof d.count === "number")
      .map((d) => ({
        date: d.date,
        count: d.count,
        level: Math.min(4, Math.max(0, d.level ?? 0)),
      }));

    return {
      days: clean,
      total: clean.reduce((sum, d) => sum + d.count, 0),
    };
  } catch {
    return null;
  }
}
