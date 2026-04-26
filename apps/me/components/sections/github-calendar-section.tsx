"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const WEEKS = 52;
const DAYS = 7;

// Seeded pseudo-random generator for deterministic output
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function generateContributions() {
  const data: number[][] = [];
  const baseSeed = 42; // Fixed seed for consistency
  for (let w = 0; w < WEEKS; w++) {
    const week: number[] = [];
    for (let d = 0; d < DAYS; d++) {
      const seed = baseSeed + w * 100 + d;
      const rand = seededRandom(seed);
      let level = 0;
      if (rand > 0.55) level = 1;
      if (rand > 0.75) level = 2;
      if (rand > 0.88) level = 3;
      if (rand > 0.95) level = 4;
      week.push(level);
    }
    data.push(week);
  }
  return data;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_LABELS = ["Mon", "Wed", "Fri"];
const MONTH_LABELS = MONTHS.slice(0, 10);

export function GithubCalendarSection() {
  const contributions = useMemo(() => generateContributions(), []);

  const totalContributions = useMemo(() => {
    if (!contributions.length) return 0;
    return contributions
      .flat()
      .reduce((sum, level) => sum + (level > 0 ? level * 3 : 0), 0);
  }, [contributions]);

  const getLevelClass = (level: number) => {
    switch (level) {
      case 0:
        return "gh-level-0";
      case 1:
        return "gh-level-1";
      case 2:
        return "gh-level-2";
      case 3:
        return "gh-level-3";
      case 4:
        return "gh-level-4";
      default:
        return "gh-level-0";
    }
  };

  // Calculate month positions
  const monthPositions = useMemo(() => {
    const positions: { month: string; x: number }[] = [];
    MONTH_LABELS.forEach((month, i) => {
      positions.push({ month, x: (i / MONTH_LABELS.length) * 100 });
    });
    return positions;
  }, []);

  return (
    <section className="py-12 section-divider">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono-data text-muted-foreground">
              GitHub Contributions
            </h2>
            <span className="text-xs text-muted-foreground">
              {totalContributions} contributions in the last year
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-border p-4 md:p-6">
            <div className="w-full max-w-full">
              {/* Month labels */}
              <div className="relative mb-3 ml-8 h-4 md:ml-9">
                {monthPositions.map((pos, i) => (
                  <span
                    key={i}
                    className="absolute text-[10px] font-mono-data text-muted-foreground"
                    style={{ left: `${pos.x}%` }}
                  >
                    {pos.month}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-2 md:grid-cols-[28px_minmax(0,1fr)]">
                {/* Day labels */}
                <div className="flex h-[52px] flex-col justify-between py-0.5 md:h-[60px]">
                  {DAY_LABELS.map((day) => (
                    <span
                      key={day}
                      className="text-[9px] font-mono-data text-muted-foreground"
                    >
                      {day}
                    </span>
                  ))}
                </div>

                {/* Contribution grid */}
                <div
                  className="grid min-w-0 gap-[3px] md:gap-[4px]"
                  style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}
                >
                  {contributions.map((week, weekIndex) => (
                    <div
                      key={weekIndex}
                      className="grid gap-[3px] md:gap-[4px]"
                      style={{ gridTemplateRows: `repeat(${DAYS}, minmax(0, 1fr))` }}
                    >
                      {week.map((level, dayIndex) => (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`aspect-square w-full rounded-[3px] ${getLevelClass(level)} transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1 hover:ring-offset-background`}
                          title={`${level} contributions`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-3">
                <span className="text-[10px] text-muted-foreground">Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2.5 w-2.5 rounded-[3px] ${getLevelClass(level)}`}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground">More</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
