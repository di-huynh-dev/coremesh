"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  Bench,
  Book,
  Bookcase,
  Box,
  C,
  DeskLamp,
  Laptop,
  Monitor,
  Orb,
  Pole,
  Pot,
  Segment,
  Sign,
  Tree,
} from "@/components/story/world-3d";
import { Table } from "@/components/story/world-childhood";
import { UTE_LAYOUT as L } from "@/lib/explore/ute";
import type { VillagerLook } from "@/lib/explore/types";
import { useFrame } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import * as THREE from "three";
import { Villager } from "../villager";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";

type V3 = [number, number, number];
type Room = typeof L.hall;
type PlayerRef = RefObject<THREE.Group | null>;

const UTE_BLUE = "#365f77";
const WALL = "#e6e1cc";
const PATH = "#d1c8b5";

/* ---------- small helpers ---------- */

/** Unlit canvas text panel (projector slides, notices). */
function GlowPanel({
  lines,
  position,
  rotation,
  width,
  height,
  bg = "#1b2a33",
  ink = "#e9f1ea",
  accent,
  fontSize = 64,
  align = "left",
}: {
  lines: string[];
  position: V3;
  rotation?: V3;
  width: number;
  height: number;
  bg?: string;
  ink?: string;
  accent?: string;
  fontSize?: number;
  align?: "left" | "center";
}) {
  const text = lines.join("\n");
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = Math.round((1024 * height) / width);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const rows = text.split("\n");
    const lh = fontSize * 1.4;
    const top = (canvas.height - lh * rows.length) / 2 + lh / 2;
    ctx.textBaseline = "middle";
    ctx.textAlign = align;
    const x = align === "center" ? canvas.width / 2 : 70;
    rows.forEach((row, i) => {
      const head = i === 0 && accent;
      ctx.fillStyle = head ? accent : ink;
      ctx.font = `${head ? 800 : 600} ${head ? fontSize * 1.15 : fontSize}px Arial, sans-serif`;
      ctx.fillText(row, x, top + i * lh, canvas.width - 120);
    });
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
  }, [text, width, height, bg, ink, accent, fontSize, align]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        color={texture ? "white" : bg}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Dollhouse room: floor, back + side walls and a knee-high front wall stay;
 * the upper front wall, lintel and flat roof lift off while Dĩ is inside.
 */
function CutawayRoom({
  room,
  player,
  label,
  floor,
  children,
}: {
  room: Room;
  player: PlayerRef;
  label: string;
  floor: string;
  children?: ReactNode;
}) {
  const hidden = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = player.current?.position;
    if (!p || !hidden.current) return;
    const inside =
      p.x > room.minX - 0.2 &&
      p.x < room.maxX + 0.2 &&
      p.z > room.backZ &&
      p.z < room.frontZ + 0.4;
    hidden.current.visible = !inside;
  });
  const T = 0.2;
  const LOW = 0.95;
  const H = room.height;
  const w = room.maxX - room.minX;
  const d = room.frontZ - room.backZ;
  const cx = (room.minX + room.maxX) / 2;
  const cz = (room.backZ + room.frontZ) / 2;
  const doorL = room.doorX - room.doorW / 2;
  const doorR = room.doorX + room.doorW / 2;
  const segments = [
    { x: (room.minX + doorL) / 2, w: doorL - room.minX },
    { x: (doorR + room.maxX) / 2, w: room.maxX - doorR },
  ].map((s) => ({ ...s, windows: Math.floor(s.w / 1.4) }));
  return (
    <group>
      <Box position={[cx, 0.0, cz]} size={[w, 0.08, d]} color={floor} />
      <Box
        position={[cx, H / 2, room.backZ]}
        size={[w + T, H, T]}
        color={WALL}
      />
      {[room.minX, room.maxX].map((x) => (
        <Box key={x} position={[x, H / 2, cz]} size={[T, H, d]} color={WALL} />
      ))}
      {segments.map((s) => (
        <Box
          key={s.x}
          position={[s.x, LOW / 2, room.frontZ]}
          size={[s.w, LOW, T]}
          color="#cfc6ab"
        />
      ))}
      <group ref={hidden}>
        {segments.map((s) => (
          <group key={s.x}>
            <Box
              position={[s.x, LOW + (H - LOW) / 2, room.frontZ]}
              size={[s.w, H - LOW, T]}
              color={WALL}
            />
            {/* window band */}
            {s.windows > 0
              ? Array.from({ length: s.windows }, (_, i) => (
                  <Box
                    key={i}
                    position={[
                      s.x + (i - (s.windows - 1) / 2) * 1.4,
                      2.0,
                      room.frontZ + T / 2 + 0.01,
                    ]}
                    size={[0.9, 0.8, 0.03]}
                    color="#5a8494"
                  />
                ))
              : null}
          </group>
        ))}
        <Box
          position={[room.doorX, (2.3 + H) / 2, room.frontZ]}
          size={[room.doorW, H - 2.3, T]}
          color={WALL}
        />
        <Sign
          text={label}
          position={[room.doorX, 2.62, room.frontZ + T / 2 + 0.02]}
          width={Math.min(2.6, room.doorW + 0.6)}
          height={0.34}
          color={UTE_BLUE}
          ink="#e7d8ab"
          fontSize={92}
        />
        <Box
          position={[cx, H + 0.08, cz]}
          size={[w + 0.5, 0.16, d + 0.5]}
          color="#cfc8b2"
        />
        <Box
          position={[cx, H + 0.24, room.frontZ + 0.2]}
          size={[w + 0.5, 0.18, 0.12]}
          color={UTE_BLUE}
        />
      </group>
      {children}
    </group>
  );
}

/** A cone of light from the projector to the screen. */
function Beam({ from, to }: { from: V3; to: V3 }) {
  const { center, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    return {
      center: a.clone().add(b).multiplyScalar(0.5),
      length: dir.length(),
      // The cone's tip (+y) points back at the projector.
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.clone().normalize().negate(),
      ),
    };
  }, [from, to]);
  return (
    <mesh position={center} quaternion={quaternion}>
      <coneGeometry args={[1.25, length, 4, 1, true]} />
      <meshBasicMaterial
        color="#fff4cf"
        transparent
        opacity={0.1}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

const STUDENT_LOOKS: VillagerLook[] = [
  { shirt: "#5b7f9a", pants: "#2b2f3a", hair: "short" },
  { shirt: "#e9e4d8", pants: "#3a3a44", hair: "bun" },
  { shirt: "#8a5a7a", pants: "#2b2f3a", hair: "crop" },
  { shirt: "#6a8a5a", pants: "#3a3a3a", hair: "pigtails" },
  { shirt: "#c48a3a", pants: "#2e3a5a", hair: "short", glasses: true },
];

/* ---------- lecture hall ---------- */

function LectureHall({
  player,
  slides,
  reducedMotion,
}: {
  player: PlayerRef;
  slides: boolean;
  reducedMotion?: boolean;
}) {
  const room = L.hall;
  const back = room.backZ + 0.12;
  const projector: V3 = [L.screen[0], 3.0, -3.7];
  const seats: Array<[number, number]> = [
    [-14.6, L.desks.rows[0]! + 0.58],
    [-12.3, L.desks.rows[0]! + 0.58],
    [-13.6, L.desks.rows[1]! + 0.58],
    [-12.1, L.desks.rows[2]! + 0.58],
    [-14.8, L.desks.rows[2]! + 0.58],
  ];
  return (
    <CutawayRoom
      room={room}
      player={player}
      label="GIẢNG ĐƯỜNG"
      floor="#c9c2ad"
    >
      {/* screen */}
      <Box
        position={[L.screen[0], 2.05, back]}
        size={[3.5, 2.05, 0.04]}
        color={slides ? "#2a2f33" : "#f0eee6"}
      />
      {slides ? (
        <GlowPanel
          lines={[
            "BÀI 1 · NHẬP MÔN LẬP TRÌNH",
            "• Biến, kiểu dữ liệu, hàm",
            "• Câu lệnh rẽ nhánh, vòng lặp",
            "• Chia nhỏ vấn đề để giải",
          ]}
          position={[L.screen[0], 2.05, back + 0.03]}
          width={3.36}
          height={1.92}
          bg="#f7f5ec"
          ink="#2a3a44"
          accent={UTE_BLUE}
          fontSize={62}
        />
      ) : null}
      {/* whiteboard */}
      <Box
        position={[-9.6, 1.75, back]}
        size={[2.1, 1.15, 0.04]}
        color="#fbfbf7"
      />
      <Box
        position={[-9.6, 1.13, back + 0.06]}
        size={[2.1, 0.05, 0.1]}
        color="#9aa3a0"
      />
      {[0.25, 0.05, -0.15].map((y, i) => (
        <Box
          key={y}
          position={[-9.85 + i * 0.12, 1.75 + y, back + 0.025]}
          size={[1.1 - i * 0.25, 0.03, 0.01]}
          color={i === 1 ? "#c0392b" : "#2e5b8a"}
        />
      ))}
      {/* projector hanging from the ceiling */}
      <Segment
        from={[projector[0], room.height, projector[2]]}
        to={[projector[0], projector[1] + 0.1, projector[2]]}
        radius={0.025}
        color="#5f6f68"
      />
      <Box position={projector} size={[0.5, 0.18, 0.42]} color="#dcdcd4" />
      <mesh
        position={[projector[0], projector[1], projector[2] - 0.22]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.07, 0.07, 0.05, 12]} />
        <meshStandardMaterial
          color={slides ? "#fff4cf" : "#333"}
          emissive={slides ? "#fff4cf" : "#000"}
          emissiveIntensity={slides ? 2 : 0}
        />
      </mesh>
      {slides ? (
        <group userData={{ noCollide: true }}>
          <Beam
            from={[projector[0], projector[1], projector[2] - 0.25]}
            to={[L.screen[0], 2.05, back + 0.1]}
          />
        </group>
      ) : null}
      {/* podium */}
      <group position={[L.podium[0], 0, L.podium[1]]}>
        <Box
          position={[0, 0.55, 0]}
          size={[0.9, 1.1, 0.6]}
          color={C.woodLight}
        />
        <Box position={[0, 1.12, 0]} size={[1.0, 0.05, 0.7]} color={C.wood} />
        <Laptop position={[0, 1.15, 0]} scale={0.5} />
      </group>
      {/* desk rows */}
      {L.desks.rows.map((z) => (
        <group key={z} position={[L.desks.x, 0, z]}>
          <Box
            position={[0, 0.76, 0]}
            size={[L.desks.width, 0.07, 0.5]}
            color="#c9a878"
          />
          <Box
            position={[0, 0.45, -0.22]}
            size={[L.desks.width, 0.6, 0.04]}
            color="#8a6a46"
          />
          {[-1, 1].map((s) => (
            <Box
              key={s}
              position={[(s * L.desks.width) / 2 - s * 0.05, 0.38, 0]}
              size={[0.05, 0.76, 0.46]}
              color="#5f4a36"
            />
          ))}
          <Book
            position={[-1.2, 0.83, 0.05]}
            scale={0.5}
            open
            color="#5f8a7a"
          />
          <Book position={[0.9, 0.83, 0.02]} scale={0.5} color="#b07a4a" />
        </group>
      ))}
      {seats.map(([x, z], i) => (
        <Villager
          key={`${x}${z}`}
          look={STUDENT_LOOKS[i % STUDENT_LOOKS.length]!}
          position={[x, 0, z]}
          facing={Math.PI}
          pose="sit"
          player={player}
          reducedMotion={reducedMotion}
        />
      ))}
      {/* clock + aircon */}
      <group position={[-15.88, 2.7, -4.3]} rotation={[0, Math.PI / 2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 18]} />
          <meshStandardMaterial color="#f7f2e4" />
        </mesh>
        <Box
          position={[0, 0.06, 0.03]}
          size={[0.02, 0.13, 0.01]}
          color={C.ink}
        />
      </group>
      <Box
        position={[-15.8, 2.75, -2.6]}
        size={[0.25, 0.32, 1.0]}
        color="#eeeeea"
      />
      <Pot position={[-8.6, 0, -6.8]} scale={1.1} />
    </CutawayRoom>
  );
}

/* ---------- library ---------- */

function Library({ player, lamp }: { player: PlayerRef; lamp: boolean }) {
  const room = L.library;
  const [tx, tz] = L.readingTable;
  const [kx, kz] = L.libraryCounter;
  return (
    <CutawayRoom room={room} player={player} label="THƯ VIỆN" floor="#b9a07c">
      {[9.0, 10.8, 12.6, 14.4].map((x) => (
        <group key={x} position={[x, 0.04, room.backZ + 0.36]}>
          <Bookcase width={1.6} height={2.2} />
        </group>
      ))}
      <group
        position={[room.minX + 0.36, 0.04, -5.6]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <Bookcase width={1.6} height={2.2} />
      </group>
      <Sign
        text="GIỮ TRẬT TỰ · ĐỌC SÁCH"
        position={[12, 2.85, room.backZ + 0.12]}
        width={2.6}
        height={0.3}
        color="#f1e6cf"
        ink={UTE_BLUE}
        fontSize={86}
      />
      {/* reading table */}
      <Table
        position={[tx, 0.04, tz]}
        width={2.4}
        depth={1.0}
        color="#c9a878"
      />
      <Box
        position={[12.3, 0.27, tz - 0.85]}
        size={[0.38, 0.46, 0.38]}
        color="#8a6a46"
      />
      <Book
        position={[tx - 0.5, 0.84, tz + 0.1]}
        open
        color="#5f8a7a"
        scale={0.8}
      />
      <Book
        position={[tx + 0.3, 0.84, tz + 0.15]}
        color="#a85a3a"
        scale={0.6}
      />
      <Book
        position={[tx + 0.3, 0.9, tz + 0.15]}
        color="#3e6b8a"
        scale={0.55}
      />
      <group position={[tx + 0.75, 0.8, tz - 0.25]}>
        <DeskLamp />
        {lamp ? (
          <>
            <mesh position={[-0.3, 0.64, 0]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshBasicMaterial color="#fff1c4" toneMapped={false} />
            </mesh>
          </>
        ) : null}
        {/* Always mounted (0 when off) so switching it on doesn't recompile shaders. */}
        <pointLight
          position={[-0.35, 0.5, 0.1]}
          color="#ffdc9a"
          intensity={lamp ? 4 : 0}
          distance={4}
          decay={2}
        />
      </group>
      <Villager
        look={{ shirt: "#6a7a9a", pants: "#2b2f3a", hair: "bun" }}
        position={[tx - 0.7, 0, tz - 0.95]}
        facing={0}
        pose="sit"
        player={player}
      />
      {/* librarian's counter */}
      <group position={[kx, 0.04, kz]}>
        <Box position={[0, 0.5, 0]} size={[0.5, 1.0, 1.6]} color="#8a6a46" />
        <Box
          position={[0, 1.03, 0]}
          size={[0.62, 0.06, 1.72]}
          color="#c9a878"
        />
        <Monitor
          position={[0.05, 1.06, -0.4]}
          scale={0.38}
          rotation={-Math.PI / 2}
        />
        <Book position={[0, 1.08, 0.45]} color="#b07a4a" scale={0.5} />
      </group>
      <Pot position={[15.5, 0, -2.9]} scale={1.1} />
    </CutawayRoom>
  );
}

/* ---------- outdoor pieces ---------- */

function WelcomeTent({ balloons }: { balloons: boolean }) {
  const [x, z] = L.tent;
  return (
    <group position={[x, 0, z]}>
      {[-1.1, 1.1].flatMap((px) =>
        [-0.8, 0.8].map((pz) => (
          <Pole
            key={`${px}${pz}`}
            position={[px, 1.15, pz]}
            height={2.3}
            radius={0.04}
            color="#d9d9d4"
          />
        )),
      )}
      <mesh position={[0, 2.68, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.75, 0.8, 4]} />
        <meshStandardMaterial color="#f4f1e8" roughness={0.9} />
      </mesh>
      <Box
        position={[0, 2.22, 0.82]}
        size={[2.4, 0.18, 0.04]}
        color={UTE_BLUE}
      />
      <Sign
        text="CHÀO MỪNG TÂN SINH VIÊN 2020"
        position={[0, 1.98, 0.83]}
        width={2.3}
        height={0.3}
        color={UTE_BLUE}
        ink="#f4e7b8"
        fontSize={70}
      />
      <Table position={[0, 0, 0.0]} width={1.8} depth={0.7} color="#2f7fc0" />
      {[-0.5, -0.2, 0.45].map((px, i) => (
        <Box
          key={px}
          position={[px, 0.78 + i * 0.01, 0.05]}
          size={[0.24, 0.02, 0.32]}
          color="#f7f5ec"
          rotation={[0, i * 0.2 - 0.2, 0]}
        />
      ))}
      {balloons ? (
        <group userData={{ noCollide: true }}>
          {[-1.1, 1.1].map((px) =>
            ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"].map((c, i) => (
              <group key={`${px}${c}`}>
                <Segment
                  from={[px, 2.3, 0.8]}
                  to={[px + (i - 1.5) * 0.18, 2.9 + (i % 2) * 0.25, 0.85]}
                  radius={0.006}
                  color="#f4f1e8"
                />
                <Orb
                  position={[
                    px + (i - 1.5) * 0.18,
                    3.08 + (i % 2) * 0.25,
                    0.85,
                  ]}
                  scale={[0.17, 0.21, 0.17]}
                  color={c}
                />
              </group>
            )),
          )}
        </group>
      ) : null}
    </group>
  );
}

function BulletinBoard({ graduated }: { graduated: boolean }) {
  const [x, z] = L.board;
  const notes: Array<[number, number, string]> = [
    [-0.7, 0.3, "#f7f5ec"],
    [-0.35, -0.1, "#f2d36b"],
    [0.6, 0.25, "#cfe3e8"],
    [0.75, -0.2, "#f7f5ec"],
    [-0.75, -0.3, "#f2b8a0"],
  ];
  return (
    <group position={[x, 0, z]}>
      {[-0.95, 0.95].map((px) => (
        <Pole
          key={px}
          position={[px, 1.1, 0]}
          height={2.2}
          radius={0.05}
          color="#5f6f68"
        />
      ))}
      <Box position={[0, 1.6, 0]} size={[2.0, 1.2, 0.08]} color="#9a6e48" />
      <Box position={[0, 2.25, 0]} size={[2.15, 0.1, 0.2]} color={UTE_BLUE} />
      <Sign
        text="BẢNG TIN"
        position={[0, 2.08, 0.045]}
        width={0.8}
        height={0.16}
        color="#9a6e48"
        ink="#f4e7b8"
        fontSize={100}
      />
      {notes.map(([nx, ny, c], i) =>
        graduated && Math.abs(nx) < 0.5 ? null : (
          <Box
            key={i}
            position={[nx, 1.6 + ny, 0.045]}
            size={[0.32, 0.36, 0.01]}
            color={c}
            rotation={[0, 0, (i - 2) * 0.05]}
          />
        ),
      )}
      {graduated ? (
        <group position={[0, 1.55, 0.05]}>
          <Box size={[0.95, 0.68, 0.01]} color="#f6efd8" />
          <Box
            position={[0, 0, 0.004]}
            size={[0.88, 0.61, 0.005]}
            color="#c9a14a"
          />
          <GlowPanel
            lines={[
              "BẰNG TỐT NGHIỆP",
              "Kỹ thuật phần mềm",
              "09.2020 - 06.2024",
              "GPA 3.34/4",
            ]}
            position={[0, 0, 0.01]}
            width={0.84}
            height={0.57}
            bg="#fbf6e6"
            ink="#3a3a44"
            accent="#8a3b26"
            fontSize={84}
            align="center"
          />
          <Orb
            position={[0.33, -0.2, 0.02]}
            scale={[0.06, 0.06, 0.015]}
            color="#c0392b"
          />
        </group>
      ) : null}
    </group>
  );
}

function FlyingCaps({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    const t = clock.elapsedTime;
    ref.current.children.forEach((cap, i) => {
      cap.position.y = 1.9 + Math.abs(Math.sin(t * 1.3 + i * 0.8)) * 2.2;
      cap.rotation.y = t * (0.8 + (i % 3) * 0.4) + i;
      cap.rotation.z = Math.sin(t * 2 + i) * 0.4;
    });
  });
  return (
    <group ref={ref} position={[8.3, 0, 2.9]} userData={{ noCollide: true }}>
      {Array.from({ length: 8 }, (_, i) => (
        <group
          key={i}
          position={[
            Math.cos(i * 2.3) * 1.3,
            2.4 + (i % 3) * 0.5,
            Math.sin(i * 2.3) * 0.9,
          ]}
        >
          <Box size={[0.36, 0.03, 0.36]} color="#1d1d24" />
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.1, 12]} />
            <meshStandardMaterial color="#1d1d24" />
          </mesh>
          <Segment
            from={[0, 0.02, 0]}
            to={[0.17, -0.12, 0.05]}
            radius={0.008}
            color="#f2c14e"
          />
        </group>
      ))}
    </group>
  );
}

function UmbrellaTable({ position, work }: { position: V3; work?: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 20]} />
        <meshStandardMaterial color="#f1e6cf" />
      </mesh>
      <Pole
        position={[0, 1.15, 0]}
        height={2.3}
        radius={0.035}
        color="#8a8f8a"
      />
      <mesh position={[0, 2.35, 0]} castShadow>
        <coneGeometry args={[1.25, 0.45, 8, 1, true]} />
        <meshStandardMaterial color="#2f7fc0" side={THREE.DoubleSide} />
      </mesh>
      {/* two glasses of iced tea */}
      {[-0.25, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.82, -0.25]}>
          <cylinderGeometry args={[0.05, 0.04, 0.14, 8]} />
          <meshStandardMaterial color="#c98a3a" transparent opacity={0.85} />
        </mesh>
      ))}
      {work ? (
        <group>
          <Laptop position={[0, 0.76, 0.1]} scale={0.45} />
          {["#f2d36b", "#f2b8a0", "#bfe3c0", "#cfe3e8"].map((c, i) => (
            <Box
              key={c}
              position={[-0.35 + i * 0.22, 0.765, 0.32 - (i % 2) * 0.1]}
              size={[0.12, 0.005, 0.12]}
              color={c}
              rotation={[0, i * 0.3, 0]}
            />
          ))}
          <Box
            position={[0.32, 0.765, -0.02]}
            size={[0.24, 0.006, 0.32]}
            color="#f7f5ec"
          />
        </group>
      ) : null}
    </group>
  );
}

function Kiosk() {
  const [x, z] = L.kiosk;
  return (
    <group position={[x, 0, z]}>
      <Box position={[0, 0.55, 0]} size={[2.6, 1.1, 0.9]} color="#d98a3a" />
      <Box position={[0, 1.13, 0]} size={[2.7, 0.06, 1.0]} color="#f1e6cf" />
      <Box
        position={[0, 1.55, -0.45]}
        size={[2.6, 0.9, 0.08]}
        color="#e6e1cc"
      />
      {[-1.25, 1.25].map((px) => (
        <Pole
          key={px}
          position={[px, 1.25, -0.4]}
          height={2.5}
          radius={0.04}
          color="#8a8f8a"
        />
      ))}
      <Box
        position={[0, 2.52, 0.1]}
        size={[3.0, 0.08, 1.4]}
        color="#c0392b"
        rotation={[0.15, 0, 0]}
      />
      <Sign
        text="CĂN TIN"
        position={[0, 2.25, 0.79]}
        width={1.5}
        height={0.32}
        color="#f1e6cf"
        ink="#c0392b"
        fontSize={150}
        rotation={[0.15, 0, 0]}
      />
      {[-0.9, -0.6, -0.3].map((px) => (
        <mesh key={px} position={[px, 1.24, 0.1]}>
          <cylinderGeometry args={[0.07, 0.06, 0.18, 10]} />
          <meshStandardMaterial color="#e6b33a" />
        </mesh>
      ))}
      <Orb
        position={[0.6, 1.25, 0.1]}
        scale={[0.22, 0.12, 0.18]}
        color="#f1e2bc"
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
          <meshStandardMaterial color="#2a2a2e" />
        </mesh>
      ))}
      <Box position={[0, 0.48, -0.05]} size={[0.3, 0.3, 0.8]} color={color} />
      <Box
        position={[0, 0.68, -0.15]}
        size={[0.28, 0.1, 0.55]}
        color="#2a2a2e"
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

const BIKE_COLORS = ["#c0392b", "#2e5b8a", "#d9d4c0", "#3a3a3a", "#5f8a3e"];

function Parking() {
  const { minX, maxX, rows } = L.parking;
  const roofZ = (rows[0]! + rows[1]!) / 2;
  return (
    <group>
      <Box
        position={[(minX + maxX) / 2, -0.03, roofZ]}
        size={[maxX - minX + 0.6, 0.05, 4.4]}
        color="#a9a69a"
      />
      {rows.map((z, r) =>
        Array.from({ length: 5 }, (_, i) => (
          <Motorbike
            key={`${r}-${i}`}
            position={[minX + 0.7 + i * 1.15, 0, z]}
            color={BIKE_COLORS[(i + r * 2) % BIKE_COLORS.length]!}
          />
        )),
      )}
      {[minX, maxX].flatMap((x) =>
        [roofZ - 2.0, roofZ + 2.0].map((z) => (
          <Pole
            key={`${x}${z}`}
            position={[x, 1.25, z]}
            height={2.5}
            radius={0.06}
            color="#7a8a80"
          />
        )),
      )}
      <Box
        position={[(minX + maxX) / 2, 2.55, roofZ]}
        size={[maxX - minX + 0.6, 0.08, 4.6]}
        color="#9aa7a0"
        rotation={[-0.08, 0, 0]}
      />
      <Sign
        text="NHÀ XE SINH VIÊN"
        position={[(minX + maxX) / 2, 2.25, roofZ + 2.3]}
        width={2.4}
        height={0.3}
        color={UTE_BLUE}
        ink="#f4e7b8"
        fontSize={90}
      />
    </group>
  );
}

function Gate() {
  return (
    <group position={[0, 0, L.gateZ]}>
      {[-2.4, 2.4].map((x) => (
        <Box
          key={x}
          position={[x, 1.3, 0]}
          size={[0.6, 2.6, 0.6]}
          color="#e6e1cc"
        />
      ))}
      <Box position={[0, 2.75, 0]} size={[5.4, 0.36, 0.5]} color={UTE_BLUE} />
      <Sign
        text="HCMUTE"
        position={[0, 2.75, 0.26]}
        width={1.8}
        height={0.3}
        color={UTE_BLUE}
        ink="#e7d8ab"
        fontSize={160}
      />
    </group>
  );
}

/* ---------- whole map ---------- */

export function UteMap({ effects, player, reducedMotion }: MapSceneProps) {
  return (
    <DioramaMap chapterId="ute" ground="#9fae86" reducedMotion={reducedMotion}>
      {/* paths */}
      {[-1, 1].map((s) => (
        <Box
          key={s}
          position={[s * 11.45, -0.035, 2.15]}
          size={[11.2, 0.05, 1.6]}
          color={PATH}
        />
      ))}
      <Box position={[0, -0.035, 7.1]} size={[2.4, 0.05, 5.7]} color={PATH} />
      <Box
        position={[L.hall.doorX, -0.035, 0.35]}
        size={[2.0, 0.05, 3.5]}
        color={PATH}
      />
      <Box
        position={[L.library.doorX, -0.035, 0]}
        size={[2.0, 0.05, 4.4]}
        color={PATH}
      />
      <Box
        position={[12.2, -0.03, 6.6]}
        size={[7, 0.05, 4.6]}
        color="#cdbfa5"
      />

      <LectureHall
        player={player}
        slides={effects.has("slides")}
        reducedMotion={reducedMotion}
      />
      <Library player={player} lamp={effects.has("den-doc")} />

      <WelcomeTent balloons={effects.has("bong-bay")} />
      <BulletinBoard graduated={effects.has("tot-nghiep")} />
      {effects.has("tot-nghiep") ? (
        <FlyingCaps reducedMotion={reducedMotion} />
      ) : null}

      {/* canteen */}
      <Kiosk />
      <UmbrellaTable
        position={[L.canteenTable[0], 0, L.canteenTable[1]]}
        work={effects.has("do-an")}
      />
      <UmbrellaTable position={[13.4, 0, 8.0]} />
      {[12.7, 14.1].map((x) => (
        <Box
          key={x}
          position={[x, 0.22, 8.0]}
          size={[0.36, 0.44, 0.36]}
          color="#2f7fc0"
        />
      ))}

      {/* motorbike parking + the roommate's bike */}
      <Parking />
      <Motorbike
        position={[L.roommate[0] - 0.95, 0, L.roommate[1]]}
        color="#d9822b"
      />
      <Gate />

      {/* campus greenery */}
      <Tree position={[-6.3, 0, -6.4]} scale={1.2} />
      <Tree position={[-6.6, 0, -2.6]} kind="palm" scale={1.1} />
      <Tree position={[5.6, 0, -6.6]} scale={1.15} />
      <Tree position={[6.2, 0, -3.4]} kind="palm" scale={1.05} />
      <Tree position={[-16.4, 0, 0.6]} scale={1.1} />
      <Tree position={[16.4, 0, 0.4]} scale={1.1} />
      <Tree position={[-6.8, 0, 9.0]} scale={1.0} />
      <Tree position={[6.6, 0, 9.0]} scale={1.0} />
      <Tree position={[16.4, 0, 9.0]} kind="palm" scale={1.1} />
      <Tree position={[-16.6, 0, 9.2]} kind="palm" scale={1.0} />
      <Tree position={[0.2, 0, -8.4]} scale={1.3} />
      <Bench position={[-6.6, 0, 3.6]} />
      <Bench position={[13.6, 0, 1.1]} />
      <Bench position={[4.6, 0, 6.8]} rotation={-0.4} />
      <Pot position={[-1.8, 0, 9.3]} scale={1.1} />
      <Pot position={[1.8, 0, 9.3]} scale={1.1} />
    </DioramaMap>
  );
}
