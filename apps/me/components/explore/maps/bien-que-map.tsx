"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  BasketBoat,
  ConicalHat,
  Gulls,
} from "@/components/story/world-childhood";
import {
  Box,
  C,
  Orb,
  Pole,
  Segment,
  Sign,
  Tree,
} from "@/components/story/world-3d";
import { BIEN_QUE_LAYOUT as L } from "@/lib/explore/bien-que";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";

type V3 = [number, number, number];

const SAND = "#e6d2a2";
const SEA = "#4f9fb0";
const BOAT_SEA: V3 = [L.boatSea[0], 0.05, L.boatSea[1]];

function seeded(i: number, k = 1) {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------- sea ---------- */

function Sea({ reducedMotion }: { reducedMotion?: boolean }) {
  const waves = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!waves.current || reducedMotion) return;
    waves.current.children.forEach((child, i) => {
      const t = (clock.elapsedTime * 0.16 + i / 3) % 1;
      child.position.z = -4.6 + t * 2.1;
      child.scale.x = 0.55 + Math.sin(t * Math.PI) * 0.45;
    });
  });
  const z0 = L.shoreZ;
  return (
    <group>
      {/* wet sand, shallows and open water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, z0 + 0.7]}>
        <planeGeometry args={[90, 1.4]} />
        <meshStandardMaterial color="#d3bb88" roughness={1} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, z0 - 0.7]}
        receiveShadow
      >
        <planeGeometry args={[90, 1.4]} />
        <meshStandardMaterial color="#7cc2c8" roughness={0.3} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.035, z0 - 1.4 - 20]}
        receiveShadow
      >
        <planeGeometry args={[90, 40]} />
        <meshStandardMaterial color={SEA} roughness={0.25} metalness={0.1} />
      </mesh>
      <group ref={waves}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            position={[0, 0.06, -4.6 + i * 0.7]}
            size={[40, 0.02, 0.09]}
            color="#f4f7f2"
          />
        ))}
      </group>
      {/* rocky point at the east end */}
      {[
        [16.2, -3.4, 0.9],
        [15.2, -3.9, 0.6],
        [16.6, -4.6, 0.7],
        [-16.6, -4.0, 0.8],
      ].map(([x, z, r], i) => (
        <Orb
          key={i}
          position={[x ?? 0, 0.1, z ?? 0]}
          scale={[r ?? 1, (r ?? 1) * 0.6, (r ?? 1) * 0.8]}
          color={i % 2 ? "#8a8a80" : "#77786f"}
        />
      ))}
    </group>
  );
}

function FishingBoat({
  position,
  reducedMotion,
}: {
  position: V3;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    const t = clock.elapsedTime + position[0];
    ref.current.position.y = position[1] + Math.sin(t * 0.9) * 0.06;
    ref.current.rotation.z = Math.sin(t * 0.7) * 0.04;
  });
  return (
    <group ref={ref} position={position}>
      <Box position={[0, 0.3, 0]} size={[4.2, 0.6, 1.4]} color="#2e6f8e" />
      <Box position={[0, 0.62, 0]} size={[4.3, 0.08, 1.5]} color="#d6342b" />
      <Box position={[0.6, 1.0, 0]} size={[1.3, 0.7, 1.0]} color="#f1ead9" />
      <Pole
        position={[-0.9, 1.8, 0]}
        height={2.4}
        radius={0.05}
        color={C.wood}
      />
      <mesh position={[-0.9, 3.05, 0]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial color="#d6342b" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** The basket boat that rows in once Dĩ waves to it. */
function ArrivingBoat({
  arrived,
  reducedMotion,
}: {
  arrived: boolean;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const oar = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const [tx, tz] = arrived ? L.boatBeach : L.boatSea;
    const k = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * 0.55);
    g.position.x += (tx - g.position.x) * k;
    g.position.z += (tz - g.position.z) * k;
    const atSea = g.position.z < L.shoreZ;
    g.position.y =
      atSea && !reducedMotion ? 0.05 + Math.sin(t * 1.3) * 0.05 : 0;
    g.rotation.y = atSea && !reducedMotion ? t * 0.25 : g.rotation.y;
    if (oar.current)
      oar.current.rotation.x =
        atSea && !reducedMotion ? Math.sin(t * 2.4) * 0.5 : 0;
  });
  return (
    <group ref={ref} position={BOAT_SEA} userData={{ noCollide: true }}>
      <BasketBoat position={[0, 0, 0]} scale={1.1} />
      {/* the fisherman rowing (a small figure in the boat) */}
      <Orb position={[0, 0.85, 0]} scale={[0.22, 0.3, 0.2]} color="#3e6b8a" />
      <Orb position={[0, 1.25, 0]} scale={[0.15, 0.16, 0.15]} color="#e9bf96" />
      <ConicalHat position={[0, 1.42, 0]} />
      <group ref={oar} position={[0.2, 0.9, 0.2]}>
        <Segment
          from={[0, 0, 0]}
          to={[0.9, -0.7, 0.3]}
          radius={0.025}
          color="#a07a4a"
        />
      </group>
      {arrived
        ? Array.from({ length: 8 }, (_, i) => (
            <Orb
              key={i}
              position={[
                -0.35 + (i % 4) * 0.2,
                0.5,
                -0.35 + Math.floor(i / 4) * 0.15,
              ]}
              scale={[0.12, 0.035, 0.045]}
              color={i % 3 ? "#b9c4c8" : "#8fa2a8"}
            />
          ))
        : null}
    </group>
  );
}

/* ---------- people's corners ---------- */

function NetPull({
  landed,
  reducedMotion,
}: {
  landed: boolean;
  reducedMotion?: boolean;
}) {
  const fish = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!fish.current || reducedMotion) return;
    fish.current.children.forEach((f, i) => {
      const t = (clock.elapsedTime * 1.3 + seeded(i) * 3) % 3;
      f.position.y = 0.12 + (t < 0.5 ? Math.sin((t / 0.5) * Math.PI) * 0.3 : 0);
      f.rotation.z = t < 0.5 ? t * 6 : 0;
    });
  });
  const [mx, mz] = L.fisherman;
  const [bx, bz] = L.fisherman2;
  const floats = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 8) * Math.PI;
        return [-12.2 + Math.cos(a) * 2.6, -7.2 - Math.sin(a) * 1.2] as [
          number,
          number,
        ];
      }),
    [],
  );
  return (
    <group userData={{ noCollide: true }}>
      {landed ? null : (
        <>
          {floats.map(([x, z], i) => (
            <Orb
              key={i}
              position={[x, 0.08, z]}
              scale={[0.09, 0.07, 0.09]}
              color="#e86a33"
            />
          ))}
          <Segment
            from={[floats[0]?.[0] ?? -9.6, 0.06, floats[0]?.[1] ?? -7.2]}
            to={[mx + 0.2, 0.85, mz - 0.35]}
            radius={0.018}
            color="#c9b38a"
          />
        </>
      )}
      <Segment
        from={[mx - 0.2, 0.85, mz - 0.3]}
        to={[bx + 0.2, 0.85, bz - 0.3]}
        radius={0.018}
        color="#c9b38a"
      />
      <Segment
        from={[bx - 0.2, 0.85, bz - 0.3]}
        to={[bx - 1.4, 0.04, bz + 0.6]}
        radius={0.018}
        color="#c9b38a"
      />
      {landed ? (
        <group position={[L.netHeap[0], 0, L.netHeap[1]]}>
          <Orb
            position={[0, 0.06, 0]}
            scale={[1.1, 0.16, 0.7]}
            color="#2f5f55"
          />
          <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.0, 12]} />
            <meshStandardMaterial color="#3d7a6c" wireframe />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <Orb
              key={i}
              position={[-0.8 + i * 0.5, 0.14, 0.6]}
              scale={[0.07, 0.07, 0.07]}
              color="#e86a33"
            />
          ))}
          <group ref={fish}>
            {Array.from({ length: 10 }, (_, i) => (
              <group
                key={i}
                position={[
                  (seeded(i, 2) - 0.5) * 1.6,
                  0.12,
                  (seeded(i, 3) - 0.5) * 1.0,
                ]}
                rotation={[0, seeded(i, 4) * 6, 0]}
              >
                <Orb scale={[0.13, 0.04, 0.05]} color="#c4ced2" />
              </group>
            ))}
          </group>
          {/* a full basket */}
          <group position={[1.6, 0, 0.3]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.35, 0.28, 0.3, 14]} />
              <meshStandardMaterial color="#8a6a3a" />
            </mesh>
            {[0, 1, 2, 3, 4].map((i) => (
              <Orb
                key={i}
                position={[-0.18 + (i % 3) * 0.17, 0.31, -0.1 + (i % 2) * 0.18]}
                scale={[0.12, 0.04, 0.05]}
                color="#b9c4c8"
              />
            ))}
          </group>
        </group>
      ) : null}
    </group>
  );
}

function Hut() {
  const [hx, hz] = L.hut;
  return (
    <group position={[hx, 0, hz]}>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Pole
            key={`${sx}${sz}`}
            position={[sx * 1.3, 1.05, sz * 1.1]}
            height={2.1}
            radius={0.07}
          />
        )),
      )}
      <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.25, 1.0, 4]} />
        <meshStandardMaterial color="#c9a86a" roughness={1} />
      </mesh>
      {/* the net Ông is mending, spread on the sand */}
      <mesh position={[0.2, 0.03, 1.2]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[2.2, 1.0, 12, 6]} />
        <meshStandardMaterial color="#2f5f55" wireframe />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <Orb
          key={i}
          position={[-0.8 + i * 0.45, 0.06, 1.7 - i * 0.05]}
          scale={[0.07, 0.06, 0.07]}
          color="#e86a33"
        />
      ))}
      {/* water jar */}
      <mesh position={[-1.0, 0.3, -0.6]} castShadow>
        <sphereGeometry args={[0.32, 12, 10]} />
        <meshStandardMaterial color="#8a5a3a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function FishBasket({ position, goods }: { position: V3; goods: string[] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.42, 0.36, 0.2, 16]} />
        <meshStandardMaterial color="#9a7a4a" roughness={1} />
      </mesh>
      {goods.map((c, i) => (
        <Orb
          key={i}
          position={[Math.cos(i * 2.4) * 0.2, 0.22, Math.sin(i * 2.4) * 0.17]}
          scale={[0.13, 0.045, 0.06]}
          color={c}
        />
      ))}
    </group>
  );
}

function SeafoodStall() {
  const [vx, vz] = L.vendor;
  return (
    <group>
      <FishBasket
        position={[vx - 0.75, 0, vz + 0.85]}
        goods={["#b9c4c8", "#a9b6bb", "#c4ced2", "#b9c4c8", "#9fb0b6"]}
      />
      <FishBasket
        position={[vx + 0.25, 0, vz + 1.0]}
        goods={["#e8d5c4", "#f0dfcf", "#e2c9b4", "#ead8c8"]}
      />
      <FishBasket
        position={[vx + 1.15, 0, vz + 0.7]}
        goods={["#d6542b", "#c9472a", "#de6a3a"]}
      />
      {/* beach umbrella */}
      <Pole
        position={[vx + 0.6, 1.2, vz - 0.6]}
        height={2.4}
        radius={0.03}
        color="#e8e2d2"
      />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh
          key={i}
          position={[vx + 0.6, 2.4, vz - 0.6]}
          rotation={[0, (i * Math.PI) / 4, 0]}
        >
          <coneGeometry args={[1.4, 0.45, 2, 1, true, 0, Math.PI / 4]} />
          <meshStandardMaterial
            color={i % 2 ? "#f6efe0" : "#2e8fb0"}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <group position={[vx - 1.6, 0, vz + 0.2]}>
        <Pole position={[0, 0.45, 0]} height={0.9} radius={0.035} />
        <Box position={[0, 0.95, 0]} size={[1.2, 0.34, 0.06]} color={C.wood} />
        <Sign
          text="HẢI SẢN TƯƠI"
          position={[0, 0.95, 0.035]}
          width={1.1}
          height={0.28}
          color={C.wood}
          ink={C.cream}
          fontSize={90}
        />
      </group>
    </group>
  );
}

function DryingRack({ position, full }: { position: V3; full: boolean }) {
  const fish = useMemo(() => {
    const out: V3[] = [];
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 3; c++)
        out.push([-0.3 + c * 0.3, 0.83, -1.05 + r * 0.35]);
    return out;
  }, []);
  return (
    <group position={position}>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Pole
            key={`${sx}${sz}`}
            position={[sx * 0.48, 0.38, sz * 1.2]}
            height={0.76}
            radius={0.04}
            color="#a99459"
          />
        )),
      )}
      <Box position={[0, 0.77, 0]} size={[1.1, 0.04, 2.6]} color="#c7b27a" />
      {Array.from({ length: 8 }, (_, i) => (
        <Box
          key={i}
          position={[0, 0.795, -1.2 + i * 0.34]}
          size={[1.08, 0.012, 0.03]}
          color="#a99459"
        />
      ))}
      {(full ? fish : fish.slice(0, 4)).map((p, i) => (
        <Orb
          key={i}
          position={p}
          scale={[0.12, 0.025, 0.05]}
          color={i % 3 ? "#c9b48a" : "#b39a6a"}
        />
      ))}
    </group>
  );
}

function Sandcastle({
  big,
  shells,
  reducedMotion,
}: {
  big: boolean;
  shells: boolean;
  reducedMotion?: boolean;
}) {
  const flag = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (flag.current && !reducedMotion)
      flag.current.rotation.y = Math.sin(clock.elapsedTime * 2.2) * 0.3;
  });
  const towers: V3[] = big
    ? [
        [-0.5, 0, -0.35],
        [0.5, 0, -0.35],
        [-0.5, 0, 0.35],
        [0.5, 0, 0.35],
      ]
    : [[-0.3, 0, 0]];
  return (
    <group position={[L.castle[0], 0, L.castle[1]]}>
      {big ? (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.05, 1.3, 28]} />
          <meshStandardMaterial color="#6fb4bd" />
        </mesh>
      ) : null}
      <Box
        position={[0, big ? 0.22 : 0.12, 0]}
        size={big ? [1.3, 0.44, 1.0] : [0.7, 0.24, 0.5]}
        color="#d9c08a"
      />
      {towers.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, big ? 0.62 : 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, big ? 0.5 : 0.3, 10]} />
            <meshStandardMaterial color="#cfb47c" roughness={1} />
          </mesh>
          <mesh position={[0, big ? 0.98 : 0.6, 0]} castShadow>
            <coneGeometry args={[0.2, 0.28, 10]} />
            <meshStandardMaterial color="#d9c08a" roughness={1} />
          </mesh>
        </group>
      ))}
      {big ? (
        <group position={[0, 0.44, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.28, 0.8, 12]} />
            <meshStandardMaterial color="#d4ba82" roughness={1} />
          </mesh>
          <Pole
            position={[0, 1.1, 0]}
            height={0.6}
            radius={0.015}
            color="#7a5c3a"
          />
          <mesh ref={flag} position={[0.12, 1.3, 0]}>
            <planeGeometry args={[0.24, 0.15]} />
            <meshStandardMaterial color="#d6342b" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ) : null}
      {shells
        ? Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <Orb
                key={i}
                position={[
                  Math.cos(a) * (big ? 0.8 : 0.5),
                  0.05,
                  Math.sin(a) * (big ? 0.62 : 0.4),
                ]}
                scale={[0.07, 0.035, 0.06]}
                color={
                  ["#f2d2c4", "#f7efe2", "#e9a98f", "#f5e0b8"][i % 4] ??
                  "#f7efe2"
                }
              />
            );
          })
        : null}
      {/* bucket and spade */}
      <mesh position={[-1.25, 0.13, 0.7]} castShadow>
        <cylinderGeometry args={[0.15, 0.11, 0.26, 12]} />
        <meshStandardMaterial color="#2e8fb0" />
      </mesh>
      <Box
        position={[-1.0, 0.03, 1.0]}
        size={[0.1, 0.03, 0.4]}
        color="#f2c14e"
        rotation={[0, 0.5, 0]}
      />
    </group>
  );
}

function ShoreShells() {
  return (
    <group
      position={[L.shells[0], 0, L.shells[1]]}
      userData={{ noCollide: true }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (seeded(i, 7) - 0.5) * 1.8,
            0.02,
            (seeded(i, 8) - 0.5) * 0.9,
          ]}
          rotation={[0, seeded(i, 9) * 6, 0]}
          scale={[1, 0.45, 0.85]}
        >
          <sphereGeometry
            args={[0.08, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial
            color={
              ["#f2d2c4", "#f7efe2", "#e9a98f", "#f5e0b8"][i % 4] ?? "#f7efe2"
            }
          />
        </mesh>
      ))}
    </group>
  );
}

export function BienQueMap({ effects, reducedMotion }: MapSceneProps) {
  return (
    <DioramaMap
      chapterId="bien-que"
      ground={SAND}
      reducedMotion={reducedMotion}
    >
      <Sea reducedMotion={reducedMotion} />
      <group position={[-9, 0, -3.2]}>
        <Gulls reducedMotion={reducedMotion} />
      </group>
      <group position={[10, 0.6, -4.5]}>
        <Gulls reducedMotion={reducedMotion} />
      </group>
      <FishingBoat position={[7, 0, -16]} reducedMotion={reducedMotion} />
      <FishingBoat position={[-13, 0, -19]} reducedMotion={reducedMotion} />
      {[
        [4.6, -7.2],
        [12.4, -6.6],
        [-2.4, -9.2],
        [-15.0, -6.4],
      ].map(([x, z]) => (
        <BasketBoat
          key={x}
          position={[x ?? 0, 0.05, z ?? 0]}
          scale={0.85}
          floating
          reducedMotion={reducedMotion}
        />
      ))}

      {/* the boat that comes in */}
      <ArrivingBoat
        arrived={effects.has("thuyen-ve")}
        reducedMotion={reducedMotion}
      />

      {/* fishermen pulling the net */}
      <NetPull landed={effects.has("luoi-ca")} reducedMotion={reducedMotion} />

      {/* boats resting on the sand */}
      <BasketBoat position={[-16.0, 0, -1.4]} />
      <BasketBoat position={[-6.6, 0, 4.2]} scale={0.9} />
      <BasketBoat position={[15.0, 0, -1.3]} scale={0.95} />

      {/* Ông's shelter */}
      <Hut />

      {/* seafood vendor and drying racks */}
      <SeafoodStall />
      {L.racks.map(([x, z]) => (
        <DryingRack
          key={x}
          position={[x, 0, z]}
          full={effects.has("phoi-ca")}
        />
      ))}

      {/* shells and the sandcastle */}
      {effects.has("vo-so") ? null : <ShoreShells />}
      <Sandcastle
        big={effects.has("lau-dai")}
        shells={effects.has("vo-so")}
        reducedMotion={reducedMotion}
      />

      {/* coconut palms */}
      <Tree position={[-16.0, 0, 3.0]} kind="palm" scale={1.3} />
      <Tree position={[-9.6, 0, 8.6]} kind="palm" scale={1.2} />
      <Tree position={[-3.6, 0, 7.8]} kind="palm" scale={1.25} />
      <Tree position={[2.0, 0, 9.3]} kind="palm" scale={1.1} />
      <Tree position={[15.8, 0, 1.4]} kind="palm" scale={1.25} />
      <Tree position={[16.0, 0, 8.6]} kind="palm" scale={1.15} />
      <Tree position={[11.0, 0, 9.2]} kind="palm" scale={1.2} />
    </DioramaMap>
  );
}
