"use client";

import { useI18n } from "@/components/i18n-provider";
import { tak, thump } from "@/lib/drum-audio";
import { trackEvent } from "@/lib/track";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Hit = "tung" | "cac";
type Note = { id: number; time: number; type: Hit; judged?: "perfect" | "good" | "miss" };
type Phase = "idle" | "playing" | "done";

const BPM = 104;
const EIGHTH = 60_000 / BPM / 2;
const LEAD_IN = 2_000;
const TRAVEL = 1_700;
const HIT_X = 14; // % from the left where notes must be hit
const PERFECT = 60;
const GOOD = 140;
const BEST_KEY = "drum-game:best";

// One bar = 8 eighth notes. T = tùng, c = cắc, . = rest. Gets busier towards the end.
const BARS = [
  "T...T...", "T...T.c.", "T.c.T.c.", "T..cT...",
  "T.c.T.cc", "T..cT.c.", "TT..T.c.", "T.ccT...",
  "T.c.TTc.", "TcT.TcT.", "T.ccT.cc", "TTc.TTcT",
];

function buildChart(): Note[] {
  const notes: Note[] = [];
  BARS.join("").split("").forEach((symbol, index) => {
    if (symbol === ".") return;
    notes.push({ id: index, time: LEAD_IN + index * EIGHTH, type: symbol === "T" ? "tung" : "cac" });
  });
  return notes;
}

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Private mode or blocked storage: the best score just isn't remembered.
  }
}

/** Rhythm mini game on the bronze drum. Opened by the "drumgame:open" window event. */
export function DrumGame() {
  const { t } = useI18n();
  const g = t.game;
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [now, setNow] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [feedback, setFeedback] = useState<{ id: number; text: string } | null>(null);
  const [pulse, setPulse] = useState<{ id: number; type: Hit } | null>(null);

  const notesRef = useRef<Note[]>([]);
  const startRef = useRef(0);
  const frameRef = useRef(0);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);
  const feedbackId = useRef(0);
  const returnFocus = useRef<HTMLElement | null>(null);
  const startButton = useRef<HTMLButtonElement>(null);

  const showFeedback = useCallback((text: string) => {
    setFeedback({ id: ++feedbackId.current, text });
  }, []);

  const finish = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setPhase("done");
    const final = scoreRef.current;
    trackEvent("drum_game_finish", { score: final });
    if (final > readBest()) {
      saveBest(final);
      setBest(final);
      setNewBest(true);
    }
  }, []);

  const loop = useCallback(() => {
    const elapsed = performance.now() - startRef.current;
    let missed = false;
    for (const note of notesRef.current) {
      if (!note.judged && elapsed - note.time > GOOD) {
        note.judged = "miss";
        missed = true;
      }
    }
    if (missed) {
      comboRef.current = 0;
      setCombo(0);
      showFeedback(g.miss);
    }
    setNow(elapsed);

    const last = notesRef.current[notesRef.current.length - 1];
    if (last && elapsed > last.time + 900) {
      finish();
      return;
    }
    frameRef.current = requestAnimationFrame(loop);
  }, [finish, g.miss, showFeedback]);

  const start = useCallback(() => {
    notesRef.current = buildChart();
    comboRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setNewBest(false);
    setFeedback(null);
    setPhase("playing");
    startRef.current = performance.now();
    frameRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const hit = useCallback(
    (type: Hit) => {
      if (type === "tung") thump(0.32);
      else tak();
      setPulse({ id: performance.now(), type });
      if (phase !== "playing") return;

      const elapsed = performance.now() - startRef.current;
      const target = notesRef.current.find(
        (note) => !note.judged && note.type === type && Math.abs(note.time - elapsed) <= GOOD,
      );
      if (!target) return;

      const offset = Math.abs(target.time - elapsed);
      target.judged = offset <= PERFECT ? "perfect" : "good";
      comboRef.current += 1;
      const multiplier = 1 + Math.floor(comboRef.current / 10) * 0.1;
      scoreRef.current += Math.round((target.judged === "perfect" ? 300 : 100) * multiplier);
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setMaxCombo((value) => Math.max(value, comboRef.current));
      showFeedback(target.judged === "perfect" ? g.perfect : g.good);
    },
    [g.good, g.perfect, phase, showFeedback],
  );

  const close = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setOpen(false);
    setPhase("idle");
    returnFocus.current?.focus();
  }, []);

  useEffect(() => {
    const onOpen = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setBest(readBest());
      setPhase("idle");
      setOpen(true);
    };
    window.addEventListener("drumgame:open", onOpen);
    return () => {
      window.removeEventListener("drumgame:open", onOpen);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    if (open && phase !== "playing") startButton.current?.focus();
  }, [open, phase]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return close();
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      if (phase === "playing" && [" ", "j", "k"].includes(key)) {
        event.preventDefault();
        hit("tung");
      } else if (phase === "playing" && ["d", "f"].includes(key)) {
        event.preventDefault();
        hit("cac");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, hit, open, phase]);

  const notes = notesRef.current;
  const judged = notes.filter((note) => note.judged);
  const hits = judged.filter((note) => note.judged !== "miss").length;
  const accuracy = judged.length ? Math.round((hits / notes.length) * 100) : 0;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="drum-game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 px-3 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={g.title}
            initial={{ y: 16, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            className="corner-ticks relative w-full max-w-2xl border border-edge bg-popover text-popover-foreground shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-edge px-4 py-3">
              <p className="font-display text-xl font-medium">
                {g.title}
                <span className="text-brand">.</span>
              </p>
              <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
                <span>
                  {g.score} <span className="text-foreground">{score}</span>
                </span>
                <span>
                  {g.combo} <span className="text-brand">×{combo}</span>
                </span>
                <span className="max-sm:hidden">
                  {g.best} <span className="text-foreground">{best}</span>
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label={g.close}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-edge transition-colors hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Lane */}
            <div className="dot-pattern relative h-44 overflow-hidden border-b border-edge sm:h-52">
              <div
                className="absolute inset-y-0 w-px bg-brand/40"
                style={{ left: `${HIT_X}%` }}
                aria-hidden="true"
              />
              <motion.div
                key={pulse?.id ?? "rest"}
                initial={{ scale: pulse ? 1.18 : 1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.18 }}
                className="absolute top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand/70 bg-background/70"
                style={{ left: `${HIT_X}%` }}
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 rounded-full bg-contain bg-center bg-no-repeat opacity-70"
                  style={{ backgroundImage: "url('/trongdong.png')" }}
                />
                <Image src="/round-avatar.webp" alt="" width={40} height={40} className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2" />
              </motion.div>

              {phase === "playing"
                ? notes.map((note) => {
                    if (note.judged && note.judged !== "miss") return null;
                    const progress = (note.time - now) / TRAVEL;
                    if (progress > 1.05 || progress < -0.25) return null;
                    const left = HIT_X + progress * (100 - HIT_X);
                    return (
                      <span
                        key={note.id}
                        className={`absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono text-[10px] font-semibold text-white shadow-md ${
                          note.type === "tung" ? "size-12 bg-brand" : "size-8 bg-bronze"
                        } ${note.judged === "miss" ? "opacity-30" : ""}`}
                        style={{ left: `${left}%` }}
                        aria-hidden="true"
                      >
                        {note.type === "tung" ? g.tung : g.cac}
                      </span>
                    );
                  })
                : null}

              <AnimatePresence>
                {feedback && phase === "playing" ? (
                  <motion.p
                    key={feedback.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="font-display absolute top-3 text-lg italic text-brand"
                    style={{ left: `${HIT_X + 8}%` }}
                    role="status"
                  >
                    {feedback.text}
                  </motion.p>
                ) : null}
              </AnimatePresence>

              {phase !== "playing" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-popover/85 px-6 text-center">
                  {phase === "done" ? (
                    <>
                      <p className="font-display text-3xl font-medium">
                        {newBest ? g.newBest : g.finished}
                      </p>
                      <p className="font-mono text-sm text-muted-foreground">
                        {g.result(score, accuracy, maxCombo)}
                      </p>
                    </>
                  ) : (
                    <p className="max-w-md font-mono text-sm leading-6 text-muted-foreground">
                      {g.howTo}
                    </p>
                  )}
                  <button
                    ref={startButton}
                    type="button"
                    onClick={start}
                    className="inline-flex h-10 items-center rounded-full bg-foreground px-5 font-mono text-sm text-background transition-colors hover:bg-brand"
                  >
                    {phase === "done" ? g.again : g.start}
                  </button>
                </div>
              ) : null}
            </div>

            {/* Touch / click controls */}
            <div className="grid grid-cols-2">
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  hit("cac");
                }}
                className="border-r border-edge py-5 font-mono text-sm transition-colors active:bg-bronze/20 hover:bg-bronze/10"
              >
                <span className="font-display text-xl text-bronze">{g.cac}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground max-sm:hidden">D · F</span>
              </button>
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  hit("tung");
                }}
                className="py-5 font-mono text-sm transition-colors active:bg-brand/20 hover:bg-brand/10"
              >
                <span className="font-display text-xl text-brand">{g.tung}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground max-sm:hidden">Space · J · K</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
