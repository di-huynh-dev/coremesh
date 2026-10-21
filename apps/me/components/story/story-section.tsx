"use client";

import { exploreMapForChapter } from "@/lib/explore";
import { mapArtwork } from "@/lib/explore/presentation";
import { chapters, type StoryMemory } from "@/lib/story";
import {
  ATMOSPHERE,
  CHAPTER_COUNT,
  SVH_PER_CHAPTER,
  atmosphereAt,
  chapterPosition,
  chapterScroll,
  mixHex,
} from "@/lib/story-journey";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  Footprints,
  MapPin,
  RotateCcw,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import "./story.css";

const StoryStage = dynamic(() => import("./story-stage"), { ssr: false });

const pad = (value: number) => String(value + 1).padStart(2, "0");
const ease = [0.22, 1, 0.36, 1] as const;

/* ---------------- pieces ---------------- */

/** Red seal (chu triện) stamped with the chapter number. */
function Seal({ index }: { index: number }) {
  return (
    <motion.span
      className="jr-seal"
      initial={{ scale: 1.6, rotate: -18, opacity: 0 }}
      animate={{ scale: 1, rotate: -6, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 17, delay: 0.05 }}
      aria-hidden="true"
    >
      <span className="jr-seal-label">CHẶNG</span>
      <span className="jr-seal-number">{pad(index)}</span>
    </motion.span>
  );
}

/** Title revealed word by word, like ink pulled across paper. */
function InkTitle({ text }: { text: string }) {
  let n = 0;
  return (
    <h2 className="jr-title">
      {text.split("\n").map((line, li) => (
        <span className="jr-title-line" key={li}>
          {line.split(" ").map((word, wi) => {
            const delay = 0.12 + n++ * 0.055;
            return (
              <span key={wi}>
                <span className="jr-word">
                  <motion.span
                    initial={{ y: "105%", rotate: 4 }}
                    animate={{ y: "0%", rotate: 0 }}
                    transition={{ duration: 0.7, delay, ease }}
                  >
                    {word}
                  </motion.span>
                </span>{" "}
              </span>
            );
          })}
        </span>
      ))}
    </h2>
  );
}

const RAIL_H = 520;
const RAIL_STEP = RAIL_H / (CHAPTER_COUNT - 1);
const railX = (i: number) =>
  26 + (i % 2 === 0 ? 0 : 22) + (i % 4 === 3 ? -10 : 0);
const RAIL_PATH = chapters
  .map((_, i) => {
    const x = railX(i);
    const y = 10 + i * RAIL_STEP;
    if (i === 0) return `M ${x} ${y}`;
    const px = railX(i - 1);
    const py = 10 + (i - 1) * RAIL_STEP;
    return `C ${px} ${py + RAIL_STEP * 0.55}, ${x} ${y - RAIL_STEP * 0.55}, ${x} ${y}`;
  })
  .join(" ");

/* ---------------- section ---------------- */

export function StorySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railPathRef = useRef<SVGPathElement>(null);
  const railDotRef = useRef<SVGGElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const position = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [walking, setWalking] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [layout, setLayout] = useState<"wide" | "narrow">("wide");
  const [visible, setVisible] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [note, setNote] = useState<{
    chapter: number;
    memory: StoryMemory;
  } | null>(null);
  const current = chapters[chapter];
  const memory = note?.chapter === chapter ? note.memory : null;
  const explorable = exploreMapForChapter(current.id);

  /* environment */
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wideQuery = window.matchMedia("(min-width: 900px)");
    const update = () => {
      setReduced(motionQuery.matches);
      setLayout(wideQuery.matches ? "wide" : "narrow");
    };
    update();
    motionQuery.addEventListener("change", update);
    wideQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      wideQuery.removeEventListener("change", update);
    };
  }, []);

  /* smooth scrolling */
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.07,
      wheelMultiplier: 0.85,
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  /* scroll → chapter coordinate, sky colours, route drawing */
  useEffect(() => {
    let frame = 0;
    let walkTimer = 0;
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;
      const rect = track.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const scroll = travel > 0 ? -rect.top / travel : 0;
      const p = chapterPosition(scroll);
      const moved = Math.abs(p - position.current) > 0.0005;
      position.current = p;

      const active = Math.min(CHAPTER_COUNT - 1, Math.round(p));
      setChapter((prev) => (prev === active ? prev : active));
      if (moved && p % 1 !== 0) {
        setWalking(true);
        window.clearTimeout(walkTimer);
        walkTimer = window.setTimeout(() => setWalking(false), 220);
      }

      const { from, to, t } = atmosphereAt(p);
      const s = stage.style;
      s.setProperty("--jr-top", mixHex(from.top, to.top, t));
      s.setProperty("--jr-bottom", mixHex(from.bottom, to.bottom, t));
      s.setProperty("--jr-ink", mixHex(from.ink, to.ink, t));
      s.setProperty("--jr-muted", mixHex(from.muted, to.muted, t));
      s.setProperty("--jr-paper", t < 0.5 ? from.paper : to.paper);
      const near = t < 0.5 ? from : to;
      stage.dataset.night = near.night ? "true" : "false";
      stage.dataset.ownMoon = near.ownMoon ? "true" : "false";

      const progress = p / (CHAPTER_COUNT - 1);
      const path = railPathRef.current;
      if (path) {
        path.style.strokeDashoffset = String(1 - progress);
        const length = path.getTotalLength();
        const point = path.getPointAtLength(length * progress);
        railDotRef.current?.setAttribute(
          "transform",
          `translate(${point.x} ${point.y})`,
        );
      }
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(walkTimer);
    };
  }, []);

  /* only render the 3D frame loop while the stage is on screen */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const top = track.getBoundingClientRect().top + window.scrollY;
      const y =
        top + chapterScroll(i) * (track.offsetHeight - window.innerHeight);
      const distance = Math.abs(i - position.current);
      if (lenisRef.current) {
        lenisRef.current.scrollTo(y, {
          duration: Math.min(3.2, 1 + distance * 0.28),
        });
      } else {
        window.scrollTo({ top: y, behavior: reduced ? "instant" : "smooth" });
      }
    },
    [reduced],
  );

  /* Coming back from an explore map (/story?c=3): return to that chapter. */
  useEffect(() => {
    const c = Number(new URLSearchParams(window.location.search).get("c"));
    if (!Number.isInteger(c) || c <= 0) return;
    const timer = window.setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top + chapterScroll(c) * (track.offsetHeight - window.innerHeight),
        behavior: "instant",
      });
    }, 60);
    return () => window.clearTimeout(timer);
  }, []);

  /* ← → to travel between chapters while the journey is on screen */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!visible || event.altKey || event.metaKey || event.ctrlKey) return;
      const el = event.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(chapter + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(chapter - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, chapter, goTo]);

  const inspect = useCallback((name: string, at: number) => {
    const found = chapters[at]?.memories.find((m) => m.name === name);
    if (found) setNote({ chapter: at, memory: found });
  }, []);
  const markUnavailable = useCallback(() => setUnavailable(true), []);

  return (
    <div className="jr" lang="vi">
      {/* ---------- cover ---------- */}
      <section className="jr-cover" aria-labelledby="jr-cover-title">
        <div className="jr-cover-drum" aria-hidden="true" />
        <div className="jr-cover-inner">
          <p className="jr-kicker">
            Huỳnh Tiến Dĩ <span>·</span> Tập một
          </p>
          <h1 id="jr-cover-title" className="jr-cover-title">
            <motion.span
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease }}
            >
              Chuyện
            </motion.span>
            <motion.em
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.12, ease }}
            >
              của Dĩ.
            </motion.em>
          </h1>
          <p className="jr-cover-lede">
            Mười sáu chặng đường, kể như một ngày dài: bình minh ở làng Cát
            Nhơn, trưa ở sân trường, đêm bên màn hình, và buổi chiều trở về nhà.
          </p>

          <nav className="jr-toc" aria-label="Mục lục">
            <p>Mục lục</p>
            <ol>
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <button type="button" onClick={() => goTo(i)}>
                    <span className="jr-toc-n">{pad(i)}</span>
                    <span className="jr-toc-label">{c.label}</span>
                    <span className="jr-toc-dots" aria-hidden="true" />
                    <span className="jr-toc-hour">{ATMOSPHERE[i].hour}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <button
            type="button"
            className="jr-cover-cue"
            onClick={() => goTo(0)}
          >
            <ArrowDown size={16} /> Lật trang đầu
          </button>
        </div>
      </section>

      {/* ---------- journey ---------- */}
      <div
        ref={trackRef}
        className="jr-track"
        style={{ height: `${CHAPTER_COUNT * SVH_PER_CHAPTER}svh` }}
      >
        <div
          ref={stageRef}
          className="jr-stage"
          data-layout={layout}
          data-walking={walking}
        >
          <div className="jr-sky" aria-hidden="true" />
          <div className="jr-sun" aria-hidden="true" />
          <div className="jr-canvas">
            <StoryStage
              position={position}
              chapter={chapter}
              layout={layout}
              reduced={reduced}
              visible={visible}
              onInspect={inspect}
              onUnavailable={markUnavailable}
            />
          </div>
          <div className="jr-grain" aria-hidden="true" />

          {/* HUD */}
          <div className="jr-hud">
            <p>
              <span className="jr-hud-n">{pad(chapter)}</span>
              <span className="jr-hud-total">/ {CHAPTER_COUNT}</span>
              <span className="jr-hud-sep" />
              <span>{current.label}</span>
              <span className="jr-hud-hour">· {ATMOSPHERE[chapter].hour}</span>
            </p>
            <span className="jr-bar" aria-hidden="true">
              <span ref={barRef} />
            </span>
          </div>

          {/* Chapter page */}
          <div className="jr-page-wrap">
            {/* Remount per chapter (no exit wait) so fast scrolling can never leave a stale page. */}
            <motion.article
              key={current.id}
              className="jr-page"
              initial={
                reduced
                  ? false
                  : { clipPath: "inset(0 100% 0 0)", opacity: 0.4 }
              }
              animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
              transition={{ duration: 0.55, ease }}
              aria-live="polite"
            >
              <div className="jr-page-head">
                <Seal index={chapter} />
                <div>
                  <p className="jr-era">{current.era}</p>
                  {current.school ? (
                    <p className="jr-school">{current.school}</p>
                  ) : null}
                </div>
              </div>
              <InkTitle text={current.title} />
              <motion.p
                className="jr-prose"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                {current.story}
              </motion.p>
              <p className="jr-place">
                <MapPin size={13} aria-hidden="true" />
                {current.location}
                {current.period ? (
                  <span className="jr-period">{current.period}</span>
                ) : null}
              </p>
              <div className="jr-memories" aria-label="Chi tiết trong bối cảnh">
                {current.memories.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    aria-pressed={memory?.name === m.name}
                    onClick={() => setNote({ chapter, memory: m })}
                  >
                    <span aria-hidden="true">✦</span>
                    {m.name}
                  </button>
                ))}
              </div>
              {explorable ? (
                <Link
                  href={`/story/kham-pha/${explorable.id}`}
                  className="jr-enter"
                >
                  <span
                    className="jr-enter-art"
                    style={{
                      backgroundImage: `url(${mapArtwork(explorable.id)})`,
                    }}
                    aria-hidden="true"
                  />
                  Bước vào {explorable.title}
                  <ArrowRight size={15} />
                </Link>
              ) : null}
            </motion.article>
          </div>

          {/* Memory note pinned onto the scene */}
          <AnimatePresence>
            {memory ? (
              <motion.aside
                key={`${chapter}-${memory.name}`}
                className="jr-note"
                initial={{ opacity: 0, y: 18, rotate: 4 }}
                animate={{ opacity: 1, y: 0, rotate: 1.5 }}
                exit={{ opacity: 0, y: 12, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                aria-label={`Ký ức: ${memory.name}`}
              >
                <span className="jr-note-tape" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setNote(null)}
                  aria-label="Đóng ghi chú"
                >
                  <X size={15} />
                </button>
                <p className="jr-note-kicker">Một chi tiết nhỏ</p>
                <h3>{memory.name}</h3>
                <p>{memory.description}</p>
              </motion.aside>
            ) : null}
          </AnimatePresence>

          {/* Route rail: the road draws itself as Dĩ walks */}
          <nav className="jr-route" aria-label="Lộ trình các chặng">
            <svg viewBox={`0 0 80 ${RAIL_H + 20}`} aria-hidden="true">
              <path d={RAIL_PATH} className="jr-route-base" />
              <path
                ref={railPathRef}
                d={RAIL_PATH}
                className="jr-route-ink"
                pathLength={1}
              />
              {chapters.map((c, i) => (
                <circle
                  key={c.id}
                  cx={railX(i)}
                  cy={10 + i * RAIL_STEP}
                  r={i === chapter ? 5 : 3.2}
                  className={
                    i <= chapter ? "jr-route-node is-past" : "jr-route-node"
                  }
                />
              ))}
              <g ref={railDotRef}>
                <circle r={8} className="jr-route-halo" />
                <circle r={3.4} className="jr-route-dot" />
              </g>
            </svg>
            <ol>
              {chapters.map((c, i) => (
                <li
                  key={c.id}
                  style={{
                    top: `calc(${((10 + i * RAIL_STEP) / (RAIL_H + 20)) * 100}% - 0.6em)`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === chapter ? "step" : undefined}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          {/* Controls + cue */}
          <div className="jr-controls">
            <button
              type="button"
              onClick={() => goTo(chapter - 1)}
              disabled={chapter === 0}
              aria-label="Chặng trước"
            >
              <ArrowLeft size={16} />
            </button>
            <p className="jr-cue">
              <Footprints size={15} aria-hidden="true" className="jr-feet" />
              {chapter < CHAPTER_COUNT - 1
                ? "Cuộn để bước tiếp"
                : "Cuộn để khép sách"}
            </p>
            <button
              type="button"
              onClick={() => goTo(chapter + 1)}
              disabled={chapter === CHAPTER_COUNT - 1}
              aria-label="Chặng sau"
            >
              <ArrowRight size={16} />
            </button>
          </div>

          {unavailable ? (
            <p className="jr-fallback" role="status">
              Thiết bị chưa hiển thị được bối cảnh 3D. Câu chuyện vẫn ở đây, cứ
              cuộn để đọc tiếp.
            </p>
          ) : null}
        </div>
      </div>

      {/* ---------- ending ---------- */}
      <section className="jr-end" aria-labelledby="jr-end-title">
        <p className="jr-kicker">Hết tập một</p>
        <h2 id="jr-end-title" className="jr-end-title">
          Có những nơi mình đi qua.
          <br />
          <em>Có một nơi ở lại trong mình.</em>
        </h2>
        <p className="jr-end-lede">
          Một người hiền lành, một cặp kính, và những điều vẫn muốn học thêm.
          Trang kế tiếp, mình muốn viết cùng bạn.
        </p>
        <div className="jr-end-actions">
          <Link href="/#contact" className="jr-btn jr-btn-primary">
            Viết tiếp cùng mình <ArrowRight size={16} />
          </Link>
          <button type="button" className="jr-btn" onClick={() => goTo(0)}>
            Về nơi bắt đầu <RotateCcw size={15} />
          </button>
          <a href="/story-assets/di-story-3d.zip" download className="jr-btn">
            Tải trọn bộ 3D <Download size={15} />
          </a>
        </div>

        <details className="jr-journal">
          <summary>
            <BookOpen size={16} /> Đọc bản chữ, không cần 3D
          </summary>
          <ol>
            {chapters.map((c, i) => (
              <li key={c.id}>
                <span className="jr-journal-n">{pad(i)}</span>
                <div>
                  <p className="jr-journal-era">
                    {c.era}
                    {c.period ? ` · ${c.period}` : ""}
                  </p>
                  <h3>{c.title.replace("\n", " ")}</h3>
                  {c.school ? (
                    <p className="jr-journal-school">{c.school}</p>
                  ) : null}
                  <p>{c.story}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="jr-journal-note">
            Các ngôi trường và cột mốc là hành trình thật. Bối cảnh sa bàn được
            sáng tác để gợi không khí từng chặng, không tái hiện nguyên mẫu kiến
            trúc.
          </p>
        </details>
      </section>
    </div>
  );
}
