"use client";

import { LocalClock } from "@/components/ui/local-clock";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Ripple = { id: number; x: number; y: number };

let audioCtx: AudioContext | undefined;

/** Synthesised drum thump — no audio asset, only runs after a user click. */
function thump() {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx ??= new Ctor();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(58, now + 0.35);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.72);
  } catch {
    // Audio is a nicety; ignore unsupported/blocked contexts.
  }
}

export function DrumBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [sound, setSound] = useState(false);
  const [frenzy, setFrenzy] = useState(false);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(px, { stiffness: 120, damping: 14 });
  const rotateX = useSpring(py, { stiffness: 120, damping: 14 });

  const addRipple = useCallback((x: number, y: number) => {
    const id = ++idRef.current;
    setRipples((list) => [...list.slice(-5), { id, x, y }]);
    window.setTimeout(
      () => setRipples((list) => list.filter((r) => r.id !== id)),
      1500,
    );
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    const onFrenzy = () => {
      setFrenzy(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setFrenzy(false), 4200);
    };
    window.addEventListener("drum:frenzy", onFrenzy);
    return () => {
      window.removeEventListener("drum:frenzy", onFrenzy);
      window.clearTimeout(timer);
    };
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    addRipple(event.clientX - rect.left, event.clientY - rect.top);
    if (sound) thump();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    px.set(((event.clientX - rect.left) / rect.width - 0.5) * 22);
    py.set(-((event.clientY - rect.top) / rect.height - 0.5) * 22);
  };

  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={containerRef}
      data-cursor="Gõ trống"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="dot-pattern relative flex h-72 cursor-pointer touch-manipulation items-center justify-center overflow-hidden select-none"
    >
      <motion.div
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        className="pointer-events-none absolute left-1/2 top-1/2 size-[460px] -translate-x-1/2 -translate-y-1/2 opacity-[0.16] mix-blend-multiply dark:opacity-[0.14] dark:mix-blend-screen"
      >
        <div
          className="trongdong-spin absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/trongdong.png')",
            animationDuration: frenzy ? "2.4s" : undefined,
          }}
          aria-hidden="true"
        />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--brand)/0.14),transparent_55%)]"
        aria-hidden="true"
      />

      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ left: ripple.x - 180, top: ripple.y - 180 }}
            className="pointer-events-none absolute size-[360px] rounded-full border-2 border-brand/60"
          />
        ))}
      </AnimatePresence>

      <div className="pointer-events-none relative flex size-24 items-center justify-center">
        <span className="drum-ring absolute inset-0 rounded-full border border-brand/50" />
        <span
          className="drum-ring absolute inset-0 rounded-full border border-brand/50"
          style={{ animationDelay: "1.5s" }}
        />
        <span
          className="drum-ring absolute inset-0 rounded-full border border-brand/50"
          style={{ animationDelay: "3s" }}
        />
        <Image
          src="/round-avatar.svg"
          alt="Huynh Tien Di monogram"
          width={64}
          height={64}
          className="relative size-16"
          priority
        />
      </div>

      <p className="pointer-events-none absolute left-4 top-3 font-mono text-[11px] tracking-wider text-muted-foreground">
        10°46′N · 106°42′E
      </p>
      <LocalClock className="pointer-events-none absolute right-4 top-3 font-mono text-[11px] tracking-wider text-foreground" />
      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground max-sm:hidden">
        Sài Gòn / Việt Nam
      </p>
      <p className="pointer-events-none absolute bottom-3 right-4 font-mono text-[11px] uppercase tracking-[0.22em] text-brand">
        est. 2022
      </p>

      <button
        type="button"
        aria-pressed={sound}
        aria-label={sound ? "Mute drum sound" : "Enable drum sound"}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setSound((on) => !on)}
        className="absolute bottom-2.5 left-1/2 inline-flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-edge bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground max-sm:hidden"
      >
        {sound ? (
          <Volume2 className="size-3 text-brand" />
        ) : (
          <VolumeX className="size-3" />
        )}
      </button>
    </div>
  );
}
