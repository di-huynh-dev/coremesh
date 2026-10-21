"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  Lantern,
  StarLantern,
  Table,
} from "@/components/story/world-childhood";
import {
  Bamboo,
  Box,
  C,
  Orb,
  Pole,
  Segment,
  Tree,
  VillageHouse,
  type Vec3,
} from "@/components/story/world-3d";
import { TRUNG_THU_LAYOUT as L } from "@/lib/explore/trung-thu";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";
import { Hedge } from "./tet-map";

const WARM = "#ffb070";
const RED = "#d6342b";
const GOLD = "#f2b632";

function useStarShape() {
  return useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? 0.42 : 1;
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.closePath();
    return s;
  }, []);
}

/* ---------- lantern street ---------- */

function LanternRow({
  posts,
  lit,
  reducedMotion,
}: {
  posts: number[];
  lit: boolean;
  reducedMotion?: boolean;
}) {
  const z = L.postsZ;
  return (
    <group>
      {posts.map((x) => (
        <Pole key={x} position={[x, 1.35, z]} height={2.7} radius={0.06} />
      ))}
      {posts.slice(1).map((x, i) => {
        const from = posts[i];
        const mid = (from + x) / 2;
        return (
          <group key={x}>
            <Segment
              from={[from, 2.62, z]}
              to={[mid, 2.42, z]}
              radius={0.01}
              color="#3b2a1a"
            />
            <Segment
              from={[mid, 2.42, z]}
              to={[x, 2.62, z]}
              radius={0.01}
              color="#3b2a1a"
            />
            {[-0.32, 0, 0.32].map((f, k) => (
              <Lantern
                key={f}
                position={[mid + f * (x - from), 2.46 + Math.abs(f) * 0.22, z]}
                scale={0.62}
                color={(i + k) % 2 ? GOLD : RED}
                glow={lit ? 1.15 : 0.06}
                reducedMotion={reducedMotion}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
}

function Ladder({ position }: { position: Vec3 }) {
  return (
    <group position={position} rotation={[-0.26, 0, 0]}>
      {[-0.2, 0.2].map((x) => (
        <Pole
          key={x}
          position={[x, 1.1, 0]}
          height={2.2}
          radius={0.035}
          color={C.bamboo}
        />
      ))}
      {[0.3, 0.7, 1.1, 1.5, 1.9].map((y) => (
        <Segment
          key={y}
          from={[-0.2, y, 0]}
          to={[0.2, y, 0]}
          radius={0.02}
          color={C.bamboo}
        />
      ))}
    </group>
  );
}

/* ---------- Ông under the banyan ---------- */

function MoonTale() {
  // Cuội under his banyan, drawn as a soft shadow on the face of the moon.
  const [mx, my, mz] = L.moon;
  const ink = (
    <meshBasicMaterial
      color="#c9ae6a"
      toneMapped={false}
      side={THREE.DoubleSide}
    />
  );
  return (
    <group
      position={[mx, my, mz + 1.07]}
      rotation={[-0.2, 0, 0]}
      userData={{ noCollide: true }}
    >
      {(
        [
          [0.22, 0.24, 0.27],
          [0.0, 0.3, 0.19],
          [0.45, 0.1, 0.18],
          [0.32, 0.4, 0.15],
        ] as const
      ).map(([x, y, r]) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0]}>
          <circleGeometry args={[r, 18]} />
          {ink}
        </mesh>
      ))}
      <mesh position={[0.22, -0.12, 0]}>
        <planeGeometry args={[0.09, 0.5]} />
        {ink}
      </mesh>
      {[-0.08, 0.08].map((dx) => (
        <mesh
          key={dx}
          position={[0.22 + dx, -0.3, 0]}
          rotation={[0, 0, dx * 4]}
        >
          <planeGeometry args={[0.03, 0.22]} />
          {ink}
        </mesh>
      ))}
      {/* chú Cuội ngồi gốc cây */}
      <mesh position={[-0.12, -0.12, 0]}>
        <circleGeometry args={[0.06, 12]} />
        {ink}
      </mesh>
      <mesh position={[-0.12, -0.27, 0]}>
        <planeGeometry args={[0.11, 0.2]} />
        {ink}
      </mesh>
    </group>
  );
}

function GrandpaCorner() {
  const [gx, gz] = L.grandpa;
  return (
    <group>
      <Tree
        position={[L.banyan[0], 0, L.banyan[1]]}
        kind="banyan"
        scale={1.5}
      />
      {/* a lantern hung on the banyan */}
      <Segment
        from={[L.banyan[0] + 1.9, 3.3, L.banyan[1] + 1.2]}
        to={[L.banyan[0] + 1.9, 2.5, L.banyan[1] + 1.2]}
        radius={0.008}
        color="#3b2a1a"
      />
      <Lantern
        position={[L.banyan[0] + 1.9, 2.5, L.banyan[1] + 1.2]}
        scale={0.7}
        glow={0.9}
      />
      <pointLight
        position={[L.banyan[0] + 1.6, 2.2, L.banyan[1] + 1.8]}
        color={WARM}
        intensity={3}
        distance={7}
      />
      {/* chiếu + khay trà */}
      <Box
        position={[gx + 0.45, 0.005, gz + 0.15]}
        size={[2.3, 0.02, 1.6]}
        color="#cdb37a"
      />
      {[-0.6, -0.2, 0.2, 0.6].map((dz) => (
        <Box
          key={dz}
          position={[gx + 0.45, 0.018, gz + 0.15 + dz]}
          size={[2.3, 0.005, 0.05]}
          color="#a8884f"
        />
      ))}
      <group position={[gx + 1.05, 0, gz - 0.05]}>
        <Box position={[0, 0.15, 0]} size={[0.7, 0.3, 0.5]} color={C.wood} />
        <Orb
          position={[0.08, 0.38, 0]}
          scale={[0.1, 0.08, 0.1]}
          color="#e7e2d6"
        />
        {[-0.2, -0.12].map((x, i) => (
          <mesh key={x} position={[x, 0.34, i ? 0.12 : -0.1]}>
            <cylinderGeometry args={[0.04, 0.03, 0.06, 10]} />
            <meshStandardMaterial color="#f1ead9" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------- mâm cỗ ---------- */

function Mooncake({ position, cut }: { position: Vec3; cut: boolean }) {
  const wedge = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.absarc(0, 0, 0.15, 0, Math.PI / 2 - 0.1, false);
    s.lineTo(0, 0);
    return s;
  }, []);
  if (!cut)
    return (
      <group position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 18]} />
          <meshStandardMaterial color="#b9763a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.05, 0.1, 14]} />
          <meshStandardMaterial color="#d89b55" />
        </mesh>
      </group>
    );
  return (
    <group position={[position[0], position[1] - 0.05, position[2]]}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh position={[0.025, 0, -0.025]} rotation={[-Math.PI / 2, 0, 0]}>
            <extrudeGeometry
              args={[
                wedge,
                { depth: 0.1, bevelEnabled: false, curveSegments: 6 },
              ]}
            />
            <meshStandardMaterial attach="material-0" color="#b9763a" />
            <meshStandardMaterial attach="material-1" color="#e9c47c" />
          </mesh>
        </group>
      ))}
      {/* trứng muối in the middle */}
      <Orb
        position={[0, 0.06, 0]}
        scale={[0.035, 0.02, 0.035]}
        color="#f2a62a"
      />
    </group>
  );
}

function PomeloDog({ position }: { position: Vec3 }) {
  return (
    <group position={position} rotation={[0, 0.6, 0]}>
      <Orb position={[0, 0.14, 0]} scale={[0.15, 0.13, 0.22]} color="#a9c45a" />
      <Orb position={[0, 0.27, 0.18]} scale={[0.1, 0.1, 0.1]} color="#b7cf68" />
      {[-0.06, 0.06].map((x) => (
        <group key={x}>
          <Orb
            position={[x, 0.36, 0.16]}
            scale={[0.03, 0.06, 0.02]}
            color="#8aa848"
          />
          <Orb
            position={[x * 0.7, 0.29, 0.27]}
            scale={[0.015, 0.015, 0.015]}
            color="#2a1d14"
          />
        </group>
      ))}
      <Segment
        from={[0, 0.18, -0.2]}
        to={[0, 0.3, -0.3]}
        radius={0.02}
        color="#8aa848"
      />
    </group>
  );
}

function Feast({ cut }: { cut: boolean }) {
  const [fx, fz] = L.feast;
  return (
    <group position={[fx, 0, fz]}>
      <Box position={[0, 0.005, 0]} size={[2.6, 0.02, 1.8]} color="#c79a5c" />
      <Box position={[0, 0.018, 0]} size={[2.3, 0.005, 1.5]} color="#a8452f" />
      {/* low table */}
      <Box position={[0, 0.44, 0]} size={[1.3, 0.07, 0.85]} color="#8a5a3a" />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Box
            key={`${sx}${sz}`}
            position={[sx * 0.56, 0.2, sz * 0.34]}
            size={[0.07, 0.4, 0.07]}
            color={C.wood}
          />
        )),
      )}
      <mesh position={[-0.15, 0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.34, 0.04, 20]} />
        <meshStandardMaterial color={C.brass} metalness={0.4} roughness={0.4} />
      </mesh>
      <Mooncake position={[-0.3, 0.57, 0.05]} cut={cut} />
      <Mooncake position={[0.02, 0.57, -0.12]} cut={cut} />
      <PomeloDog position={[0.38, 0.47, 0.12]} />
      {/* chuối, hồng */}
      {[0, 1, 2].map((i) => (
        <Orb
          key={i}
          position={[-0.45 + i * 0.12, 0.56, 0.3]}
          scale={[0.07, 0.05, 0.07]}
          color="#f28a1e"
        />
      ))}
      {/* đèn dầu */}
      <group position={[0.45, 0.47, -0.25]}>
        <mesh>
          <cylinderGeometry args={[0.07, 0.09, 0.12, 12]} />
          <meshStandardMaterial color="#cfe3d6" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <coneGeometry args={[0.025, 0.08, 8]} />
          <meshStandardMaterial
            color="#ffd27a"
            emissive="#ff9a2a"
            emissiveIntensity={2.5}
          />
        </mesh>
      </group>
      <pointLight
        position={[0.4, 1.3, 0.2]}
        color={WARM}
        intensity={3.2}
        distance={6}
      />
      {cut
        ? [-0.3, 0.1].map((x) => (
            <Orb
              key={x}
              position={[x, 0.5, 0.36]}
              scale={[0.08, 0.012, 0.08]}
              color="#f1ead9"
            />
          ))
        : null}
    </group>
  );
}

/* ---------- lion dance ---------- */

function Lion({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion?: boolean;
}) {
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!head.current || !body.current) return;
    if (!active || reducedMotion) {
      head.current.position.y = active ? 1.15 : 0.8;
      head.current.rotation.set(active ? 0 : 0.3, 0, 0);
      body.current.position.y = 0;
      return;
    }
    const t = clock.elapsedTime;
    const hop = Math.abs(Math.sin(t * 4.2));
    head.current.position.y = 1.1 + hop * 0.45;
    head.current.rotation.set(
      -0.15 + Math.sin(t * 4.2) * 0.14,
      Math.sin(t * 1.3) * 0.35,
      Math.sin(t * 2.1) * 0.3,
    );
    body.current.position.y = Math.abs(Math.sin(t * 4.2 - 0.9)) * 0.16;
  });
  return (
    <group position={[L.lion[0], 0, L.lion[1]]} rotation={[0, 0.65, 0]}>
      {/* the two dancers' legs */}
      {[0.45, -1.25].flatMap((z) =>
        [-0.22, 0.22].map((x) => (
          <group key={`${x}${z}`}>
            <Pole
              position={[x, 0.42, z]}
              height={0.84}
              radius={0.09}
              color={GOLD}
            />
            <Orb
              position={[x, 0.05, z + 0.06]}
              scale={[0.09, 0.05, 0.14]}
              color="#2a1d14"
            />
          </group>
        )),
      )}
      <group ref={body}>
        <Box position={[0, 1.05, -0.45]} size={[0.92, 0.5, 1.9]} color={RED} />
        <Box
          position={[0, 1.31, -0.45]}
          size={[0.6, 0.06, 1.85]}
          color={GOLD}
        />
        {[-0.05, -0.45, -0.85, -1.25].map((z, i) => (
          <Orb
            key={z}
            position={[0, 1.36, z]}
            scale={[0.13, 0.11, 0.13]}
            color={i % 2 ? "#f6f1e4" : GOLD}
          />
        ))}
        <Orb
          position={[0, 1.15, -1.48]}
          scale={[0.22, 0.2, 0.2]}
          color={GOLD}
        />
      </group>
      <group ref={head} position={[0, 0.8, 0.55]}>
        <Orb scale={[0.5, 0.45, 0.45]} color={RED} />
        <Orb
          position={[0, -0.14, 0.3]}
          scale={[0.36, 0.2, 0.22]}
          color={GOLD}
        />
        <Orb
          position={[0, -0.2, 0.36]}
          scale={[0.24, 0.07, 0.12]}
          color="#5a1a14"
        />
        {[-0.18, 0.18].map((x) => (
          <group key={x} position={[x, 0.12, 0.38]}>
            <Orb scale={[0.09, 0.09, 0.06]} color="#ffffff" />
            <Orb
              position={[0, 0, 0.05]}
              scale={[0.045, 0.045, 0.03]}
              color="#1a1a1a"
            />
          </group>
        ))}
        <Orb
          position={[0, 0.42, 0.05]}
          scale={[0.09, 0.16, 0.09]}
          color={GOLD}
        />
        {Array.from({ length: 7 }, (_, i) => (
          <Orb
            key={i}
            position={[
              Math.cos(i * 0.52) * 0.5,
              Math.sin(i * 0.52) * 0.4 - 0.05,
              -0.18,
            ]}
            scale={[0.12, 0.12, 0.12]}
            color={i % 2 ? "#f6f1e4" : GOLD}
          />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <Orb
            key={`m${i}`}
            position={[
              -Math.cos(i * 0.52) * 0.5,
              Math.sin(i * 0.52) * 0.4 - 0.05,
              -0.18,
            ]}
            scale={[0.12, 0.12, 0.12]}
            color={i % 2 ? GOLD : "#f6f1e4"}
          />
        ))}
      </group>
    </group>
  );
}

function Drum({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion?: boolean;
}) {
  const sticks = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    sticks.current.forEach((s, i) => {
      if (!s) return;
      s.rotation.x =
        active && !reducedMotion
          ? -0.5 + Math.abs(Math.sin(clock.elapsedTime * 8.4 + i * 1.6)) * 0.9
          : -0.2;
    });
  });
  return (
    <group position={[L.drum[0], 0, L.drum[1]]}>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Box
            key={`${sx}${sz}`}
            position={[sx * 0.36, 0.25, sz * 0.36]}
            size={[0.07, 0.5, 0.07]}
            color={C.wood}
          />
        )),
      )}
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.47, 0.47, 0.56, 22]} />
        <meshStandardMaterial color="#b3261e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.07, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.03, 22]} />
        <meshStandardMaterial color="#e7d3a8" />
      </mesh>
      {[0.52, 1.04].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.47, 0.025, 6, 24]} />
          <meshStandardMaterial color={GOLD} metalness={0.4} />
        </mesh>
      ))}
      {[-0.14, 0.14].map((x, i) => (
        <group
          key={x}
          position={[x - 0.2, 1.2, 0.05]}
          ref={(g) => {
            if (g) sticks.current[i] = g;
          }}
        >
          <Segment
            from={[0, 0, 0.35]}
            to={[0.12, -0.05, -0.1]}
            radius={0.018}
            color="#e9dcc0"
          />
        </group>
      ))}
      {/* cymbals on a stool */}
      <group position={[0.85, 0, 0.5]}>
        <Box
          position={[0, 0.22, 0]}
          size={[0.4, 0.44, 0.4]}
          color={C.woodLight}
        />
        <mesh position={[0, 0.47, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.02, 18]} />
          <meshStandardMaterial
            color={C.brass}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>
      <Pole position={[0.7, 1.3, -0.85]} height={2.6} radius={0.04} />
      <Segment
        from={[0.7, 2.55, -0.85]}
        to={[0.7, 2.55, -0.45]}
        radius={0.02}
        color={C.wood}
      />
      <Lantern
        position={[0.7, 2.55, -0.45]}
        scale={0.7}
        glow={0.9}
        reducedMotion={reducedMotion}
      />
      <pointLight
        position={[-1.6, 2.3, 1.0]}
        color={WARM}
        intensity={active ? 6.5 : 3}
        distance={8}
      />
    </group>
  );
}

/* ---------- kids' lantern procession ---------- */

const PARADE = [
  { shirt: "#2e6f8e", lamp: "star", color: "#e8382b", hair: "#1d1a18" },
  { shirt: "#e6b33a", lamp: "carp", color: "#f28a1e", hair: "#1d1a18" },
  { shirt: "#5b8a4a", lamp: "star", color: GOLD, hair: "#2a1d14" },
  { shirt: "#c0392b", lamp: "round", color: RED, hair: "#1d1a18" },
  { shirt: "#8e44ad", lamp: "star", color: "#e8382b", hair: "#1d1a18" },
  { shirt: "#f3ead8", lamp: "carp", color: "#f2a62a", hair: "#2a1d14" },
] as const;

function Parade({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const star = useStarShape();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reducedMotion ? 0 : clock.elapsedTime;
    ref.current.children.forEach((kid, i) => {
      const x = ((i * 1.5 + t * 0.85 + 8) % 32) - 16;
      kid.position.set(x, Math.abs(Math.sin(t * 5 + i)) * 0.05, 2.95);
    });
  });
  return (
    <group ref={ref} userData={{ noCollide: true }}>
      {PARADE.map((kid, i) => (
        <group key={i} rotation={[0, Math.PI / 2, 0]}>
          {[-0.08, 0.08].map((x) => (
            <Pole
              key={x}
              position={[x, 0.25, 0]}
              height={0.5}
              radius={0.06}
              color="#2a2a2e"
            />
          ))}
          <mesh position={[0, 0.72, 0]} castShadow>
            <coneGeometry args={[0.22, 0.55, 12]} />
            <meshStandardMaterial color={kid.shirt} />
          </mesh>
          <Orb
            position={[0, 1.12, 0]}
            scale={[0.2, 0.21, 0.19]}
            color="#e9bf96"
          />
          <Orb
            position={[0, 1.18, -0.03]}
            scale={[0.21, 0.17, 0.2]}
            color={kid.hair}
          />
          <Segment
            from={[0.18, 0.75, 0.1]}
            to={[0.28, 1.55, 0.42]}
            radius={0.018}
            color="#8a6a3a"
          />
          <group position={[0.28, 1.35, 0.45]}>
            {kid.lamp === "star" ? (
              <mesh scale={0.2} position={[0, 0, -0.04]}>
                <extrudeGeometry
                  args={[star, { depth: 0.35, bevelEnabled: false }]}
                />
                <meshStandardMaterial
                  color={kid.color}
                  emissive={kid.color}
                  emissiveIntensity={1}
                />
              </mesh>
            ) : kid.lamp === "carp" ? (
              <group rotation={[0, Math.PI / 2, 0]}>
                <mesh scale={[0.22, 0.12, 0.1]}>
                  <sphereGeometry args={[1, 12, 8]} />
                  <meshStandardMaterial
                    color={kid.color}
                    emissive={kid.color}
                    emissiveIntensity={1}
                  />
                </mesh>
                <mesh position={[-0.27, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <coneGeometry args={[0.1, 0.14, 6]} />
                  <meshStandardMaterial
                    color={GOLD}
                    emissive={GOLD}
                    emissiveIntensity={0.8}
                  />
                </mesh>
              </group>
            ) : (
              <mesh scale={[0.13, 0.16, 0.13]}>
                <sphereGeometry args={[1, 12, 8]} />
                <meshStandardMaterial
                  color={kid.color}
                  emissive={kid.color}
                  emissiveIntensity={1}
                />
              </mesh>
            )}
          </group>
        </group>
      ))}
    </group>
  );
}

/* ---------- lantern stall ---------- */

function SpinningLantern({
  position,
  reducedMotion,
}: {
  position: Vec3;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) ref.current.rotation.y += delta * 0.9;
  });
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.34, 6, 1, true]} />
        <meshStandardMaterial
          color="#ffe1a0"
          emissive="#ffb347"
          emissiveIntensity={0.9}
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
        />
      </mesh>
      {[-0.18, 0.18].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 6]} />
          <meshStandardMaterial color={RED} />
        </mesh>
      ))}
      <group ref={ref}>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i * Math.PI * 2) / 5;
          return (
            <mesh
              key={i}
              position={[Math.sin(a) * 0.14, -0.02, Math.cos(a) * 0.14]}
              rotation={[0, a, 0]}
            >
              <boxGeometry args={[0.05, 0.14, 0.01]} />
              <meshStandardMaterial color="#3a2416" />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function LanternStall({ reducedMotion }: { reducedMotion?: boolean }) {
  const star = useStarShape();
  return (
    <group position={[L.stall[0], 0, L.stall[1]]}>
      <Table position={[0, 0, 0]} width={1.9} depth={0.75} color="#8a5a3a" />
      {[-1.05, 1.05].map((x) => (
        <Pole key={x} position={[x, 1.15, -0.3]} height={2.3} radius={0.04} />
      ))}
      <Segment
        from={[-1.05, 2.25, -0.3]}
        to={[1.05, 2.25, -0.3]}
        radius={0.03}
        color={C.wood}
      />
      <Lantern
        position={[-0.65, 2.22, -0.3]}
        scale={0.6}
        glow={0.9}
        reducedMotion={reducedMotion}
      />
      <Lantern
        position={[0.65, 2.22, -0.3]}
        scale={0.6}
        color={GOLD}
        glow={0.9}
        reducedMotion={reducedMotion}
      />
      {[-0.1, 0.25].map((x, i) => (
        <group key={x} position={[x, 1.85, -0.3]}>
          <Segment
            from={[0, 0.4, 0]}
            to={[0, 0.2, 0]}
            radius={0.006}
            color="#3b2a1a"
          />
          <mesh scale={0.17} position={[0, 0, -0.03]}>
            <extrudeGeometry
              args={[star, { depth: 0.3, bevelEnabled: false }]}
            />
            <meshStandardMaterial
              color={i ? GOLD : "#e8382b"}
              emissive={i ? GOLD : "#e8382b"}
              emissiveIntensity={0.9}
            />
          </mesh>
        </group>
      ))}
      <SpinningLantern
        position={[0.45, 0.95, 0.05]}
        reducedMotion={reducedMotion}
      />
      {/* carp lanterns lying on the table */}
      {[-0.55, -0.15].map((x) => (
        <group key={x} position={[x, 0.86, 0.1]} rotation={[0, 0.3, 0]}>
          <Orb scale={[0.18, 0.1, 0.08]} color="#f28a1e" />
          <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.08, 0.12, 6]} />
            <meshStandardMaterial color={GOLD} />
          </mesh>
        </group>
      ))}
      <pointLight
        position={[0, 1.9, 0.9]}
        color={WARM}
        intensity={3.2}
        distance={6}
      />
    </group>
  );
}

/* ---------- pond with the moon in it ---------- */

function MoonPond({ reducedMotion }: { reducedMotion?: boolean }) {
  const moon = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!moon.current || reducedMotion) return;
    const t = clock.elapsedTime;
    moon.current.scale.set(1 + Math.sin(t * 1.7) * 0.06, 1, 1);
  });
  return (
    <group position={[L.pond[0], 0, L.pond[1]]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <circleGeometry args={[1.75, 32]} />
        <meshStandardMaterial color="#2c4466" roughness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]}>
        <ringGeometry args={[1.7, 1.98, 32]} />
        <meshStandardMaterial color="#6f6650" />
      </mesh>
      <mesh
        ref={moon}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-0.25, -0.005, -0.35]}
      >
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial
          color="#fff0c2"
          toneMapped={false}
          transparent
          opacity={0.85}
        />
      </mesh>
      {[
        [0.9, 0.6],
        [0.7, -0.9],
        [-1.0, 0.7],
      ].map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, i]} position={[x, 0.0, z]}>
          <circleGeometry args={[0.28, 12, 0, Math.PI * 1.8]} />
          <meshStandardMaterial color="#3f6b35" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Fireflies({
  center,
  reducedMotion,
}: {
  center: Vec3;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    const t = clock.elapsedTime;
    ref.current.children.forEach((fly, i) => {
      fly.position.set(
        Math.sin(t * 0.4 + i * 1.9) * (1.2 + (i % 3) * 0.5),
        0.7 + Math.sin(t * 0.9 + i) * 0.35 + (i % 4) * 0.25,
        Math.cos(t * 0.33 + i * 2.3) * (1.1 + (i % 2) * 0.6),
      );
    });
  });
  return (
    <group ref={ref} position={center} userData={{ noCollide: true }}>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 1.9) * 1.4,
            0.8 + (i % 4) * 0.25,
            Math.cos(i * 2.3) * 1.2,
          ]}
        >
          <sphereGeometry args={[0.035, 6, 4]} />
          <meshBasicMaterial color="#f4f19a" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- whole map ---------- */

export function TrungThuMap({ effects, reducedMotion }: MapSceneProps) {
  const lit = effects.has("lanterns");
  const lion = effects.has("lan");
  return (
    <DioramaMap
      chapterId="trung-thu"
      ground="#7d8c5a"
      reducedMotion={reducedMotion}
    >
      {/* village road + side paths */}
      <Box position={[0, -0.02, 2.15]} size={[36, 0.04, 1.6]} color="#b8a882" />
      <Box
        position={[-9.2, -0.02, -0.9]}
        size={[1.2, 0.04, 4.6]}
        color="#b8a882"
      />
      <Box
        position={[11, -0.02, -0.4]}
        size={[1.2, 0.04, 3.6]}
        color="#b8a882"
      />

      {/* lantern street */}
      <LanternRow posts={L.postsWest} lit={lit} reducedMotion={reducedMotion} />
      <LanternRow posts={L.postsEast} lit={lit} reducedMotion={reducedMotion} />
      <pointLight
        position={[-11.2, 2.2, 3.0]}
        color={WARM}
        intensity={lit ? 7 : 0}
        distance={9}
      />
      <pointLight
        position={[11.2, 2.2, 3.0]}
        color={WARM}
        intensity={lit ? 7 : 0}
        distance={9}
      />
      <Ladder position={[L.ladder[0], 0, L.ladder[1]]} />
      {/* a basket of lanterns still waiting to be hung */}
      {lit ? null : (
        <group position={[L.dad[0] + 0.9, 0, L.dad[1] + 0.2]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.24, 0.4, 14]} />
            <meshStandardMaterial color="#b8925a" roughness={0.95} />
          </mesh>
          {[RED, GOLD, RED].map((c, i) => (
            <Orb
              key={i}
              position={[-0.12 + i * 0.12, 0.45, (i % 2) * 0.08]}
              scale={[0.12, 0.13, 0.12]}
              color={c}
            />
          ))}
        </group>
      )}

      {/* Ông, the banyan and the tale of chú Cuội */}
      <GrandpaCorner />
      {effects.has("cuoi") ? <MoonTale /> : null}
      <Fireflies
        center={[L.banyan[0] + 1.5, 0, L.banyan[1] + 1.5]}
        reducedMotion={reducedMotion}
      />

      {/* mâm cỗ */}
      <Feast cut={effects.has("pha-co")} />

      {/* the kid with her star lantern */}
      <StarLantern
        position={[L.kid[0] + 0.3, 0, L.kid[1] + 0.1]}
        reducedMotion={reducedMotion}
      />
      {effects.has("parade") ? <Parade reducedMotion={reducedMotion} /> : null}

      {/* lion dance troupe */}
      <Lion active={lion} reducedMotion={reducedMotion} />
      <Drum active={lion} reducedMotion={reducedMotion} />

      <LanternStall reducedMotion={reducedMotion} />
      <MoonPond reducedMotion={reducedMotion} />
      <Fireflies
        center={[L.pond[0] + 0.5, 0, L.pond[1] - 0.2]}
        reducedMotion={reducedMotion}
      />

      {/* neighbours with porch lanterns */}
      {L.houses.map(([x, z]) => (
        <group key={x} position={[x, 0, z]} scale={0.9}>
          <VillageHouse position={[0, 0, 0]} />
          {[-1.2, 1.2].map((dx, i) => (
            <Lantern
              key={dx}
              position={[dx, 2.0, 1.35]}
              scale={0.7}
              color={i ? GOLD : RED}
              glow={lit ? 1 : 0.35}
              reducedMotion={reducedMotion}
            />
          ))}
        </group>
      ))}

      {/* edges of the village */}
      <Bamboo position={[-16, 0, -1.5]} scale={1.3} />
      <Bamboo position={[16, 0, -0.5]} scale={1.2} />
      <Bamboo position={[14.6, 0, -7.8]} scale={1.1} />
      <Tree position={[-15.6, 0, 8.6]} kind="palm" scale={1.2} />
      <Tree position={[15.8, 0, 9.2]} kind="palm" scale={1.1} />
      <Tree position={[-2.4, 0, -8.2]} scale={1.1} />
      <Tree position={[4.4, 0, -8.0]} scale={1.0} />
      <Hedge from={[-17.4, -9.6]} to={[17.4, -9.6]} />
    </DioramaMap>
  );
}
