"use client";

import { progressKey } from "@/lib/explore";
import { mapArtwork } from "@/lib/explore/presentation";
import type {
  DialogueLine,
  ExploreMapData,
  Interaction,
  PlayerAction,
  Vec2,
} from "@/lib/explore/types";
import { chapters } from "@/lib/story";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ListChecks,
  Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./explore.css";

const ExploreStage = dynamic(() => import("./explore-stage"), {
  ssr: false,
  loading: () => (
    <div className="ex-loading" role="status">
      Đang mở cánh cổng ký ức…
    </div>
  ),
});

type Dialog = {
  lines: DialogueLine[];
  index: number;
  interaction?: Interaction;
  kind: "talk" | "intro" | "outro";
};

type Saved = { done: string[]; effects: string[]; finished?: boolean };

function load(id: string): Saved | null {
  try {
    const raw = window.localStorage.getItem(progressKey(id));
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(id: string, data: Saved) {
  try {
    window.localStorage.setItem(progressKey(id), JSON.stringify(data));
  } catch {
    // Progress is a convenience; ignore storage failures.
  }
}

/** Touch joystick: drag inside the ring to walk. */
function Joystick({
  value,
}: {
  value: React.RefObject<{ x: number; z: number }>;
}) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const origin = useRef<{ x: number; y: number } | null>(null);
  const R = 44;
  const move = (cx: number, cy: number) => {
    if (!origin.current) return;
    let dx = cx - origin.current.x;
    let dy = cy - origin.current.y;
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    setKnob({ x: dx, y: dy });
    value.current.x = dx / R;
    value.current.z = dy / R;
  };
  const end = () => {
    origin.current = null;
    setKnob({ x: 0, y: 0 });
    value.current.x = 0;
    value.current.z = 0;
  };
  return (
    <div
      className="ex-joystick"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        const rect = e.currentTarget.getBoundingClientRect();
        origin.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        move(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => move(e.clientX, e.clientY)}
      onPointerUp={end}
      onPointerCancel={end}
      aria-label="Cần điều khiển: kéo để đi"
      role="application"
    >
      <span style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}

const ELDERS = [
  "Ông",
  "Bà",
  "Cha",
  "Mẹ",
  "Cô",
  "Thầy",
  "Bác",
  "Chú",
  "Anh",
  "Chị",
];

/** Dĩ bows ("dạ") to elders and teachers, and waves to friends and kids. */
function defaultAction(
  it: Interaction,
  map: ExploreMapData,
): PlayerAction | undefined {
  const npc = it.npc ? map.npcs.find((n) => n.id === it.npc) : undefined;
  if (!npc) return undefined;
  return ELDERS.some((title) => npc.name.startsWith(title)) ? "bow" : "wave";
}

export function ExplorePage({ map }: { map: ExploreMapData }) {
  const chapterIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === map.chapterId),
  );
  const [done, setDone] = useState<Set<string>>(new Set());
  const [effects, setEffects] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);
  const [near, setNear] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const closedAt = useRef(0);
  const [questsOpen, setQuestsOpen] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [touch, setTouch] = useState(false);
  const joystick = useRef({ x: 0, z: 0 });
  const toastTimer = useRef(0);

  const nearInteraction = useMemo(
    () => map.interactions.find((i) => i.id === near) ?? null,
    [map, near],
  );
  const npcColor = useMemo(
    () => Object.fromEntries(map.npcs.map((n) => [n.name, n.look.shirt])),
    [map],
  );

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    setQuestsOpen(window.innerWidth >= 700);
    const saved = load(map.id);
    if (saved) {
      setDone(new Set(saved.done));
      setEffects(new Set(saved.effects));
      setFinished(Boolean(saved.finished));
    } else {
      setDialog({ lines: map.intro, index: 0, kind: "intro" });
    }
  }, [map]);

  useEffect(() => {
    save(map.id, { done: [...done], effects: [...effects], finished });
  }, [map.id, done, effects, finished]);

  const say = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const [gesture, setGesture] = useState<{
    kind: PlayerAction;
    nonce: number;
  } | null>(null);
  const play = useCallback(
    (kind: PlayerAction) =>
      setGesture((g) => ({ kind, nonce: (g?.nonce ?? 0) + 1 })),
    [],
  );

  const open = useCallback(
    (id: string) => {
      const it = map.interactions.find((i) => i.id === id);
      if (!it) return;
      setDialog({ lines: it.lines, index: 0, interaction: it, kind: "talk" });
      const action = it.action ?? defaultAction(it, map);
      if (action) play(action);
    },
    [map, play],
  );

  const advance = useCallback(() => {
    const current = dialog;
    if (!current) return;
    if (current.index < current.lines.length - 1) {
      setDialog({ ...current, index: current.index + 1 });
      return;
    }
    // Finished this conversation.
    if (current.kind === "outro") {
      setDialog(null);
      closedAt.current = performance.now();
      setFinished(true);
      setShowDone(true);
      return;
    }
    let next: Dialog | null = null;
    const it = current.interaction;
    if (it) {
      const effect = it.effect;
      if (effect) setEffects((prev) => new Set(prev).add(effect));
      if (it.quest && !done.has(it.quest)) {
        const nextDone = new Set(done).add(it.quest);
        setDone(nextDone);
        play("cheer");
        const quest = map.quests.find((q) => q.id === it.quest);
        say(
          it.reward
            ? `${it.reward} ✦ ${quest?.label ?? ""}`
            : `Đã xong: ${quest?.label ?? ""}`,
        );
        if (nextDone.size === map.quests.length && !finished) {
          next = { lines: map.outro, index: 0, kind: "outro" };
        }
      }
    }
    if (!next) closedAt.current = performance.now();
    setDialog(next);
  }, [dialog, done, finished, map, play, say]);

  /* E / Enter / Space */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!["KeyE", "Enter", "Space"].includes(e.code)) return;
      const el = e.target as HTMLElement | null;
      if (el && el.tagName === "BUTTON" && e.code !== "KeyE") return;
      e.preventDefault();
      if (dialog) advance();
      // A short pause after a conversation ends, so a repeated key press
      // doesn't immediately reopen the same conversation.
      else if (near && performance.now() - closedAt.current > 650) open(near);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, near, advance, open]);

  const line = dialog ? dialog.lines[dialog.index] : null;
  const lookTarget: Vec2 | null = dialog?.interaction
    ? (dialog.interaction.focus ??
      map.npcs.find((n) => n.id === dialog.interaction?.npc)?.at ??
      dialog.interaction.at)
    : null;

  return (
    <main
      className="ex"
      lang="vi"
      style={
        {
          "--ex-top": map.sky.top,
          "--ex-bottom": map.sky.bottom,
        } as React.CSSProperties
      }
    >
      {/* "Cánh cổng ký ức": a painted cover while the 3D world loads */}
      <div
        className="ex-cover"
        data-ready={ready}
        style={{ backgroundImage: `url(${mapArtwork(map.id)})` }}
        aria-hidden={ready}
      >
        <div className="ex-cover-inner">
          <p>Bước vào chặng {String(chapterIndex + 1).padStart(2, "0")}</p>
          <h2>{map.title}</h2>
          <em>{map.subtitle}</em>
          <span className="ex-cover-status" role="status">
            <span className="ex-cover-dot" /> Đang mở cánh cổng ký ức…
          </span>
        </div>
      </div>

      <div className="ex-canvas">
        <ExploreStage
          map={map}
          effects={effects}
          frozen={dialog !== null || showDone}
          reduced={reduced}
          joystick={joystick}
          lookTarget={lookTarget}
          onNearChange={setNear}
          onArrive={open}
          onReady={markReady}
          doneQuests={done}
          talkingTo={dialog?.interaction?.npc ?? null}
          playerAction={gesture}
        />
      </div>

      {/* top bar */}
      <header className="ex-top">
        <Link href={`/story?c=${chapterIndex}`} className="ex-back">
          <ArrowLeft size={16} /> Về hành trình
        </Link>
        <div className="ex-title">
          <p>
            Bước vào{" "}
            <span>chặng {String(chapterIndex + 1).padStart(2, "0")}</span>
          </p>
          <h1>
            {map.title}
            <em> · {map.subtitle}</em>
          </h1>
        </div>
      </header>

      {/* quests */}
      <aside className="ex-quests" data-open={questsOpen}>
        <button
          type="button"
          onClick={() => setQuestsOpen((v) => !v)}
          aria-expanded={questsOpen}
        >
          <ListChecks size={16} />
          Việc cần làm
          <span className="ex-quests-count">
            {done.size}/{map.quests.length}
          </span>
        </button>
        {questsOpen ? (
          <ol>
            {map.quests.map((q) => (
              <li key={q.id} data-done={done.has(q.id)}>
                <span className="ex-check">
                  {done.has(q.id) ? <Check size={12} /> : null}
                </span>
                {q.label}
              </li>
            ))}
          </ol>
        ) : null}
        <span className="ex-quests-bar" aria-hidden="true">
          <span
            style={{ transform: `scaleX(${done.size / map.quests.length})` }}
          />
        </span>
      </aside>

      {/* interaction prompt */}
      <AnimatePresence>
        {nearInteraction && !dialog && !showDone ? (
          <motion.button
            key={nearInteraction.id}
            type="button"
            className="ex-prompt"
            onClick={() => open(nearInteraction.id)}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <kbd>{touch ? "Chạm" : "E"}</kbd>
            {nearInteraction.label}
            {nearInteraction.quest && done.has(nearInteraction.quest) ? (
              <Check size={14} />
            ) : null}
          </motion.button>
        ) : null}
      </AnimatePresence>

      {/* dialogue */}
      <AnimatePresence>
        {line ? (
          <motion.div
            className="ex-dialog"
            role="dialog"
            aria-live="polite"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22 }}
            onClick={advance}
          >
            {line.who ? (
              <p className="ex-speaker">
                <span
                  className="ex-avatar"
                  style={{
                    background:
                      line.who === "Dĩ"
                        ? "hsl(var(--brand))"
                        : (npcColor[line.who] ?? "#6b5a4a"),
                  }}
                >
                  {line.who.slice(0, 1)}
                </span>
                {line.who}
              </p>
            ) : (
              <p className="ex-speaker ex-narrator">
                <Sparkles size={13} /> Kể chuyện
              </p>
            )}
            <motion.p
              key={`${dialog?.index}-${line.text}`}
              className="ex-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {line.text}
            </motion.p>
            <button
              type="button"
              className="ex-next"
              onClick={(e) => {
                e.stopPropagation();
                advance();
              }}
              autoFocus
            >
              {dialog && dialog.index < dialog.lines.length - 1
                ? "Tiếp"
                : "Xong"}
              <ChevronRight size={15} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast ? (
          <motion.p
            key={toast}
            className="ex-toast"
            role="status"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {toast}
          </motion.p>
        ) : null}
      </AnimatePresence>

      {/* controls */}
      {dialog || showDone ? null : touch ? (
        <Joystick value={joystick} />
      ) : (
        <p className="ex-help">
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd> hoặc mũi tên để đi · <kbd>Shift</kbd> chạy · <kbd>E</kbd>{" "}
          tương tác · nhấp chuột để đi tới
        </p>
      )}

      {/* completion */}
      <AnimatePresence>
        {showDone ? (
          <motion.div
            className="ex-done-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="ex-done"
              initial={{ y: 30, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              aria-labelledby="ex-done-title"
            >
              <span
                className="ex-done-art"
                style={{ backgroundImage: `url(${mapArtwork(map.id)})` }}
                aria-hidden="true"
              />
              <span className="ex-done-seal">✦</span>
              <p className="ex-done-kicker">Đã trọn một miền ký ức</p>
              <h2 id="ex-done-title">{map.title}</h2>
              <ul>
                {map.quests.map((q) => (
                  <li key={q.id}>
                    <Check size={13} /> {q.label}
                  </li>
                ))}
              </ul>
              <div>
                <button type="button" onClick={() => setShowDone(false)}>
                  Ở lại thêm
                </button>
                <Link href={`/story?c=${chapterIndex}`} className="ex-primary">
                  Về hành trình <ChevronRight size={15} />
                </Link>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
