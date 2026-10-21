"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  Bamboo,
  Bicycle,
  Box,
  Buffalo,
  C,
  Orb,
  Pole,
  RicePaddy,
  Roof,
  Segment,
  Tree,
  VillageHouse,
  type Vec3,
} from "@/components/story/world-3d";
import { seeded } from "@/components/story/world-childhood";
import { CAY_DA_LAYOUT as L } from "@/lib/explore/cay-da";
import type { VillagerLook } from "@/lib/explore/types";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Villager } from "../villager";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";
import { Hedge } from "./tet-map";

type PlayerRef = RefObject<THREE.Group | null>;

const KID: Record<string, VillagerLook> = {
  cau: { shirt: "#2e6f8e", pants: "#3a3a3a", hair: "short", height: 0.7 },
  rope: { shirt: "#f3efe6", pants: "#7a2e3b", hair: "bun", height: 0.66 },
  jumper: {
    shirt: "#e6b33a",
    pants: "#2e4a7a",
    hair: "pigtails",
    height: 0.64,
  },
  bi1: { shirt: "#5b8a4a", pants: "#3a3a3a", hair: "crop", height: 0.68 },
  bi2: { shirt: "#c0392b", pants: "#2a2a2e", hair: "short", height: 0.7 },
};

/* ---------- the big banyan at the head of the village ---------- */

function BigBanyan() {
  const roots = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + seeded(i) * 0.4;
        const r = 1.5 + seeded(i, 2) * 1.3;
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          len: 2.4 + seeded(i, 3) * 0.9,
        };
      }),
    [],
  );
  const canopy: Array<[number, number, number, number, string]> = [
    [0, 4.9, 0, 2.2, C.leaf],
    [-1.9, 4.4, 0.5, 1.7, C.leafDark],
    [1.9, 4.5, -0.3, 1.8, C.leafLight],
    [0.4, 4.3, 1.8, 1.6, C.leaf],
    [-0.6, 4.6, -1.8, 1.7, C.leafDark],
    [1.4, 5.5, 1.0, 1.3, C.leafLight],
    [-1.2, 5.6, -0.6, 1.3, C.leaf],
  ];
  return (
    <group position={[L.bigBanyan[0], 0, L.bigBanyan[1]]}>
      <mesh position={[0, 1.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.78, 3.5, 12]} />
        <meshStandardMaterial color="#7a6446" roughness={1} />
      </mesh>
      {/* buttress roots (low enough to step over) */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 3 + 0.3, 0]}>
          <Orb
            position={[0.85, 0.12, 0]}
            scale={[0.75, 0.24, 0.22]}
            color="#6f5a3e"
          />
        </group>
      ))}
      {/* branches */}
      {(
        [
          [-1.8, 3.9, 0.4],
          [1.8, 4.0, -0.3],
          [0.3, 3.8, 1.7],
          [-0.5, 4.1, -1.7],
        ] as Vec3[]
      ).map((to, i) => (
        <Segment
          key={i}
          from={[0, 3.0, 0]}
          to={to}
          radius={0.16}
          color="#7a6446"
        />
      ))}
      {canopy.map(([x, y, z, r, color], i) => (
        <Orb
          key={i}
          position={[x, y, z]}
          scale={[r, r * 0.62, r]}
          color={color}
        />
      ))}
      {/* aerial roots hanging like a curtain (thin: walk-through) */}
      {roots.map((r, i) => (
        <Pole
          key={i}
          position={[r.x, 3.7 - r.len / 2, r.z]}
          height={r.len}
          radius={0.024}
          color="#93815a"
        />
      ))}
    </group>
  );
}

function Shrine() {
  return (
    <group position={[L.shrine[0], 0, L.shrine[1]]} rotation={[0, 0.5, 0]}>
      <Box position={[0, 0.35, 0]} size={[0.75, 0.7, 0.6]} color="#d9cdb0" />
      <Box position={[0, 0.8, -0.05]} size={[0.6, 0.2, 0.45]} color="#cbbd9c" />
      <group position={[0, 0.9, 0]}>
        <Roof width={0.95} depth={0.85} height={0.32} />
      </group>
      <Box
        position={[0, 0.55, 0.31]}
        size={[0.4, 0.28, 0.02]}
        color="#b3261e"
      />
      <mesh position={[0, 0.76, 0.18]}>
        <cylinderGeometry args={[0.07, 0.05, 0.08, 10]} />
        <meshStandardMaterial color={C.brass} metalness={0.4} />
      </mesh>
      {[-0.03, 0.03].map((x) => (
        <Segment
          key={x}
          from={[x, 0.8, 0.18]}
          to={[x * 2, 1.0, 0.18]}
          radius={0.006}
          color="#b0262a"
        />
      ))}
    </group>
  );
}

function SchoolBags() {
  return (
    <group position={[L.bags[0], 0, L.bags[1]]}>
      {(
        [
          [0, 0.2, 0, 0.2, "#2e6f8e"],
          [0.45, 0.2, 0.1, -0.3, "#c0392b"],
          [0.2, 0.52, 0.05, 0.6, "#5b8a4a"],
        ] as const
      ).map(([x, y, z, r, color], i) => (
        <group
          key={i}
          position={[x, y, z]}
          rotation={[0, r, i === 2 ? 1.4 : 0]}
        >
          <Box size={[0.4, 0.4, 0.16]} color={color} />
          <Box
            position={[0, 0.06, 0.09]}
            size={[0.32, 0.18, 0.03]}
            color="#f1dfba"
          />
        </group>
      ))}
      {/* a pair of dép lào left behind */}
      {[-0.5, -0.32].map((x) => (
        <Box
          key={x}
          position={[x, 0.01, 0.45]}
          size={[0.11, 0.02, 0.26]}
          color="#e7e2d6"
        />
      ))}
    </group>
  );
}

/* ---------- ô ăn quan: counted pebbles ---------- */

function PebblePile({ position, count }: { position: Vec3; count: number }) {
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => (
        <Orb
          key={i}
          position={[(i % 5) * 0.11, 0.03, Math.floor(i / 5) * 0.12]}
          scale={[0.04, 0.03, 0.04]}
          color={i % 3 ? "#8d8a80" : "#c9c2b3"}
        />
      ))}
      {/* tally marks scratched in the dirt */}
      {Array.from({ length: Math.ceil(count / 5) }, (_, i) => (
        <Box
          key={`t${i}`}
          position={[0.62 + i * 0.09, 0.008, 0.1]}
          size={[0.015, 0.006, 0.22]}
          color="#6b5236"
        />
      ))}
    </group>
  );
}

/* ---------- well buckets ---------- */

function Buckets({ full }: { full: boolean }) {
  const [a, b] = L.buckets;
  return (
    <group>
      {[a, b].map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.22, 0.48, 16, 1, true]} />
            <meshStandardMaterial
              color="#8a9aa0"
              metalness={0.5}
              roughness={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            position={[0, full ? 0.43 : 0.03, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[full ? 0.25 : 0.21, 16]} />
            <meshStandardMaterial
              color={full ? "#6fb0c0" : "#4a4f50"}
              roughness={0.15}
            />
          </mesh>
          <Segment
            from={[-0.25, 0.48, 0]}
            to={[0, 0.72, 0]}
            radius={0.008}
            color="#3b2a1a"
          />
          <Segment
            from={[0.25, 0.48, 0]}
            to={[0, 0.72, 0]}
            radius={0.008}
            color="#3b2a1a"
          />
        </group>
      ))}
      {/* đòn gánh across the two buckets */}
      <Segment
        from={[a[0] - 0.35, 0.74, a[1]]}
        to={[b[0] + 0.35, 0.74, b[1]]}
        radius={0.03}
        color="#a07a4a"
      />
      {full
        ? [0, 1, 2, 3, 4].map((i) => (
            <Orb
              key={i}
              position={[
                a[0] - 0.5 + i * 0.12,
                0.01,
                a[1] + 0.4 + (i % 2) * 0.1,
              ]}
              scale={[0.09, 0.005, 0.07]}
              color="#7f9b88"
            />
          ))
        : null}
    </group>
  );
}

/* ---------- đá cầu ---------- */

function ShuttleRally({
  high,
  reducedMotion,
}: {
  high: boolean;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const [from, to] = useMemo(
    () => [
      new THREE.Vector3(L.cauKid[0] + 0.35, 0.35, L.cauKid[1] + 0.05),
      new THREE.Vector3(L.cauFriend[0] - 0.35, 0.35, L.cauFriend[1]),
    ],
    [],
  );
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const speed = high ? 0.42 : 0.6;
    const t = reducedMotion ? 0.5 : (clock.elapsedTime * speed) % 2;
    const u = t < 1 ? t : 2 - t;
    const k = t < 1 ? t : t - 1;
    g.position.lerpVectors(from, to, u);
    g.position.y = 0.35 + Math.sin(k * Math.PI) * (high ? 4.2 : 1.2);
    g.rotation.z = Math.sin(k * Math.PI * 2) * 0.6;
  });
  return (
    <group ref={ref} userData={{ noCollide: true }}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 10]} />
        <meshStandardMaterial color="#2c2c2e" />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * 1.57) * 0.04,
            0.12,
            Math.sin(i * 1.57) * 0.04,
          ]}
          rotation={[Math.sin(i * 1.57) * 0.3, 0, -Math.cos(i * 1.57) * 0.3]}
        >
          <boxGeometry args={[0.05, 0.22, 0.008]} />
          <meshStandardMaterial
            color={["#e8382b", "#2e6f8e", "#f2b632", "#5b8a4a"][i]}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- nhảy dây ---------- */

function RopeGame({
  active,
  player,
  reducedMotion,
}: {
  active: boolean;
  player: PlayerRef;
  reducedMotion?: boolean;
}) {
  const rope = useRef<THREE.Group>(null);
  const jumper = useRef<THREE.Group>(null);
  const [cx, cz] = L.rope;
  const half = (L.ropeFriend[0] - L.ropeKid[0]) / 2 - 0.3;
  useFrame(({ clock }) => {
    if (!rope.current) return;
    const swing = active && !reducedMotion;
    const angle = swing ? clock.elapsedTime * 5 : Math.PI;
    rope.current.rotation.x = angle;
    if (jumper.current)
      jumper.current.position.y = swing
        ? Math.max(0, -Math.cos(angle)) * 0.38
        : 0;
  });
  return (
    <group>
      <group ref={rope} position={[cx, 0.7, cz]} userData={{ noCollide: true }}>
        <mesh scale={[half, 0.66, 1]}>
          <torusGeometry args={[1, 0.02, 5, 28, Math.PI]} />
          <meshStandardMaterial color="#e8382b" />
        </mesh>
      </group>
      {active ? (
        <group ref={jumper} userData={{ noCollide: true }}>
          <Villager
            look={KID.jumper}
            position={[cx, 0, cz]}
            facing={0.2}
            player={player}
            reducedMotion={reducedMotion}
          />
        </group>
      ) : null}
    </group>
  );
}

/* ---------- bắn bi ---------- */

const MARBLE_COLORS = ["#3fa7d6", "#e86a33", "#5bbf6a", "#f2c230", "#c05ac9"];

function Marble({ position, color }: { position?: Vec3; color: string }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.055, 12, 8]} />
      <meshStandardMaterial
        color={color}
        roughness={0.1}
        metalness={0.1}
        transparent
        opacity={0.88}
      />
    </mesh>
  );
}

function MarbleRing({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion?: boolean;
}) {
  const shooter = useRef<THREE.Mesh>(null);
  const target = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!shooter.current || !target.current) return;
    if (!active || reducedMotion) {
      shooter.current.position.set(-1.05, 0.055, 0.25);
      target.current.position.set(
        active ? 1.05 : 0.05,
        0.055,
        active ? 0.4 : 0.05,
      );
      return;
    }
    const u = (clock.elapsedTime / 3) % 1;
    const s = Math.min(1, u / 0.35);
    shooter.current.position.set(-1.05 + s * 1.0, 0.055, 0.25 - s * 0.2);
    const k = THREE.MathUtils.clamp((u - 0.35) / 0.3, 0, 1);
    const e = 1 - (1 - k) * (1 - k);
    target.current.position.set(0.05 + e * 1.0, 0.055, 0.05 + e * 0.35);
  });
  return (
    <group
      position={[L.marbles[0], 0, L.marbles[1]]}
      userData={{ noCollide: true }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[0.86, 0.9, 32]} />
        <meshStandardMaterial color="#6b5236" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <circleGeometry args={[0.07, 12]} />
        <meshStandardMaterial color="#4a3826" />
      </mesh>
      {[
        [-0.35, 0.3],
        [0.3, -0.35],
        [0.45, 0.25],
        [-0.25, -0.4],
      ].map(([x, z], i) => (
        <Marble key={i} position={[x, 0.055, z]} color={MARBLE_COLORS[i]} />
      ))}
      <mesh ref={target} position={[0.05, 0.055, 0.05]} castShadow>
        <sphereGeometry args={[0.06, 12, 8]} />
        <meshStandardMaterial color="#f2f2f2" roughness={0.1} />
      </mesh>
      <mesh ref={shooter} position={[-1.05, 0.055, 0.25]} castShadow>
        <sphereGeometry args={[0.06, 12, 8]} />
        <meshStandardMaterial color={MARBLE_COLORS[4]} roughness={0.1} />
      </mesh>
    </group>
  );
}

/* ---------- whole map ---------- */

export function CayDaMap({ effects, player, reducedMotion }: MapSceneProps) {
  return (
    <DioramaMap
      chapterId="cay-da"
      ground="#a6b481"
      reducedMotion={reducedMotion}
    >
      {/* village road, the path through the gate and to the big banyan */}
      <Box position={[0, -0.02, 2.15]} size={[36, 0.04, 1.6]} color="#c6b48c" />
      <Box
        position={[L.gate[0], -0.02, -6.4]}
        size={[1.4, 0.04, 6]}
        color="#c6b48c"
      />
      <Box
        position={[-9.6, -0.02, -0.4]}
        size={[1.3, 0.04, 3.6]}
        color="#c6b48c"
      />
      {/* swept earth under the banyan */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[L.bigBanyan[0], -0.03, L.bigBanyan[1]]}
      >
        <circleGeometry args={[3.6, 28]} />
        <meshStandardMaterial color="#b9a77c" roughness={1} />
      </mesh>

      <BigBanyan />
      <Shrine />
      <SchoolBags />
      <Bicycle position={[-11.6, 0, -0.6]} rotation={0.2} />

      {/* ô ăn quan (the board is the diorama's own) */}
      {effects.has("soi") ? (
        <group>
          <PebblePile position={[1.3, 0, 0.98]} count={12} />
          <PebblePile position={[1.55, 0, -0.45]} count={9} />
        </group>
      ) : null}

      <Buckets full={effects.has("nuoc")} />

      {/* đá cầu */}
      <Villager
        look={KID.cau}
        position={[L.cauFriend[0], 0, L.cauFriend[1]]}
        facing={-1.7}
        player={player}
        reducedMotion={reducedMotion}
      />
      <ShuttleRally high={effects.has("cau")} reducedMotion={reducedMotion} />

      {/* nhảy dây */}
      <Villager
        look={KID.rope}
        position={[L.ropeFriend[0], 0, L.ropeFriend[1]]}
        facing={-Math.PI / 2}
        player={player}
        reducedMotion={reducedMotion}
      />
      <RopeGame
        active={effects.has("day")}
        player={player}
        reducedMotion={reducedMotion}
      />

      {/* bắn bi */}
      {L.marbleKids.map(([x, z], i) => (
        <Villager
          key={x}
          look={i ? KID.bi2 : KID.bi1}
          position={[x, 0, z]}
          facing={i ? -0.9 : 1.0}
          pose="sit"
          player={player}
          reducedMotion={reducedMotion}
        />
      ))}
      <MarbleRing active={effects.has("bi")} reducedMotion={reducedMotion} />

      {/* fields beyond the gate */}
      <RicePaddy position={[-4.4, 0, -7.3]} width={5} depth={3.4} />
      <RicePaddy position={[8.6, 0, -7.0]} width={7} depth={3.6} />
      <group position={[L.buffalo[0], 0, L.buffalo[1]]} rotation={[0, -0.8, 0]}>
        <Buffalo />
      </group>

      {/* houses and the bamboo edge of the village */}
      {L.houses.map(([x, z]) => (
        <group key={x} position={[x, 0, z]} scale={0.85}>
          <VillageHouse position={[0, 0, 0]} />
        </group>
      ))}
      <Bamboo position={[-16, 0, -0.6]} scale={1.3} />
      <Bamboo position={[16.3, 0, -0.6]} scale={1.2} />
      <Bamboo position={[-16, 0, -7.8]} scale={1.2} />
      <Tree position={[-4.6, 0, 8.8]} scale={1.1} />
      <Tree position={[3.6, 0, 9.0]} kind="palm" scale={1.1} />
      <Tree position={[10.4, 0, 9.2]} scale={1.0} />
      <Hedge from={[-17.4, -9.6]} to={[17.4, -9.6]} />
    </DioramaMap>
  );
}
