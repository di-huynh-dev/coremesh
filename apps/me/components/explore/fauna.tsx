"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { Buffalo } from "@/components/story/world-3d";
import type { AnimalSpec } from "@/lib/explore/types";
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import { Group } from "three";
import type { VillagerMotion } from "./villager";

function Blob({
  position,
  scale,
  color,
  rotation,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow>
      <sphereGeometry args={[1, 14, 10]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function Stick({
  position,
  length,
  radius = 0.035,
  color,
}: {
  position: [number, number, number];
  length: number;
  radius?: number;
  color: string;
}) {
  return (
    <mesh
      position={[position[0], position[1] - length / 2, position[2]]}
      castShadow
    >
      <cylinderGeometry args={[radius, radius * 0.85, length, 8]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

/** Shared walk cycle state for four-legged animals. */
function useQuadruped(
  motion: RefObject<VillagerMotion> | undefined,
  legs: RefObject<(Group | null)[]>,
  rate: number,
  reducedMotion?: boolean,
) {
  const phase = useRef(Math.random() * 6);
  return useFrame((_, delta) => {
    const speed = reducedMotion ? 0 : (motion?.current?.speed ?? 0);
    phase.current +=
      Math.min(delta, 0.1) *
      rate *
      Math.min(1, speed / 0.3 + 0.0001) *
      (1 + speed);
    const amount = Math.min(1, speed / 1.2);
    legs.current?.forEach((leg, i) => {
      if (leg)
        leg.rotation.x =
          Math.sin(
            phase.current + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0),
          ) *
          0.6 *
          amount;
    });
  });
}

function Dog({
  color = "#c98a4b",
  motion,
  reducedMotion,
}: {
  color?: string;
  motion?: RefObject<VillagerMotion>;
  reducedMotion?: boolean;
}) {
  const legs = useRef<(Group | null)[]>([]);
  const tail = useRef<Group>(null);
  const head = useRef<Group>(null);
  useQuadruped(motion, legs, 9, reducedMotion);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    if (tail.current) tail.current.rotation.z = Math.sin(t * 12) * 0.5;
    if (head.current && (motion?.current?.speed ?? 0) < 0.1)
      head.current.rotation.y = Math.sin(t * 0.8) * 0.4;
  });
  return (
    <group scale={0.9}>
      <Blob position={[0, 0.55, 0]} scale={[0.22, 0.2, 0.42]} color={color} />
      <group ref={head} position={[0, 0.75, 0.42]}>
        <Blob position={[0, 0, 0]} scale={[0.17, 0.16, 0.18]} color={color} />
        <Blob
          position={[0, -0.04, 0.16]}
          scale={[0.08, 0.07, 0.1]}
          color="#e9d2b0"
        />
        <Blob
          position={[0, -0.01, 0.26]}
          scale={[0.03, 0.025, 0.02]}
          color="#1a1410"
        />
        {[-0.08, 0.08].map((x) => (
          <Blob
            key={x}
            position={[x, 0.04, 0.14]}
            scale={[0.022, 0.022, 0.01]}
            color="#1a1410"
          />
        ))}
        {[-0.11, 0.11].map((x) => (
          <Blob
            key={`e${x}`}
            position={[x, 0.12, -0.02]}
            scale={[0.05, 0.1, 0.03]}
            rotation={[0, 0, x > 0 ? -0.4 : 0.4]}
            color="#8a5a2b"
          />
        ))}
      </group>
      <group ref={tail} position={[0, 0.66, -0.4]} rotation={[0.9, 0, 0]}>
        <Stick
          position={[0, 0.22, 0]}
          length={0.24}
          radius={0.03}
          color={color}
        />
      </group>
      {[
        [-0.12, 0.25],
        [0.12, 0.25],
        [-0.12, -0.25],
        [0.12, -0.25],
      ].map(([x, z], i) => (
        <group
          key={i}
          ref={(g) => {
            legs.current[i] = g;
          }}
          position={[x, 0.42, z]}
        >
          <Stick
            position={[0, 0, 0]}
            length={0.42}
            radius={0.045}
            color={color}
          />
        </group>
      ))}
    </group>
  );
}

function Cat({
  color = "#e0a35a",
  motion,
  reducedMotion,
}: {
  color?: string;
  motion?: RefObject<VillagerMotion>;
  reducedMotion?: boolean;
}) {
  const legs = useRef<(Group | null)[]>([]);
  const tail = useRef<Group>(null);
  useQuadruped(motion, legs, 8, reducedMotion);
  useFrame(({ clock }) => {
    if (tail.current && !reducedMotion)
      tail.current.rotation.x = 0.6 + Math.sin(clock.elapsedTime * 1.5) * 0.25;
  });
  return (
    <group scale={0.7}>
      <Blob position={[0, 0.42, 0]} scale={[0.16, 0.15, 0.32]} color={color} />
      <group position={[0, 0.6, 0.32]}>
        <Blob position={[0, 0, 0]} scale={[0.14, 0.13, 0.13]} color={color} />
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.14, 0]} castShadow>
            <coneGeometry args={[0.05, 0.1, 4]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
        {[-0.05, 0.05].map((x) => (
          <Blob
            key={`e${x}`}
            position={[x, 0.02, 0.12]}
            scale={[0.02, 0.025, 0.01]}
            color="#2b3a1a"
          />
        ))}
      </group>
      <group ref={tail} position={[0, 0.5, -0.3]}>
        <Stick
          position={[0, 0.35, 0]}
          length={0.35}
          radius={0.025}
          color={color}
        />
      </group>
      {[
        [-0.08, 0.2],
        [0.08, 0.2],
        [-0.08, -0.2],
        [0.08, -0.2],
      ].map(([x, z], i) => (
        <group
          key={i}
          ref={(g) => {
            legs.current[i] = g;
          }}
          position={[x, 0.3, z]}
        >
          <Stick
            position={[0, 0, 0]}
            length={0.3}
            radius={0.035}
            color={color}
          />
        </group>
      ))}
    </group>
  );
}

function Duck({
  motion,
  reducedMotion,
}: {
  motion?: RefObject<VillagerMotion>;
  reducedMotion?: boolean;
}) {
  const body = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!body.current || reducedMotion) return;
    const speed = motion?.current?.speed ?? 0;
    body.current.rotation.z =
      Math.sin(clock.elapsedTime * 10) * 0.12 * Math.min(1, speed);
  });
  return (
    <group ref={body} scale={0.8}>
      <Blob
        position={[0, 0.25, 0]}
        scale={[0.15, 0.13, 0.22]}
        color="#f4f1e8"
      />
      <Blob
        position={[0, 0.42, 0.16]}
        scale={[0.09, 0.09, 0.09]}
        color="#f4f1e8"
      />
      <Blob
        position={[0, 0.4, 0.27]}
        scale={[0.05, 0.02, 0.06]}
        color="#f2a62a"
      />
      <Blob
        position={[0, 0.3, -0.2]}
        scale={[0.06, 0.04, 0.06]}
        color="#ece7da"
      />
      {[-0.06, 0.06].map((x) => (
        <Blob
          key={x}
          position={[x, 0.04, 0.02]}
          scale={[0.05, 0.02, 0.07]}
          color="#f2a62a"
        />
      ))}
    </group>
  );
}

function Hen({
  motion,
  reducedMotion,
  color = "#a8643a",
}: {
  motion?: RefObject<VillagerMotion>;
  reducedMotion?: boolean;
  color?: string;
}) {
  const head = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!head.current || reducedMotion) return;
    const still = (motion?.current?.speed ?? 0) < 0.1;
    head.current.rotation.x = still
      ? Math.max(0, Math.sin(clock.elapsedTime * 3)) * 0.9
      : Math.sin(clock.elapsedTime * 12) * 0.15;
  });
  return (
    <group>
      <Blob position={[0, 0.22, 0]} scale={[0.13, 0.15, 0.18]} color={color} />
      <Blob
        position={[0, 0.3, -0.15]}
        scale={[0.08, 0.1, 0.06]}
        color="#6b3a1e"
      />
      <group ref={head} position={[0, 0.33, 0.14]}>
        <Blob
          position={[0, 0.05, 0.04]}
          scale={[0.07, 0.07, 0.07]}
          color="#f3efe6"
        />
        <Blob
          position={[0, 0.13, 0.04]}
          scale={[0.015, 0.03, 0.03]}
          color="#d6342b"
        />
        <mesh position={[0, 0.05, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.02, 0.05, 6]} />
          <meshStandardMaterial color="#f2a62a" />
        </mesh>
      </group>
      <Stick
        position={[0.04, 0.1, 0]}
        length={0.1}
        radius={0.01}
        color="#f2a62a"
      />
      <Stick
        position={[-0.04, 0.1, 0]}
        length={0.1}
        radius={0.01}
        color="#f2a62a"
      />
    </group>
  );
}

/** A small bird hopping on the ground, flying up and circling while it "moves". */
function GroundBird({
  motion,
  reducedMotion,
}: {
  motion?: RefObject<VillagerMotion>;
  reducedMotion?: boolean;
}) {
  const body = useRef<Group>(null);
  const wings = useRef<(Group | null)[]>([]);
  useFrame(({ clock }) => {
    if (!body.current || reducedMotion) return;
    const t = clock.elapsedTime;
    const flying = (motion?.current?.speed ?? 0) > 0.3;
    body.current.position.y +=
      ((flying ? 1.6 : 0) - body.current.position.y) * 0.06;
    const flap = flying ? Math.sin(t * 22) * 0.9 : 0;
    wings.current.forEach((w, i) => {
      if (w) w.rotation.z = i ? -flap : flap;
    });
  });
  return (
    <group ref={body}>
      <Blob position={[0, 0.1, 0]} scale={[0.06, 0.06, 0.1]} color="#6b5a46" />
      <Blob
        position={[0, 0.15, 0.08]}
        scale={[0.045, 0.045, 0.045]}
        color="#6b5a46"
      />
      {[-1, 1].map((s, i) => (
        <group
          key={s}
          ref={(g) => {
            wings.current[i] = g;
          }}
          position={[s * 0.05, 0.12, 0]}
        >
          <Blob
            position={[s * 0.07, 0, 0]}
            scale={[0.08, 0.012, 0.05]}
            color="#4f4232"
          />
        </group>
      ))}
    </group>
  );
}

export function Animal({
  kind,
  color,
  motion,
  reducedMotion,
}: {
  kind: AnimalSpec["kind"];
  color?: string;
  motion?: RefObject<VillagerMotion>;
  reducedMotion?: boolean;
}) {
  switch (kind) {
    case "dog":
      return (
        <Dog color={color} motion={motion} reducedMotion={reducedMotion} />
      );
    case "cat":
      return (
        <Cat color={color} motion={motion} reducedMotion={reducedMotion} />
      );
    case "duck":
      return <Duck motion={motion} reducedMotion={reducedMotion} />;
    case "chicken":
      return (
        <Hen color={color} motion={motion} reducedMotion={reducedMotion} />
      );
    case "bird":
      return <GroundBird motion={motion} reducedMotion={reducedMotion} />;
    case "buffalo":
      return (
        <group rotation={[0, -Math.PI / 2, 0]}>
          <Buffalo />
        </group>
      );
    default:
      return null;
  }
}

/** Collision radius for each animal kind. */
export const ANIMAL_RADIUS: Record<AnimalSpec["kind"], number> = {
  dog: 0.35,
  cat: 0.25,
  duck: 0.2,
  chicken: 0.2,
  bird: 0,
  buffalo: 0.85,
};
