"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const COLORS = ["#d92d1a", "#e0a526", "#fde047", "#f97316", "#ffffff"];

type Piece = {
  id: number;
  x: number;
  rise: number;
  drift: number;
  rotate: number;
  color: string;
  delay: number;
  star: boolean;
};

function makePieces(): Piece[] {
  return Array.from({ length: 44 }, (_, id) => ({
    id,
    x: Math.random() * 100,
    rise: 35 + Math.random() * 45,
    drift: (Math.random() - 0.5) * 220,
    rotate: (Math.random() - 0.5) * 900,
    color: COLORS[id % COLORS.length],
    delay: Math.random() * 0.25,
    star: id % 5 === 0,
  }));
}

/** Konami code (or the palette's "Drum frenzy") → confetti + fast-spinning drum. */
export function EasterEgg() {
  const [run, setRun] = useState(0);
  const pieces = useMemo(() => (run ? makePieces() : []), [run]);

  useEffect(() => {
    let progress = 0;
    const trigger = () => {
      setRun((n) => n + 1);
      window.dispatchEvent(new Event("drum:frenzy"));
      window.setTimeout(() => setRun(0), 3200);
    };

    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        trigger();
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("easter:run", trigger);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("easter:run", trigger);
    };
  }, []);

  return (
    <AnimatePresence>
      {run ? (
        <motion.div
          key="egg"
          aria-hidden="true"
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
        >
          {pieces.map((piece) => (
            <motion.span
              key={piece.id}
              initial={{ left: `${piece.x}%`, top: "105%", rotate: 0, opacity: 1 }}
              animate={{
                top: `${100 - piece.rise}%`,
                x: piece.drift,
                rotate: piece.rotate,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 2.6, delay: piece.delay, ease: "easeOut" }}
              style={{ color: piece.color, backgroundColor: piece.star ? undefined : piece.color }}
              className={
                piece.star
                  ? "absolute text-xl leading-none"
                  : "absolute h-3 w-2 rounded-[1px]"
              }
            >
              {piece.star ? "★" : null}
            </motion.span>
          ))}
          <motion.p
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="font-display absolute left-1/2 top-24 -translate-x-1/2 rounded-full bg-foreground px-5 py-2 text-lg whitespace-nowrap text-background italic shadow-xl"
          >
            Bạn tìm ra rồi! 🥁
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
