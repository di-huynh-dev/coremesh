"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/*
 * Scroll-triggered reveals, driven by markup:
 *
 *   [data-fx-head]            a block that animates when 25% of it is visible:
 *                             "hero"/"page" (hidden pre-hydration), "section", or any other name
 *     [data-fx="line"]        heading split into visual lines that rise into view
 *     [data-fx="item"]        fades up 10px, staggered after the previous element
 *     [data-fx="fade"]        fades in (portraits, stats, charts)
 *   siblings of a section head fade in afterwards, unless marked [data-fx-skip]
 *   [data-timeline]           bars grow once its head has played
 *   [data-method]             principle steps draw in sequence
 *   [data-tip]                floating tooltip (title in data-tip, meta in data-tip-meta)
 *
 * Classes are removed once a reveal finishes, so React-owned DOM ends up untouched.
 *
 * Render it inside the page that uses it, not in a layout: Next.js hydrates page
 * segments separately, and splitting headings before the page hydrates causes a
 * hydration mismatch.
 */

const LINE_STAGGER = 90;
const ITEM_STAGGER = 90;
const FADE_STAGGER = 120;

interface Reveal {
  head: HTMLElement;
  heading?: HTMLElement;
  original?: Node[];
  body: HTMLElement[];
  done: number;
  finished: boolean;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Splits a heading into the words of each rendered line. */
function measureLines(heading: HTMLElement) {
  const words = (heading.textContent ?? "").trim().split(/\s+/).filter(Boolean);
  const spans = words.map((word) => {
    const span = document.createElement("span");
    span.textContent = word;
    return span;
  });
  heading.replaceChildren(
    ...spans.flatMap((span, i) => (i ? [document.createTextNode(" "), span] : [span])),
  );

  const lines: { top: number; words: string[] }[] = [];
  spans.forEach((span) => {
    const last = lines[lines.length - 1];
    if (!last || Math.abs(last.top - span.offsetTop) > 4) {
      lines.push({ top: span.offsetTop, words: [] });
    }
    lines[lines.length - 1]!.words.push(span.textContent ?? "");
  });
  return lines.map((line) => line.words.join(" "));
}

function prepare(head: HTMLElement): Reveal {
  let delay = 0;
  let heading: HTMLElement | undefined;
  let original: Node[] | undefined;

  head.querySelectorAll<HTMLElement>("[data-fx]").forEach((el) => {
    const kind = el.dataset.fx;

    if (kind === "line" && !heading) {
      heading = el;
      original = [...el.childNodes];
      const lines = measureLines(el);
      el.replaceChildren(
        ...lines.flatMap((text, i) => {
          const outer = document.createElement("span");
          const inner = document.createElement("span");
          outer.className = "rv-line";
          inner.className = "rv-in";
          inner.style.setProperty("--d", `${delay + i * LINE_STAGGER}ms`);
          inner.textContent = text;
          outer.append(inner);
          return i ? [document.createTextNode(" "), outer] : [outer];
        }),
      );
      el.classList.add("rv");
      delay += lines.length * LINE_STAGGER + 160;
      return;
    }

    el.classList.add(kind === "fade" ? "fx-fade" : "fx-item");
    el.style.setProperty("--d", `${delay}ms`);
    delay += kind === "fade" ? FADE_STAGGER : ITEM_STAGGER;
  });

  const isSection = head.dataset.fxHead === "section";
  const body = isSection
    ? ([...(head.parentElement?.children ?? [])].filter(
        (el) => el !== head && !el.hasAttribute("data-fx-skip"),
      ) as HTMLElement[])
    : [];
  body.forEach((el) => {
    el.classList.add("fx-body");
    el.style.setProperty("--d", `${delay + 120}ms`);
  });

  return { head, heading, original, body, done: delay + 700, finished: false };
}

function finish(reveal: Reveal) {
  if (reveal.finished) return;
  reveal.finished = true;

  if (reveal.heading && reveal.original) {
    reveal.heading.replaceChildren(...reveal.original);
    reveal.heading.classList.remove("rv");
  }
  reveal.head.querySelectorAll<HTMLElement>(".fx-item, .fx-fade").forEach((el) => {
    el.classList.remove("fx-item", "fx-fade");
    el.style.removeProperty("--d");
  });
  reveal.body.forEach((el) => {
    el.classList.remove("fx-body", "fx-go");
    el.style.removeProperty("--d");
  });
  reveal.head.classList.remove("fx-go");
}

function createTooltip() {
  // Created on first hover: appending to <body> while Next.js is still streaming
  // HTML into it can break hydration.
  let tip: HTMLDivElement | null = null;
  const ensureTip = () => {
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "fx-tip";
      tip.setAttribute("role", "status");
      document.body.appendChild(tip);
    }
    return tip;
  };

  const show = (target: HTMLElement) => {
    const tip = ensureTip();
    tip.replaceChildren();
    const meta = target.dataset.tipMeta;
    if (meta) {
      const el = document.createElement("span");
      el.className = "fx-tip-meta";
      el.textContent = meta;
      tip.append(el);
    }
    const title = document.createElement("strong");
    title.textContent = target.dataset.tip ?? "";
    tip.append(title);

    const rows = target.dataset.tipRows
      ? (JSON.parse(target.dataset.tipRows) as { label: string; color: string }[])
      : [];
    if (rows.length > 0) {
      const list = document.createElement("span");
      list.className = "fx-tip-rows";
      rows.forEach((row) => {
        const line = document.createElement("span");
        const dot = document.createElement("i");
        dot.style.background = row.color;
        line.append(dot, row.label);
        list.append(line);
      });
      tip.append(list);
    }

    tip.hidden = false;
    const anchor = target.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    const x = Math.min(
      Math.max(8, anchor.left + anchor.width / 2 - box.width / 2),
      window.innerWidth - box.width - 8,
    );
    const y =
      anchor.top - box.height - 12 < 8 ? anchor.bottom + 12 : anchor.top - box.height - 12;
    tip.style.transform = `translate(${x}px, ${y}px)`;
  };

  const over = (event: Event) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>("[data-tip]");
    if (target) show(target);
  };
  const out = (event: Event) => {
    const related = (event as PointerEvent | FocusEvent).relatedTarget as Element | null;
    if (tip && !related?.closest("[data-tip]")) tip.hidden = true;
  };

  document.addEventListener("pointerover", over);
  document.addEventListener("pointerout", out);
  document.addEventListener("focusin", over);
  document.addEventListener("focusout", out);

  return () => {
    document.removeEventListener("pointerover", over);
    document.removeEventListener("pointerout", out);
    document.removeEventListener("focusin", over);
    document.removeEventListener("focusout", out);
    tip?.remove();
  };
}

export function MotionController() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const removeTooltip = createTooltip();

    if (reducedMotion()) {
      root.classList.remove("fx-pre");
      return removeTooltip;
    }

    let cancelled = false;
    const reveals: Reveal[] = [];
    const observers: IntersectionObserver[] = [];
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    const play = (reveal: Reveal) => {
      reveal.head.classList.add("fx-go");
      reveal.body.forEach((el) => el.classList.add("fx-go"));
      reveal.head.dispatchEvent(new CustomEvent("fx:play"));
      later(() => finish(reveal), reveal.done + 900);
    };

    const setup = () => {
      if (cancelled) return;

      const heads = [...document.querySelectorAll<HTMLElement>("[data-fx-head]")].filter(
        // Heads already scrolled past (e.g. restored scroll position) stay as they are.
        (head) => head.getBoundingClientRect().bottom > 0,
      );
      heads.forEach((head) => reveals.push(prepare(head)));
      root.classList.remove("fx-pre");

      const headObserver = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            headObserver.unobserve(entry.target);
            const reveal = reveals.find((r) => r.head === entry.target);
            if (reveal) play(reveal);
          }),
        { threshold: 0.25 },
      );
      reveals.forEach((reveal) => headObserver.observe(reveal.head));
      observers.push(headObserver);

      const timeline = document.querySelector<HTMLElement>("[data-timeline]");
      if (timeline) {
        timeline.classList.add("tl-pre");
        const grow = () => {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                timeline.classList.add("tl-in");
                observer.disconnect();
              }
            },
            { threshold: 0.3 },
          );
          observer.observe(timeline);
          observers.push(observer);
        };
        const owner = timeline.closest<HTMLElement>("[data-fx-head]");
        if (owner && reveals.some((r) => r.head === owner)) {
          owner.addEventListener(
            "fx:play",
            () => later(grow, parseInt(timeline.style.getPropertyValue("--d")) || 0),
            { once: true },
          );
        } else {
          grow();
        }
        later(() => timeline.classList.add("tl-in"), 3000);
      }

      document.querySelectorAll<HTMLElement>("[data-method]").forEach((method) => {
        method.classList.add("m-pre");
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              method.classList.add("m-in");
              observer.disconnect();
            }
          },
          { rootMargin: "0px 0px -25% 0px" },
        );
        observer.observe(method);
        observers.push(observer);
      });
    };

    // Wait for the streamed document to finish parsing, then for web fonts so
    // line breaks are measured correctly.
    const start = () => {
      if (document.fonts.status === "loaded") setup();
      else document.fonts.ready.then(setup);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }

    return () => {
      cancelled = true;
      document.removeEventListener("DOMContentLoaded", start);
      observers.forEach((observer) => observer.disconnect());
      timers.forEach((id) => window.clearTimeout(id));
      reveals.forEach(finish);
      document
        .querySelectorAll(".tl-pre, .tl-in, .m-pre, .m-in")
        .forEach((el) => el.classList.remove("tl-pre", "tl-in", "m-pre", "m-in"));
      root.classList.remove("fx-pre");
      removeTooltip();
    };
  }, [pathname]);

  return null;
}

/** Inline, render-blocking: hides above-the-fold heads until MotionController runs. */
export const motionPreScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('fx-pre');setTimeout(function(){d.classList.remove('fx-pre')},2500)}}catch(e){}`;
