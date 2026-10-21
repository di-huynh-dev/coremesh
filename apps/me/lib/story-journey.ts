import { chapters } from "./story";

export const CHAPTER_COUNT = chapters.length;

/**
 * Share of each chapter's scroll spent standing still (reading) before the
 * character walks on to the next scene.
 */
export const HOLD = 0.45;

/** Scroll distance per chapter, in small-viewport heights. */
export const SVH_PER_CHAPTER = 180;

export type Atmosphere = {
  /** Sky gradient behind the transparent canvas. */
  top: string;
  bottom: string;
  /** Fog colour — matches the horizon so far scenes melt into the sky. */
  haze: string;
  sun: string;
  sunIntensity: number;
  ambient: number;
  hemiSky: string;
  hemiGround: string;
  /** Overlay text colours for this time of day. */
  ink: string;
  muted: string;
  paper: string;
  /** Short label shown in the HUD. */
  hour: string;
  /** Night scenes switch the moon on and the paper to dark. */
  night?: boolean;
  /** The diorama draws its own moon, so the sky's moon is hidden. */
  ownMoon?: boolean;
};

/** Time of day for each chapter, keyed by chapter id (see lib/story.ts). */
const ATMOSPHERE_BY_ID: Record<string, Atmosphere> = {
  "que-nha": {
    hour: "Bình minh",
    top: "#f2cfae",
    bottom: "#fbefe2",
    haze: "#f6e2cf",
    sun: "#ffcf9e",
    sunIntensity: 2.7,
    ambient: 1.05,
    hemiSky: "#ffe6cc",
    hemiGround: "#a8a18a",
    ink: "#2a1d14",
    muted: "#6b5a4a",
    paper: "rgba(255,250,242,0.86)",
  },
  "tieu-hoc": {
    hour: "Buổi sáng",
    top: "#cfe4ef",
    bottom: "#f5f1e6",
    haze: "#e9eee8",
    sun: "#fff3df",
    sunIntensity: 3.3,
    ambient: 1.15,
    hemiSky: "#f3f6ee",
    hemiGround: "#a8a18a",
    ink: "#1f2a2e",
    muted: "#55625f",
    paper: "rgba(255,253,248,0.86)",
  },
  "mua-he": {
    hour: "Trưa hè",
    top: "#b9dfee",
    bottom: "#f3f5e8",
    haze: "#e5efe9",
    sun: "#fffaf0",
    sunIntensity: 3.7,
    ambient: 1.2,
    hemiSky: "#f2f8f2",
    hemiGround: "#a6a585",
    ink: "#1d2b2a",
    muted: "#536360",
    paper: "rgba(255,255,250,0.86)",
  },
  thcs: {
    hour: "Gần trưa",
    top: "#d3e5ec",
    bottom: "#f5f2e9",
    haze: "#ebeee8",
    sun: "#fff2d9",
    sunIntensity: 3.3,
    ambient: 1.15,
    hemiSky: "#f3f6ee",
    hemiGround: "#a8a18a",
    ink: "#1f2a2e",
    muted: "#55625f",
    paper: "rgba(255,253,248,0.86)",
  },
  thpt: {
    hour: "Chiều vàng",
    top: "#f0cfa9",
    bottom: "#f8ebdd",
    haze: "#f3e1cd",
    sun: "#ffcb92",
    sunIntensity: 3.0,
    ambient: 1.05,
    hemiSky: "#ffe4c4",
    hemiGround: "#a39478",
    ink: "#2b1d12",
    muted: "#6e5946",
    paper: "rgba(255,249,240,0.86)",
  },
  "di-xa": {
    hour: "Hoàng hôn",
    top: "#e2a993",
    bottom: "#f2d7c6",
    haze: "#ecc9b6",
    sun: "#ffad84",
    sunIntensity: 2.4,
    ambient: 0.95,
    hemiSky: "#ffd2bb",
    hemiGround: "#8f7f6c",
    ink: "#2b1813",
    muted: "#6c4f45",
    paper: "rgba(255,246,240,0.86)",
  },
  ute: {
    hour: "Chập tối",
    top: "#9fb2d3",
    bottom: "#e4e2ec",
    haze: "#cfd3e2",
    sun: "#ffdcb6",
    sunIntensity: 2.2,
    ambient: 0.95,
    hemiSky: "#c7d3ea",
    hemiGround: "#8b8a86",
    ink: "#1b2133",
    muted: "#4f5670",
    paper: "rgba(250,250,255,0.84)",
  },
  "goc-hoc": {
    hour: "Nửa đêm",
    night: true,
    top: "#141d33",
    bottom: "#33405f",
    haze: "#28324d",
    sun: "#a9c3ff",
    sunIntensity: 1.0,
    ambient: 0.62,
    hemiSky: "#5d74a8",
    hemiGround: "#2a2c3a",
    ink: "#eef1fb",
    muted: "#aeb7d4",
    paper: "rgba(22,30,52,0.78)",
  },
  amit: {
    hour: "Sáng sớm",
    top: "#d2dbe6",
    bottom: "#f2efe9",
    haze: "#e4e6e6",
    sun: "#fff0dc",
    sunIntensity: 3.0,
    ambient: 1.1,
    hemiSky: "#eef2f4",
    hemiGround: "#a1a093",
    ink: "#1e262d",
    muted: "#56606a",
    paper: "rgba(255,253,250,0.86)",
  },
  "hien-tai": {
    hour: "Giữa ngày",
    top: "#d6e7ee",
    bottom: "#f5f2ea",
    haze: "#e8ede9",
    sun: "#fff4e2",
    sunIntensity: 3.3,
    ambient: 1.15,
    hemiSky: "#f3f6ee",
    hemiGround: "#a8a18a",
    ink: "#1f2a2e",
    muted: "#55625f",
    paper: "rgba(255,253,248,0.86)",
  },
  "coi-nguon": {
    hour: "Chiều về",
    top: "#f1b894",
    bottom: "#f9e2cf",
    haze: "#f4d2ba",
    sun: "#ffb98a",
    sunIntensity: 2.7,
    ambient: 1.0,
    hemiSky: "#ffd8bd",
    hemiGround: "#a08a74",
    ink: "#2b1a12",
    muted: "#6e5243",
    paper: "rgba(255,248,240,0.86)",
  },
  "tet-que": {
    hour: "Sáng mùng Một",
    top: "#f6d5b3",
    bottom: "#fdf0e2",
    haze: "#f8e3cf",
    sun: "#ffdcae",
    sunIntensity: 3.0,
    ambient: 1.1,
    hemiSky: "#ffe8d0",
    hemiGround: "#a8a18a",
    ink: "#2b1a12",
    muted: "#6e5243",
    paper: "rgba(255,249,241,0.86)",
  },
  "trung-thu": {
    hour: "Đêm rằm",
    night: true,
    ownMoon: true,
    top: "#171c38",
    bottom: "#3a3c63",
    haze: "#2b2e4f",
    sun: "#ffe2a8",
    sunIntensity: 0.9,
    ambient: 0.6,
    hemiSky: "#6d6aa0",
    hemiGround: "#2a2a38",
    ink: "#f3efe4",
    muted: "#c3bcd8",
    paper: "rgba(26,28,56,0.78)",
  },
  "bien-que": {
    hour: "Trưa nắng",
    top: "#a6daee",
    bottom: "#f1f7f2",
    haze: "#e0eff0",
    sun: "#fffaf0",
    sunIntensity: 3.8,
    ambient: 1.2,
    hemiSky: "#eef8fa",
    hemiGround: "#b8a985",
    ink: "#16303a",
    muted: "#4d6670",
    paper: "rgba(255,255,252,0.86)",
  },
  "cho-que": {
    hour: "Sáng chợ",
    top: "#e4dccb",
    bottom: "#f6f0e6",
    haze: "#ece6da",
    sun: "#ffecc9",
    sunIntensity: 3.0,
    ambient: 1.1,
    hemiSky: "#f4efe4",
    hemiGround: "#a39a80",
    ink: "#2a2118",
    muted: "#675a4a",
    paper: "rgba(255,252,246,0.86)",
  },
  "cay-da": {
    hour: "Chiều tan học",
    top: "#f1d1a4",
    bottom: "#f8ecdc",
    haze: "#f3e0c8",
    sun: "#ffc98e",
    sunIntensity: 3.0,
    ambient: 1.05,
    hemiSky: "#ffe2c0",
    hemiGround: "#a39478",
    ink: "#2b1d12",
    muted: "#6e5946",
    paper: "rgba(255,249,240,0.86)",
  },
};

export const ATMOSPHERE: Atmosphere[] = chapters.map(
  (c) => ATMOSPHERE_BY_ID[c.id] ?? ATMOSPHERE_BY_ID["que-nha"],
);

type Vec3 = [number, number, number];
export type Shot = { pos: Vec3; look: Vec3; fov: number };

/**
 * One camera set-up per memory, relative to the character's x. Room scenes
 * (07–09) keep the camera on +x because their walls stand on the -x side.
 */
const SHOTS_BY_ID: Record<string, Shot> = {
  "que-nha": { pos: [-6, 6.4, 15], look: [0.6, 1.2, 0], fov: 36 }, // quê nhà — from the left, dawn
  "tieu-hoc": { pos: [4, 4.2, 13], look: [0, 1.7, -0.6], fov: 40 }, // tiểu học — low, looking up at the school
  "mua-he": { pos: [7, 9, 15.5], look: [0, 0.8, 0], fov: 38 }, // mùa hè — wide over the river
  thcs: { pos: [-3.5, 5.4, 14], look: [0, 1.4, -0.5], fov: 39 }, // THCS
  thpt: { pos: [5, 3.6, 12.5], look: [0, 1.9, -1], fov: 41 }, // THPT — low, dramatic gate
  "di-xa": { pos: [0.5, 13, 15], look: [0, 0.4, -0.4], fov: 36 }, // đi xa — bird's eye departure
  ute: { pos: [-6, 4.6, 14], look: [0, 2.1, -1], fov: 40 }, // UTE — campus rising
  "goc-hoc": { pos: [3.6, 5.2, 11.5], look: [0, 1.3, -0.5], fov: 38 }, // tự học — intimate, night
  amit: { pos: [6, 7.4, 16], look: [0, 1.2, 0], fov: 38 }, // AMIT
  "hien-tai": { pos: [5, 6.4, 15], look: [0, 1.2, 0], fov: 38 }, // hiện tại
  "coi-nguon": { pos: [0, 6.2, 19], look: [0, 1.4, 0], fov: 34 }, // cội nguồn — wide, closing shot
  "tet-que": { pos: [-5, 5.6, 14], look: [0.4, 1.4, -0.4], fov: 38 }, // Tết — porch, mai and the bánh tét fire
  "trung-thu": { pos: [4.5, 4.2, 13], look: [0, 1.9, -0.8], fov: 41 }, // Trung thu — low, the moon behind the lanterns
  "bien-que": { pos: [0.5, 8.6, 16], look: [0, 0.6, -0.9], fov: 38 }, // biển — over the sand to the sea
  "cho-que": { pos: [-4.5, 6, 14.5], look: [0, 1.2, -0.5], fov: 38 }, // chợ — along the stalls
  "cay-da": { pos: [5.5, 5.2, 14], look: [0, 1.8, -0.8], fov: 40 }, // cây đa — under the banyan
};

export const SHOTS: Shot[] = chapters.map(
  (c) => SHOTS_BY_ID[c.id] ?? SHOTS_BY_ID["que-nha"],
);

/**
 * Which existing character rig look a chapter uses (age, glasses, held prop),
 * plus an optional shirt colour. Legacy looks are numbered as in character-3d.
 */
export type CharacterLook = {
  base: number;
  shirt?:
    | "red"
    | "navy"
    | "blue"
    | "olive"
    | "saffron"
    | "cream"
    | "teal"
    | "terracotta";
};
const LOOKS_BY_ID: Record<string, CharacterLook> = {
  "que-nha": { base: 0 },
  "tet-que": { base: 0, shirt: "red" },
  "tieu-hoc": { base: 1 },
  "trung-thu": { base: 2, shirt: "navy" },
  "mua-he": { base: 2 },
  "bien-que": { base: 2, shirt: "blue" },
  "cho-que": { base: 0, shirt: "olive" },
  "cay-da": { base: 1 },
  thcs: { base: 3 },
  thpt: { base: 4 },
  "di-xa": { base: 5 },
  ute: { base: 6 },
  "goc-hoc": { base: 7 },
  amit: { base: 8 },
  "hien-tai": { base: 9 },
  "coi-nguon": { base: 10 },
};
export const LOOKS: CharacterLook[] = chapters.map(
  (c) => LOOKS_BY_ID[c.id] ?? { base: 0 },
);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * Maps raw scroll (0..1 over the journey track) to a chapter coordinate:
 * integers are "standing at chapter i", fractions are walking between them.
 */
export function chapterPosition(scroll: number): number {
  const raw = clamp01(scroll) * CHAPTER_COUNT;
  const i = Math.min(CHAPTER_COUNT - 1, Math.floor(raw));
  if (i >= CHAPTER_COUNT - 1) return CHAPTER_COUNT - 1;
  const u = raw - i;
  return i + smoother(clamp01((u - HOLD) / (1 - HOLD)));
}

/** Scroll fraction at which chapter i is reached and its reading pause begins. */
export function chapterScroll(i: number): number {
  return (Math.min(Math.max(i, 0), CHAPTER_COUNT - 1) + 0.02) / CHAPTER_COUNT;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Interpolates two #rrggbb colours. */
export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(ar, br)}, ${c(ag, bg)}, ${c(ab, bb)})`;
}

/** Atmosphere pair + blend factor for a chapter coordinate. */
export function atmosphereAt(position: number) {
  const i = Math.min(CHAPTER_COUNT - 1, Math.max(0, Math.floor(position)));
  const j = Math.min(CHAPTER_COUNT - 1, i + 1);
  return { from: ATMOSPHERE[i], to: ATMOSPHERE[j], t: position - i };
}
