"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  environmentTheme,
  type EnvironmentTheme,
} from "@/lib/explore/presentation";
import type { ExploreMapData } from "@/lib/explore/types";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import { Color, DoubleSide, Group, InstancedMesh, Object3D } from "three";

const dummy = new Object3D();

function seeded(i: number, k: number) {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Butterflies flutter around the player, never far from where he is. */
function Butterflies({
  player,
  count = 7,
}: {
  player: RefObject<Group | null>;
  count?: number;
}) {
  const group = useRef<Group>(null);
  const colors = ["#f2b632", "#f7f1e1", "#e86a33", "#7fb3d5", "#f19cbb"];
  useFrame(({ clock }) => {
    const g = group.current;
    const p = player.current?.position;
    if (!g || !p) return;
    const t = clock.elapsedTime;
    g.children.forEach((b, i) => {
      const a = t * (0.25 + seeded(i, 1) * 0.25) + i * 2.1;
      const r = 3 + seeded(i, 2) * 5;
      b.position.set(
        p.x + Math.cos(a) * r,
        0.8 + seeded(i, 3) * 1.6 + Math.sin(t * 1.7 + i) * 0.3,
        p.z + Math.sin(a * 1.3) * r * 0.7,
      );
      b.rotation.y = -a;
      const flap = Math.sin(t * 18 + i) * 0.9;
      (b.children[0] as Object3D).rotation.z = flap;
      (b.children[1] as Object3D).rotation.z = -flap;
    });
  });
  return (
    <group ref={group} userData={{ noCollide: true }}>
      {Array.from({ length: count }, (_, i) => (
        <group key={i}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.06, 0, 0]}>
              <planeGeometry args={[0.12, 0.09]} />
              <meshStandardMaterial
                color={colors[i % colors.length]}
                side={DoubleSide}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Fireflies: instanced glowing dots drifting near the ground around the player. */
function Fireflies({
  player,
  count = 60,
}: {
  player: RefObject<Group | null>;
  count?: number;
}) {
  const mesh = useRef<InstancedMesh>(null);
  useFrame(({ clock }) => {
    const m = mesh.current;
    const p = player.current?.position;
    if (!m || !p) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const a = t * 0.15 * (0.5 + seeded(i, 1)) + i;
      const r = 2 + seeded(i, 2) * 10;
      dummy.position.set(
        p.x + Math.cos(a) * r + Math.sin(t * 0.7 + i) * 0.4,
        0.4 + seeded(i, 3) * 2 + Math.sin(t * 1.3 + i * 3) * 0.25,
        p.z + Math.sin(a * 0.9) * r * 0.8,
      );
      const pulse = 0.5 + 0.5 * Math.sin(t * (2 + seeded(i, 4) * 2) + i);
      dummy.scale.setScalar(0.03 + pulse * 0.035);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      userData={{ noCollide: true }}
    >
      <sphereGeometry args={[1, 6, 4]} />
      <meshBasicMaterial color="#f8ef8a" toneMapped={false} />
    </instancedMesh>
  );
}

/** Leaves or petals drifting down and sideways in the wind. */
function Drift({
  player,
  color,
  count = 36,
}: {
  player: RefObject<Group | null>;
  color: string;
  count?: number;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const tint = useMemo(() => new Color(color), [color]);
  useFrame(({ clock }) => {
    const m = mesh.current;
    const p = player.current?.position;
    if (!m || !p) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const life = (t * (0.06 + seeded(i, 1) * 0.05) + seeded(i, 2)) % 1;
      dummy.position.set(
        p.x - 9 + seeded(i, 3) * 18 + life * 4,
        6 - life * 6,
        p.z - 8 + seeded(i, 4) * 14 + Math.sin(t + i) * 0.4,
      );
      dummy.rotation.set(t * 2 + i, t * 1.3 + i, 0);
      dummy.scale.setScalar(life > 0.97 ? 0 : 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      userData={{ noCollide: true }}
    >
      <planeGeometry args={[0.12, 0.08]} />
      <meshStandardMaterial color={tint} side={DoubleSide} />
    </instancedMesh>
  );
}

/** A small flock that crosses the sky every so often, wings flapping. */
function Flock({
  player,
  color = "#f5f1e6",
}: {
  player: RefObject<Group | null>;
  color?: string;
}) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    const p = player.current?.position;
    if (!g || !p) return;
    const t = clock.elapsedTime;
    const cycle = (t % 26) / 26;
    g.position.set(
      p.x - 28 + cycle * 56,
      7.5 + Math.sin(t * 0.4) * 0.6,
      p.z - 12,
    );
    g.children.forEach((bird, i) => {
      const flap = Math.sin(t * 9 + i) * 0.7;
      (bird.children[0] as Object3D).rotation.z = flap;
      (bird.children[1] as Object3D).rotation.z = -flap;
    });
  });
  return (
    <group ref={group} userData={{ noCollide: true }}>
      {Array.from({ length: 7 }, (_, i) => (
        <group
          key={i}
          position={[-Math.abs(i - 3) * 0.9, (i % 2) * 0.3, (i - 3) * 0.8]}
        >
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, 0, s * 0.18]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.12, 0.02, 0.36]} />
              <meshBasicMaterial color={color} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Soft cloud shadows sliding across the ground. */
function CloudShadows({ player }: { player: RefObject<Group | null> }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    const p = player.current?.position;
    if (!g || !p) return;
    const t = clock.elapsedTime;
    g.children.forEach((c, i) => {
      const travel = ((t * 0.6 + i * 23) % 70) - 35;
      c.position.set(p.x + travel, 0.03, p.z - 10 + i * 9);
    });
  });
  return (
    <group ref={group} userData={{ noCollide: true }}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[6 + i * 2, 4 + i, 1]}
        >
          <circleGeometry args={[1, 28]} />
          <meshBasicMaterial
            color="#1d2a1f"
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Theme- and time-aware life in the air: insects, leaves, birds, cloud shadows.
 * Shared by the explore maps and the /story journey.
 */
export function AmbienceLayer({
  theme,
  night,
  player,
  reduced,
  groundShadows = true,
}: {
  theme: EnvironmentTheme;
  night: boolean;
  player: RefObject<Group | null>;
  reduced: boolean;
  /** Cloud shadows need a continuous ground; the floating journey dioramas have none. */
  groundShadows?: boolean;
}) {
  if (reduced) return null;
  const rural = theme === "village" || theme === "festival";
  if (night) return <Fireflies player={player} count={rural ? 70 : 30} />;
  return (
    <>
      {theme !== "city" ? (
        <Butterflies player={player} count={rural ? 8 : 5} />
      ) : null}
      <Drift
        player={player}
        color={
          theme === "festival"
            ? "#f2b632"
            : theme === "school"
              ? "#d9573a"
              : "#8fa35a"
        }
        count={theme === "city" ? 14 : 30}
      />
      <Flock player={player} color={rural ? "#f5f1e6" : "#5b5f66"} />
      {groundShadows ? <CloudShadows player={player} /> : null}
    </>
  );
}

/** Ambience for an explore map, derived from its id and sky. */
export function Ambience({
  map,
  player,
  reduced,
}: {
  map: ExploreMapData;
  player: RefObject<Group | null>;
  reduced: boolean;
}) {
  const night = map.sky.sunIntensity < 1.3 || (map.sky.hemi ?? 1.2) < 0.7;
  return (
    <AmbienceLayer
      theme={environmentTheme(map.id)}
      night={night}
      player={player}
      reduced={reduced}
    />
  );
}
