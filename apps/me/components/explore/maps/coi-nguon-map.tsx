"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { Smoke } from "@/components/story/world-childhood";
import {
  Bamboo,
  Box,
  Buffalo,
  C,
  Orb,
  Pole,
  RicePaddy,
  Segment,
  Tree,
  VillageHouse,
} from "@/components/story/world-3d";
import { COI_NGUON_LAYOUT as L } from "@/lib/explore/coi-nguon";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";
import { Candle, FruitTray, Hedge, Incense } from "./tet-map";

type V3 = [number, number, number];

const WARM = "#ffc46e";

/* ---------- small pieces ---------- */

function Bulb({ position, on }: { position: V3; on: boolean }) {
  return (
    <group position={position}>
      <Segment
        from={[0, 0.16, 0]}
        to={[0, 0.05, 0]}
        radius={0.006}
        color="#2f2a24"
      />
      <mesh>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial
          color={on ? "#fff1c0" : "#d8d0b8"}
          emissive={WARM}
          emissiveIntensity={on ? 2.4 : 0.03}
        />
      </mesh>
    </group>
  );
}

function LampPost({ position, on }: { position: V3; on: boolean }) {
  return (
    <group position={position}>
      <Pole position={[0, 1.2, 0]} height={2.4} radius={0.05} color="#4a4a48" />
      <Segment
        from={[0, 2.35, 0]}
        to={[0.45, 2.45, 0]}
        radius={0.03}
        color="#4a4a48"
      />
      <mesh position={[0.45, 2.35, 0]}>
        <coneGeometry args={[0.16, 0.14, 10, 1, true]} />
        <meshStandardMaterial color="#4a4a48" side={THREE.DoubleSide} />
      </mesh>
      <Bulb position={[0.45, 2.22, 0]} on={on} />
    </group>
  );
}

/** Low wooden platform (bộ ván) under a bougainvillea trellis. */
function Porch({ served, lit }: { served: boolean; lit: boolean }) {
  const [px, pz] = L.platform;
  const blossoms = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const x = -1.6 + ((i * 0.83) % 3.2);
        const z = -1.1 + ((i * 0.57) % 2.2);
        return [x, 2.42 + (i % 3) * 0.06, z] as V3;
      }),
    [],
  );
  return (
    <group position={[px, 0, pz]}>
      {/* platform */}
      <Box position={[0, 0.42, 0]} size={[2.2, 0.1, 1.4]} color="#8a5a36" />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Box
            key={`${sx}${sz}`}
            position={[sx * 0.98, 0.19, sz * 0.58]}
            size={[0.1, 0.38, 0.1]}
            color="#5e3d24"
          />
        )),
      )}
      {served ? <DinnerTray /> : <TeaSet />}

      {/* trellis */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Pole
            key={`p${sx}${sz}`}
            position={[sx * 1.6, 1.15, sz * 1.1]}
            height={2.3}
            radius={0.06}
            color={C.wood}
          />
        )),
      )}
      {[-1.1, 1.1].map((z) => (
        <Box
          key={z}
          position={[0, 2.3, z]}
          size={[3.4, 0.08, 0.08]}
          color={C.wood}
        />
      ))}
      {[-1.6, -0.55, 0.55, 1.6].map((x) => (
        <Box
          key={x}
          position={[x, 2.34, 0]}
          size={[0.06, 0.06, 2.4]}
          color={C.wood}
        />
      ))}
      {blossoms.map((p, i) => (
        <Orb
          key={i}
          position={p}
          scale={[0.32, 0.12, 0.28]}
          color={i % 3 === 0 ? "#5d7d42" : i % 2 ? "#d94f8a" : "#c43d78"}
        />
      ))}
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <Bulb key={x} position={[x, 2.1, 1.1]} on={lit} />
      ))}
      <pointLight
        position={[0, 1.9, 0.2]}
        color={WARM}
        intensity={lit ? 5 : 0}
        distance={8}
      />
    </group>
  );
}

function TeaSet() {
  return (
    <group position={[0.4, 0.47, 0]}>
      <Orb position={[0, 0.1, 0]} scale={[0.12, 0.1, 0.12]} color="#e7e2d6" />
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.04, 0.2]}>
          <cylinderGeometry args={[0.05, 0.04, 0.07, 10]} />
          <meshStandardMaterial color="#f1ead9" />
        </mesh>
      ))}
    </group>
  );
}

function DinnerTray() {
  return (
    <group position={[0, 0.47, 0]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.62, 0.6, 0.04, 24]} />
        <meshStandardMaterial color="#9b6a3a" />
      </mesh>
      {/* rice pot */}
      <mesh position={[-0.32, 0.14, -0.18]}>
        <cylinderGeometry args={[0.15, 0.13, 0.2, 14]} />
        <meshStandardMaterial color="#5a5450" metalness={0.3} />
      </mesh>
      <Orb
        position={[-0.32, 0.24, -0.18]}
        scale={[0.13, 0.05, 0.13]}
        color="#f6f3ea"
      />
      {/* sour soup */}
      <mesh position={[0.1, 0.1, -0.2]}>
        <cylinderGeometry args={[0.17, 0.11, 0.12, 16]} />
        <meshStandardMaterial color="#f1ead9" />
      </mesh>
      <mesh position={[0.1, 0.16, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#e39a4a" />
      </mesh>
      {/* braised fish */}
      <mesh position={[0.36, 0.05, 0.12]}>
        <cylinderGeometry args={[0.16, 0.14, 0.03, 16]} />
        <meshStandardMaterial color="#f6f3ea" />
      </mesh>
      <Orb
        position={[0.36, 0.09, 0.12]}
        scale={[0.12, 0.04, 0.05]}
        color="#8a4a26"
      />
      {/* greens */}
      {[0, 1, 2, 3].map((i) => (
        <Orb
          key={i}
          position={[
            -0.1 + (i % 2) * 0.1,
            0.08,
            0.22 + Math.floor(i / 2) * 0.06,
          ]}
          scale={[0.07, 0.04, 0.06]}
          color={i % 2 ? "#5f9a3a" : "#7cb24a"}
        />
      ))}
      {/* four bowls with chopsticks */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const x = Math.cos(a) * 0.82;
        const z = Math.sin(a) * 0.5;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.08, 0.05, 0.07, 12]} />
              <meshStandardMaterial color="#e9e4d6" />
            </mesh>
            <Box
              position={[0.12, 0.01, 0]}
              size={[0.015, 0.01, 0.24]}
              color="#6b4a2a"
              rotation={[0, a, 0]}
            />
          </group>
        );
      })}
    </group>
  );
}

function Altar({
  lit,
  reducedMotion,
}: {
  lit: boolean;
  reducedMotion?: boolean;
}) {
  return (
    <group position={[L.altar[0], 0, L.altar[1]]}>
      <Box position={[0, 0.1, 0]} size={[0.6, 0.2, 0.6]} color="#b8afa0" />
      <Box position={[0, 0.65, 0]} size={[0.3, 1.0, 0.3]} color="#d9cdb0" />
      <Box position={[0, 1.18, 0]} size={[0.9, 0.08, 0.6]} color="#cbbd9c" />
      <Incense
        position={[0, 1.31, -0.05]}
        lit={lit}
        reducedMotion={reducedMotion}
      />
      {lit ? (
        <>
          <Candle position={[-0.32, 1.38, -0.05]} />
          <Candle position={[0.32, 1.38, -0.05]} />
        </>
      ) : null}
      <group position={[0, 1.24, 0.18]} scale={0.45}>
        <FruitTray position={[0, 0, 0]} />
      </group>
    </group>
  );
}

function Egrets({
  flying,
  reducedMotion,
}: {
  flying: boolean;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const [fx, fz] = L.field;
  const spots = useMemo(
    () =>
      [
        [-2.4, -1.4],
        [-0.8, 0.6],
        [1.2, -1.8],
        [2.6, 0.9],
        [0.2, -0.4],
      ] as Array<[number, number]>,
    [],
  );
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.children.forEach((bird, i) => {
      const [sx, sz] = spots[i] ?? [0, 0];
      if (flying) {
        const a =
          (reducedMotion ? 0 : t * 0.35) + (i / spots.length) * Math.PI * 2;
        bird.position.set(
          fx + Math.cos(a) * (3.2 + i * 0.3),
          3.4 + i * 0.25 + (reducedMotion ? 0 : Math.sin(t * 1.5 + i) * 0.15),
          fz + Math.sin(a) * 2.2,
        );
        bird.rotation.y = -a;
        const wings = bird.children[1];
        if (wings && !reducedMotion)
          wings.rotation.x = Math.sin(t * 7 + i) * 0.6;
      } else {
        bird.position.set(fx + sx, 0, fz + sz);
        bird.rotation.y = i * 1.3;
        bird.position.y = 0;
      }
    });
  });
  return (
    <group ref={ref} userData={{ noCollide: true }}>
      {spots.map((_, i) => (
        <group key={i}>
          <group>
            <Orb
              position={[0, 0.62, 0]}
              scale={[0.17, 0.11, 0.1]}
              color="#f7f5ef"
            />
            <Segment
              from={[0.12, 0.66, 0]}
              to={[0.2, 0.86, 0]}
              radius={0.025}
              color="#f7f5ef"
            />
            <Orb
              position={[0.22, 0.9, 0]}
              scale={[0.05, 0.045, 0.045]}
              color="#f7f5ef"
            />
            <mesh position={[0.31, 0.89, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.015, 0.1, 5]} />
              <meshStandardMaterial color="#e2b13a" />
            </mesh>
            {flying ? null : (
              <>
                <Segment
                  from={[-0.02, 0.55, 0.03]}
                  to={[-0.02, 0.05, 0.03]}
                  radius={0.01}
                  color="#2f2f2f"
                />
                <Segment
                  from={[-0.02, 0.55, -0.03]}
                  to={[-0.02, 0.05, -0.03]}
                  radius={0.01}
                  color="#2f2f2f"
                />
              </>
            )}
          </group>
          <group position={[0, 0.66, 0]}>
            {flying
              ? [-1, 1].map((s) => (
                  <Box
                    key={s}
                    position={[0, 0, s * 0.22]}
                    size={[0.18, 0.015, 0.36]}
                    color="#f7f5ef"
                  />
                ))
              : null}
          </group>
        </group>
      ))}
    </group>
  );
}

function OldKite({
  flying,
  reducedMotion,
}: {
  flying: boolean;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const [kx, kz] = L.kid;
  const sky: V3 = [kx + 3.8, 7.2, kz - 6.2];
  useFrame(({ clock }) => {
    if (!ref.current || !flying || reducedMotion) return;
    ref.current.position.y = sky[1] + Math.sin(clock.elapsedTime * 0.7) * 0.35;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.15;
  });
  const kite = (
    <>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color="#c9483a" side={THREE.DoubleSide} />
      </mesh>
      <Segment from={[-0.62, 0, 0.01]} to={[0.62, 0, 0.01]} radius={0.012} />
      <Segment from={[0, -0.62, 0.01]} to={[0, 0.62, 0.01]} radius={0.012} />
    </>
  );
  if (!flying)
    return (
      <group
        position={[kx + 0.75, 0.04, kz + 0.25]}
        rotation={[-Math.PI / 2, 0, 0.5]}
        userData={{ noCollide: true }}
      >
        {kite}
      </group>
    );
  return (
    <group userData={{ noCollide: true }}>
      <Segment
        from={[kx + 0.3, 1.0, kz]}
        to={sky}
        radius={0.007}
        color="#f5f1e6"
      />
      <group ref={ref} position={sky}>
        {kite}
        <Segment
          from={[0, -0.64, 0]}
          to={[0.25, -2.0, 0]}
          radius={0.014}
          color="#f2b632"
        />
      </group>
    </group>
  );
}

function Fireflies({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reducedMotion ? 0 : clock.elapsedTime;
    ref.current.children.forEach((f, i) => {
      f.position.set(
        -16 + (i % 5) * 1.2 + Math.sin(t * 0.6 + i) * 0.5,
        0.9 + Math.sin(t * 0.9 + i * 1.7) * 0.35,
        -8.3 + Math.floor(i / 5) * 1.1 + Math.cos(t * 0.5 + i) * 0.5,
      );
    });
  });
  return (
    <group ref={ref} userData={{ noCollide: true }}>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.035, 6, 4]} />
          <meshStandardMaterial
            color="#f6f2a0"
            emissive="#e8f07a"
            emissiveIntensity={3}
          />
        </mesh>
      ))}
    </group>
  );
}

export function CoiNguonMap({ effects, reducedMotion }: MapSceneProps) {
  const lit = effects.has("den");
  const [kx, kz] = L.kitchen;
  return (
    <DioramaMap
      chapterId="coi-nguon"
      ground="#a3a86e"
      reducedMotion={reducedMotion}
    >
      {/* village road and the brick yard */}
      <Box position={[0, -0.02, 2.15]} size={[36, 0.04, 1.6]} color="#c6b48c" />
      <Box
        position={[-10, -0.02, -1.2]}
        size={[8.4, 0.04, 5.2]}
        color="#c99d74"
      />
      {[-13.2, -11.6, -10, -8.4, -6.8].map((x) => (
        <Box
          key={x}
          position={[x, 0.005, -1.2]}
          size={[0.03, 0.01, 5.2]}
          color="#b5865e"
        />
      ))}
      {[-3.3, -1.6, 0.1].map((z) => (
        <Box
          key={z}
          position={[-10, 0.005, z]}
          size={[8.4, 0.01, 0.03]}
          color="#b5865e"
        />
      ))}

      {/* kitchen house with evening smoke */}
      <group position={[kx, 0, kz]} scale={0.9}>
        <VillageHouse position={[0, 0, 0]} open />
      </group>
      <Smoke
        position={[kx - 1.2, 2.9, kz - 0.4]}
        reducedMotion={reducedMotion}
      />
      {[-1.4, 0, 1.4].map((x) => (
        <Bulb key={x} position={[kx + x, 1.62, kz + 1.25]} on={lit} />
      ))}
      <pointLight
        position={[kx, 1.6, kz + 1.8]}
        color={WARM}
        intensity={lit ? 4 : 0}
        distance={7}
      />

      {/* porch dinner, altar, and lights on the diorama house too */}
      <Porch served={effects.has("mam-com")} lit={lit} />
      <Altar lit={effects.has("huong")} reducedMotion={reducedMotion} />
      <Bulb position={[-2, 1.78, -0.35]} on={lit} />
      <pointLight
        position={[-2, 1.7, 0.2]}
        color={WARM}
        intensity={lit ? 4 : 0}
        distance={7}
      />
      {L.lamps.map(([x, z]) => (
        <LampPost key={x} position={[x, 0, z]} on={lit} />
      ))}
      {lit ? <Fireflies reducedMotion={reducedMotion} /> : null}

      {/* the fields at sunset */}
      <RicePaddy position={[L.field[0], 0, L.field[1]]} width={8} depth={6} />
      <RicePaddy position={[L.field[0], 0, -7.0]} width={8} depth={3.2} />
      <RicePaddy position={[11, 0, 6.3]} width={8} depth={4.4} />
      <Egrets flying={effects.has("co")} reducedMotion={reducedMotion} />

      {/* old friend with his buffalo and hoe */}
      <group position={[16.0, 0, 4.7]} rotation={[0, Math.PI, 0]}>
        <Buffalo />
      </group>
      <Pole
        position={[L.friend[0] + 0.4, 0.6, L.friend[1] + 0.15]}
        height={1.2}
        radius={0.025}
        rotation={[0, 0, 0.25]}
      />

      {/* the old kite */}
      <OldKite flying={effects.has("dieu-bay")} reducedMotion={reducedMotion} />

      {/* edges of the village */}
      <Bamboo position={[-15.8, 0, -7.6]} scale={1.3} />
      <Bamboo position={[-13.6, 0, -8.4]} scale={1.2} />
      <Bamboo position={[-6.8, 0, -8.2]} scale={1.2} />
      <Bamboo position={[-16.2, 0, -2.4]} scale={1.1} />
      <Tree position={[-14.6, 0, -4.4]} scale={1.2} />
      <Tree position={[-15.6, 0, 6.2]} kind="palm" scale={1.2} />
      <Tree position={[-6.0, 0, 8.4]} kind="palm" scale={1.2} />
      <Tree position={[3.4, 0, 8.8]} scale={1.1} />
      <Tree position={[16.0, 0, -8.4]} kind="palm" scale={1.1} />
      <Tree position={[5.6, 0, -7.6]} scale={1.15} />
      <Hedge from={[-17.4, -9.6]} to={[17.4, -9.6]} />
    </DioramaMap>
  );
}
