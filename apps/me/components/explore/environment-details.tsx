"use client";
/* eslint-disable react/no-unknown-property -- React Three Fiber scene primitives. */

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  Group,
  InstancedMesh,
  Object3D,
  RepeatWrapping,
  Vector2,
} from "three";
import type { ExploreMapData } from "@/lib/explore/types";
import { environmentTheme } from "@/lib/explore/presentation";

/** Small deterministic grain; no external texture fetches and the GLB embeds it. */
export function useGroundTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d")!;
    const pixels = context.createImageData(128, 128);
    let seed = 171;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const value = 140 + (seed % 105);
      pixels.data.set([value, value, value, 255], i);
    }
    context.putImageData(pixels, 0, 0);
    const t = new CanvasTexture(canvas);
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(70, 52);
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

export function EarthenJar({ scale = 1 }: { scale?: number }) {
  const profile = useMemo(
    () =>
      [
        [0.2, 0],
        [0.31, 0.08],
        [0.43, 0.42],
        [0.38, 0.65],
        [0.23, 0.76],
        [0.24, 0.82],
      ].map(([x, y]) => new Vector2(x, y)),
    [],
  );
  return (
    <group scale={scale} name="Chum_sanh">
      <mesh castShadow receiveShadow>
        <latheGeometry args={[profile, 24]} />
        <meshStandardMaterial color="#83573d" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.81, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.235, 0.035, 8, 24]} />
        <meshStandardMaterial color="#b48057" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.24, 24]} />
        <meshStandardMaterial
          color="#344b4b"
          roughness={0.12}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

export function WovenBasket() {
  return (
    <group name="Thung_tre">
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.43, 0.29, 0.43, 24, 1, true]} />
        <meshStandardMaterial color="#ad8d53" roughness={0.95} side={2} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0.035 + i * 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.29 + i * 0.017, 0.016, 4, 24]} />
          <meshStandardMaterial color={i % 2 ? "#d6b77c" : "#8a6d42"} />
        </mesh>
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i * Math.PI) / 8) * 0.355,
            0.24,
            Math.cos((i * Math.PI) / 8) * 0.355,
          ]}
          rotation={[0, (i * Math.PI) / 8, -0.13]}
        >
          <boxGeometry args={[0.015, 0.42, 0.018]} />
          <meshStandardMaterial color="#d2b678" />
        </mesh>
      ))}
    </group>
  );
}

function Planter({ flower = false }: { flower?: boolean }) {
  return (
    <group name={flower ? "Chau_hoa_cuc" : "Chau_cay"}>
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.25, 0.48, 12]} />
        <meshStandardMaterial color="#ae7153" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 12]} />
        <meshStandardMaterial color="#413c2b" />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <group
          key={i}
          position={[Math.sin(i * 2.4) * 0.24, 0.5, Math.cos(i * 2.4) * 0.24]}
        >
          <mesh position={[0, 0.23, 0]} rotation={[0.15, i, 0.12]}>
            <cylinderGeometry args={[0.018, 0.025, 0.5, 5]} />
            <meshStandardMaterial color="#51653a" />
          </mesh>
          <mesh
            position={[0, 0.45, 0]}
            scale={flower ? [1, 0.65, 1] : [0.8, 1.8, 0.8]}
            castShadow
          >
            <icosahedronGeometry args={[flower ? 0.14 : 0.2, 1]} />
            <meshStandardMaterial
              color={flower ? (i % 2 ? "#e9b82e" : "#e9d469") : "#49704a"}
              roughness={0.85}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RoadLamp() {
  return (
    <group name="Den_duong">
      <mesh position={[0, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.09, 5.2, 8]} />
        <meshStandardMaterial
          color="#4e5d59"
          metalness={0.65}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0.35, 5.18, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#4e5d59" />
      </mesh>
      <mesh position={[0.7, 5.13, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.24]} />
        <meshStandardMaterial
          color="#fff0bb"
          emissive="#ffd281"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.22, 8]} />
        <meshStandardMaterial color="#78817a" />
      </mesh>
    </group>
  );
}

/** Perimeter scenery keeps authored paths and interactions clear on every map. */
export function EnvironmentDetails({
  map,
  reduced,
}: {
  map: ExploreMapData;
  reduced: boolean;
}) {
  const theme = environmentTheme(map.id);
  const rural = theme === "village" || theme === "festival";
  const grass = useRef<InstancedMesh>(null);
  const birds = useRef<Group>(null);
  const left = map.bounds.min[0] - 2;
  const right = map.bounds.max[0] + 2;
  const back = map.bounds.min[1] - 5;
  useEffect(() => {
    if (!grass.current) return;
    const dummy = new Object3D();
    for (let i = 0; i < 180; i++) {
      const side = i % 2 ? left : right;
      dummy.position.set(
        side + Math.sin(i * 6.31) * 1.3,
        0.15,
        back + (i % 45) * 0.65,
      );
      dummy.rotation.set(0, i * 2.4, Math.sin(i) * 0.25);
      dummy.scale.set(0.3 + (i % 4) * 0.07, 0.35 + (i % 5) * 0.12, 1);
      dummy.updateMatrix();
      grass.current.setMatrixAt(i, dummy.matrix);
    }
    grass.current.instanceMatrix.needsUpdate = true;
  }, [left, right, back]);
  useFrame(({ clock }) => {
    if (birds.current && !reduced) {
      birds.current.position.x = Math.sin(clock.elapsedTime * 0.035) * 8;
      birds.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.25;
    }
  });
  return (
    <group name={`Environment_${map.id}`} userData={{ noCollide: true }}>
      {rural ? (
        <>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh
              key={i}
              position={[-45 + i * 15, -2.5, back - 25 - (i % 2) * 4]}
              scale={[12, 7 + (i % 3) * 2, 7]}
            >
              <sphereGeometry args={[1, 16, 10]} />
              <meshStandardMaterial
                color={i % 2 ? "#859886" : "#9bac97"}
                roughness={1}
              />
            </mesh>
          ))}
          <instancedMesh ref={grass} args={[undefined, undefined, 180]}>
            <coneGeometry args={[0.18, 0.8, 3]} />
            <meshStandardMaterial color="#74814a" roughness={1} />
          </instancedMesh>
          {[left, right].map((x, i) => (
            <group key={x} position={[x, 0, back + 7 + i * 5]}>
              <EarthenJar />
              <group position={[0.65, 0, 0.3]}>
                <EarthenJar scale={0.7} />
              </group>
              <group position={[-0.7, 0, 0.6]}>
                <WovenBasket />
              </group>
              <group position={[0.1, 0, 1.1]}>
                <Planter flower={theme === "festival"} />
              </group>
            </group>
          ))}
          <group ref={birds} name="Canh_co_xa">
            {Array.from({ length: 5 }, (_, i) => (
              <group
                key={i}
                position={[-7 + i * 2.2, 10 + (i % 2), back - 7 + i]}
                rotation={[0, 0.2, -0.1]}
              >
                {[-1, 1].map((side) => (
                  <mesh
                    key={side}
                    position={[side * 0.22, 0, 0]}
                    rotation={[0, 0, side * 0.28]}
                  >
                    <boxGeometry args={[0.48, 0.035, 0.11]} />
                    <meshStandardMaterial color="#f0ecda" />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        </>
      ) : (
        <>
          {[left, right].map((x) => (
            <group key={x} position={[x, 0, back + 7]}>
              <RoadLamp />
              {[0, 1, 2].map((i) => (
                <group key={i} position={[0, 0, 2 + i * 2]}>
                  <Planter flower={theme === "school"} />
                </group>
              ))}
            </group>
          ))}
          {theme === "city" &&
            Array.from({ length: 9 }, (_, i) => (
              <group
                key={i}
                position={[-36 + i * 9, 0, back - 18 - (i % 2) * 4]}
              >
                <mesh position={[0, 3 + (i % 4), 0]}>
                  <boxGeometry args={[6, 6 + (i % 4) * 2, 5]} />
                  <meshStandardMaterial
                    color={i % 2 ? "#aebabb" : "#c5c4b7"}
                    roughness={0.85}
                  />
                </mesh>
                {[1, 2, 3].map((floor) => (
                  <mesh key={floor} position={[0, floor * 1.4, 2.52]}>
                    <boxGeometry args={[4.8, 0.65, 0.03]} />
                    <meshStandardMaterial
                      color="#6e888c"
                      metalness={0.3}
                      roughness={0.4}
                    />
                  </mesh>
                ))}
              </group>
            ))}
        </>
      )}
    </group>
  );
}
