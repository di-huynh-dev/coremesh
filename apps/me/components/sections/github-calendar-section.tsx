"use client";

import { useMemo, useState } from "react";

const WEEKS = 52;
const DAYS = 7;
const MONTH_LABELS = [
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
];
const LEVEL_COLORS = ["#e5e7eb", "#d1d5db", "#b8bcc5", "#9ca3af", "#808692"];

// Seeded pseudo-random generator for deterministic output
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function generateContributions() {
  const data: { level: number; count: number; label: string }[][] = [];
  const baseSeed = 42; // Fixed seed for consistency
  for (let w = 0; w < WEEKS; w++) {
    const week: { level: number; count: number; label: string }[] = [];
    for (let d = 0; d < DAYS; d++) {
      const seed = baseSeed + w * 100 + d;
      const rand = seededRandom(seed);
      let level = 0;
      if (rand > 0.55) level = 1;
      if (rand > 0.75) level = 2;
      if (rand > 0.88) level = 3;
      if (rand > 0.95) level = 4;
      const count = level === 0 ? 0 : Math.max(1, Math.round(rand * 13));
      week.push({
        level,
        count,
        label: `${count} contributions on week ${w + 1}, day ${d + 1}`,
      });
    }
    data.push(week);
  }
  return data;
}

export function GithubCalendarSection() {
  const contributions = useMemo(() => generateContributions(), []);
  const [tooltip, setTooltip] = useState<{
    label: string;
    left: number;
    top: number;
  } | null>(null);

  const totalContributions = useMemo(() => {
    if (!contributions.length) return 0;
    return contributions
      .flat()
      .reduce((sum, day) => sum + day.count, 0);
  }, [contributions]);

  return (
    <section className="profile-rail rail-box screen-line-after overflow-hidden px-4 py-7">
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[736px]">
          <div className="mb-2 grid grid-cols-12 px-1 text-sm text-muted-foreground">
            {MONTH_LABELS.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>

          <div className="relative">
            <div
              className="grid w-max grid-flow-col grid-rows-7 gap-[3px] px-1"
              aria-label="GitHub contribution heatmap"
              onMouseLeave={() => setTooltip(null)}
            >
            {contributions.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <span
                  key={`${weekIndex}-${dayIndex}`}
                  className="size-[11px] rounded-[2px] transition-transform duration-150 hover:scale-125"
                  style={{ backgroundColor: LEVEL_COLORS[day.level] }}
                  onMouseEnter={() =>
                    setTooltip({
                      label: day.label,
                      left: weekIndex * 14 + 6,
                      top: dayIndex * 14 - 42,
                    })
                  }
                />
              )),
            )}
            </div>

            {tooltip ? (
              <div
                className="pointer-events-none absolute z-20 rounded-lg bg-zinc-950 px-3 py-2 font-sans text-sm text-white opacity-100 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-opacity duration-150"
                style={{
                  left: tooltip.left,
                  top: tooltip.top,
                  transform: "translateX(-50%)",
                }}
              >
                <span className="whitespace-nowrap">{tooltip.label}</span>
                <span className="absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-zinc-950" />
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-sm text-muted-foreground">
            <p>
              {new Intl.NumberFormat("en-US").format(totalContributions)}{" "}
              contributions in 2026 on{" "}
              <a
                href="https://github.com/di-huynh-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4"
              >
                GitHub
              </a>
              .
            </p>
            <div className="flex items-center gap-2">
              <span>Less</span>
              {LEVEL_COLORS.map((color) => (
                <div
                  key={color}
                  className="size-3 rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
