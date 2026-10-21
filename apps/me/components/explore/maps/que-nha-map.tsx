"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  Bamboo,
  Bench,
  Box,
  Buffalo,
  Orb,
  Pole,
  RicePaddy,
  Segment,
  Tree,
  VillageHouse,
} from "@/components/story/world-3d";
import { Well } from "@/components/story/world-childhood";
import { QUE_NHA_LAYOUT as L } from "@/lib/explore/que-nha";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";
import { Chicken, Hedge } from "./tet-map";

function Coop({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box position={[0, 0.6, 0]} size={[2.0, 1.2, 1.4]} color="#9a7a52" />
      <Box
        position={[0, 1.3, 0]}
        size={[2.3, 0.12, 1.7]}
        color="#6b5236"
        rotation={[0, 0, 0.08]}
      />
      <Box
        position={[0.4, 0.4, 0.71]}
        size={[0.5, 0.6, 0.02]}
        color="#4a3826"
      />
    </group>
  );
}

function Grains({ center }: { center: [number, number, number] }) {
  return (
    <group position={center} userData={{ noCollide: true }}>
      {Array.from({ length: 40 }, (_, i) => (
        <Orb
          key={i}
          position={[
            Math.cos(i * 2.4) * (0.2 + (i % 7) * 0.12),
            0.02,
            Math.sin(i * 2.4) * (0.2 + (i % 7) * 0.12),
          ]}
          scale={[0.03, 0.015, 0.02]}
          color="#e9c46a"
        />
      ))}
    </group>
  );
}

function HighKite({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.position.y = 7.5 + Math.sin(clock.elapsedTime * 0.7) * 0.4;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.15;
  });
  return (
    <group userData={{ noCollide: true }}>
      <Segment
        from={[L.kidKite[0] + 0.3, 1.3, L.kidKite[1]]}
        to={[L.kidKite[0] + 3.5, 7.4, L.kidKite[1] - 5]}
        radius={0.008}
        color="#f5f1e6"
      />
      <group ref={ref} position={[L.kidKite[0] + 3.5, 7.5, L.kidKite[1] - 5]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[1.0, 1.0]} />
          <meshStandardMaterial color="#d6342b" side={THREE.DoubleSide} />
        </mesh>
        <Segment
          from={[0, -0.7, 0]}
          to={[0.2, -2.0, 0]}
          radius={0.015}
          color="#f2b632"
        />
      </group>
    </group>
  );
}

function Pond({ lotus }: { lotus: boolean }) {
  return (
    <group position={[L.pond[0], 0, L.pond[1]]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <circleGeometry args={[2.2, 32]} />
        <meshStandardMaterial color="#5f9a8f" roughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]}>
        <ringGeometry args={[2.15, 2.45, 32]} />
        <meshStandardMaterial color="#8a7a58" />
      </mesh>
      {[
        [-0.8, 0.4],
        [0.6, -0.5],
        [0.9, 0.8],
        [-0.3, -0.9],
        [-1.2, -0.2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh rotation={[-Math.PI / 2, 0, i]} position={[0, 0.01, 0]}>
            <circleGeometry args={[0.32, 14, 0, Math.PI * 1.8]} />
            <meshStandardMaterial color="#4f8a3a" side={THREE.DoubleSide} />
          </mesh>
          {lotus || i < 2 ? (
            <mesh position={[0.05, 0.22, 0.05]}>
              <coneGeometry args={[0.12, 0.26, 7]} />
              <meshStandardMaterial
                color="#f2a7b8"
                emissive="#f2a7b8"
                emissiveIntensity={0.1}
              />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
}

export function QueNhaMap({ effects, reducedMotion }: MapSceneProps) {
  return (
    <DioramaMap chapterId="que-nha" reducedMotion={reducedMotion}>
      {/* village road along the walking lane */}
      <Box position={[0, -0.02, 2.15]} size={[36, 0.04, 1.6]} color="#c6b48c" />
      <Box
        position={[-8.6, -0.02, -1.3]}
        size={[1.2, 0.04, 6.5]}
        color="#c6b48c"
      />

      {/* Ông's bench under a tree */}
      <Tree position={[-10.6, 0, -6.4]} scale={1.25} />
      <Bench position={[L.grandpaBench[0], 0, L.grandpaBench[1] + 0.35]} />
      <group position={[L.grandpaBench[0] + 0.9, 0, L.grandpaBench[1] + 0.9]}>
        <Box position={[0, 0.3, 0]} size={[0.6, 0.6, 0.6]} color="#8a6a46" />
        <Orb position={[0, 0.7, 0]} scale={[0.12, 0.1, 0.12]} color="#e7e2d6" />
      </group>

      {/* mother's chicken yard */}
      <Coop position={[L.coop[0], 0, L.coop[1]]} />
      {[
        [-10.3, 4.1],
        [-11.8, 4.6],
        [-9.6, 3.2],
        ...(effects.has("feed")
          ? [
              [-8.2, 2.8],
              [-9.2, 3.9],
              [-10.8, 3.4],
            ]
          : []),
      ].map(([x, z]) => (
        <Chicken
          key={`${x}-${z}`}
          position={[x, 0, z]}
          reducedMotion={reducedMotion}
        />
      ))}
      {effects.has("feed") ? <Grains center={[-9.4, 0.02, 3.4]} /> : null}

      {/* the kite field */}
      {effects.has("kite") ? <HighKite reducedMotion={reducedMotion} /> : null}

      {/* father's fields */}
      <RicePaddy position={[11, 0, 0.6]} width={7} depth={5} />
      <RicePaddy position={[11, 0, 7]} width={7} depth={4} />
      <group position={[L.buffalo[0], 0, L.buffalo[1]]} rotation={[0, -0.6, 0]}>
        <Buffalo />
      </group>
      <Pole
        position={[L.dad[0] + 0.6, 0.7, L.dad[1] + 0.2]}
        height={1.4}
        radius={0.035}
        rotation={[0, 0, 0.35]}
      />

      <Pond lotus={effects.has("lotus")} />
      <Well position={[L.well[0], 0, L.well[1]]} />

      {/* neighbours and the bamboo edge of the village */}
      {L.neighbors.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} scale={0.9}>
          <VillageHouse position={[0, 0, 0]} />
        </group>
      ))}
      <Bamboo position={[-15, 0, -1]} scale={1.3} />
      <Bamboo position={[15.5, 0, -4]} scale={1.2} />
      <Bamboo position={[-4, 0, -8.4]} scale={1.1} />
      <Tree position={[-14.5, 0, 7]} kind="palm" scale={1.2} />
      <Tree position={[15, 0, 8.5]} kind="palm" scale={1.1} />
      <Tree position={[4.5, 0, -8]} scale={1.1} />
      <Hedge from={[-17.4, -9.6]} to={[17.4, -9.6]} />
    </DioramaMap>
  );
}
