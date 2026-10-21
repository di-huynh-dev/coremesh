"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { Smoke } from "@/components/story/world-childhood";
import {
  Bicycle,
  Box,
  C,
  Orb,
  Pole,
  Pot,
  RicePaddy,
  Roof,
  Segment,
  Sign,
  Suitcase,
  Tree,
} from "@/components/story/world-3d";
import { DI_XA_LAYOUT as L } from "@/lib/explore/di-xa";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";
import { Hedge } from "./tet-map";

type V3 = [number, number, number];

const TRACK_Z = L.track.z;
const STATION_YELLOW = "#e7cf8e";
const LAMP_GLOW = "#ffcf7a";

/* ---------- rail line ---------- */

/** Rails + ballast + sleepers extending the diorama's short track across the map. */
function Tracks() {
  const sleepers = useRef<THREE.InstancedMesh>(null);
  const xs: number[] = [];
  for (let x = -17.9; x < -5.9; x += 0.48) xs.push(x);
  for (let x = 6.1; x < 18; x += 0.48) xs.push(x);
  const count = xs.length;
  useEffect(() => {
    const mesh = sleepers.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    let n = 0;
    for (let x = -17.9; x < -5.9; x += 0.48) {
      o.position.set(x, 0.1, TRACK_Z);
      o.updateMatrix();
      mesh.setMatrixAt(n++, o.matrix);
    }
    for (let x = 6.1; x < 18; x += 0.48) {
      o.position.set(x, 0.1, TRACK_Z);
      o.updateMatrix();
      mesh.setMatrixAt(n++, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      {[-1, 1].map((side) => {
        const cx = side * 11.95;
        return (
          <group key={side}>
            <Box
              position={[cx, 0.0, TRACK_Z]}
              size={[12.1, 0.14, 2.7]}
              color="#a29b84"
            />
            {[-0.7, 0.7].map((dz) => (
              <Box
                key={dz}
                position={[cx, 0.17, TRACK_Z + dz]}
                size={[12.1, 0.09, 0.08]}
                color="#626d69"
                metalness={0.5}
              />
            ))}
          </group>
        );
      })}
      <instancedMesh
        ref={sleepers}
        args={[undefined, undefined, count]}
        receiveShadow
      >
        <boxGeometry args={[0.2, 0.07, 1.85]} />
        <meshStandardMaterial color="#6e715f" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

/** Platform extensions on both sides of the diorama's own platform. */
function Platform() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box
            position={[side * 10.7, 0.08, 0.1]}
            size={[10.7, 0.16, 1.4]}
            color="#c5b99e"
          />
          <Box
            position={[side * 10.7, 0.18, -0.52]}
            size={[10.7, 0.04, 0.09]}
            color="#d5b86e"
          />
        </group>
      ))}
    </group>
  );
}

/* ---------- station building + ticket counter ---------- */

function StationBuilding() {
  const [cx, cz] = L.station.center;
  const front = L.station.depth / 2;
  const counterX = L.ticketCounter[0] - cx;
  return (
    <group position={[cx, 0, cz]}>
      <Box
        position={[0, 0.08, 0.15]}
        size={[L.station.width + 0.5, 0.16, L.station.depth + 0.6]}
        color="#b4ab94"
      />
      <Box
        position={[0, 1.5, 0]}
        size={[L.station.width, 2.8, L.station.depth]}
        color={STATION_YELLOW}
      />
      {/* white trim + base band */}
      <Box
        position={[0, 2.86, 0]}
        size={[L.station.width + 0.12, 0.14, L.station.depth + 0.12]}
        color="#f4ecd6"
      />
      <Box
        position={[0, 0.3, front + 0.01]}
        size={[L.station.width, 0.3, 0.04]}
        color="#b98f5a"
      />
      <group position={[0, 2.93, 0]}>
        <Roof
          width={L.station.width + 0.8}
          depth={L.station.depth + 0.8}
          height={1.1}
        />
      </group>
      {/* station name + clock */}
      <Sign
        text="GA PHÙ CÁT"
        position={[-0.6, 2.45, front + 0.03]}
        width={2.6}
        height={0.42}
        color="#f4ecd6"
        ink="#8a3b26"
        fontSize={150}
      />
      <group position={[1.35, 2.45, front + 0.04]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 20]} />
          <meshStandardMaterial color="#f7f2e4" />
        </mesh>
        <Box
          position={[0, 0.07, 0.03]}
          size={[0.025, 0.15, 0.01]}
          color={C.ink}
        />
        <Box
          position={[0.05, 0, 0.03]}
          size={[0.11, 0.02, 0.01]}
          color={C.ink}
          rotation={[0, 0, -0.4]}
        />
      </group>
      {/* door + windows */}
      <Box
        position={[-1.6, 1.0, front + 0.02]}
        size={[1.1, 1.9, 0.05]}
        color="#5a3f2a"
      />
      <Box
        position={[-1.6, 1.0, front + 0.05]}
        size={[0.03, 1.8, 0.02]}
        color="#8a6a46"
      />
      {[-3.0, -0.2].map((x) => (
        <group key={x} position={[x, 1.35, front + 0.02]}>
          <Box size={[0.75, 0.95, 0.05]} color="#4c6470" />
          <Box
            position={[0, 0, 0.03]}
            size={[0.75, 0.04, 0.02]}
            color="#f4ecd6"
          />
          <Box
            position={[0, 0, 0.03]}
            size={[0.04, 0.95, 0.02]}
            color="#f4ecd6"
          />
        </group>
      ))}
      {/* ticket window (the seller stands right in front of it) */}
      <Box
        position={[counterX, 1.35, front + 0.02]}
        size={[1.5, 1.3, 0.05]}
        color="#3c2f25"
      />
      <Sign
        text="BÁN VÉ"
        position={[counterX, 2.12, front + 0.04]}
        width={1.1}
        height={0.26}
        color="#8a3b26"
        ink="#f4ecd6"
        fontSize={140}
      />
      {/* counter */}
      <Box
        position={[counterX, 0.52, L.ticketCounter[1] - cz]}
        size={[1.6, 1.04, 0.4]}
        color="#8a6a46"
      />
      <Box
        position={[counterX, 1.06, L.ticketCounter[1] - cz]}
        size={[1.7, 0.06, 0.5]}
        color="#b98f5a"
      />
      {/* awning */}
      <Box
        position={[counterX, 2.42, front + 0.75]}
        size={[2.1, 0.07, 1.5]}
        color="#8a3b26"
        rotation={[0.18, 0, 0]}
      />
      <pointLight
        position={[counterX, 2.0, front + 1.2]}
        color="#ffd79a"
        intensity={4}
        distance={5}
        decay={2}
      />
      {/* departure board */}
      <group position={[-3.0, 2.35, front + 0.04]}>
        <Box size={[1.1, 0.42, 0.04]} color="#26323a" />
        <Sign
          text="GIỜ TÀU ĐI"
          position={[0, 0.08, 0.025]}
          width={1.0}
          height={0.16}
          color="#26323a"
          ink="#f2c14e"
          fontSize={120}
        />
        <Sign
          text="→ TP. HỒ CHÍ MINH"
          position={[0, -0.1, 0.025]}
          width={1.0}
          height={0.14}
          color="#26323a"
          ink="#9fd0b0"
          fontSize={110}
        />
      </group>
      <Pot position={[-2.45, 0, front + 0.45]} scale={0.9} />
      <Pot position={[-0.75, 0, front + 0.45]} scale={0.9} />
    </group>
  );
}

/* ---------- platform canopy, lamps, benches ---------- */

function Canopy() {
  const { minX, maxX } = L.canopy;
  const mid = (minX + maxX) / 2;
  return (
    <group>
      {[7.0, 10.0, 13.0, 15.8].map((x) => (
        <Pole
          key={x}
          position={[x, 1.5, 0.6]}
          height={2.85}
          radius={0.07}
          color="#5f6f68"
        />
      ))}
      <Box
        position={[mid, 2.95, 0.05]}
        size={[maxX - minX, 0.12, 1.9]}
        color="#7a8a80"
      />
      <Box
        position={[mid, 2.87, 0.98]}
        size={[maxX - minX, 0.16, 0.06]}
        color="#a8543f"
      />
      {/* the big direction board */}
      <group position={[11.5, 2.38, 0.95]}>
        {[-1.7, 1.7].map((x) => (
          <Segment
            key={x}
            from={[x, 0.25, 0]}
            to={[x, 0.5, 0]}
            radius={0.02}
            color="#4a5550"
          />
        ))}
        <Box size={[3.9, 0.52, 0.06]} color="#25455a" />
        <Sign
          text="PHÙ CÁT  →  TP. HỒ CHÍ MINH"
          position={[0, 0, 0.035]}
          width={3.75}
          height={0.4}
          color="#25455a"
          ink={C.cream}
          fontSize={100}
        />
      </group>
    </group>
  );
}

function LampPost({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Pole position={[0, 1.6, 0]} height={3.2} radius={0.05} color="#4a5550" />
      <Segment
        from={[0, 3.1, 0]}
        to={[0.42, 3.25, 0]}
        radius={0.025}
        color="#4a5550"
      />
      <mesh position={[0.45, 3.15, 0]}>
        <sphereGeometry args={[0.13, 12, 8]} />
        <meshStandardMaterial
          color={LAMP_GLOW}
          emissive={LAMP_GLOW}
          emissiveIntensity={1.6}
        />
      </mesh>
    </group>
  );
}

function PlatformBench({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Box position={[0, 0.46, 0]} size={[1.5, 0.08, 0.4]} color="#b5865e" />
      <Box
        position={[0, 0.78, -0.17]}
        size={[1.5, 0.3, 0.05]}
        color="#b5865e"
      />
      {[-0.6, 0.6].map((x) => (
        <Box
          key={x}
          position={[x, 0.22, 0]}
          size={[0.07, 0.44, 0.38]}
          color="#4a5550"
        />
      ))}
    </group>
  );
}

/* ---------- people's things ---------- */

/** Mẹ's woven bag of home food: rice paper, a jar of ruốc, bananas. */
function FoodBag({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Box position={[0, 0.22, 0]} size={[0.5, 0.42, 0.32]} color="#c9a46a" />
      {[0.1, 0.24, 0.36].map((y) => (
        <Box
          key={y}
          position={[0, y, 0.165]}
          size={[0.5, 0.025, 0.01]}
          color="#a8844e"
        />
      ))}
      <mesh position={[0, 0.48, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.17, 0.02, 6, 14, Math.PI]} />
        <meshStandardMaterial color="#8a6a46" />
      </mesh>
      <Box
        position={[-0.08, 0.47, 0]}
        size={[0.24, 0.12, 0.2]}
        color="#5f8a3e"
      />
      <mesh position={[0.13, 0.48, 0.02]}>
        <cylinderGeometry args={[0.07, 0.07, 0.14, 10]} />
        <meshStandardMaterial color="#d9b25a" />
      </mesh>
      <Orb
        position={[0.02, 0.5, -0.08]}
        scale={[0.14, 0.04, 0.05]}
        color="#e9c64a"
      />
    </group>
  );
}

/** The ticket follows Dĩ once bought, held at his right side. */
function TicketInHand({ player }: { player: RefObject<THREE.Group | null> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const p = player.current;
    const g = ref.current;
    if (!p || !g) return;
    const yaw = p.rotation.y;
    // Local offset (0.34 right, 0.18 forward) rotated by Dĩ's facing.
    const ox = 0.34 * Math.cos(yaw) + 0.18 * Math.sin(yaw);
    const oz = -0.34 * Math.sin(yaw) + 0.18 * Math.cos(yaw);
    g.position.set(
      p.position.x + ox,
      1.02 + Math.sin(clock.elapsedTime * 3) * 0.02,
      p.position.z + oz,
    );
    g.rotation.y = yaw;
  });
  return (
    <group ref={ref} userData={{ noCollide: true }}>
      <Box size={[0.2, 0.012, 0.12]} color="#f4ecd6" />
      <Box
        position={[-0.06, 0.008, 0]}
        size={[0.05, 0.006, 0.12]}
        color="#c0392b"
      />
    </group>
  );
}

function Stall() {
  const [x, z] = L.stall;
  return (
    <group position={[x, 0, z]}>
      {/* table */}
      <Box
        position={[0, 0.74, 0]}
        size={[1.8, 0.08, 0.8]}
        color={C.woodLight}
      />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Box
            key={`${sx}${sz}`}
            position={[sx * 0.82, 0.36, sz * 0.32]}
            size={[0.07, 0.72, 0.07]}
            color={C.wood}
          />
        )),
      )}
      {/* bánh ít lá gai: little dark-green leaf pyramids */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          position={[
            -0.7 + (i % 4) * 0.17,
            0.86,
            -0.12 + Math.floor(i / 4) * 0.2,
          ]}
          castShadow
        >
          <coneGeometry args={[0.075, 0.16, 4]} />
          <meshStandardMaterial color="#3d5a2c" roughness={0.9} />
        </mesh>
      ))}
      {/* stacks of bánh tráng */}
      {[0.1, 0.42].map((bx) => (
        <mesh key={bx} position={[bx, 0.84, 0.05]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
          <meshStandardMaterial color="#efe2bf" />
        </mesh>
      ))}
      {[0.66, 0.74].map((bx) => (
        <mesh key={bx} position={[bx, 0.9, -0.15]}>
          <cylinderGeometry args={[0.035, 0.035, 0.25, 8]} />
          <meshStandardMaterial color="#9fc6d6" transparent opacity={0.8} />
        </mesh>
      ))}
      {/* awning */}
      {[-0.95, 0.95].flatMap((px) =>
        [-0.5, 0.45].map((pz) => (
          <Pole
            key={`${px}${pz}`}
            position={[px, 1.1, pz]}
            height={2.2}
            radius={0.03}
            color="#6b6f6a"
          />
        )),
      )}
      {Array.from({ length: 5 }, (_, i) => (
        <Box
          key={i}
          position={[-0.84 + i * 0.42, 2.23, 0]}
          size={[0.42, 0.05, 1.3]}
          color={i % 2 ? "#f1e6cf" : "#c0392b"}
          rotation={[-0.12, 0, 0]}
        />
      ))}
      <Sign
        text="BÁNH ÍT LÁ GAI · BÁNH TRÁNG"
        position={[0, 1.95, 0.66]}
        width={1.9}
        height={0.24}
        color="#f1e6cf"
        ink="#8a3b26"
        fontSize={78}
      />
      <pointLight
        position={[0, 1.9, 0.2]}
        color="#ffcf8a"
        intensity={3}
        distance={4.5}
        decay={2}
      />
    </group>
  );
}

/* ---------- the arriving train ---------- */

function Locomotive({
  reducedMotion,
  active,
}: {
  reducedMotion?: boolean;
  active: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const offset = useRef(reducedMotion ? 0 : 26);
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    g.visible = active;
    if (!active) {
      offset.current = reducedMotion ? 0 : 26;
      return;
    }
    if (reducedMotion) offset.current = 0;
    else {
      const step = Math.min(delta, 0.1);
      offset.current = Math.max(
        0,
        offset.current - Math.max(0.5, offset.current * 0.9) * step,
      );
    }
    g.position.x = L.loco[0] + offset.current;
  });
  const BLUE = "#2f5d8a";
  return (
    // Walk-through for the collider pass: it is moving, and the rail bed is blocked anyway.
    <group
      ref={ref}
      position={[L.loco[0] + (reducedMotion ? 0 : 26), 0, L.loco[1]]}
      userData={{ noCollide: true }}
    >
      <Box position={[0, 1.25, 0]} size={[4.2, 1.9, 1.95]} color={BLUE} />
      <Box
        position={[0, 0.72, 0.985]}
        size={[4.2, 0.3, 0.03]}
        color="#c0392b"
      />
      <Box
        position={[0, 0.92, 0.99]}
        size={[4.2, 0.08, 0.03]}
        color="#f1e6cf"
      />
      <Box position={[0, 2.25, 0]} size={[4.3, 0.16, 2.0]} color="#3c4a52" />
      {/* cab windows at both ends */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box
            position={[s * 2.11, 1.62, 0]}
            size={[0.04, 0.5, 1.4]}
            color="#253a44"
          />
          <Box
            position={[s * 1.75, 1.62, 0.985]}
            size={[0.4, 0.45, 0.03]}
            color="#253a44"
          />
        </group>
      ))}
      <Sign
        text="ĐƯỜNG SẮT VIỆT NAM"
        position={[0, 1.25, 0.99]}
        width={2.1}
        height={0.22}
        color={BLUE}
        ink={C.cream}
        fontSize={80}
      />
      {/* headlight (east end) */}
      <mesh position={[2.13, 1.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.05, 14]} />
        <meshStandardMaterial
          color="#fff3c4"
          emissive="#ffe9a0"
          emissiveIntensity={2.5}
        />
      </mesh>
      <pointLight
        position={[2.6, 1.1, 0]}
        color="#ffe9b0"
        intensity={active ? 4 : 0}
        distance={6}
        decay={2}
      />
      {/* bogies */}
      {[-1.5, -0.9, 0.9, 1.5].map((x) => (
        <mesh
          key={x}
          position={[x, 0.37, 0.68]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.27, 12]} />
          <meshStandardMaterial color="#414e4a" />
        </mesh>
      ))}
      {/* horn + whistle steam */}
      <Box position={[1.2, 2.42, 0]} size={[0.3, 0.16, 0.2]} color="#9aa3a0" />
      <group scale={1.3}>
        <Smoke position={[0.92, 1.95, 0]} reducedMotion={reducedMotion} />
      </group>
    </group>
  );
}

/** Lit windows and an open door on the diorama carriage once boarding starts. */
function CarriageLights() {
  const windows = [-3.1, -1.85, -0.6, 0.65, 1.9, 3.1];
  const carriageX = -0.2;
  // Just in front of the diorama carriage's window panes (its face is at z -1.05).
  const face = TRACK_Z + 1.03;
  return (
    <group userData={{ noCollide: true }}>
      {windows.map((x) => (
        <mesh key={x} position={[carriageX + x, 1.55, face]}>
          <planeGeometry args={[0.78, 0.56]} />
          <meshBasicMaterial color="#ffd890" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[L.trainDoor[0], 1.05, face + 0.005]}>
        <planeGeometry args={[0.36, 1.3]} />
        <meshBasicMaterial color="#ffe2a8" toneMapped={false} />
      </mesh>
      {/* boarding step */}
      <Box
        position={[L.trainDoor[0], 0.3, face + 0.12]}
        size={[0.5, 0.05, 0.25]}
        color="#5f6f68"
      />
    </group>
  );
}

/* ---------- whole map ---------- */

export function DiXaMap({ effects, player, reducedMotion }: MapSceneProps) {
  const bagOnPlatform = effects.has("qua-que");
  return (
    <DioramaMap
      chapterId="di-xa"
      ground="#b8b09a"
      reducedMotion={reducedMotion}
    >
      <Tracks />
      <Platform />

      {/* forecourt paving */}
      <Box
        position={[-11.6, -0.03, 7.6]}
        size={[11, 0.04, 3.4]}
        color="#cfc5ab"
      />
      <Box
        position={[0, -0.03, 6.6]}
        size={[11.7, 0.04, 4.6]}
        color="#c9bfa5"
      />

      <StationBuilding />
      <Canopy />
      {L.lamps.map(([x, z]) => (
        <LampPost key={x} position={[x, 0, z]} />
      ))}
      <PlatformBench position={[11.6, 0.16, 0.05]} />
      <PlatformBench position={[14.3, 0.16, 0.05]} />
      <PlatformBench position={[-13.6, 0.16, 0.05]} />

      {/* the traveller's luggage */}
      <Suitcase position={[13.75, 0, 3.0]} scale={0.8} />
      <Box
        position={[12.45, 0.18, 2.35]}
        size={[0.5, 0.36, 0.35]}
        color="#6b7f5a"
      />

      {/* Mẹ's bag: at her feet until she hands it over */}
      <FoodBag
        position={
          bagOnPlatform
            ? [L.bagOnPlatform[0], 0.16, L.bagOnPlatform[1]]
            : [L.momBag[0], 0, L.momBag[1]]
        }
      />
      {effects.has("ve") ? <TicketInHand player={player} /> : null}

      <Stall />
      {/* Mounted from the start (hidden) so the train's lights don't recompile shaders on arrival. */}
      <Locomotive
        reducedMotion={reducedMotion}
        active={effects.has("tau-den")}
      />
      {effects.has("mo-cua") ? <CarriageLights /> : null}
      <pointLight
        position={[0.6, 1.7, -0.4]}
        color="#ffd890"
        intensity={effects.has("mo-cua") ? 3 : 0}
        distance={6}
        decay={2}
      />

      {/* the sun going down behind the fields */}
      <mesh position={[9, 6.5, -32]}>
        <circleGeometry args={[2.6, 32]} />
        <meshBasicMaterial color="#ffc27a" toneMapped={false} fog={false} />
      </mesh>
      {[-14, -2, 11].map((x, i) => (
        <Orb
          key={x}
          position={[x, 0.2, -16 - i]}
          scale={[7 + i, 2.6 + i * 0.6, 3]}
          color={i % 2 ? "#a8846f" : "#9a7b6c"}
        />
      ))}
      <RicePaddy position={[-11, 0, -6.6]} width={11} depth={4.2} />
      <RicePaddy position={[11, 0, -6.6]} width={11} depth={4.2} />
      <Tree position={[-16, 0, -4.4]} kind="palm" scale={1.2} />
      <Tree position={[-4.8, 0, -6.2]} kind="palm" scale={1.1} />
      <Tree position={[5.2, 0, -5.4]} scale={1.1} />
      <Tree position={[16.2, 0, -4.6]} kind="palm" scale={1.25} />

      {/* forecourt edges */}
      <Tree position={[-16.2, 0, 7.6]} scale={1.05} />
      <Tree position={[16.3, 0, 7.4]} kind="palm" scale={1.1} />
      <Tree position={[5.0, 0, 9.0]} scale={0.95} />
      <Bicycle position={[-16.4, 0, 3.6]} rotation={1.5} />
      <Bicycle position={[-16.4, 0, 5.1]} rotation={1.6} />
      <Pot position={[-6.3, 0, 4.9]} scale={1.1} />
      <Pot position={[6.6, 0, 4.4]} scale={1.1} />
      <Hedge from={[-17.4, 10.6]} to={[-2.6, 10.6]} />
      <Hedge from={[2.6, 10.6]} to={[17.4, 10.6]} />
    </DioramaMap>
  );
}
