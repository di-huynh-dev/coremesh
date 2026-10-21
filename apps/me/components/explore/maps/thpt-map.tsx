"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { Villager } from "@/components/explore/villager";
import {
  Bench,
  Bicycle,
  Book,
  Box,
  Orb,
  Pole,
  Roof,
  Segment,
  Sign,
  Tree,
} from "@/components/story/world-3d";
import { Table } from "@/components/story/world-childhood";
import { THPT_LAYOUT as L } from "@/lib/explore/thpt";
import type { VillagerLook } from "@/lib/explore/types";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";
import { Hedge } from "./tet-map";

const WALL = "#eadcbc";
const TRIM = "#7a3b22";
const FLAME = "#d8452c";

const BOY: VillagerLook = {
  shirt: "#f4f1ea",
  pants: "#2c3550",
  hair: "short",
  hairColor: "#1d1a18",
  height: 0.94,
};
const GIRL: VillagerLook = {
  shirt: "#fbfaf6",
  pants: "#fbfaf6",
  hair: "bun",
  hairColor: "#1d1a18",
  height: 0.9,
  longShirt: true,
};

const LAWNS = [
  { x: -11.2, z: 5.6, w: 7.8, d: 4.4 },
  { x: 12.4, z: 5.8, w: 8.0, d: 4.0 },
  { x: 12.2, z: 0.6, w: 7.0, d: 3.6 },
];

/** Snellen-style eye chart rows (y = centre height on the board). */
const CHART_ROWS = [
  { text: "E", size: 0.3, font: 230, y: 1.75 },
  { text: "F  P", size: 0.2, font: 160, y: 1.5 },
  { text: "T  O  Z", size: 0.15, font: 120, y: 1.3 },
  { text: "L  P  E  D", size: 0.12, font: 96, y: 1.13 },
  { text: "P  E  C  F  D", size: 0.1, font: 80, y: 0.98 },
];

function seeded(i: number, k = 1) {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------- classroom 12A (cut-away like the Tết house) ---------- */

function SchoolDesk({
  position,
  children,
}: {
  position: [number, number, number];
  children?: ReactNode;
}) {
  return (
    <group position={position}>
      <Box position={[0, 0.74, 0]} size={[1.6, 0.07, 0.6]} color="#b48a5a" />
      <Box
        position={[0, 0.52, -0.26]}
        size={[1.54, 0.4, 0.04]}
        color="#9a7348"
      />
      {[-0.74, 0.74].map((x) => (
        <Box
          key={x}
          position={[x, 0.36, 0]}
          size={[0.06, 0.72, 0.54]}
          color="#7a5636"
        />
      ))}
      <Box position={[0, 0.4, 0.6]} size={[1.6, 0.06, 0.3]} color="#b48a5a" />
      {[-0.7, 0.7].map((x) => (
        <Box
          key={x}
          position={[x, 0.19, 0.6]}
          size={[0.06, 0.38, 0.26]}
          color="#7a5636"
        />
      ))}
      {children}
    </group>
  );
}

function Classroom({ effects, player }: MapSceneProps) {
  const roof = useRef<THREE.Group>(null);
  const r = L.classroom;
  const cx = (r.minX + r.maxX) / 2;
  const cz = (r.backZ + r.frontZ) / 2;
  const w = r.maxX - r.minX;
  const d = r.frontZ - r.backZ;
  useFrame(() => {
    const p = player.current?.position;
    if (!roof.current || !p) return;
    // Dollhouse cut-away: lift the roof off while Dĩ is inside the classroom.
    roof.current.visible = !(
      p.x > r.minX - 0.2 &&
      p.x < r.maxX + 0.2 &&
      p.z > r.backZ - 0.2 &&
      p.z < r.frontZ + 0.4
    );
  });
  const sharp = effects.has("kinh");
  const outline = effects.has("de-cuong");
  return (
    <group>
      <Box position={[cx, 0.03, cz]} size={[w, 0.06, d]} color="#c2b8a3" />
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          position={[r.minX + 0.6 + i * 1.18, 0.065, cz]}
          size={[0.02, 0.01, d]}
          color="#a99f8a"
        />
      ))}
      <Box
        position={[cx, 1.5, r.backZ]}
        size={[w + 0.3, 3.0, 0.3]}
        color={WALL}
      />
      {[r.minX, r.maxX].map((x) => (
        <group key={x}>
          <Box position={[x, 1.5, cz]} size={[0.3, 3.0, d]} color={WALL} />
          {[-1.2, 1.2].map((dz) => (
            <group
              key={dz}
              position={[x + (x < cx ? -0.17 : 0.17), 1.7, cz + dz]}
            >
              <Box size={[0.05, 1.0, 1.1]} color="#5a4a3a" />
              <Box size={[0.07, 0.85, 0.95]} color="#8fb0b4" />
            </group>
          ))}
        </group>
      ))}

      {/* green board with the exam countdown: blurry until Dĩ gets glasses */}
      <group position={[cx, 0, r.backZ + 0.17]}>
        <Box position={[0, 1.7, 0]} size={[3.8, 1.5, 0.06]} color="#5a4a3a" />
        <Sign
          text="CÒN 30 NGÀY · THI TỐT NGHIỆP"
          position={[0, 1.95, 0.035]}
          width={3.6}
          height={0.6}
          color="#2f4a3a"
          ink={sharp ? "#ffffff" : "#5f7a6c"}
          fontSize={sharp ? 92 : 104}
        />
        <Sign
          text={sharp ? "Cố lên 12A!" : "~ ~ ~ ~ ~ ~"}
          position={[0, 1.4, 0.035]}
          width={3.6}
          height={0.62}
          color="#2f4a3a"
          ink={sharp ? "#f6d36b" : "#4d6a5c"}
          fontSize={sharp ? 120 : 140}
        />
        <Sign
          text="HỌC ĐI ĐÔI VỚI HÀNH"
          position={[0, 2.7, 0.02]}
          width={3.0}
          height={0.32}
          color="#b3261e"
          ink="#f6d36b"
          fontSize={64}
        />
        <Box
          position={[0, 0.92, 0.1]}
          size={[3.4, 0.05, 0.16]}
          color="#5a4a3a"
        />
      </group>

      {/* teacher's desk */}
      <group position={[L.teacherDesk[0], 0, L.teacherDesk[1]]}>
        <Box position={[0, 0.76, 0]} size={[1.4, 0.08, 0.7]} color="#7a4e2e" />
        <Box
          position={[0, 0.39, 0.3]}
          size={[1.36, 0.72, 0.04]}
          color="#6a4228"
        />
        {[-0.62, 0.62].map((x) => (
          <Box
            key={x}
            position={[x, 0.38, 0]}
            size={[0.07, 0.76, 0.62]}
            color="#5a3a24"
          />
        ))}
        <Book position={[-0.25, 0.84, 0]} color="#3e6b8a" />
        <Book position={[-0.25, 0.9, 0]} color="#c0392b" scale={0.9} />
      </group>

      {/* desks */}
      {L.desks.map(([x, z]) => (
        <SchoolDesk key={`${x}${z}`} position={[x, 0, z]}>
          <Box
            position={[-0.45, 0.32, -0.12]}
            size={[0.36, 0.24, 0.14]}
            color="#4a5a6a"
          />
          {x === L.myDesk[0] && z === L.myDesk[1] && outline ? (
            <group userData={{ noCollide: true }}>
              {[0, 1, 2, 3].map((i) => (
                <Box
                  key={i}
                  position={[0.3, 0.79 + i * 0.025, -0.02]}
                  size={[0.42, 0.02, 0.3]}
                  color={i % 2 ? "#f4f1ea" : "#efe6cf"}
                  rotation={[0, i * 0.08, 0]}
                />
              ))}
              <Sign
                text="ĐỀ CƯƠNG ÔN THI"
                position={[0.3, 0.892, -0.02]}
                rotation={[-Math.PI / 2, 0, 0]}
                width={0.4}
                height={0.12}
                color="#f4f1ea"
                ink="#b3261e"
                fontSize={110}
              />
            </group>
          ) : null}
        </SchoolDesk>
      ))}

      {/* roof (hidden while inside) */}
      <group ref={roof} position={[cx, 3.0, cz]}>
        <Roof width={w + 0.9} depth={d + 0.9} height={1.4} />
        <Sign
          text="LỚP 12A"
          position={[0, -0.3, d / 2 + 0.36]}
          width={1.5}
          height={0.32}
          color="#f3ead6"
          ink={TRIM}
          fontSize={110}
        />
      </group>
    </group>
  );
}

/* ---------- infirmary + eye chart ---------- */

function Glasses({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0.2]}>
      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <torusGeometry args={[0.08, 0.014, 6, 18]} />
          <meshStandardMaterial color="#26302f" metalness={0.4} />
        </mesh>
      ))}
      <Segment
        from={[-0.03, 0.02, 0]}
        to={[0.03, 0.02, 0]}
        radius={0.01}
        color="#26302f"
      />
      {[-0.19, 0.19].map((x) => (
        <Segment
          key={x}
          from={[x, 0, 0]}
          to={[x, 0.24, 0.03]}
          radius={0.01}
          color="#26302f"
        />
      ))}
    </group>
  );
}

function Infirmary({ glasses }: { glasses: boolean }) {
  const f = L.infirmary;
  const cx = (f.minX + f.maxX) / 2;
  const w = f.maxX - f.minX;
  return (
    <group>
      {/* building front wall */}
      <Box position={[cx, 1.4, f.z]} size={[w, 2.8, 0.4]} color="#f2efe6" />
      <Box
        position={[cx, 0.3, f.z + 0.21]}
        size={[w, 0.6, 0.02]}
        color="#8fb0b4"
      />
      <Box
        position={[cx - 1.6, 1.1, f.z + 0.21]}
        size={[1.0, 2.0, 0.04]}
        color="#6b8a8e"
      />
      <Box
        position={[cx + 1.8, 1.6, f.z + 0.21]}
        size={[1.3, 0.9, 0.04]}
        color="#9ec1c6"
      />
      <Sign
        text="PHÒNG Y TẾ"
        position={[cx, 2.45, f.z + 0.22]}
        width={2.2}
        height={0.34}
        color="#ffffff"
        ink="#c0392b"
        fontSize={100}
      />
      <group position={[cx + 1.6, 2.45, f.z + 0.23]}>
        <Box size={[0.36, 0.1, 0.02]} color="#d6342b" />
        <Box size={[0.1, 0.36, 0.02]} color="#d6342b" />
      </group>
      {/* awning */}
      {[f.minX + 0.2, f.maxX - 0.2].map((x) => (
        <Pole
          key={x}
          position={[x, 1.2, -6.0]}
          height={2.4}
          radius={0.05}
          color="#9aa6a8"
        />
      ))}
      <Box
        position={[cx, 2.5, -7.5]}
        size={[w, 0.05, 3.2]}
        rotation={[0.08, 0, 0]}
        color="#eef3f2"
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          position={[f.minX + 0.6 + i * 1.24, 2.4, -5.95]}
          size={[0.62, 0.18, 0.04]}
          color={i % 2 ? "#ffffff" : "#d6342b"}
        />
      ))}

      {/* eye chart on a stand */}
      <group
        position={[L.eyeChart[0], 0, L.eyeChart[1]]}
        rotation={[0, 0.55, 0]}
      >
        {[-0.4, 0.4].map((x) => (
          <Segment
            key={x}
            from={[x, 0, 0]}
            to={[x, 2.0, 0]}
            radius={0.03}
            color="#8a8a8a"
          />
        ))}
        <Box position={[0, 1.4, 0]} size={[0.8, 1.2, 0.04]} color="#ffffff" />
        {CHART_ROWS.map((row) => (
          <Sign
            key={row.text}
            text={row.text}
            position={[0, row.y, 0.025]}
            width={0.7}
            height={row.size}
            color="#ffffff"
            ink="#1d1a18"
            fontSize={row.font}
          />
        ))}
      </group>
      {/* floor mark where you stand to read */}
      <Box
        position={[-12.4, -0.01, -5.9]}
        size={[0.6, 0.02, 0.08]}
        color="#d6342b"
      />

      {/* nurse's table */}
      <Table
        position={[L.nurseTable[0], 0, L.nurseTable[1]]}
        width={1.2}
        depth={0.7}
        color="#e6e2d8"
      />
      <Box
        position={[L.nurseTable[0] + 0.35, 0.83, L.nurseTable[1] - 0.1]}
        size={[0.34, 0.14, 0.26]}
        color="#3e6b8a"
      />
      {glasses ? (
        <group userData={{ noCollide: true }}>
          <Glasses
            position={[L.nurseTable[0] - 0.2, 0.79, L.nurseTable[1] + 0.05]}
          />
          <Box
            position={[L.nurseTable[0] - 0.2, 0.8, L.nurseTable[1] - 0.2]}
            size={[0.4, 0.07, 0.14]}
            color="#5a2f1e"
          />
          <Orb
            position={[L.nurseTable[0] - 0.2, 1.25, L.nurseTable[1] + 0.05]}
            scale={[0.06, 0.06, 0.06]}
            color="#f6d36b"
          />
        </group>
      ) : null}
      {/* medicine cabinet */}
      <group position={[f.maxX - 0.6, 0, f.z + 0.5]}>
        <Box position={[0, 0.85, 0]} size={[0.9, 1.7, 0.45]} color="#f7f6f2" />
        <Box
          position={[0, 1.3, 0.23]}
          size={[0.24, 0.07, 0.01]}
          color="#d6342b"
        />
        <Box
          position={[0, 1.3, 0.23]}
          size={[0.07, 0.24, 0.01]}
          color="#d6342b"
        />
      </group>
    </group>
  );
}

/* ---------- yearbook photo ---------- */

function Confetti({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const cx = (L.steps.minX + L.steps.maxX) / 2;
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.children.forEach((child, i) => {
      const t = (clock.elapsedTime * 0.22 + seeded(i)) % 1;
      child.position.set(
        (seeded(i, 2) - 0.5) * 5.2 + Math.sin(t * 6 + i) * 0.2,
        3.6 - t * 3.4,
        (seeded(i, 3) - 0.5) * 1.6,
      );
      child.rotation.set(t * 9, t * 6 + i, 0);
    });
  });
  const colors = ["#d6342b", "#f2b632", "#2e6f8e", "#5b8a4a", "#f4f1ea"];
  return (
    <group
      ref={ref}
      position={[cx, 0, L.steps.z + 0.8]}
      userData={{ noCollide: true }}
    >
      {Array.from({ length: 26 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (seeded(i, 2) - 0.5) * 5.2,
            1 + seeded(i, 4) * 2.4,
            (seeded(i, 3) - 0.5) * 1.6,
          ]}
        >
          <planeGeometry args={[0.09, 0.06]} />
          <meshStandardMaterial
            color={colors[i % colors.length]}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function Flash({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime % 3.2) / 3.2;
    const s = reducedMotion ? 1 : t < 0.08 ? 1 + t * 22 : 0.6;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={[L.tripod[0], 1.5, L.tripod[1] - 0.18]}>
      <sphereGeometry args={[0.08, 12, 8]} />
      <meshBasicMaterial color="#fffbe8" toneMapped={false} />
    </mesh>
  );
}

function YearbookPhoto({
  taken,
  player,
  reducedMotion,
}: {
  taken: boolean;
  player: MapSceneProps["player"];
  reducedMotion?: boolean;
}) {
  const s = L.steps;
  const cx = (s.minX + s.maxX) / 2;
  const w = s.maxX - s.minX;
  return (
    <group>
      {/* steps */}
      <Box position={[cx, 0.15, s.z]} size={[w, 0.3, 0.9]} color="#c9bfae" />
      <Box
        position={[cx, 0.08, s.z + 0.55]}
        size={[w, 0.16, 0.25]}
        color="#d8cfbe"
      />
      {L.classmatesBack.map((x, i) => (
        <Villager
          key={x}
          look={i % 2 ? GIRL : BOY}
          position={[x, 0.3, s.z]}
          player={player}
          reducedMotion={reducedMotion}
        />
      ))}
      {L.classmatesFront.map((x, i) => (
        <Villager
          key={x}
          look={i % 2 ? BOY : GIRL}
          position={[x, 0, s.z + 1.0]}
          player={player}
          reducedMotion={reducedMotion}
        />
      ))}
      {taken ? (
        <group userData={{ noCollide: true }}>
          <group
            position={[
              (L.classmatesFront[0]! + L.classmatesFront[2]!) / 2,
              0.95,
              s.z + 1.4,
            ]}
          >
            <Box size={[2.6, 0.42, 0.03]} color="#2e3f6e" />
            <Sign
              text="KỶ YẾU 12A · THPT SỐ 3 PHÙ CÁT"
              position={[0, 0, 0.02]}
              width={2.5}
              height={0.36}
              color="#2e3f6e"
              ink="#f6d36b"
              fontSize={58}
            />
          </group>
          <Confetti reducedMotion={reducedMotion} />
          <Flash reducedMotion={reducedMotion} />
        </group>
      ) : null}

      {/* tripod camera */}
      <group position={[L.tripod[0], 0, L.tripod[1]]}>
        {[0, 1, 2].map((i) => (
          <Segment
            key={i}
            from={[Math.cos(i * 2.1) * 0.3, 0, Math.sin(i * 2.1) * 0.3]}
            to={[0, 1.3, 0]}
            radius={0.02}
            color="#2b2b2b"
          />
        ))}
        <Box position={[0, 1.45, 0]} size={[0.34, 0.24, 0.2]} color="#2b2b2b" />
        <mesh position={[0, 1.45, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.14, 14]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- flame tree (phượng) ---------- */

function FlameTree({
  falling,
  reducedMotion,
}: {
  falling: boolean;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.children.forEach((child, i) => {
      const t = (clock.elapsedTime * 0.16 + seeded(i)) % 1;
      child.position.set(
        Math.cos(i * 1.7) * (0.8 + t * 1.3),
        3.2 - t * 3.2,
        Math.sin(i * 1.7) * (0.8 + t * 1.3),
      );
      child.rotation.set(t * 8, t * 5, 0);
    });
  });
  const [x, z] = L.flameTree;
  return (
    <group>
      <Tree position={[x, 0, z]} scale={1.4} blossom />
      {Array.from({ length: 10 }, (_, i) => (
        <Orb
          key={i}
          position={[
            x + Math.cos(i * 2.3) * 1.1,
            3.3 + seeded(i) * 0.7,
            z + Math.sin(i * 2.3) * 0.9,
          ]}
          scale={[0.28, 0.16, 0.28]}
          color={FLAME}
        />
      ))}
      {/* petals on the ground */}
      {Array.from({ length: falling ? 22 : 8 }, (_, i) => (
        <mesh
          key={i}
          position={[
            x - 1.2 + seeded(i, 5) * 2.8,
            0.01,
            z - 1.6 + seeded(i, 6) * 2.4,
          ]}
          rotation={[-Math.PI / 2, 0, i]}
        >
          <circleGeometry args={[0.06, 5]} />
          <meshStandardMaterial color={FLAME} />
        </mesh>
      ))}
      {falling ? (
        <group ref={ref} position={[x, 0, z]} userData={{ noCollide: true }}>
          {Array.from({ length: 24 }, (_, i) => (
            <mesh key={i}>
              <circleGeometry args={[0.06, 5]} />
              <meshStandardMaterial
                color={FLAME}
                side={THREE.DoubleSide}
                emissive={FLAME}
                emissiveIntensity={0.15}
              />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
}

/* ---------- gate + fence ---------- */

function Fence({ from, to, z }: { from: number; to: number; z: number }) {
  const w = to - from;
  const posts = Math.max(2, Math.round(w / 1.6));
  return (
    <group position={[(from + to) / 2, 0, z]}>
      <Box position={[0, 0.25, 0]} size={[w, 0.5, 0.26]} color="#e8dcc6" />
      <Box position={[0, 0.82, 0]} size={[w, 0.08, 0.1]} color={TRIM} />
      <Box position={[0, 1.12, 0]} size={[w, 0.08, 0.1]} color={TRIM} />
      {Array.from({ length: posts + 1 }, (_, i) => (
        <Box
          key={i}
          position={[-w / 2 + (i * w) / posts, 0.7, 0]}
          size={[0.22, 1.4, 0.3]}
          color="#e8dcc6"
        />
      ))}
    </group>
  );
}

export function ThptMap({ effects, player, reducedMotion }: MapSceneProps) {
  return (
    <DioramaMap chapterId="thpt" ground="#c7b892" reducedMotion={reducedMotion}>
      {/* yard surfaces */}
      <Box position={[0, -0.04, 2.15]} size={[34, 0.04, 1.6]} color="#c6b48c" />
      <Box position={[0, -0.04, 10]} size={[40, 0.04, 3]} color="#a99f88" />
      {LAWNS.map(({ x, z, w, d }) => (
        <Box
          key={`${x}${z}`}
          position={[x, -0.035, z]}
          size={[w, 0.04, d]}
          color="#9aae6c"
        />
      ))}

      <Classroom
        effects={effects}
        player={player}
        reducedMotion={reducedMotion}
      />
      <Infirmary glasses={effects.has("kinh")} />
      <YearbookPhoto
        taken={effects.has("ky-yeu")}
        player={player}
        reducedMotion={reducedMotion}
      />

      {/* application form on the chapter's study desk */}
      {effects.has("nguyen-vong") ? (
        <group userData={{ noCollide: true }}>
          <Sign
            text="NV1: KỸ THUẬT PHẦN MỀM"
            position={[L.studyDesk[0] + 0.25, 1.035, L.studyDesk[1] + 0.35]}
            rotation={[-Math.PI / 2, 0, 0]}
            width={0.42}
            height={0.26}
            color="#fbf6e6"
            ink="#2e3f6e"
            fontSize={64}
          />
          <Segment
            from={[L.studyDesk[0] + 0.5, 1.04, L.studyDesk[1] + 0.25]}
            to={[L.studyDesk[0] + 0.62, 1.04, L.studyDesk[1] + 0.45]}
            radius={0.012}
            color="#2e3f6e"
          />
        </group>
      ) : null}

      {/* best friend's bench under the flame tree */}
      <Bench position={[L.bench[0], 0, L.bench[1]]} />
      <FlameTree
        falling={effects.has("phuong")}
        reducedMotion={reducedMotion}
      />
      <Book
        position={[L.bench[0] + 0.4, 0.57, L.bench[1]]}
        color="#3e6b8a"
        scale={0.7}
      />

      {/* table tennis between classes */}
      <group position={[12.2, 0, 0.6]} rotation={[0, Math.PI / 2, 0]}>
        <Box position={[0, 0.74, 0]} size={[2.6, 0.06, 1.4]} color="#2f6e4f" />
        <Box
          position={[0, 0.775, 0]}
          size={[2.6, 0.01, 0.02]}
          color="#f4f1ea"
        />
        <Box position={[0, 0.86, 0]} size={[0.02, 0.16, 1.5]} color="#f4f1ea" />
        {[-1, 1].map((s) => (
          <Box
            key={s}
            position={[s * 0.9, 0.36, 0]}
            size={[0.08, 0.72, 1.1]}
            color="#2b2b2b"
          />
        ))}
      </group>

      {/* bike parking */}
      <group>
        {[-16.4, -13.6, -10.8].flatMap((x) =>
          [-2.9, -0.5].map((z) => (
            <Pole
              key={`${x}${z}`}
              position={[x, 1.15, z]}
              height={2.3}
              radius={0.05}
              color="#6b7b80"
            />
          )),
        )}
        <Box
          position={[-13.6, 2.35, -1.7]}
          size={[6.2, 0.06, 2.9]}
          rotation={[0.1, 0, 0]}
          color="#7a8f6a"
        />
        {L.bikes.map((x) => (
          <Bicycle key={x} position={[x, 0, L.bikeZ]} rotation={Math.PI / 2} />
        ))}
      </group>

      {/* gate (closed in the afternoon), fence, road */}
      <Fence from={-17.4} to={-2.3} z={L.gateZ} />
      <Fence from={2.3} to={17.4} z={L.gateZ} />
      <group position={[0, 0, L.gateZ]}>
        {[-2.05, 2.05].map((x) => (
          <Box
            key={x}
            position={[x, 1.6, 0]}
            size={[0.6, 3.2, 0.6]}
            color="#e8dcc6"
          />
        ))}
        <Box position={[0, 3.35, 0]} size={[5.0, 0.55, 0.45]} color={TRIM} />
        <Sign
          text="TRƯỜNG THPT SỐ 3 PHÙ CÁT"
          position={[0, 3.35, -0.24]}
          rotation={[0, Math.PI, 0]}
          width={4.6}
          height={0.42}
          color={TRIM}
          ink="#fff1c9"
          fontSize={70}
        />
        <Sign
          text="TRƯỜNG THPT SỐ 3 PHÙ CÁT"
          position={[0, 3.35, 0.24]}
          width={4.6}
          height={0.42}
          color={TRIM}
          ink="#fff1c9"
          fontSize={70}
        />
        {Array.from({ length: 11 }, (_, i) => (
          <Pole
            key={i}
            position={[-1.6 + i * 0.32, 0.8, 0.05]}
            height={1.6}
            radius={0.025}
            color="#4a4a4a"
          />
        ))}
        <Box
          position={[0, 1.55, 0.05]}
          size={[3.5, 0.06, 0.06]}
          color="#4a4a4a"
        />
        <Box
          position={[0, 0.25, 0.05]}
          size={[3.5, 0.06, 0.06]}
          color="#4a4a4a"
        />
      </group>

      {/* trees, benches, hedges */}
      <Tree position={[-15.0, 0, 0.6]} scale={1.15} blossom />
      <Tree position={[-7.4, 0, 0.6]} scale={1.05} blossom />
      <Tree position={[6.6, 0, -2.6]} scale={1.2} />
      <Tree position={[6.4, 0, -8.0]} kind="banyan" scale={1.15} />
      <Tree position={[-6.6, 0, -7.4]} scale={1.1} />
      <Bench position={[-6.6, 0, -6.0]} />
      <Tree position={[16.2, 0, 3.4]} kind="palm" scale={1.1} />
      <Tree position={[6.4, 0, 6.6]} kind="palm" scale={1.05} />
      <Bench position={[5.2, 0, 6.2]} rotation={0.15} />
      {[-14, -6, 6, 14].map((x) => (
        <Tree key={x} position={[x, 0, 10.6]} scale={1.0} />
      ))}
      <Hedge from={[-17.4, -9.6]} to={[17.4, -9.6]} />
      <Hedge from={[-17.4, -9.6]} to={[-17.4, 8.0]} />
      <Hedge from={[17.4, -9.6]} to={[17.4, 8.0]} />
    </DioramaMap>
  );
}
