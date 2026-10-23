"use client";

import { useLocale } from "next-intl";
import { useId, useState } from "react";

// Interactive layout-shift score for one shift (used in the Core Web Vitals post).
// Assumes the element spans the viewport width and moves vertically.

const COPY = {
  en: {
    title: "Layout shift calculator",
    viewportW: "Viewport width",
    viewportH: "Viewport height",
    height: "Element height",
    move: "Moved down by",
    impact: "Impact fraction",
    distance: "Distance fraction",
    score: "Shift score",
    union: "union height",
    largest: "largest viewport side",
    good: "Good",
    needs: "Needs improvement",
    poor: "Poor",
  },
  vi: {
    title: "Máy tính layout shift",
    viewportW: "Chiều rộng viewport",
    viewportH: "Chiều cao viewport",
    height: "Chiều cao phần tử",
    move: "Bị đẩy xuống",
    impact: "Impact fraction",
    distance: "Distance fraction",
    score: "Điểm của lần dịch",
    union: "chiều cao vùng hợp",
    largest: "cạnh lớn nhất của viewport",
    good: "Tốt",
    needs: "Cần cải thiện",
    poor: "Kém",
  },
} as const;

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-xs text-soft">
      {label}
      <span className="flex items-center rounded-lg border border-line bg-background focus-within:border-cobalt">
        <input
          id={id}
          type="number"
          min={0}
          value={value}
          // Keep the raw text so clearing the field doesn't snap to "0" mid-edit.
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent px-2.5 py-1.5 font-mono text-sm text-ink tabular-nums outline-none"
        />
        <span className="pr-2.5 font-mono text-[0.7rem] text-faint">px</span>
      </span>
    </label>
  );
}

export function ClsCalculator() {
  const locale = useLocale();
  const t = COPY[locale === "vi" ? "vi" : "en"];
  const [fields, setFields] = useState({ vw: "1920", vh: "1080", height: "300", move: "148" });
  const set = (key: keyof typeof fields) => (value: string) =>
    setFields((current) => ({ ...current, [key]: value }));
  const num = (value: string) => Math.max(0, Number(value) || 0);
  const vw = num(fields.vw);
  const vh = num(fields.vh);
  const height = num(fields.height);
  const move = num(fields.move);

  // Union of the old and new position, clipped to the viewport height.
  const unionHeight = Math.min(vh, move < height ? height + move : height * 2);
  const impact = vh > 0 ? unionHeight / vh : 0;
  const largest = Math.max(vw, vh);
  const distance = largest > 0 ? Math.min(move / largest, 1) : 0;
  const score = impact * distance;
  const rating = score <= 0.1 ? "good" : score <= 0.25 ? "needs" : "poor";
  const ratingStyle = {
    good: "bg-topic-performance/12 text-topic-performance",
    needs: "bg-topic-growth/15 text-topic-growth",
    poor: "bg-destructive/10 text-destructive",
  }[rating];

  return (
    <div className="not-prose my-8 rounded-2xl border border-line bg-paper p-5 text-base md:p-6">
      <p className="eyebrow">{t.title}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NumberField label={t.viewportW} value={fields.vw} onChange={set("vw")} />
        <NumberField label={t.viewportH} value={fields.vh} onChange={set("vh")} />
        <NumberField label={t.height} value={fields.height} onChange={set("height")} />
        <NumberField label={t.move} value={fields.move} onChange={set("move")} />
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl border border-line bg-background p-3">
          <dt className="text-xs text-soft">{t.impact}</dt>
          <dd className="mt-1 font-mono text-lg text-ink tabular-nums">{impact.toFixed(3)}</dd>
          <dd className="font-mono text-[0.7rem] text-faint">
            {unionHeight} / {vh} ({t.union})
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-background p-3">
          <dt className="text-xs text-soft">{t.distance}</dt>
          <dd className="mt-1 font-mono text-lg text-ink tabular-nums">{distance.toFixed(3)}</dd>
          <dd className="font-mono text-[0.7rem] text-faint">
            {move} / {largest} ({t.largest})
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-background p-3">
          <dt className="text-xs text-soft">{t.score}</dt>
          <dd className="mt-1 flex items-center gap-2">
            <span className="font-mono text-lg font-semibold text-ink tabular-nums">{score.toFixed(3)}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ratingStyle}`}>{t[rating]}</span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
