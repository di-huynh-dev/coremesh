"use client";

import { useI18n } from "@/components/i18n-provider";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

/** My working day: 09:00–18:00 in Ho Chi Minh City (UTC+7), expressed in UTC hours. */
const MY_OFFSET = 7;
const WORK_START = 9;
const WORK_END = 18;

type Overlap = { zone: string; hours: number; from: string; to: string; same: boolean };

function hhmm(utcHour: number, offsetHours: number) {
  const minutes = Math.round((((utcHour + offsetHours) % 24) + 24) % 24 * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function computeOverlap(): Overlap {
  const offset = -new Date().getTimezoneOffset() / 60;
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  const mine = [WORK_START - MY_OFFSET, WORK_END - MY_OFFSET];

  // Try the visitor's day shifted by ±1 day so overlaps across midnight UTC are found.
  let best = { hours: 0, start: 0, end: 0 };
  for (const shift of [-24, 0, 24]) {
    const start = Math.max(mine[0], WORK_START - offset + shift);
    const end = Math.min(mine[1], WORK_END - offset + shift);
    if (end - start > best.hours) best = { hours: end - start, start, end };
  }

  return {
    zone,
    hours: Math.round(best.hours * 2) / 2,
    from: hhmm(best.start, offset),
    to: hhmm(best.end, offset),
    same: offset === MY_OFFSET,
  };
}

/** "My working hours overlap yours by N hours", computed in the visitor's own time zone. */
export function TimezoneOverlap() {
  const { t } = useI18n();
  const [overlap, setOverlap] = useState<Overlap | null>(null);

  // Time zone is only known in the browser; render nothing on the server.
  useEffect(() => setOverlap(computeOverlap()), []);

  if (!overlap) return null;
  const z = t.contact.timezone;

  return (
    <div className="flex items-start gap-3">
      <span className="mini-icon">
        <Clock className="size-4" />
      </span>
      <span>
        {overlap.same
          ? z.same
          : overlap.hours > 0
            ? z.overlap(overlap.hours, overlap.from, overlap.to)
            : z.none}
        <span className="block text-xs text-muted-foreground/70">{overlap.zone}</span>
      </span>
    </div>
  );
}
