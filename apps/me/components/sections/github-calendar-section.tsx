"use client";

import { useI18n } from "@/components/i18n-provider";
import { socials } from "@/lib/data/profile";
import type { Contributions } from "@/lib/github";
import { useMemo, useState } from "react";

const CELL = 14; // 11px cell + 3px gap
const SAMPLE_WEEKS = 53;

type Day = { level: number; count: number; label: string } | null;

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function sampleDays() {
  const days: { date: string; count: number; level: number }[] = [];
  const start = new Date(Date.UTC(2025, 0, 5)); // a Sunday
  for (let i = 0; i < SAMPLE_WEEKS * 7; i++) {
    const rand = seededRandom(42 + Math.floor(i / 7) * 100 + (i % 7));
    let level = 0;
    if (rand > 0.55) level = 1;
    if (rand > 0.75) level = 2;
    if (rand > 0.88) level = 3;
    if (rand > 0.95) level = 4;
    const date = new Date(start.getTime() + i * 86_400_000);
    days.push({
      date: date.toISOString().slice(0, 10),
      count: level === 0 ? 0 : Math.max(1, Math.round(rand * 13)),
      level,
    });
  }
  return days;
}

function formatDate(iso: string, dateLocale: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(dateLocale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildWeeks(
  days: { date: string; count: number; level: number }[],
  dayLabel: (count: number, date: string) => string,
  dateLocale: string,
) {
  const weeks: Day[][] = [];
  let week: Day[] = [];
  const firstDow = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  for (let i = 0; i < firstDow; i++) week.push(null);

  for (const d of days) {
    week.push({
      level: d.level,
      count: d.count,
      label: dayLabel(d.count, formatDate(d.date, dateLocale)),
    });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function monthLabels(days: { date: string }[], weekCount: number, dateLocale: string) {
  const labels: { month: string; week: number }[] = [];
  const firstDow = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  let lastMonth = -1;
  days.forEach((d, i) => {
    const date = new Date(`${d.date}T00:00:00Z`);
    const month = date.getUTCMonth();
    const week = Math.floor((i + firstDow) / 7);
    if (month !== lastMonth && date.getUTCDate() <= 7 && week < weekCount - 1) {
      labels.push({
        month: date.toLocaleDateString(dateLocale, { month: "short", timeZone: "UTC" }),
        week,
      });
      lastMonth = month;
    }
  });
  return labels;
}

export function GithubCalendarSection({ data }: { data?: Contributions | null }) {
  const { locale, t } = useI18n();
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US";
  const live = Boolean(data && data.days.length > 0);

  const days = useMemo(() => (live ? data!.days : sampleDays()), [live, data]);
  const weeks = useMemo(
    () => buildWeeks(days, t.calendar.day, numberLocale),
    [days, t, numberLocale],
  );
  const labels = useMemo(
    () => monthLabels(days, weeks.length, numberLocale),
    [days, weeks.length, numberLocale],
  );
  const total = useMemo(
    () => (live ? data!.total : days.reduce((sum, d) => sum + d.count, 0)),
    [live, data, days],
  );

  const [tooltip, setTooltip] = useState<{
    label: string;
    left: number;
    top: number;
  } | null>(null);

  return (
    <section className="profile-rail rail-box screen-line-after overflow-hidden px-4 py-7">
      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: weeks.length * CELL + 8 }}>
          <div
            className="relative mb-2 h-5 px-1 font-mono text-xs text-muted-foreground"
            aria-hidden="true"
          >
            {labels.map((item) => (
              <span
                key={`${item.month}-${item.week}`}
                className="absolute"
                style={{ left: item.week * CELL + 4 }}
              >
                {item.month}
              </span>
            ))}
          </div>

          <div className="relative">
            <div
              className="grid w-max grid-flow-col grid-rows-7 gap-[3px] px-1"
              role="img"
              aria-label={t.calendar.aria(total)}
              onMouseLeave={() => setTooltip(null)}
            >
              {weeks.map((week, weekIndex) =>
                week.map((day, dayIndex) =>
                  day ? (
                    <span
                      key={`${weekIndex}-${dayIndex}`}
                      className={`gh-level-${day.level} size-[11px] rounded-[2px] transition-transform duration-150 hover:scale-125`}
                      onMouseEnter={() =>
                        setTooltip({
                          label: day.label,
                          left: weekIndex * CELL + 10,
                          top: dayIndex * CELL - 42,
                        })
                      }
                    />
                  ) : (
                    <span key={`${weekIndex}-${dayIndex}`} className="size-[11px]" />
                  ),
                ),
              )}
            </div>

            {tooltip ? (
              <div
                className="pointer-events-none absolute z-20 rounded-lg bg-zinc-950 px-3 py-2 font-sans text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
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

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-muted-foreground">
            <p>
              {live ? (
                <>{t.calendar.live(new Intl.NumberFormat(numberLocale).format(total))}</>
              ) : (
                <>{t.calendar.sample}</>
              )}
              <a
                href={socials.github.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline decoration-brand/60 underline-offset-4 hover:text-brand"
              >
                GitHub
              </a>
              .
            </p>
            <div className="flex items-center gap-2">
              <span>{t.calendar.less}</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`gh-level-${level} size-3 rounded-[2px]`}
                />
              ))}
              <span>{t.calendar.more}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
