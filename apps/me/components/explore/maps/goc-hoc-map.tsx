"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { Smoke } from "@/components/story/world-childhood";
import {
  Box,
  Coffee,
  Laptop,
  Orb,
  Pole,
  Pot,
  Segment,
  Sign,
} from "@/components/story/world-3d";
import { GOC_HOC_LAYOUT as L } from "@/lib/explore/goc-hoc";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";

type V3 = [number, number, number];
type PlayerRef = RefObject<THREE.Group | null>;

const FACADE = "#5d6478";
const FACADE_TRIM = "#727a8e";
const WARM = "#ffcf7a";
const ROW_DEPTH = L.rowZ.front - L.rowZ.back;
const ROW_CZ = (L.rowZ.front + L.rowZ.back) / 2;
const H = L.room.height;

function seeded(i: number, k = 1) {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------- small helpers ---------- */

/** Unlit canvas text (screens, clock). `bg: null` draws text on a transparent plane. */
function GlowPanel({
  lines,
  position,
  rotation,
  width,
  height,
  bg = "#1b2430",
  ink = "#cfe8d0",
  accent,
  fontSize = 56,
  align = "left",
  font = "'Courier New', monospace",
}: {
  lines: string[];
  position: V3;
  rotation?: V3;
  width: number;
  height: number;
  bg?: string | null;
  ink?: string;
  accent?: string;
  fontSize?: number;
  align?: "left" | "center";
  font?: string;
}) {
  const text = lines.join("\n");
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = Math.round((1024 * height) / width);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const rows = text.split("\n");
    const lh = fontSize * 1.4;
    const top = (canvas.height - lh * rows.length) / 2 + lh / 2;
    ctx.textBaseline = "middle";
    ctx.textAlign = align;
    ctx.font = `700 ${fontSize}px ${font}`;
    const x = align === "center" ? canvas.width / 2 : 60;
    rows.forEach((row, i) => {
      ctx.fillStyle = i === 0 && accent ? accent : ink;
      ctx.fillText(row, x, top + i * lh, canvas.width - 100);
    });
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
  }, [text, width, height, bg, ink, accent, fontSize, align, font]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        color={texture ? "white" : (bg ?? "black")}
        transparent={!bg}
        depthWrite={!!bg}
        toneMapped={false}
      />
    </mesh>
  );
}

/** A window pane that glows at night (lit) or stays dark. */
function Pane({
  position,
  size,
  lit,
  color = WARM,
}: {
  position: V3;
  size: [number, number];
  lit: boolean;
  color?: string;
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial color={lit ? color : "#2a3044"} toneMapped={false} />
    </mesh>
  );
}

/* ---------- Dĩ's room: front wall (cut away while inside) ---------- */

function RoomFront({ player }: { player: PlayerRef }) {
  const upper = useRef<THREE.Group>(null);
  const R = L.room;
  useFrame(() => {
    const p = player.current?.position;
    if (!p || !upper.current) return;
    const inside =
      p.x > R.minX - 0.2 && p.x < 5.45 + 0.2 && p.z < R.frontZ + 0.35;
    upper.current.visible = !inside;
  });
  const T = 0.15;
  const LOW = 0.9;
  const doorL = R.doorX - R.doorW / 2;
  const doorR = R.doorX + R.doorW / 2;
  const segs = [
    { x: (R.minX + doorL) / 2, w: doorL - R.minX },
    { x: (doorR + 5.45) / 2, w: 5.45 - doorR },
  ];
  return (
    <group>
      {segs.map((s) => (
        <group key={s.x}>
          <Box
            position={[s.x, LOW / 2, R.frontZ]}
            size={[s.w, LOW, T]}
            color={FACADE}
          />
          <Box
            position={[s.x, LOW + 0.03, R.frontZ]}
            size={[s.w + 0.02, 0.06, T + 0.06]}
            color={FACADE_TRIM}
          />
        </group>
      ))}
      {/* door threshold */}
      <Box
        position={[R.doorX, 0.02, R.frontZ]}
        size={[R.doorW, 0.04, T + 0.1]}
        color="#3f4556"
      />
      <group ref={upper}>
        {segs.map((s) => (
          <Box
            key={s.x}
            position={[s.x, LOW + (H - LOW) / 2, R.frontZ]}
            size={[s.w, H - LOW, T]}
            color={FACADE}
          />
        ))}
        <Box
          position={[R.doorX, (2.3 + H) / 2, R.frontZ]}
          size={[R.doorW, H - 2.3, T]}
          color={FACADE}
        />
        {/* lit window with a grille, room number, aircon */}
        <group position={[-2.9, 1.85, R.frontZ + T / 2 + 0.01]}>
          <Pane position={[0, 0, 0]} size={[1.3, 0.8]} lit />
          {[-0.45, -0.15, 0.15, 0.45].map((x) => (
            <Box
              key={x}
              position={[x, 0, 0.02]}
              size={[0.025, 0.8, 0.02]}
              color="#2a2f3a"
            />
          ))}
        </group>
        <Sign
          text="P.3"
          position={[R.doorX, 2.55, R.frontZ + T / 2 + 0.02]}
          width={0.5}
          height={0.24}
          color="#d9d4c0"
          ink="#2a2f3a"
          fontSize={160}
        />
        <Box
          position={[3.6, 3.0, R.frontZ + 0.24]}
          size={[0.8, 0.45, 0.3]}
          color="#d9d9d4"
        />
        {/* ceiling slab + parapet */}
        <Box
          position={[0.075, H + 0.06, (R.backZ + R.frontZ) / 2]}
          size={[10.9, 0.12, R.frontZ - R.backZ + 0.2]}
          color="#4b5163"
        />
        <Box
          position={[0.075, H + 0.25, R.frontZ]}
          size={[10.9, 0.3, 0.12]}
          color={FACADE_TRIM}
        />
      </group>
    </group>
  );
}

/* ---------- inside the room ---------- */

function Cat({ reducedMotion }: { reducedMotion?: boolean }) {
  const tail = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!tail.current || reducedMotion) return;
    tail.current.rotation.z = 0.5 + Math.sin(clock.elapsedTime * 1.6) * 0.35;
  });
  const fur = "#e0a050";
  return (
    <group position={[L.cat[0], 0.94, L.cat[1]]} rotation={[0, 0.5, 0]}>
      <Orb position={[0, 0.12, 0]} scale={[0.2, 0.13, 0.12]} color={fur} />
      <Orb
        position={[0.17, 0.25, 0.02]}
        scale={[0.1, 0.09, 0.09]}
        color={fur}
      />
      {[-0.045, 0.045].map((z) => (
        <mesh key={z} position={[0.17, 0.35, 0.02 + z]}>
          <coneGeometry args={[0.03, 0.07, 4]} />
          <meshStandardMaterial color={fur} />
        </mesh>
      ))}
      <group ref={tail} position={[-0.18, 0.1, 0]} rotation={[0, 0, 0.5]}>
        <Segment
          from={[0, 0, 0]}
          to={[-0.05, 0.26, 0]}
          radius={0.025}
          color={fur}
        />
      </group>
    </group>
  );
}

function SleepingRoommate({ reducedMotion }: { reducedMotion?: boolean }) {
  const blanket = useRef<THREE.Mesh>(null);
  const zzz = useRef<THREE.Group>(null);
  const [bx, bz] = L.bed;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (blanket.current && !reducedMotion)
      blanket.current.scale.y = 0.16 + Math.sin(t * 1.2) * 0.012;
    if (zzz.current && !reducedMotion)
      zzz.current.children.forEach((z, i) => {
        const k = (t * 0.25 + i / 3) % 1;
        z.position.set(0.15 * k + i * 0.05, k * 0.7, 0);
        z.scale.setScalar(0.6 + k * 0.6);
      });
  });
  return (
    <group userData={{ noCollide: true }}>
      <Orb
        position={[bx - 0.2, 0.98, bz - 0.47]}
        scale={[0.19, 0.17, 0.18]}
        color="#e9bf96"
      />
      <Orb
        position={[bx - 0.2, 1.03, bz - 0.55]}
        scale={[0.2, 0.16, 0.16]}
        color="#1d1a18"
      />
      <mesh
        ref={blanket}
        position={[bx, 0.86, bz + 0.2]}
        scale={[0.6, 0.16, 0.55]}
        castShadow
      >
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#5b6fa8" roughness={0.95} />
      </mesh>
      <group ref={zzz} position={[bx - 0.1, 1.3, bz - 0.4]}>
        {["Z", "z", "z"].map((s, i) => (
          <GlowPanel
            key={i}
            lines={[s]}
            position={[i * 0.05, i * 0.22, 0]}
            width={0.2}
            height={0.2}
            bg={null}
            ink="#c9d4ff"
            fontSize={700}
            align="center"
            font="Arial, sans-serif"
          />
        ))}
      </group>
    </group>
  );
}

const CLOCK_TIMES = ["22:00", "22:35", "23:10", "23:45", "00:40", "01:15"];
const DESK_EFFECTS = ["den", "hello", "cafe", "fix", "push"];

function DeskStuff({
  effects,
  reducedMotion,
}: {
  effects: ReadonlySet<string>;
  reducedMotion?: boolean;
}) {
  const y = L.deskTopY;
  const shade = L.lampShade;
  const hello = effects.has("hello");
  const push = effects.has("push");
  const fixed = effects.has("fix");
  const done = DESK_EFFECTS.filter((e) => effects.has(e)).length;
  const monitorLines = push
    ? [
        "$ git add .",
        '$ git commit -m "bai tap dau tien"',
        "$ git push origin main",
        "✓ Đã đẩy lên GitHub",
      ]
    : [
        "// bài tập đầu tiên",
        'console.log("Hello, world!");',
        "",
        "> Hello, world!",
      ];
  return (
    <group>
      {/* ceiling bulb, always on but dim */}
      <Segment
        from={[0.4, H, -1.2]}
        to={[0.4, 3.35, -1.2]}
        radius={0.01}
        color="#2a2f3a"
      />
      <mesh position={[0.4, 3.28, -1.2]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshBasicMaterial color="#ffe6c0" toneMapped={false} />
      </mesh>
      <pointLight
        position={[0.4, 3.1, -1.0]}
        color="#ffe2b8"
        intensity={1.6}
        distance={9}
        decay={2}
      />

      {/* desk lamp switched on */}
      {effects.has("den") ? (
        <group>
          <mesh position={shade}>
            <sphereGeometry args={[0.075, 10, 8]} />
            <meshBasicMaterial color="#fff1c4" toneMapped={false} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-2.25, y + 0.006, -1.55]}
          >
            <circleGeometry args={[0.5, 24]} />
            <meshBasicMaterial
              color="#ffe0a0"
              transparent
              opacity={0.22}
              depthWrite={false}
            />
          </mesh>
        </group>
      ) : null}
      {/* Always mounted (0 when off): toggling a light's presence forces every material to recompile. */}
      <pointLight
        position={[shade[0] + 0.1, shade[1] - 0.1, shade[2] + 0.35]}
        color="#ffd28a"
        intensity={effects.has("den") ? 5 : 0}
        distance={5.5}
        decay={2}
      />

      {/* monitor: Hello, world! then git push */}
      {hello || push ? (
        <GlowPanel
          lines={monitorLines}
          position={L.monitorScreen}
          width={1.18}
          height={0.7}
          accent={push ? "#9fb4c8" : "#7f8c99"}
          ink={push ? "#8ee59a" : "#e6edf3"}
          fontSize={50}
        />
      ) : null}

      {/* laptop: the bug, then the fix */}
      <group position={L.laptopScreen} rotation={[-0.14, 0, 0]}>
        <GlowPanel
          lines={
            fixed
              ? ["✓ 0 lỗi", "Nút bấm chạy rồi!"]
              : [
                  "Uncaught TypeError:",
                  "Cannot read properties",
                  "of undefined",
                ]
          }
          position={[0, 0, 0.045]}
          width={0.68}
          height={0.4}
          bg={fixed ? "#12301f" : "#2a1416"}
          ink={fixed ? "#7ee08a" : "#ff8a80"}
          fontSize={fixed ? 90 : 72}
        />
      </group>

      {/* coffee + cup noodles */}
      {effects.has("cafe") ? (
        <group>
          <Coffee position={[0.45, y, -1.25]} />
          <group scale={0.3}>
            <Smoke
              position={[0.45 / 0.3, (y + 0.28) / 0.3, -1.25 / 0.3]}
              reducedMotion={reducedMotion}
            />
          </group>
          <group position={[0.38, y, -1.9]}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.11, 0.085, 0.2, 14]} />
              <meshStandardMaterial color="#f4efe2" />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.105, 0.1, 0.06, 14]} />
              <meshStandardMaterial color="#c0392b" />
            </mesh>
            <Box
              position={[0.02, 0.205, 0]}
              size={[0.2, 0.01, 0.2]}
              color="#e6b33a"
            />
          </group>
        </group>
      ) : null}

      {/* digital clock on the side wall */}
      <group position={[-5.04, 2.65, -0.9]} rotation={[0, Math.PI / 2, 0]}>
        <Box
          position={[0, 0, -0.02]}
          size={[0.7, 0.32, 0.04]}
          color="#1d1f26"
        />
        <GlowPanel
          lines={[CLOCK_TIMES[done] ?? CLOCK_TIMES[0]!]}
          position={[0, 0, 0.005]}
          width={0.62}
          height={0.25}
          bg="#14161c"
          ink="#ff5a4a"
          fontSize={190}
          align="center"
        />
      </group>
      {/* a sticky note of goals on the wall */}
      <GlowPanel
        lines={["JS → React → TS", "mỗi ngày 1 chút"]}
        position={[-2.75, 1.55, -3.37]}
        width={0.7}
        height={0.32}
        bg="#f2d36b"
        ink="#4a3a1a"
        fontSize={92}
        align="center"
        font="Arial, sans-serif"
      />
    </group>
  );
}

/* ---------- the row of rented rooms ---------- */

type RoomDoor = { x: number; label: string; open?: boolean; lit?: boolean };

function RowBlock({
  minX,
  maxX,
  doors,
}: {
  minX: number;
  maxX: number;
  doors: RoomDoor[];
}) {
  const w = maxX - minX;
  const cx = (minX + maxX) / 2;
  const face = L.rowZ.front + 0.012;
  return (
    <group>
      <Box
        position={[cx, H / 2, ROW_CZ]}
        size={[w, H, ROW_DEPTH]}
        color={FACADE}
      />
      <Box
        position={[cx, H + 0.15, ROW_CZ]}
        size={[w + 0.1, 0.3, ROW_DEPTH + 0.1]}
        color="#4b5163"
      />
      {doors.map((d) => (
        <group key={d.x} position={[d.x, 0, face]}>
          <Box
            position={[0, 1.02, 0]}
            size={[1.1, 2.04, 0.03]}
            color={FACADE_TRIM}
          />
          {d.open ? (
            <Pane
              position={[0, 1.0, 0.02]}
              size={[0.95, 1.95]}
              lit
              color="#ffd59a"
            />
          ) : (
            <Box
              position={[0, 1.0, 0.02]}
              size={[0.95, 1.95, 0.02]}
              color="#3b3f4a"
            />
          )}
          <Pane position={[1.35, 1.6, 0.01]} size={[0.9, 0.65]} lit={!!d.lit} />
          {[-0.2, 0.0, 0.2].map((gx) => (
            <Box
              key={gx}
              position={[1.35 + gx, 1.6, 0.03]}
              size={[0.02, 0.65, 0.02]}
              color="#2a2f3a"
            />
          ))}
          <Sign
            text={d.label}
            position={[0, 2.3, 0.02]}
            width={0.42}
            height={0.2}
            color="#d9d4c0"
            ink="#2a2f3a"
            fontSize={150}
          />
          <Box
            position={[1.35, 3.0, 0.16]}
            size={[0.75, 0.42, 0.28]}
            color="#d9d9d4"
          />
          <Pot position={[-0.85, 0, 0.3]} scale={0.7} />
        </group>
      ))}
    </group>
  );
}

function WaterTank({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Box position={[0, 0.2, 0]} size={[1.1, 0.4, 0.8]} color="#3f4556" />
      <mesh position={[0, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 1.2, 16]} />
        <meshStandardMaterial
          color="#b9c0c8"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function Laundry() {
  const clothes = [
    "#c0392b",
    "#f1e6cf",
    "#2e6f8e",
    "#e6b33a",
    "#6a8a5a",
    "#d9d4c0",
  ];
  return (
    <group userData={{ noCollide: true }}>
      <Segment
        from={[-16.4, 2.75, 1.8]}
        to={[-5.8, 2.75, 1.8]}
        radius={0.008}
        color="#9aa3a0"
      />
      {clothes.map((c, i) => (
        <Box
          key={c}
          position={[-15.6 + i * 1.6, 2.47, 1.8]}
          size={[0.42, 0.55, 0.02]}
          color={c}
          rotation={[0, 0, (seeded(i) - 0.5) * 0.15]}
        />
      ))}
    </group>
  );
}

/* ---------- the alley ---------- */

function StreetLamp({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Pole position={[0, 1.7, 0]} height={3.4} radius={0.06} color="#3f4556" />
      <Segment
        from={[0, 3.3, 0]}
        to={[0, 3.45, -0.55]}
        radius={0.03}
        color="#3f4556"
      />
      <mesh position={[0, 3.36, -0.6]}>
        <sphereGeometry args={[0.14, 12, 8]} />
        <meshBasicMaterial color="#ffe0a8" toneMapped={false} />
      </mesh>
      <pointLight
        position={[0, 3.1, -0.8]}
        color="#ffd9a0"
        intensity={4}
        distance={8}
        decay={2}
      />
    </group>
  );
}

function Motorbike({ position, color }: { position: V3; color: string }) {
  return (
    <group position={position}>
      {[-0.5, 0.5].map((wz) => (
        <mesh
          key={wz}
          position={[0, 0.27, wz]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        >
          <torusGeometry args={[0.22, 0.07, 6, 16]} />
          <meshStandardMaterial color="#1d1f26" />
        </mesh>
      ))}
      <Box position={[0, 0.48, -0.05]} size={[0.3, 0.3, 0.8]} color={color} />
      <Box
        position={[0, 0.68, -0.15]}
        size={[0.28, 0.1, 0.55]}
        color="#1d1f26"
      />
      <Box position={[0, 0.66, 0.42]} size={[0.32, 0.55, 0.1]} color={color} />
      <Segment
        from={[-0.3, 0.98, 0.45]}
        to={[0.3, 0.98, 0.45]}
        radius={0.02}
        color="#3a3a3a"
      />
    </group>
  );
}

function NoodleCart({ reducedMotion }: { reducedMotion?: boolean }) {
  const [x, z] = L.cart;
  return (
    <group position={[x, 0, z]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.62, 0.3, 0.38]} castShadow>
          <torusGeometry args={[0.26, 0.05, 6, 16]} />
          <meshStandardMaterial color="#2a2a2e" />
        </mesh>
      ))}
      <Box position={[0, 0.78, 0]} size={[1.6, 0.7, 0.7]} color="#b5372c" />
      <Box position={[0, 1.15, 0]} size={[1.7, 0.05, 0.8]} color="#d9d4c0" />
      <Sign
        text="HỦ TIẾU"
        position={[0, 0.8, 0.36]}
        width={1.2}
        height={0.3}
        color="#b5372c"
        ink="#f4e7b8"
        fontSize={150}
      />
      {/* glass case with noodles and herbs */}
      <mesh position={[-0.3, 1.42, 0]}>
        <boxGeometry args={[0.85, 0.48, 0.55]} />
        <meshStandardMaterial color="#bfe0e8" transparent opacity={0.3} />
      </mesh>
      <Box
        position={[-0.45, 1.25, 0]}
        size={[0.3, 0.12, 0.3]}
        color="#f1e6cf"
      />
      <Box
        position={[-0.12, 1.24, 0]}
        size={[0.24, 0.1, 0.24]}
        color="#5f8a3e"
      />
      {/* broth pot */}
      <mesh position={[0.5, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.2, 0.36, 16]} />
        <meshStandardMaterial
          color="#b9c0c8"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
      <group scale={0.5}>
        <Smoke position={[1.0, 3.2, 0]} reducedMotion={reducedMotion} />
      </group>
      {/* roof + bulb */}
      {[-0.75, 0.75].map((px) => (
        <Pole
          key={px}
          position={[px, 1.6, -0.3]}
          height={0.9}
          radius={0.025}
          color="#6b6f6a"
        />
      ))}
      <Box
        position={[0, 2.08, -0.05]}
        size={[1.8, 0.05, 0.9]}
        color="#2e6f8e"
      />
      <mesh position={[0, 1.9, 0.15]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshBasicMaterial color="#fff1c4" toneMapped={false} />
      </mesh>
      <pointLight
        position={[0, 1.8, 0.4]}
        color="#ffd59a"
        intensity={3.5}
        distance={5}
        decay={2}
      />
      {/* plastic stools */}
      {[-0.9, 0, 0.9].map((sx, i) => (
        <mesh key={sx} position={[sx, 0.18, 2.1 + (i % 2) * 0.15]}>
          <cylinderGeometry args={[0.17, 0.2, 0.36, 10]} />
          <meshStandardMaterial color={i % 2 ? "#2e6f8e" : "#c0392b"} />
        </mesh>
      ))}
    </group>
  );
}

function KettleShelf({
  steaming,
  reducedMotion,
}: {
  steaming: boolean;
  reducedMotion?: boolean;
}) {
  const [x, z] = L.kettleShelf;
  return (
    <group position={[x, 0, z]}>
      <Box position={[0, 0.45, 0]} size={[1.1, 0.9, 0.4]} color="#7a6a58" />
      <Box position={[0, 0.92, 0]} size={[1.16, 0.04, 0.46]} color="#9a8a72" />
      <mesh position={[-0.28, 1.07, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.26, 14]} />
        <meshStandardMaterial color="#f1f1ea" />
      </mesh>
      <Box
        position={[-0.14, 1.1, 0]}
        size={[0.06, 0.16, 0.04]}
        color="#2a2a2e"
      />
      {["#c0392b", "#e6b33a", "#2e6f8e"].map((c, i) => (
        <Box
          key={c}
          position={[0.12 + i * 0.14, 1.0 + (i === 1 ? 0.06 : 0), 0.02]}
          size={[0.12, 0.12 + (i === 1 ? 0.1 : 0), 0.18]}
          color={c}
        />
      ))}
      <mesh position={[0.42, 1.0, 0.05]}>
        <cylinderGeometry args={[0.05, 0.05, 0.12, 10]} />
        <meshStandardMaterial color="#e3d8b9" />
      </mesh>
      {steaming ? (
        <group scale={0.35}>
          <Smoke
            position={[-0.28 / 0.35, 1.25 / 0.35, 0]}
            reducedMotion={reducedMotion}
          />
        </group>
      ) : null}
    </group>
  );
}

function NeighborCorner() {
  const [x, z] = L.neighborTable;
  return (
    <group position={[x, 0, z]}>
      <Box position={[0, 0.22, 0]} size={[0.6, 0.44, 0.5]} color="#7a6a58" />
      <Laptop position={[0, 0.44, 0.02]} scale={0.38} />
      <Coffee position={[0.22, 0.44, 0.18]} />
    </group>
  );
}

function Gate() {
  const zs = Array.from({ length: 15 }, (_, i) => 1.8 + i * 0.52);
  return (
    <group position={[L.gateX, 0, 0]}>
      {[1.55, 9.6].map((z) => (
        <Box
          key={z}
          position={[0, 1.2, z]}
          size={[0.4, 2.4, 0.4]}
          color={FACADE_TRIM}
        />
      ))}
      {zs.map((z) => (
        <Box
          key={z}
          position={[0, 1.0, z]}
          size={[0.04, 1.9, 0.04]}
          color="#2a2f3a"
        />
      ))}
      {[0.12, 1.95].map((y) => (
        <Box
          key={y}
          position={[0, y, 5.6]}
          size={[0.06, 0.06, 8.0]}
          color="#2a2f3a"
        />
      ))}
      <mesh position={[0.3, 2.55, 1.55]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshBasicMaterial color={WARM} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Night towers far behind the dãy trọ, windows painted on a canvas. */
function Tower({
  position,
  size,
  seed,
}: {
  position: V3;
  size: V3;
  seed: number;
}) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#1b2136";
    ctx.fillRect(0, 0, 128, 256);
    let n = 0;
    for (let row = 0; row < 20; row++)
      for (let col = 0; col < 6; col++) {
        const r = seeded(n++, seed);
        ctx.fillStyle = r > 0.62 ? "#ffd98a" : r > 0.5 ? "#9fc6ff" : "#262d45";
        ctx.fillRect(8 + col * 20, 8 + row * 12.4, 12, 7);
      }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [seed]);
  useEffect(() => () => texture?.dispose(), [texture]);
  const [w, h, d] = size;
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#1d2338" roughness={1} />
      </mesh>
      <mesh position={[0, h / 2, d / 2 + 0.02]}>
        <planeGeometry args={[w * 0.92, h * 0.96]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, h + 0.3, 0]}>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshBasicMaterial color="#ff4a3a" toneMapped={false} />
      </mesh>
    </group>
  );
}

const TOWERS: Array<{ p: V3; s: V3 }> = [
  { p: [-15, 0, -14], s: [4, 9, 3] },
  { p: [-9, 0, -18], s: [4.5, 14, 4] },
  { p: [-3, 0, -13], s: [3.5, 8, 3] },
  { p: [3, 0, -19], s: [5, 18, 4] },
  { p: [9, 0, -14], s: [4, 11, 3] },
  { p: [15, 0, -17], s: [4.5, 13, 4] },
  { p: [20, 0, -12], s: [4, 8, 3] },
  { p: [-21, 0, -12], s: [4, 7, 3] },
];

/* ---------- whole map ---------- */

export function GocHocMap({ effects, player, reducedMotion }: MapSceneProps) {
  return (
    <DioramaMap
      chapterId="goc-hoc"
      ground="#2e3240"
      reducedMotion={reducedMotion}
    >
      {/* alley paving + gutter */}
      <Box
        position={[0, -0.02, 5.55]}
        size={[34.6, 0.05, 8.1]}
        color="#454b5a"
      />
      <Box position={[0, 0.01, 9.2]} size={[34.6, 0.02, 0.3]} color="#3a3f4c" />
      {[-7, 2, 12].map((x) => (
        <mesh
          key={x}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.012, 6.2]}
        >
          <circleGeometry args={[0.32, 18]} />
          <meshStandardMaterial color="#3a3f4c" metalness={0.4} />
        </mesh>
      ))}

      {/* Dĩ's room (the diorama) closed off with a front wall */}
      <RoomFront player={player} />
      <DeskStuff effects={effects} reducedMotion={reducedMotion} />
      <SleepingRoommate reducedMotion={reducedMotion} />
      <Cat reducedMotion={reducedMotion} />

      {/* the rest of the dãy trọ */}
      <RowBlock
        minX={-17}
        maxX={-5.3}
        doors={[
          { x: -14.2, label: "P.1", lit: false },
          { x: -9.2, label: "P.2", open: true, lit: true },
        ]}
      />
      <RowBlock
        minX={5.45}
        maxX={17}
        doors={[
          { x: 8.6, label: "P.4", lit: true },
          { x: 13.4, label: "P.5", lit: false },
        ]}
      />
      <WaterTank position={[-12, H + 0.3, -1.6]} />
      <WaterTank position={[12.4, H + 0.3, -1.2]} />
      <Segment
        from={[-7.5, H + 0.3, -2.4]}
        to={[-7.5, H + 1.6, -2.4]}
        radius={0.02}
        color="#8a8f8a"
      />
      <Segment
        from={[-7.9, H + 1.3, -2.4]}
        to={[-7.1, H + 1.3, -2.4]}
        radius={0.015}
        color="#8a8f8a"
      />
      <Laundry />
      <KettleShelf
        steaming={effects.has("cafe")}
        reducedMotion={reducedMotion}
      />
      <NeighborCorner />

      {/* parked bikes + plants */}
      <Motorbike position={[-11.6, 0, 2.3]} color="#c0392b" />
      <Motorbike position={[-12.5, 0, 2.3]} color="#d9d4c0" />
      <Motorbike position={[11.6, 0, 2.3]} color="#2e5b8a" />
      <Motorbike position={[15.4, 0, 2.3]} color="#3a3a3a" />
      <Pot position={[-15.6, 0, 8.6]} scale={1.1} />
      <Pot position={[16.2, 0, 8.6]} scale={1.1} />

      {/* street, vendor, gate */}
      <NoodleCart reducedMotion={reducedMotion} />
      <Gate />
      {L.streetLamps.map(([x, z]) => (
        <StreetLamp key={x} position={[x, 0, z]} />
      ))}
      <group userData={{ noCollide: true }}>
        <Segment
          from={[-11.5, 3.35, 8.9]}
          to={[3.2, 3.35, 8.9]}
          radius={0.012}
          color="#1d1f26"
        />
        <Segment
          from={[-11.5, 3.35, 8.9]}
          to={[-9.0, H + 0.3, L.rowZ.front]}
          radius={0.012}
          color="#1d1f26"
        />
        <Segment
          from={[3.2, 3.35, 8.9]}
          to={[6.5, H + 0.3, L.rowZ.front]}
          radius={0.012}
          color="#1d1f26"
        />
        <Segment
          from={[3.2, 3.2, 8.9]}
          to={[17, 3.6, 8.4]}
          radius={0.012}
          color="#1d1f26"
        />
      </group>

      {/* south wall and low houses beyond it */}
      <Box
        position={[0, 0.55, L.southWallZ]}
        size={[34.6, 1.1, 0.25]}
        color="#4b5163"
      />
      <Box
        position={[0, 1.13, L.southWallZ]}
        size={[34.8, 0.08, 0.4]}
        color={FACADE_TRIM}
      />
      {[-12, -1.5, 9.5].map((x, i) => (
        <group key={x} position={[x, 0, 14]}>
          <Box
            position={[0, 1.4, 0]}
            size={[7.5 + i * 0.4, 2.8, 3.4]}
            color="#3d4354"
          />
          <Box
            position={[0, 2.85, 0]}
            size={[7.7 + i * 0.4, 0.12, 3.6]}
            color="#4b5163"
          />
          <WaterTank position={[1.6 - i, 2.9, 0]} />
        </group>
      ))}

      {/* the city at night, and the moon */}
      {TOWERS.map((t, i) => (
        <Tower key={i} position={t.p} size={t.s} seed={i + 3} />
      ))}
      <mesh position={[-12, 15, -38]}>
        <circleGeometry args={[1.8, 32]} />
        <meshBasicMaterial color="#f4f1da" toneMapped={false} fog={false} />
      </mesh>
    </DioramaMap>
  );
}
