"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  Bamboo,
  Box,
  Buffalo,
  C,
  Kite,
  Orb,
  Pole,
  RicePaddy,
  Segment,
  Sign,
  Tree,
  VillageHouse,
} from "@/components/story/world-3d";
import { MUA_HE_LAYOUT as L } from "@/lib/explore/mua-he";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";

type V3 = [number, number, number];

const RX = L.river.x;
const RW = L.river.half * 2;
/** Stream pieces outside the diorama island (z ranges). */
const STREAM: Array<[number, number]> = [
  [-14, -3.9],
  [3.9, 14],
];
const BUFFALO_START: V3 = [L.buffalo[0], 0, L.buffalo[1]];

/* ---------- the stream, bridge and paper boats ---------- */

function Stream({ reducedMotion }: { reducedMotion?: boolean }) {
  const ripples = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ripples.current && !reducedMotion)
      ripples.current.position.z = Math.sin(clock.elapsedTime * 0.5) * 0.12;
  });
  const marks = useMemo(
    () =>
      STREAM.flatMap(([a, b]) =>
        Array.from({ length: Math.floor((b - a) / 0.8) }, (_, i) => {
          const z = a + 0.4 + i * 0.8;
          return [RX + Math.sin(z * 2.3) * 0.55, z, 0.35 + (i % 3) * 0.15];
        }),
      ),
    [],
  );
  return (
    <group>
      {STREAM.map(([a, b]) => (
        <group key={a}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[RX, 0.03, (a + b) / 2]}
            receiveShadow
          >
            <planeGeometry args={[RW, b - a]} />
            <meshStandardMaterial color={C.water} roughness={0.25} />
          </mesh>
          {[-1, 1].map((s) => (
            <Box
              key={s}
              position={[RX + s * (L.river.half + 0.05), 0.05, (a + b) / 2]}
              size={[0.14, 0.18, b - a]}
              color="#a0a079"
            />
          ))}
        </group>
      ))}
      <group ref={ripples}>
        {marks.map(([x, z, w], i) => (
          <Box
            key={i}
            position={[x, 0.045, z]}
            size={[w, 0.008, 0.025]}
            color="#9db5a1"
          />
        ))}
      </group>
      {/* reeds along the banks (walk-through) */}
      <group userData={{ noCollide: true }}>
        {[-7.2, -5.6, -11.5, 5.2, 10.8, 12.6].map((z, i) => {
          const x = RX + (i % 2 ? 1 : -1) * (L.river.half + 0.25);
          return (
            <group key={z} position={[x, 0, z]}>
              {[0, 1, 2, 3].map((k) => (
                <mesh
                  key={k}
                  position={[
                    Math.cos(k * 1.9) * 0.14,
                    0.32,
                    Math.sin(k * 1.9) * 0.14,
                  ]}
                  rotation={[Math.sin(k) * 0.15, 0, Math.cos(k) * 0.15]}
                >
                  <coneGeometry args={[0.03, 0.64 + (k % 2) * 0.2, 4]} />
                  <meshStandardMaterial color={k % 2 ? C.leafLight : C.leaf} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>
    </group>
  );
}

function PlankBridge() {
  const z = L.bridgeZ;
  return (
    <group position={[RX, 0, z]}>
      <Box position={[0, 0.1, 0]} size={[3.4, 0.1, 2.0]} color="#9b7a52" />
      {Array.from({ length: 9 }, (_, i) => (
        <Box
          key={i}
          position={[-1.6 + i * 0.4, 0.16, 0]}
          size={[0.03, 0.01, 1.96]}
          color="#7a5c3a"
        />
      ))}
      <group userData={{ noCollide: true }}>
        {[-0.95, 0.95].map((dz) => (
          <group key={dz}>
            {[-1.55, -0.52, 0.52, 1.55].map((x) => (
              <Pole
                key={x}
                position={[x, 0.45, dz]}
                height={0.7}
                radius={0.045}
                color={C.wood}
              />
            ))}
            <Box
              position={[0, 0.78, dz]}
              size={[3.3, 0.07, 0.07]}
              color={C.woodLight}
            />
          </group>
        ))}
      </group>
    </group>
  );
}

function PaperBoat({ position }: { position?: V3 }) {
  return (
    <group position={position}>
      <Box position={[0, 0.04, 0]} size={[0.15, 0.07, 0.34]} color="#f6f3ea" />
      <mesh position={[0, 0.15, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.1, 0.18, 4]} />
        <meshStandardMaterial color="#fbf8f0" roughness={0.9} />
      </mesh>
    </group>
  );
}

function PaperBoats({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((boat, i) => {
      const t = reducedMotion ? i / 5 : (clock.elapsedTime * 0.035 + i / 5) % 1;
      const z = -13 + t * 26;
      boat.position.set(RX + Math.sin(z * 0.5 + i) * 0.45, 0.04, z);
      boat.rotation.y = Math.sin(z * 0.5 + i) * 0.35;
      // hidden while crossing the lane causeway (dry ground)
      boat.visible = z < 1.35 || z > 2.95;
    });
  });
  return (
    <group ref={ref} userData={{ noCollide: true }}>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i}>
          <PaperBoat />
        </group>
      ))}
    </group>
  );
}

/* ---------- people's corners ---------- */

function BambooBed({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Box position={[0, 0.45, 0]} size={[1.8, 0.06, 1.0]} color="#c7b27a" />
      {Array.from({ length: 7 }, (_, i) => (
        <Box
          key={i}
          position={[0, 0.485, -0.42 + i * 0.14]}
          size={[1.78, 0.012, 0.03]}
          color="#a99459"
        />
      ))}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Pole
            key={`${sx}${sz}`}
            position={[sx * 0.8, 0.21, sz * 0.42]}
            height={0.42}
            radius={0.05}
            color="#a99459"
          />
        )),
      )}
      {/* tea pot, cups and a palm-leaf fan */}
      <Orb
        position={[0.45, 0.6, 0.1]}
        scale={[0.12, 0.1, 0.12]}
        color="#e7e2d6"
      />
      {[0.2, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.52, -0.2]}>
          <cylinderGeometry args={[0.05, 0.04, 0.07, 10]} />
          <meshStandardMaterial color="#f1ead9" />
        </mesh>
      ))}
      <mesh position={[-0.4, 0.5, 0.1]} rotation={[-Math.PI / 2, 0, 0.6]}>
        <circleGeometry args={[0.22, 14, 0, Math.PI]} />
        <meshStandardMaterial color="#d8c48a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Hammock({
  swinging,
  reducedMotion,
}: {
  swinging: boolean;
  reducedMotion?: boolean;
}) {
  const swing = useRef<THREE.Group>(null);
  const curve = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.5, 0, 0),
        new THREE.Vector3(0, -1.55, 0),
        new THREE.Vector3(1.5, 0, 0),
      ),
    [],
  );
  useFrame(({ clock }) => {
    if (!swing.current) return;
    swing.current.rotation.x =
      swinging && !reducedMotion ? Math.sin(clock.elapsedTime * 1.3) * 0.22 : 0;
  });
  return (
    <group position={[L.hammock[0], 0, L.hammock[1]]}>
      <Tree position={[-1.7, 0, 0]} scale={1.05} />
      <Tree position={[1.7, 0, 0.1]} scale={1.15} />
      <group ref={swing} position={[0, 1.3, 0]}>
        <mesh scale={[1, 1, 1.6]} castShadow>
          <tubeGeometry args={[curve, 20, 0.16, 8, false]} />
          <meshStandardMaterial color="#d65a4a" roughness={0.9} />
        </mesh>
      </group>
      {/* cicadas on the trunks */}
      {[
        [-1.62, 1.55, 0.12],
        [-1.78, 1.9, -0.05],
        [1.6, 1.4, 0.2],
        [1.82, 2.0, 0.05],
      ].map(([x, y, z], i) => (
        <Orb
          key={i}
          position={[x ?? 0, y ?? 0, z ?? 0]}
          scale={[0.05, 0.08, 0.04]}
          color="#4a3a22"
        />
      ))}
    </group>
  );
}

function FollowBuffalo({
  player,
  reducedMotion,
}: {
  player: RefObject<THREE.Group | null>;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    const g = ref.current;
    const p = player.current?.position;
    if (!g || !p) return;
    const dt = Math.min(delta, 0.1);
    const dx = g.position.x - p.x;
    const dz = g.position.z - p.z;
    const d = Math.hypot(dx, dz) || 0.0001;
    const keep = 2.2;
    let moving = false;
    if (d > keep + 0.05) {
      const tx = p.x + (dx / d) * keep;
      const tz = p.z + (dz / d) * keep;
      const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 1.8);
      g.position.x += (tx - g.position.x) * k;
      g.position.z += (tz - g.position.z) * k;
      moving = true;
    }
    // Head (+x) turns towards Dĩ.
    const want = Math.atan2(dz, -dx);
    const diff =
      THREE.MathUtils.euclideanModulo(
        want - g.rotation.y + Math.PI,
        Math.PI * 2,
      ) - Math.PI;
    g.rotation.y += diff * (reducedMotion ? 1 : 1 - Math.exp(-dt * 4));
    if (body.current)
      body.current.position.y =
        moving && !reducedMotion
          ? Math.abs(Math.sin(clock.elapsedTime * 5)) * 0.04
          : 0;
  });
  return (
    <group ref={ref} position={BUFFALO_START} userData={{ noCollide: true }}>
      <group ref={body}>
        <Buffalo />
      </group>
    </group>
  );
}

function FishingSpot({
  caught,
  reducedMotion,
}: {
  caught: boolean;
  reducedMotion?: boolean;
}) {
  const fish = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    if (fish.current) fish.current.rotation.z = Math.sin(t * 9) * 0.35;
    if (bob.current) bob.current.position.y = 0.07 + Math.sin(t * 2.2) * 0.025;
  });
  const [fx, fz] = L.fisher;
  const tip: V3 = [RX - 0.1, caught ? 2.3 : 1.9, fz - 0.15];
  return (
    <group>
      <group userData={{ noCollide: true }}>
        <Segment
          from={[fx - 0.45, 0.72, fz + 0.05]}
          to={tip}
          radius={0.022}
          color="#8a6a3a"
        />
        {caught ? (
          <>
            <Segment
              from={tip}
              to={[tip[0], 1.05, tip[2]]}
              radius={0.005}
              color="#f5f1e6"
            />
            <group ref={fish} position={[tip[0], 1.05, tip[2]]}>
              <Orb
                position={[0, -0.2, 0]}
                scale={[0.07, 0.2, 0.05]}
                color="#b6a45a"
              />
              <mesh position={[0, -0.44, 0]} rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[0.07, 0.1, 4]} />
                <meshStandardMaterial color="#8f7f3e" />
              </mesh>
            </group>
          </>
        ) : (
          <>
            <Segment
              from={tip}
              to={[tip[0] - 0.2, 0.08, tip[2]]}
              radius={0.005}
              color="#f5f1e6"
            />
            <mesh ref={bob} position={[tip[0] - 0.2, 0.07, tip[2]]}>
              <sphereGeometry args={[0.05, 8, 6]} />
              <meshStandardMaterial color="#d6342b" />
            </mesh>
          </>
        )}
      </group>
      {/* bucket and bait tin */}
      <group position={[fx + 0.4, 0, fz - 0.9]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.16, 0.3, 14]} />
          <meshStandardMaterial color="#5c7f9a" />
        </mesh>
        <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.18, 14]} />
          <meshStandardMaterial color={C.water} />
        </mesh>
        {caught ? (
          <Orb
            position={[0.02, 0.31, 0]}
            scale={[0.13, 0.04, 0.05]}
            color="#b6a45a"
          />
        ) : null}
      </group>
      <mesh position={[fx + 0.1, 0.05, fz + 0.75]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 10]} />
        <meshStandardMaterial color="#9a9a8a" metalness={0.4} />
      </mesh>
    </group>
  );
}

function IceCreamCart() {
  return (
    <group position={[L.cart[0], 0, L.cart[1]]}>
      <Box position={[0, 0.72, 0]} size={[1.25, 0.6, 0.7]} color="#e9eef0" />
      <Box position={[0, 1.04, 0]} size={[1.3, 0.06, 0.75]} color="#5c9fb8" />
      <Box
        position={[0, 0.72, 0.36]}
        size={[1.1, 0.18, 0.02]}
        color="#e2553f"
      />
      <Sign
        text="CÀ REM"
        position={[0, 0.72, 0.372]}
        width={0.9}
        height={0.16}
        color="#e2553f"
        ink="#fff6e0"
        fontSize={110}
      />
      {[-0.38, 0.38].map((z) => (
        <mesh key={z} position={[0.2, 0.3, z]}>
          <torusGeometry args={[0.26, 0.04, 6, 18]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
      ))}
      <Box
        position={[-0.55, 0.22, 0]}
        size={[0.06, 0.44, 0.06]}
        color="#6a6a6a"
      />
      <Segment
        from={[-0.62, 0.95, -0.3]}
        to={[-1.05, 0.95, -0.3]}
        radius={0.025}
        color="#6a6a6a"
      />
      <Segment
        from={[-0.62, 0.95, 0.3]}
        to={[-1.05, 0.95, 0.3]}
        radius={0.025}
        color="#6a6a6a"
      />
      <Segment
        from={[-1.05, 0.95, -0.32]}
        to={[-1.05, 0.95, 0.32]}
        radius={0.03}
        color="#2f2f2f"
      />
      {/* umbrella */}
      <Pole
        position={[0.4, 1.6, 0]}
        height={1.2}
        radius={0.025}
        color="#cfcfcf"
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[0.4, 2.25, 0]}
          rotation={[0, (i * Math.PI) / 3, 0]}
        >
          <coneGeometry args={[0.85, 0.35, 3, 1, true, 0, Math.PI / 3]} />
          <meshStandardMaterial
            color={i % 2 ? "#f6efe0" : "#e2553f"}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* bell */}
      <mesh position={[-1.05, 1.06, 0.2]}>
        <sphereGeometry args={[0.05, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={C.brass} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Haystack({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <coneGeometry args={[1.0, 1.6, 14]} />
        <meshStandardMaterial color="#d9b85c" roughness={1} />
      </mesh>
      <Pole position={[0, 1.8, 0]} height={0.5} radius={0.03} />
    </group>
  );
}

function GrassTufts() {
  const tufts = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const x = -16 + ((i * 7.31) % 17.5);
        const z = 3.6 + ((i * 3.77) % 5.4);
        return [x, z] as [number, number];
      }),
    [],
  );
  return (
    <group userData={{ noCollide: true }}>
      {tufts.map(([x, z], i) => (
        <Orb
          key={i}
          position={[x, 0.04, z]}
          scale={[0.22, 0.09, 0.18]}
          color={i % 2 ? "#7f9a58" : "#6f8a4c"}
        />
      ))}
    </group>
  );
}

export function MuaHeMap({ effects, player, reducedMotion }: MapSceneProps) {
  const following = effects.has("trau-theo");
  return (
    <DioramaMap
      chapterId="mua-he"
      ground="#94ad7a"
      reducedMotion={reducedMotion}
    >
      {/* village road along the lane and a footpath to the plank bridge */}
      <Box position={[0, -0.02, 2.15]} size={[36, 0.04, 1.6]} color="#c6b48c" />
      <Box
        position={[4.5, -0.02, L.bridgeZ]}
        size={[19, 0.04, 1.2]}
        color="#c9b98f"
      />

      <Stream reducedMotion={reducedMotion} />
      <PlankBridge />
      {effects.has("thuyen-giay") ? (
        <PaperBoats reducedMotion={reducedMotion} />
      ) : (
        <group userData={{ noCollide: true }}>
          <PaperBoat position={[L.girl[0] + 0.15, 0, L.girl[1] + 0.55]} />
          <PaperBoat position={[L.girl[0] - 0.35, 0, L.girl[1] + 0.3]} />
        </group>
      )}

      {/* Ông's shady corner in the bamboo grove */}
      <BambooBed position={[L.bed[0], 0, L.bed[1]]} />
      <Bamboo position={[-15.6, 0, -7.4]} scale={1.35} />
      <Bamboo position={[-13.4, 0, -7.9]} scale={1.25} />
      <Bamboo position={[-11.2, 0, -8.3]} scale={1.3} />
      <Bamboo position={[-16.2, 0, -3.6]} scale={1.2} />
      <Bamboo position={[-10.0, 0, -6.4]} scale={1.0} />
      <Hammock swinging={effects.has("vong")} reducedMotion={reducedMotion} />

      {/* meadow, buffalo and haystack */}
      <GrassTufts />
      {following ? (
        <FollowBuffalo player={player} reducedMotion={reducedMotion} />
      ) : (
        <group position={BUFFALO_START}>
          <Buffalo />
        </group>
      )}
      <Pole
        position={[L.herder[0] + 0.35, 0.55, L.herder[1] + 0.1]}
        height={1.1}
        radius={0.025}
        rotation={[0, 0, -0.3]}
      />
      <Haystack position={[-15.2, 0, 4.4]} />
      <Haystack position={[-14.6, 0, 7.6]} />

      {/* fishing on the east bank */}
      <FishingSpot
        caught={effects.has("ca-can")}
        reducedMotion={reducedMotion}
      />

      {/* ice-cream cart on the road */}
      <IceCreamCart />

      {/* east fields, a neighbour's house and a kite in the sky */}
      <RicePaddy position={[12.6, 0, -5.6]} width={7} depth={5} />
      <RicePaddy position={[12.6, 0, 5.0]} width={7} depth={3.6} />
      <group position={[14.6, 0, -0.9]} scale={0.8}>
        <VillageHouse position={[0, 0, 0]} />
      </group>
      <group
        position={[L.kite[0] - 2, 1.8, L.kite[1]]}
        userData={{ noCollide: true }}
      >
        <Kite reducedMotion={reducedMotion} />
      </group>

      {/* edges of the village */}
      <Tree position={[7.6, 0, -8.6]} scale={1.2} />
      <Tree position={[-4.6, 0, -7.6]} kind="palm" scale={1.2} />
      <Tree position={[-15.4, 0, 9.2]} kind="palm" scale={1.2} />
      <Tree position={[16, 0, 9.0]} kind="palm" scale={1.1} />
      <Tree position={[-5.2, 0, 8.8]} scale={1.1} />
      <Bamboo position={[8.6, 0, 9.4]} scale={1.1} />
      <Bamboo position={[16.2, 0, -8.6]} scale={1.2} />
    </DioramaMap>
  );
}
