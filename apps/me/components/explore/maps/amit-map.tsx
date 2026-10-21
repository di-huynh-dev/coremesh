"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  Bench,
  Bookcase,
  Box,
  Chair,
  Coffee,
  Desk,
  Laptop,
  Monitor,
  Orb,
  Pole,
  Pot,
  Segment,
  Sign,
  type Vec3,
} from "@/components/story/world-3d";
import { AMIT_LAYOUT as L } from "@/lib/explore/amit";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";

type Area = { minX: number; maxX: number; minZ: number; maxZ: number };

const WALL = "#e8dfc9";
const TEAL = "#4c6c76";
const WOOD = "#b98d5e";

function seeded(i: number, k = 1) {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------- shared office pieces (also used by the Estuary map) ---------- */

/** See-through pane. Still blocks the player (opacity ≥ 0.2). */
export function Glass({
  position,
  size,
  color = "#cfe6ea",
  opacity = 0.26,
}: {
  position: Vec3;
  size: Vec3;
  color?: string;
  opacity?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        roughness={0.1}
        metalness={0.1}
      />
    </mesh>
  );
}

/** Flat glowing rectangle facing +z (screen backgrounds). */
export function Panel({
  position = [0, 0, 0],
  size,
  color,
  glow = 0.35,
}: {
  position?: Vec3;
  size: [number, number];
  color: string;
  glow?: number;
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={glow}
        roughness={0.6}
      />
    </mesh>
  );
}

/** Hides its children (ceilings, headers) while the player stands inside `area`. */
export function HideWhenInside({
  player,
  area,
  children,
}: {
  player: MapSceneProps["player"];
  area: Area;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = player.current?.position;
    if (!ref.current || !p) return;
    const inside =
      p.x > area.minX - 0.2 &&
      p.x < area.maxX + 0.2 &&
      p.z > area.minZ - 0.2 &&
      p.z < area.maxZ + 0.4;
    ref.current.visible = !inside;
  });
  return (
    <group ref={ref} userData={{ noCollide: true }}>
      {children}
    </group>
  );
}

/** Scales its children in with a little overshoot when it mounts. */
export function PopIn({
  position,
  delay = 0,
  reducedMotion,
  children,
}: {
  position?: Vec3;
  delay?: number;
  reducedMotion?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(-delay);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (reducedMotion) {
      g.scale.setScalar(1);
      return;
    }
    if (t.current >= 1) return;
    t.current = Math.min(1, t.current + dt * 2.4);
    const k = Math.max(0, t.current) - 1;
    const s = 1 + 2.70158 * k * k * k + 1.70158 * k * k;
    g.scale.setScalar(Math.max(0.0001, t.current <= 0 ? 0.0001 : s));
  });
  return (
    <group ref={ref} position={position} scale={reducedMotion ? 1 : 0.0001}>
      {children}
    </group>
  );
}

/** A big screen on two legs, facing +z. Children sit on the screen face. */
export function ScreenStand({
  position,
  width,
  height,
  center = 1.95,
  color = "#2f3a40",
  children,
}: {
  position: Vec3;
  width: number;
  height: number;
  center?: number;
  color?: string;
  children?: ReactNode;
}) {
  const leg = center - height / 2;
  return (
    <group position={position}>
      <Box position={[0, 0.04, 0]} size={[width * 0.7, 0.08, 0.6]} color={color} />
      {[-1, 1].map((s) => (
        <Pole
          key={s}
          position={[s * width * 0.3, leg / 2, -0.02]}
          height={leg}
          radius={0.05}
          color={color}
        />
      ))}
      <Box
        position={[0, center, -0.02]}
        size={[width + 0.14, height + 0.14, 0.08]}
        color={color}
      />
      <group position={[0, center, 0.03]}>{children}</group>
    </group>
  );
}

/** Exterior wall with a sill, a long window and mullions. Faces ±z. */
export function WindowWall({
  x1,
  x2,
  z,
  wall = WALL,
  frame = "#6f7b78",
}: {
  x1: number;
  x2: number;
  z: number;
  wall?: string;
  frame?: string;
}) {
  const len = x2 - x1;
  const cx = (x1 + x2) / 2;
  const mullions = Math.max(1, Math.round(len / 2));
  return (
    <group position={[cx, 0, z]}>
      <Box position={[0, 0.42, 0]} size={[len, 0.84, 0.3]} color={wall} />
      <Glass position={[0, 1.92, 0]} size={[len, 2.16, 0.06]} />
      <Box position={[0, 3.18, 0]} size={[len, 0.36, 0.3]} color={wall} />
      {Array.from({ length: mullions + 1 }, (_, i) => (
        <Box
          key={i}
          position={[-len / 2 + (i * len) / mullions, 1.92, 0]}
          size={[0.08, 2.16, 0.14]}
          color={frame}
        />
      ))}
    </group>
  );
}

/**
 * A row of city blocks along local x, facing local +z. Rotate the group to
 * line another edge of the map.
 */
export function CityBackdrop({
  position,
  rotation = 0,
  length,
  seed = 1,
  palette = ["#9fb2b4", "#b8c2bb", "#8ea3aa", "#c4c4b4"],
  glass = "#d7e6e6",
  maxHeight = 9,
}: {
  position: Vec3;
  rotation?: number;
  length: number;
  seed?: number;
  palette?: string[];
  glass?: string;
  maxHeight?: number;
}) {
  const blocks = useMemo(() => {
    const out: Array<{ x: number; w: number; h: number; d: number; z: number }> =
      [];
    let x = -length / 2;
    let i = 0;
    while (x < length / 2) {
      const w = 1.6 + seeded(i, seed) * 1.6;
      const h = 2.8 + seeded(i, seed + 3) * (maxHeight - 2.8);
      out.push({
        x: x + w / 2,
        w,
        h,
        d: 1.8 + seeded(i, seed + 7) * 1.4,
        z: -seeded(i, seed + 11) * 2.2,
      });
      x += w + 0.3 + seeded(i, seed + 5) * 0.6;
      i++;
    }
    return out;
  }, [length, seed, maxHeight]);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {blocks.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <Box
            position={[0, b.h / 2, 0]}
            size={[b.w, b.h, b.d]}
            color={palette[i % palette.length]!}
          />
          {[0.3, 0.55, 0.8]
            .filter((f) => f * b.h > 1)
            .map((f) => (
              <Box
                key={f}
                position={[0, f * b.h, b.d / 2 + 0.01]}
                size={[b.w * 0.8, 0.3, 0.02]}
                color={glass}
              />
            ))}
        </group>
      ))}
    </group>
  );
}

export function StickyNote({
  position,
  color,
  tilt = 0,
}: {
  position: Vec3;
  color: string;
  tilt?: number;
}) {
  return (
    <Box
      position={position}
      size={[0.22, 0.22, 0.012]}
      color={color}
      rotation={[0, 0, tilt]}
    />
  );
}

export function RoundTable({
  position,
  radius = 0.55,
  color = "#efe7d6",
}: {
  position: Vec3;
  radius?: number;
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.06, 22]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <Pole position={[0, 0.38, 0]} height={0.74} radius={0.06} color="#5d6463" />
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
        <meshStandardMaterial color="#5d6463" />
      </mesh>
    </group>
  );
}

export function Stool({
  position,
  color = "#c9725a",
}: {
  position: Vec3;
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 14]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Pole position={[0, 0.22, 0]} height={0.44} radius={0.035} color="#5d6463" />
    </group>
  );
}

export function Sofa({
  position,
  rotation = 0,
  color = "#7f9a8e",
  width = 2.4,
}: {
  position: Vec3;
  rotation?: number;
  color?: string;
  width?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box position={[0, 0.24, 0]} size={[width, 0.48, 0.9]} color={color} />
      <Box position={[0, 0.72, 0.36]} size={[width, 0.6, 0.2]} color={color} />
      {[-1, 1].map((s) => (
        <Box
          key={s}
          position={[s * (width / 2 - 0.1), 0.6, 0]}
          size={[0.2, 0.32, 0.9]}
          color={color}
        />
      ))}
      {[-0.5, 0.5].map((x) => (
        <Box
          key={x}
          position={[x * (width / 2.4), 0.55, -0.05]}
          size={[width / 2 - 0.3, 0.16, 0.7]}
          color="#e8e1cf"
        />
      ))}
    </group>
  );
}

export function StringLights({
  from,
  to,
  reducedMotion,
}: {
  from: Vec3;
  to: Vec3;
  reducedMotion?: boolean;
}) {
  const bulbs = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!bulbs.current || reducedMotion) return;
    bulbs.current.children.forEach((b, i) => {
      b.scale.setScalar(0.9 + Math.sin(clock.elapsedTime * 2 + i) * 0.12);
    });
  });
  const n = 9;
  const mid: Vec3 = [
    (from[0] + to[0]) / 2,
    Math.min(from[1], to[1]) - 0.35,
    (from[2] + to[2]) / 2,
  ];
  const at = (t: number): Vec3 => {
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const c = t * t;
    return [
      a * from[0] + b * mid[0] + c * to[0],
      a * from[1] + b * mid[1] + c * to[1],
      a * from[2] + b * mid[2] + c * to[2],
    ];
  };
  return (
    <group userData={{ noCollide: true }}>
      <Segment from={from} to={at(0.5)} radius={0.01} color="#3a3a3a" />
      <Segment from={at(0.5)} to={to} radius={0.01} color="#3a3a3a" />
      <group ref={bulbs}>
        {Array.from({ length: n }, (_, i) => {
          const p = at((i + 0.5) / n);
          return (
            <mesh key={i} position={[p[0], p[1] - 0.08, p[2]]}>
              <sphereGeometry args={[0.06, 8, 6]} />
              <meshStandardMaterial
                color="#ffe3a3"
                emissive="#ffcf70"
                emissiveIntensity={1.6}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* ---------- AMIT pieces ---------- */

function Core() {
  const c = L.core;
  const w = c.maxX - c.minX;
  const d = c.maxZ - c.minZ;
  const cz = (c.minZ + c.maxZ) / 2;
  return (
    <group>
      <Box position={[0, 1.9, cz]} size={[w, 3.8, d]} color="#dcd3bd" />
      <Box position={[0, 3.85, cz]} size={[w + 0.2, 0.12, d + 0.2]} color="#b9ae94" />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.02), 0, -6.6]}>
          <Box position={[0, 1.2, 0]} size={[0.04, 2.4, 1.7]} color="#8f9796" />
          {[-0.4, 0.4].map((z) => (
            <Box
              key={z}
              position={[s * 0.015, 1.15, z]}
              size={[0.03, 2.2, 0.74]}
              color="#b7bfbd"
              metalness={0.4}
            />
          ))}
          <Sign
            text="THANG MÁY"
            position={[s * 0.04, 2.75, 0]}
            rotation={[0, (s * Math.PI) / 2, 0]}
            width={1.3}
            height={0.28}
            color={TEAL}
            ink="#f4efe2"
            fontSize={84}
          />
        </group>
      ))}
    </group>
  );
}

function Kanban({ done }: { done: boolean }) {
  const cols = ["TO DO", "DOING", "DONE"];
  const cards: Array<[number, number, string]> = [
    [-1, 2.25, "#f2d36b"],
    [-1, 1.95, "#9cc3d5"],
    [0, 2.25, "#9fcfb0"],
    [1, 2.25, "#cfe3b5"],
    [1, 1.95, "#cfe3b5"],
  ];
  const bugX = done ? 1 : 0;
  return (
    <group position={[L.kanban[0], 0, L.kanban[1]]}>
      <Box position={[0, 1.9, -0.03]} size={[3.1, 1.8, 0.04]} color="#7d8a86" />
      <Box position={[0, 1.9, 0]} size={[3.0, 1.7, 0.05]} color="#f6f3ea" />
      <Sign
        text="KANBAN · SPRINT"
        position={[0, 2.98, 0.03]}
        width={2.0}
        height={0.3}
        color={TEAL}
        ink="#f6f3ea"
        fontSize={78}
      />
      {cols.map((t, i) => (
        <Sign
          key={t}
          text={t}
          position={[(i - 1), 2.55, 0.03]}
          width={0.9}
          height={0.2}
          color="#f6f3ea"
          ink={TEAL}
          fontSize={80}
        />
      ))}
      {[-0.5, 0.5].map((x) => (
        <Box key={x} position={[x, 1.85, 0.03]} size={[0.02, 1.5, 0.01]} color="#b9c0bb" />
      ))}
      {cards.map(([x, y, c], i) => (
        <Box key={i} position={[x, y, 0.035]} size={[0.7, 0.22, 0.012]} color={c} />
      ))}
      <group position={[bugX, 1.62, 0.035]}>
        <Box size={[0.76, 0.26, 0.012]} color={done ? "#5aa66a" : "#d9534f"} />
        <Sign
          text={done ? "BUG · ĐÃ SỬA" : "BUG · FORM"}
          position={[0, 0, 0.008]}
          width={0.68}
          height={0.19}
          color={done ? "#5aa66a" : "#d9534f"}
          ink="#ffffff"
          fontSize={62}
        />
      </group>
    </group>
  );
}

function RetroBoard({
  full,
  reducedMotion,
}: {
  full: boolean;
  reducedMotion?: boolean;
}) {
  const colors = ["#f2d36b", "#f2a7b8", "#9cc3d5", "#b9dca0"];
  const notes = Array.from({ length: 12 }, (_, i) => {
    const col = Math.floor(i / 4);
    const k = i % 4;
    return {
      p: [
        (col - 1) * 0.85 + ((k % 2) - 0.5) * 0.32,
        2.22 - Math.floor(k / 2) * 0.34,
        0.04,
      ] as Vec3,
      c: colors[(i + col) % colors.length]!,
      tilt: (seeded(i, 4) - 0.5) * 0.25,
      always: i === 0 || i === 4,
    };
  });
  return (
    <group position={[L.retroBoard[0], 0, L.retroBoard[1]]}>
      <Box position={[0, 1.9, -0.03]} size={[2.7, 1.8, 0.04]} color="#7d8a86" />
      <Box position={[0, 1.9, 0]} size={[2.6, 1.7, 0.05]} color="#efe8d4" />
      <Sign
        text="RETRO CUỐI SPRINT"
        position={[0, 2.98, 0.03]}
        width={1.9}
        height={0.3}
        color="#c9725a"
        ink="#fff6ea"
        fontSize={76}
      />
      {["TỐT", "CẢI THIỆN", "HÀNH ĐỘNG"].map((t, i) => (
        <Sign
          key={t}
          text={t}
          position={[(i - 1) * 0.85, 2.58, 0.03]}
          width={0.8}
          height={0.18}
          color="#efe8d4"
          ink="#5a4636"
          fontSize={70}
        />
      ))}
      {notes.map((n, i) =>
        n.always ? (
          <StickyNote key={i} position={n.p} color={n.c} tilt={n.tilt} />
        ) : full ? (
          <PopIn
            key={i}
            position={n.p}
            delay={i * 0.08}
            reducedMotion={reducedMotion}
          >
            <StickyNote position={[0, 0, 0]} color={n.c} tilt={n.tilt} />
          </PopIn>
        ) : null,
      )}
    </group>
  );
}

function MeetingRoom({ effects, player, reducedMotion }: MapSceneProps) {
  const m = L.meeting;
  const cx = (m.minX + m.maxX) / 2;
  const cz = (m.minZ + m.maxZ) / 2;
  const w = m.maxX - m.minX;
  const d = m.maxZ - m.minZ;
  const leftLen = m.doorMinX - m.minX;
  const rightLen = m.maxX - m.doorMaxX;
  const [tx, tz] = L.meetingTable;
  return (
    <group>
      <Box position={[cx, 0.0, cz]} size={[w, 0.03, d]} color="#b9c4b3" />
      {/* front glass with a doorway, side glass towards the corridor */}
      <Glass
        position={[m.minX + leftLen / 2, 1.3, m.maxZ]}
        size={[leftLen, 2.6, 0.06]}
      />
      <Glass
        position={[m.doorMaxX + rightLen / 2, 1.3, m.maxZ]}
        size={[rightLen, 2.6, 0.06]}
      />
      <Glass position={[m.maxX, 1.3, cz]} size={[0.06, 2.6, d]} />
      {[m.minX + 1.0, m.doorMinX, m.doorMaxX, m.maxX].map((x) => (
        <Box
          key={x}
          position={[x, 1.32, m.maxZ]}
          size={[0.09, 2.64, 0.1]}
          color="#6f7b78"
        />
      ))}
      {[-7.0, -4.6].map((z) => (
        <Box key={z} position={[m.maxX, 1.32, z]} size={[0.1, 2.64, 0.09]} color="#6f7b78" />
      ))}
      <Box position={[cx, 0.04, m.maxZ]} size={[w, 0.08, 0.1]} color="#6f7b78" />

      {/* table + chairs */}
      <group position={[tx, 0, tz]}>
        <Box position={[0, 0.78, 0]} size={[2.8, 0.08, 1.3]} color={WOOD} />
        {[-1.0, 1.0].map((x) => (
          <Box key={x} position={[x, 0.37, 0]} size={[0.24, 0.74, 0.9]} color="#5d6463" />
        ))}
        <Laptop position={[-0.6, 0.82, -0.1]} scale={0.6} />
        <Coffee position={[0.5, 0.82, 0.2]} />
        <Coffee position={[0.95, 0.82, -0.25]} />
        <Box position={[0.1, 0.83, -0.2]} size={[0.5, 0.01, 0.36]} color="#f4f1e8" />
      </group>
      {[-0.6, 0.6].map((x) => (
        <Chair key={x} position={[tx + x, 0, tz + 1.15]} />
      ))}

      <Kanban done={effects.has("bug-done")} />
      <RetroBoard full={effects.has("retro")} reducedMotion={reducedMotion} />
      <Pot position={[m.minX + 0.6, 0, m.maxZ - 0.6]} scale={1.5} />

      {/* ceiling + header, lifted off while Dĩ is inside */}
      <HideWhenInside player={player} area={m}>
        <Box position={[cx, 3.0, cz]} size={[w, 0.12, d]} color="#e9e3d2" />
        <Box position={[cx, 2.8, m.maxZ]} size={[w, 0.36, 0.14]} color={WALL} />
        <Sign
          text="PHÒNG HỌP"
          position={[(m.doorMinX + m.doorMaxX) / 2, 2.8, m.maxZ + 0.08]}
          width={1.6}
          height={0.3}
          color={TEAL}
          ink="#f4efe2"
          fontSize={80}
        />
      </HideWhenInside>
    </group>
  );
}

function RubberDuck({ position }: { position: Vec3 }) {
  return (
    <group position={position} rotation={[0, 0.5, 0]}>
      <Orb position={[0, 0.09, 0]} scale={[0.13, 0.09, 0.1]} color="#f2c230" />
      <Orb position={[0.07, 0.2, 0]} scale={[0.07, 0.07, 0.07]} color="#f2c230" />
      <mesh position={[0.15, 0.19, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.03, 0.07, 6]} />
        <meshStandardMaterial color="#e86a33" />
      </mesh>
    </group>
  );
}

/** Bobbing label that pops in above something that just changed. */
export function FloatingTag({
  position,
  text,
  color,
  edge = "#2f6b4a",
  width = 1.5,
  reducedMotion,
}: {
  position: Vec3;
  text: string;
  color: string;
  edge?: string;
  width?: number;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.6) * 0.08;
  });
  return (
    <group ref={ref} position={position} userData={{ noCollide: true }}>
      <PopIn reducedMotion={reducedMotion}>
        <Box position={[0, 0, -0.03]} size={[width, 0.42, 0.04]} color={edge} />
        <Sign
          text={text}
          position={[0, 0, 0]}
          width={width - 0.1}
          height={0.34}
          color={color}
          ink="#ffffff"
          fontSize={86}
        />
      </PopIn>
    </group>
  );
}

function OpenPlan({ effects, reducedMotion }: MapSceneProps) {
  const [mx, mz] = L.myDesk;
  const [rx, rz] = L.mentorDesk;
  return (
    <group>
      <Box position={[11.8, 0.0, -5.5]} size={[10.4, 0.03, 7.4]} color="#c9c2a6" />
      {L.desks.map(([x, z], i) => {
        const mentor = x === rx && z === rz;
        return (
          <group key={i}>
            <Desk position={[x, 0, z]} width={2.8} />
            <Monitor
              position={[x - 0.55, 1.02, z - 0.2]}
              scale={0.75}
              variant={i % 2}
            />
            <Box
              position={[x - 0.55, 1.04, z + 0.28]}
              size={[0.7, 0.03, 0.22]}
              color="#d9d4c2"
            />
            {mentor ? null : <Chair position={[x - 0.4, 0, z + 0.95]} />}
            {i === 0 ? <Pot position={[x + 1.0, 1.02, z - 0.2]} scale={0.6} /> : null}
            {i === 1 ? <Coffee position={[x + 0.6, 1.02, z + 0.1]} /> : null}
          </group>
        );
      })}

      {/* Dĩ's desk: a name card, then a laptop + badge on the first day */}
      <Sign
        text="Dĩ · INTERN"
        position={[mx + 0.75, 1.13, mz + 0.5]}
        width={0.62}
        height={0.18}
        color="#f6f3ea"
        ink={TEAL}
        fontSize={70}
      />
      {effects.has("badge") ? (
        <PopIn position={[mx + 0.6, 1.02, mz - 0.05]} reducedMotion={reducedMotion}>
          <Laptop scale={0.65} />
          <Box position={[0.65, 0.02, 0.25]} size={[0.2, 0.02, 0.3]} color="#3f6f8a" />
          <Box position={[0.65, 0.035, 0.22]} size={[0.14, 0.01, 0.1]} color="#f4efe2" />
        </PopIn>
      ) : null}

      {/* mentor's desk */}
      <RubberDuck position={[rx + 0.85, 1.02, rz + 0.15]} />
      <Coffee position={[rx + 0.45, 1.02, rz + 0.3]} />
      {effects.has("review") ? (
        <>
          <Sign
            text="APPROVED"
            position={[rx - 0.55, 1.55, rz - 0.13]}
            width={0.98}
            height={0.56}
            color="#2f8a57"
            ink="#ffffff"
            fontSize={150}
          />
          <FloatingTag
            position={[rx, 2.75, rz]}
            text="PR APPROVED"
            color="#2f8a57"
            reducedMotion={reducedMotion}
          />
        </>
      ) : null}

      <Pot position={[11.2, 0, -8.5]} scale={1.4} />
      <Pot position={[16.4, 0, -8.5]} scale={1.7} />
      <group position={[16.85, 0, -0.6]} rotation={[0, -Math.PI / 2, 0]}>
        <Bookcase width={1.4} height={1.8} />
      </group>
    </group>
  );
}

function DesignScreen({ built }: { built: boolean }) {
  const [x, z] = L.designScreen;
  return (
    <ScreenStand position={[x, 0, z]} width={3.0} height={1.7}>
      <Panel size={[3.0, 1.7]} color={built ? "#fbfaf6" : "#eceae4"} glow={0.25} />
      {built ? (
        <group position={[0, 0, 0.01]}>
          <Box position={[0, 0.66, 0]} size={[2.8, 0.22, 0.01]} color={TEAL} />
          <Sign
            text="AMIT · UI KIT"
            position={[-0.8, 0.66, 0.008]}
            width={1.0}
            height={0.18}
            color={TEAL}
            ink="#ffffff"
            fontSize={80}
          />
          {(
            [
              [-0.92, "#e0a33a", "Card"],
              [0, TEAL, "Card"],
              [0.92, "#c9725a", "Card"],
            ] as Array<[number, string, string]>
          ).map(([cx, c, t]) => (
            <group key={cx} position={[cx, 0.08, 0]}>
              <Box size={[0.8, 0.7, 0.01]} color="#ffffff" />
              <Box position={[0, 0.25, 0.006]} size={[0.8, 0.2, 0.01]} color={c} />
              <Sign
                text={t}
                position={[0, -0.05, 0.012]}
                width={0.6}
                height={0.16}
                color="#ffffff"
                ink="#4a4a4a"
                fontSize={80}
              />
            </group>
          ))}
          <Box position={[-0.55, -0.55, 0]} size={[1.3, 0.2, 0.01]} color="#dfe5e3" />
          <Sign
            text="Input"
            position={[-0.55, -0.55, 0.008]}
            width={1.2}
            height={0.16}
            color="#ffffff"
            ink="#7a8582"
            fontSize={74}
          />
          <Box position={[0.75, -0.55, 0]} size={[0.75, 0.22, 0.01]} color={TEAL} />
          <Sign
            text="Button"
            position={[0.75, -0.55, 0.008]}
            width={0.66}
            height={0.17}
            color={TEAL}
            ink="#ffffff"
            fontSize={84}
          />
        </group>
      ) : (
        <group position={[0, 0, 0.01]}>
          <Sign
            text="FIGMA · BẢN THIẾT KẾ"
            position={[0, 0.66, 0]}
            width={1.8}
            height={0.2}
            color="#eceae4"
            ink="#6c6a64"
            fontSize={80}
          />
          {[-0.92, 0, 0.92].map((cx) => (
            <Box
              key={cx}
              position={[cx, 0.08, 0]}
              size={[0.8, 0.7, 0.01]}
              color="#d4d1c8"
            />
          ))}
          {[-0.55, 0.75].map((cx) => (
            <Box
              key={cx}
              position={[cx, -0.55, 0]}
              size={[cx < 0 ? 1.3 : 0.75, 0.2, 0.01]}
              color="#c4c1b8"
            />
          ))}
        </group>
      )}
    </ScreenStand>
  );
}

function Pantry() {
  const c = L.counter;
  const len = c.maxZ - c.minZ;
  const cz = (c.minZ + c.maxZ) / 2;
  return (
    <group>
      <Box position={[-11.9, 0.0, 6.5]} size={[10.2, 0.03, 5.6]} color="#e2d6bf" />
      {/* counter along the left wall */}
      <Box position={[c.x, 0.46, cz]} size={[0.7, 0.92, len]} color={WOOD} />
      <Box position={[c.x + 0.03, 0.95, cz]} size={[0.8, 0.06, len + 0.1]} color="#efe7d6" />
      {/* coffee machine, facing into the room (+x) */}
      <group position={[L.coffee[0], 0.98, L.coffee[1]]} rotation={[0, Math.PI / 2, 0]}>
        <Box position={[0, 0.36, 0]} size={[0.6, 0.72, 0.48]} color="#3a3f44" metalness={0.3} />
        <Box position={[0, 0.2, 0.2]} size={[0.3, 0.06, 0.16]} color="#8f9796" />
        <mesh position={[0.18, 0.55, 0.245]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshStandardMaterial color="#ff5a3a" emissive="#ff3a1a" emissiveIntensity={2} />
        </mesh>
        <Coffee position={[0, 0.0, 0.14]} />
      </group>
      <Coffee position={[c.x + 0.1, 0.98, c.minZ + 1.9]} />
      <Coffee position={[c.x - 0.1, 0.98, c.minZ + 2.2]} />
      <mesh position={[c.x, 1.1, c.maxZ - 0.6]}>
        <cylinderGeometry args={[0.13, 0.15, 0.3, 12]} />
        <meshStandardMaterial color="#c0c7c6" metalness={0.5} roughness={0.3} />
      </mesh>
      <Sign
        text="PANTRY"
        position={[-17.18, 2.35, cz]}
        rotation={[0, Math.PI / 2, 0]}
        width={1.8}
        height={0.38}
        color="#c9725a"
        ink="#fff6ea"
        fontSize={110}
      />
      {/* hanging sign over the pantry, readable from the camera */}
      <group userData={{ noCollide: true }}>
        {[-1, 1].map((s) => (
          <Segment
            key={s}
            from={[-14.2 + s * 0.7, 2.62, 4.0]}
            to={[-14.2 + s * 0.7, 3.3, 4.0]}
            radius={0.012}
            color="#5d6463"
          />
        ))}
        <Sign
          text="PANTRY · CÀ PHÊ"
          position={[-14.2, 2.5, 4.0]}
          width={1.8}
          height={0.34}
          color="#c9725a"
          ink="#fff6ea"
          fontSize={96}
        />
      </group>
      {/* fridge */}
      <Box position={[-16.6, 1.0, 8.75]} size={[0.8, 2.0, 0.7]} color="#d8dcda" metalness={0.2} />
      <Box position={[-16.18, 1.1, 8.55]} size={[0.05, 0.5, 0.03]} color="#8f9796" />
      {/* tables */}
      {L.pantryTables.map(([x, z]) => (
        <group key={x}>
          <RoundTable position={[x, 0, z]} />
          <Stool position={[x - 0.85, 0, z]} />
          <Stool position={[x + 0.85, 0, z]} color="#4c6c76" />
          <Coffee position={[x + 0.15, 0.79, z - 0.1]} />
        </group>
      ))}
      <Pot position={[-7.2, 0, 8.7]} scale={1.3} />
      <Pot position={[-16.5, 0, 3.8]} scale={1.3} />
    </group>
  );
}

function Reception({ handedOver }: { handedOver: boolean }) {
  const [x, z] = L.reception;
  return (
    <group>
      <Box position={[0.4, 0.0, 7.1]} size={[9.4, 0.03, 3.8]} color="#d3c7ab" />
      <group position={[x, 0, z]}>
        <Box position={[0, 0.55, 0]} size={[3.2, 1.1, 0.8]} color="#ede3cc" />
        <Box position={[0, 1.13, 0]} size={[3.4, 0.06, 0.95]} color={WOOD} />
        <Box position={[0, 0.55, 0.41]} size={[3.0, 0.08, 0.01]} color={TEAL} />
        <Sign
          text="AMIT GROUP"
          position={[0, 0.8, 0.41]}
          width={1.7}
          height={0.34}
          color="#ede3cc"
          ink={TEAL}
          fontSize={120}
        />
        <Monitor position={[0.9, 1.16, -0.15]} rotation={Math.PI} scale={0.5} />
        {handedOver ? null : (
          <group position={[-0.5, 1.16, 0.05]}>
            <Box position={[0, 0.03, 0]} size={[0.62, 0.05, 0.44]} color="#a9b2a5" metalness={0.4} />
            <Box position={[0.55, 0.012, 0.05]} size={[0.2, 0.02, 0.3]} color="#3f6f8a" />
          </group>
        )}
      </group>
      {/* welcome easel */}
      <group position={[-3.4, 0, 6.2]} rotation={[0, 0.25, 0]}>
        {[-0.45, 0.45].map((s) => (
          <Segment key={s} from={[s, 0, 0.15]} to={[s * 0.6, 1.7, 0]} radius={0.03} color="#6b5236" />
        ))}
        <Box position={[0, 1.15, 0.05]} size={[1.2, 0.8, 0.04]} color="#f6f3ea" />
        <Sign
          text="CHÀO MỪNG"
          position={[0, 1.32, 0.08]}
          width={1.05}
          height={0.22}
          color="#f6f3ea"
          ink="#c9725a"
          fontSize={90}
        />
        <Sign
          text="BẠN MỚI!"
          position={[0, 1.04, 0.08]}
          width={1.05}
          height={0.22}
          color="#f6f3ea"
          ink={TEAL}
          fontSize={90}
        />
      </group>
      <Pot position={[-5.2, 0, 8.6]} scale={1.6} />
      <Pot position={[5.4, 0, 8.6]} scale={1.6} />
    </group>
  );
}

function DesignCorner({ effects }: { effects: ReadonlySet<string> }) {
  const [sx, sz] = L.sofa;
  return (
    <group>
      <Box position={[9.6, 0.0, 6.5]} size={[7.0, 0.03, 5.6]} color="#cdd3c4" />
      <DesignScreen built={effects.has("ui")} />
      <Sofa position={[sx, 0, sz]} color="#7f9a8e" />
      <Box position={[sx, 0.22, sz - 1.15]} size={[1.2, 0.44, 0.6]} color={WOOD} />
      <Coffee position={[sx + 0.3, 0.44, sz - 1.1]} />
      <Orb position={[6.6, 0.32, 6.9]} scale={[0.5, 0.34, 0.5]} color="#e0a33a" />
      <Orb position={[6.5, 0.3, 5.6]} scale={[0.46, 0.32, 0.46]} color="#c9725a" />
      <Pot position={[12.4, 0, 8.7]} scale={1.4} />
      <Sign
        text="GÓC THIẾT KẾ"
        position={[L.designScreen[0], 3.08, L.designScreen[1]]}
        width={1.6}
        height={0.3}
        color={TEAL}
        ink="#f4efe2"
        fontSize={84}
      />
    </group>
  );
}

function Balcony({ reducedMotion }: { reducedMotion?: boolean }) {
  const b = L.balcony;
  const w = b.maxX - b.minX;
  const d = b.maxZ - b.minZ;
  const cx = (b.minX + b.maxX) / 2;
  const cz = (b.minZ + b.maxZ) / 2;
  return (
    <group>
      <Box position={[cx, 0.0, cz]} size={[w, 0.04, d]} color="#a77b52" />
      {Array.from({ length: 9 }, (_, i) => (
        <Box
          key={i}
          position={[b.minX + 0.2 + i * 0.45, 0.025, cz]}
          size={[0.02, 0.01, d]}
          color="#8a6340"
        />
      ))}
      {/* railing: right edge and front edge */}
      <Box position={[b.maxX, 1.02, cz]} size={[0.08, 0.06, d]} color="#5d6463" />
      <Glass position={[b.maxX, 0.55, cz]} size={[0.04, 0.9, d]} />
      <Box position={[cx, 1.02, b.maxZ]} size={[w, 0.06, 0.08]} color="#5d6463" />
      <Glass position={[cx, 0.55, b.maxZ]} size={[w, 0.9, 0.04]} />
      {[b.minZ, b.minZ + d / 3, b.minZ + (2 * d) / 3].map((z) => (
        <Pole key={z} position={[b.maxX, 0.5, z]} height={1.0} radius={0.04} color="#5d6463" />
      ))}
      {[b.minX, cx].map((x) => (
        <Pole key={x} position={[x, 0.5, b.maxZ]} height={1.0} radius={0.04} color="#5d6463" />
      ))}
      <Pole position={[b.maxX, 1.45, b.maxZ]} height={2.9} radius={0.05} color="#5d6463" />
      <Pole position={[b.maxX, 1.45, b.minZ]} height={2.9} radius={0.05} color="#5d6463" />
      <StringLights
        from={[b.maxX, 2.85, b.minZ]}
        to={[b.maxX, 2.85, b.maxZ]}
        reducedMotion={reducedMotion}
      />
      <Bench position={[16.3, 0, 5.4]} rotation={-Math.PI / 2} />
      <Pot position={[16.5, 0, 4.0]} scale={1.2} />
      <Pot position={[13.7, 0, 8.9]} scale={1.3} />
      <Pot position={[16.5, 0, 8.9]} scale={1.1} />
    </group>
  );
}

function Shell() {
  return (
    <group>
      {/* office floor slab over the street */}
      <Box position={[0, -0.05, 0.1]} size={[34.8, 0.03, 19.4]} color="#d6cdb6" />
      {/* back windows on both sides of the core */}
      <WindowWall x1={-17.4} x2={L.core.minX} z={-9.35} />
      <WindowWall x1={L.core.maxX} x2={17.4} z={-9.35} />
      {/* side walls */}
      <Box position={[-17.35, 1.67, 0.05]} size={[0.3, 3.34, 19.1]} color={WALL} />
      <Box position={[17.35, 1.67, -2.95]} size={[0.3, 3.34, 12.8]} color={WALL} />
      {/* floor edge at the front */}
      <Box position={[0, 0.0, 9.65]} size={[34.8, 0.05, 0.12]} color="#8f8a78" />
    </group>
  );
}

export function AmitMap({ effects, player, reducedMotion }: MapSceneProps) {
  return (
    <DioramaMap chapterId="amit" ground="#a9ad9f" reducedMotion={reducedMotion}>
      <Shell />
      <Core />
      <MeetingRoom effects={effects} player={player} reducedMotion={reducedMotion} />
      <OpenPlan effects={effects} player={player} reducedMotion={reducedMotion} />
      <Reception handedOver={effects.has("badge")} />
      <DesignCorner effects={effects} />
      <Pantry />
      <Balcony reducedMotion={reducedMotion} />
      <Pot position={[6.4, 0, -8.6]} scale={1.3} />
      <Pot position={[-6.6, 0, 3.2]} scale={1.2} />

      {/* the city outside */}
      <CityBackdrop position={[0, 0, -13]} length={54} seed={2} />
      <CityBackdrop
        position={[22, 0, 0]}
        rotation={-Math.PI / 2}
        length={30}
        seed={5}
        maxHeight={7}
      />
    </DioramaMap>
  );
}
