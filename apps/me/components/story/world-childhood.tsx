"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

/**
 * Extra childhood dioramas (Tết, Trung thu, biển, chợ, cây đa). They follow the
 * same layout contract as world-3d.tsx: island x -5.85..5.85, z -4.25..4.25,
 * and the walking lane z 1.55..2.75 is always left clear for the character.
 * Settings are illustrative memories of a Vietnamese (Bình Định) countryside.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ComponentType } from "react";
import * as THREE from "three";
import {
  Bamboo,
  Bench,
  Bicycle,
  Box,
  C,
  Inspectable,
  Orb,
  Pole,
  Pot,
  Segment,
  Sign,
  Tree,
  VillageHouse,
  type Vec3,
} from "./world-3d";

type SceneProps = {
  reducedMotion?: boolean;
  onInspect?: (name: string) => void;
};

/* ---------------- shared props ---------------- */

export function Lantern({
  position,
  color = "#d6342b",
  scale = 1,
  glow = 0.55,
  reducedMotion = false,
}: {
  position: Vec3;
  color?: string;
  scale?: number;
  glow?: number;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current && !reducedMotion)
      ref.current.rotation.z =
        Math.sin(clock.elapsedTime * 1.3 + position[0]) * 0.07;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <Segment
        from={[0, 0, 0]}
        to={[0, -0.22, 0]}
        radius={0.01}
        color="#3b2a1a"
      />
      <mesh position={[0, -0.5, 0]} scale={[1, 1.15, 1]} castShadow>
        <sphereGeometry args={[0.24, 14, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          roughness={0.6}
        />
      </mesh>
      {[-0.24, -0.78].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 10]} />
          <meshStandardMaterial
            color={C.brass}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      ))}
      <mesh position={[0, -0.92, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.22, 6]} />
        <meshStandardMaterial color={C.brass} />
      </mesh>
    </group>
  );
}

export function Table({
  position,
  width = 1.5,
  depth = 0.8,
  color = C.woodLight,
}: {
  position: Vec3;
  width?: number;
  depth?: number;
  color?: string;
}) {
  return (
    <group position={position}>
      <Box position={[0, 0.72, 0]} size={[width, 0.08, depth]} color={color} />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Box
            key={`${sx}${sz}`}
            position={[sx * (width / 2 - 0.08), 0.35, sz * (depth / 2 - 0.08)]}
            size={[0.07, 0.7, 0.07]}
            color={C.wood}
          />
        )),
      )}
    </group>
  );
}

export function Fruit({
  position,
  color,
  r = 0.11,
}: {
  position: Vec3;
  color: string;
  r?: number;
}) {
  return <Orb position={position} scale={[r, r, r]} color={color} />;
}

export function seeded(i: number, k = 1) {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------------- 1. Tết quê ---------------- */

export function MaiTree({ position }: { position: Vec3 }) {
  const blossoms = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => {
        const a = seeded(i) * Math.PI * 2;
        const r = 0.35 + seeded(i, 2) * 0.75;
        return [
          Math.cos(a) * r,
          1.35 + seeded(i, 3) * 1.15,
          Math.sin(a) * r * 0.7,
        ] as Vec3;
      }),
    [],
  );
  return (
    <group position={position}>
      <Pot scale={1.8} plant={false} />
      <Segment
        from={[0, 0.7, 0]}
        to={[0.1, 1.5, 0]}
        radius={0.07}
        color="#5b3d26"
      />
      <Segment
        from={[0.1, 1.5, 0]}
        to={[-0.55, 2.2, 0.1]}
        radius={0.045}
        color="#5b3d26"
      />
      <Segment
        from={[0.1, 1.5, 0]}
        to={[0.6, 2.35, -0.1]}
        radius={0.045}
        color="#5b3d26"
      />
      <Segment
        from={[0.05, 1.2, 0]}
        to={[0.65, 1.7, 0.2]}
        radius={0.035}
        color="#5b3d26"
      />
      {blossoms.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.075 + seeded(i, 5) * 0.04, 7, 5]} />
          <meshStandardMaterial
            color={i % 7 === 0 ? "#f3b12a" : "#f7d34a"}
            emissive="#f2b632"
            emissiveIntensity={0.12}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Smoke({
  position,
  reducedMotion = false,
}: {
  position: Vec3;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const t = reducedMotion ? i / 5 : (clock.elapsedTime * 0.28 + i / 5) % 1;
      child.position.set(Math.sin(t * 6 + i) * 0.15, t * 1.8, 0);
      child.scale.setScalar(0.12 + t * 0.3);
    });
  });
  return (
    <group ref={ref} position={position}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial
            color="#e9e4dc"
            transparent
            opacity={0.45}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Fire({
  position,
  reducedMotion = false,
}: {
  position: Vec3;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current && !reducedMotion)
      ref.current.scale.y = 1 + Math.sin(clock.elapsedTime * 13) * 0.18;
  });
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <Segment
          key={i}
          from={[Math.cos(i * 2.1) * 0.45, 0.05, Math.sin(i * 2.1) * 0.45]}
          to={[0, 0.12, 0]}
          radius={0.05}
          color="#5b3d26"
        />
      ))}
      <mesh ref={ref} position={[0, 0.22, 0]}>
        <coneGeometry args={[0.22, 0.45, 8]} />
        <meshStandardMaterial
          color="#ff8a2a"
          emissive="#ff6a00"
          emissiveIntensity={1.4}
        />
      </mesh>
      <pointLight
        position={[0, 0.5, 0]}
        color="#ff9a4a"
        intensity={2.2}
        distance={3.5}
      />
    </group>
  );
}

export function TetScene({ onInspect, reducedMotion }: SceneProps) {
  return (
    <>
      <Inspectable
        name="Câu đối đỏ"
        position={[-2.2, 0, -1.65]}
        marker={[0, 3.3, 1.5]}
        onInspect={onInspect}
      >
        <VillageHouse position={[0, 0, 0]} open />
        <Sign
          text="CHÚC MỪNG NĂM MỚI"
          position={[0, 1.78, 0.67]}
          width={2.6}
          height={0.34}
          color="#b3261e"
          ink="#f6d36b"
          fontSize={64}
        />
        <Sign
          text="AN KHANG"
          position={[-1.55, 1.15, 0.67]}
          width={0.7}
          height={0.22}
          color="#b3261e"
          ink="#f6d36b"
          fontSize={70}
        />
        <Sign
          text="THỊNH VƯỢNG"
          position={[1.55, 1.15, 0.67]}
          width={0.7}
          height={0.22}
          color="#b3261e"
          ink="#f6d36b"
          fontSize={58}
        />
      </Inspectable>
      <Lantern position={[-3.85, 2.05, -0.2]} reducedMotion={reducedMotion} />
      <Lantern position={[-0.55, 2.05, -0.2]} reducedMotion={reducedMotion} />

      <Inspectable
        name="Cây mai"
        position={[2.0, 0, -1.6]}
        marker={[0, 2.8, 0]}
        onInspect={onInspect}
      >
        <MaiTree position={[0, 0, 0]} />
      </Inspectable>

      <Inspectable
        name="Nồi bánh tét"
        position={[3.9, 0, 0.15]}
        marker={[0, 1.6, 0]}
        onInspect={onInspect}
      >
        <Fire position={[0, 0, 0]} reducedMotion={reducedMotion} />
        {[0, 1, 2].map((i) => (
          <Orb
            key={i}
            position={[
              Math.cos(i * 2.1 + 0.5) * 0.42,
              0.12,
              Math.sin(i * 2.1 + 0.5) * 0.42,
            ]}
            scale={[0.14, 0.12, 0.14]}
            color="#7d7a72"
          />
        ))}
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.36, 0.62, 16]} />
          <meshStandardMaterial
            color="#2c2c2e"
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
        <Smoke position={[0, 0.95, 0]} reducedMotion={reducedMotion} />
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[-0.95, 0.09 + i * 0.13, 0.25 - (i % 2) * 0.08]}
            rotation={[0, 0.3, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.08, 0.08, 0.6, 10]} />
            <meshStandardMaterial color="#4e7a3a" roughness={0.9} />
          </mesh>
        ))}
      </Inspectable>

      <Table position={[0.35, 0, 0.55]} width={1.1} depth={0.6} />
      <mesh position={[0.35, 0.8, 0.55]}>
        <cylinderGeometry args={[0.36, 0.3, 0.06, 18]} />
        <meshStandardMaterial color={C.brass} metalness={0.4} roughness={0.4} />
      </mesh>
      {(
        [
          [0.2, 0.93, 0.5, "#f2c230"],
          [0.45, 0.93, 0.6, "#5c8f3a"],
          [0.32, 1.06, 0.55, "#d8572a"],
          [0.55, 0.92, 0.45, "#e9a23b"],
          [0.12, 0.92, 0.66, "#8bb34a"],
        ] as const
      ).map(([x, y, z, c], i) => (
        <Fruit key={i} position={[x, y, z]} color={c} r={0.12} />
      ))}

      {[-4.9, 5.0].map((x) => (
        <group key={x} position={[x, 0, 0.9]}>
          <Pot scale={0.9} plant={false} />
          {Array.from({ length: 6 }, (_, i) => (
            <Orb
              key={i}
              position={[
                Math.cos(i) * 0.16,
                0.5 + (i % 3) * 0.06,
                Math.sin(i) * 0.16,
              ]}
              scale={[0.1, 0.09, 0.1]}
              color="#f4b223"
            />
          ))}
        </group>
      ))}
      <Bamboo position={[5.0, 0, -3.2]} scale={0.9} />
    </>
  );
}

/* ---------------- 2. Trung thu ---------------- */

export function StarLantern({
  position,
  color = "#e8382b",
  reducedMotion = false,
}: {
  position: Vec3;
  color?: string;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const shape = useMemo(() => {
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
  useFrame(({ clock }) => {
    if (ref.current && !reducedMotion) {
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.6) * 0.12;
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.25;
    }
  });
  return (
    <group position={position}>
      <Segment
        from={[0, 0, 0]}
        to={[0.35, 2.1, 0]}
        radius={0.025}
        color="#8a6a3a"
      />
      <group ref={ref} position={[0.35, 2.1, 0]}>
        <Segment
          from={[0, 0, 0]}
          to={[0, -0.18, 0]}
          radius={0.008}
          color="#3b2a1a"
        />
        <mesh position={[0, -0.6, 0]} scale={0.42}>
          <extrudeGeometry
            args={[
              shape,
              {
                depth: 0.35,
                bevelEnabled: true,
                bevelSize: 0.06,
                bevelThickness: 0.06,
                bevelSegments: 1,
              },
            ]}
          />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.9}
            roughness={0.5}
          />
        </mesh>
        <pointLight
          position={[0, -0.6, 0.4]}
          color="#ffb070"
          intensity={1.6}
          distance={3}
        />
      </group>
    </group>
  );
}

export function MidAutumnScene({ onInspect, reducedMotion }: SceneProps) {
  const lanterns = [-3.9, -2.6, -1.3, 0, 1.3, 2.6, 3.9];
  return (
    <>
      <Inspectable
        name="Trăng rằm"
        position={[-0.6, 5.5, -4.1]}
        marker={[0, -1.45, 0.6]}
        onInspect={onInspect}
      >
        <mesh>
          <sphereGeometry args={[1.05, 32, 20]} />
          <meshBasicMaterial color="#fff0c2" toneMapped={false} />
        </mesh>
        <mesh scale={1.35}>
          <sphereGeometry args={[1.05, 24, 16]} />
          <meshBasicMaterial
            color="#ffe6a8"
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      </Inspectable>

      <VillageHouse position={[-2.4, 0, -2.75]} />

      {[-4.9, 4.9].map((x) => (
        <Pole key={x} position={[x, 1.45, -0.6]} height={2.9} radius={0.05} />
      ))}
      <Segment
        from={[-4.9, 2.85, -0.6]}
        to={[4.9, 2.85, -0.6]}
        radius={0.012}
        color="#3b2a1a"
      />
      {lanterns.map((x, i) => (
        <Lantern
          key={x}
          position={[x, 2.85, -0.6]}
          scale={0.7}
          color={i % 2 ? "#f2b632" : "#d6342b"}
          glow={1}
          reducedMotion={reducedMotion}
        />
      ))}
      <pointLight
        position={[-2, 2.4, 0]}
        color="#ffb070"
        intensity={5}
        distance={9}
      />
      <pointLight
        position={[2.4, 2.4, 0]}
        color="#ffb070"
        intensity={5}
        distance={9}
      />

      <Inspectable
        name="Đèn ông sao"
        position={[-1.6, 0, 0.75]}
        marker={[0.35, 2.75, 0]}
        onInspect={onInspect}
      >
        <StarLantern position={[0, 0, 0]} reducedMotion={reducedMotion} />
      </Inspectable>
      <StarLantern
        position={[4.3, 0, 0.6]}
        color="#f2b632"
        reducedMotion={reducedMotion}
      />

      <Inspectable
        name="Bánh trung thu"
        position={[2.2, 0, 0.2]}
        marker={[0, 1.55, 0]}
        onInspect={onInspect}
      >
        <Table position={[0, 0, 0]} width={1.3} depth={0.75} color="#8a5a3a" />
        <mesh position={[0, 0.79, 0]}>
          <cylinderGeometry args={[0.42, 0.36, 0.05, 20]} />
          <meshStandardMaterial color="#f1e6cf" />
        </mesh>
        {[
          [-0.16, 0.0],
          [0.17, 0.05],
          [0.0, -0.17],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0.86, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.13, 0.13, 0.1, 16]} />
              <meshStandardMaterial color="#b9763a" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.04, 0.09, 12]} />
              <meshStandardMaterial color="#d89b55" />
            </mesh>
          </group>
        ))}
        <Orb
          position={[0.48, 0.92, -0.12]}
          scale={[0.15, 0.13, 0.15]}
          color="#e7e2d6"
        />
        <Segment
          from={[0.6, 0.92, -0.12]}
          to={[0.72, 1.0, -0.12]}
          radius={0.018}
          color="#e7e2d6"
        />
      </Inspectable>

      {/* đầu lân */}
      <group position={[-4.3, 0, 0.35]} rotation={[0, 0.5, 0]}>
        <Orb position={[0, 0.75, 0]} scale={[0.55, 0.5, 0.5]} color="#d6342b" />
        <Orb
          position={[0, 0.95, 0.32]}
          scale={[0.38, 0.22, 0.25]}
          color="#f2b632"
        />
        {[-0.2, 0.2].map((x) => (
          <group key={x} position={[x, 1.02, 0.44]}>
            <Orb scale={[0.09, 0.09, 0.06]} color="#ffffff" />
            <Orb
              position={[0, 0, 0.05]}
              scale={[0.045, 0.045, 0.03]}
              color="#1a1a1a"
            />
          </group>
        ))}
        <Orb
          position={[0, 1.32, -0.05]}
          scale={[0.1, 0.18, 0.1]}
          color="#f2b632"
        />
        {Array.from({ length: 7 }, (_, i) => (
          <Orb
            key={i}
            position={[
              Math.cos(i * 0.9) * 0.55,
              0.75 + Math.sin(i * 0.9) * 0.45,
              -0.25,
            ]}
            scale={[0.14, 0.14, 0.14]}
            color={i % 2 ? "#f6f1e4" : "#f2b632"}
          />
        ))}
        <Box
          position={[0, 0.2, -0.55]}
          size={[0.9, 0.4, 0.9]}
          color="#d6342b"
        />
      </group>
    </>
  );
}

/* ---------------- 3. Biển quê ---------------- */

export function BasketBoat({
  position,
  scale = 1,
  reducedMotion = false,
  floating = false,
}: {
  position: Vec3;
  scale?: number;
  reducedMotion?: boolean;
  floating?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current && floating && !reducedMotion) {
      ref.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 1.2) * 0.04;
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.06;
    }
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh
        position={[0, 0.42, 0]}
        rotation={[Math.PI, 0, 0]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.75, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#6b4a2b"
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.75, 0.045, 6, 28]} />
        <meshStandardMaterial color="#8a6a3a" />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[0, 0.2, 0]}
          rotation={[0, (i * Math.PI) / 4, 0]}
        >
          <torusGeometry args={[0.62, 0.012, 4, 20, Math.PI]} />
          <meshStandardMaterial color="#4a3320" />
        </mesh>
      ))}
      <Segment
        from={[-0.2, 0.45, 0.3]}
        to={[0.9, 0.9, 0.6]}
        radius={0.025}
        color="#a07a4a"
      />
    </group>
  );
}

export function Waves({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.children.forEach((child, i) => {
      const t = (clock.elapsedTime * 0.18 + i / 3) % 1;
      child.position.z = -3.9 + t * 1.9;
      child.scale.x = 0.6 + Math.sin(t * Math.PI) * 0.4;
    });
  });
  return (
    <group ref={ref}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          position={[0, 0.07, -3.9 + i * 0.6]}
          size={[10.8, 0.02, 0.08]}
          color="#f4f7f2"
        />
      ))}
    </group>
  );
}

export function Gulls({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    const t = clock.elapsedTime;
    ref.current.position.x = Math.sin(t * 0.15) * 3;
    ref.current.children.forEach((g, i) => {
      g.rotation.z = Math.sin(t * 5 + i) * 0.25;
    });
  });
  return (
    <group ref={ref} position={[0, 4.2, -2.4]}>
      {[
        [0, 0, 0],
        [0.9, 0.35, 0.3],
        [-0.8, 0.25, -0.2],
      ].map((p, i) => (
        <group key={i} position={p as Vec3}>
          <Segment
            from={[-0.28, 0.08, 0]}
            to={[0, 0, 0]}
            radius={0.022}
            color="#f5f5f2"
          />
          <Segment
            from={[0, 0, 0]}
            to={[0.28, 0.08, 0]}
            radius={0.022}
            color="#f5f5f2"
          />
        </group>
      ))}
    </group>
  );
}

export function SeasideScene({ onInspect, reducedMotion }: SceneProps) {
  return (
    <>
      <Box
        position={[0, 0.0, 0]}
        size={[11.55, 0.03, 8.35]}
        color="#e6d2a2"
        roughness={1}
      />
      <mesh position={[0, 0.05, -3.25]} receiveShadow>
        <boxGeometry args={[11.55, 0.06, 1.95]} />
        <meshStandardMaterial
          color="#4f9fb0"
          transparent
          opacity={0.92}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      <Waves reducedMotion={reducedMotion} />
      <Gulls reducedMotion={reducedMotion} />

      <Inspectable
        name="Thuyền thúng"
        position={[-2.6, 0, -1.1]}
        marker={[0, 1.4, 0]}
        onInspect={onInspect}
      >
        <BasketBoat position={[0, 0, 0]} />
        <BasketBoat position={[1.55, 0, 0.35]} scale={0.85} />
      </Inspectable>
      <BasketBoat
        position={[2.7, 0.0, -3.15]}
        scale={0.8}
        floating
        reducedMotion={reducedMotion}
      />

      <Inspectable
        name="Lưới cá"
        position={[-4.7, 0, 0.45]}
        marker={[0, 2.1, 0]}
        onInspect={onInspect}
      >
        {[-0.75, 0.75].map((z) => (
          <Pole key={z} position={[0, 0.85, z]} height={1.7} radius={0.04} />
        ))}
        <mesh position={[0.02, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.5, 1.1, 10, 7]} />
          <meshStandardMaterial color="#2f5f55" wireframe />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <Orb
            key={i}
            position={[0.03, 1.62, -0.6 + i * 0.4]}
            scale={[0.05, 0.05, 0.05]}
            color="#e86a33"
          />
        ))}
      </Inspectable>

      <Inspectable
        name="Bãi cát"
        position={[2.4, 0, 0.55]}
        marker={[0, 1.3, 0]}
        onInspect={onInspect}
      >
        <Box position={[0, 0.18, 0]} size={[0.8, 0.36, 0.6]} color="#d9c08a" />
        {[-0.3, 0.3].map((x) => (
          <mesh key={x} position={[x, 0.55, 0]} castShadow>
            <coneGeometry args={[0.16, 0.42, 8]} />
            <meshStandardMaterial color="#d9c08a" roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.18, 0.5, 10]} />
          <meshStandardMaterial color="#cfb47c" roughness={1} />
        </mesh>
        <mesh position={[0.8, 0.14, 0.25]} castShadow>
          <cylinderGeometry args={[0.15, 0.11, 0.26, 12]} />
          <meshStandardMaterial color="#d6342b" />
        </mesh>
        {[0, 1, 2].map((i) => (
          <Orb
            key={i}
            position={[-0.7 + i * 0.25, 0.04, 0.42]}
            scale={[0.07, 0.035, 0.06]}
            color={i % 2 ? "#f2d2c4" : "#f7efe2"}
          />
        ))}
      </Inspectable>

      <Tree position={[5.0, 0, -0.7]} kind="palm" scale={1.05} />
      <Tree position={[-5.15, 0, -2.0]} kind="palm" scale={0.9} />
    </>
  );
}

/* ---------------- 4. Chợ quê ---------------- */

export function Stall({
  position,
  awning,
  goods,
}: {
  position: Vec3;
  awning: [string, string];
  goods: "fruit" | "fish" | "cloth";
}) {
  return (
    <group position={position}>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Pole
            key={`${sx}${sz}`}
            position={[sx * 0.85, 0.95, sz * 0.5]}
            height={1.9}
            radius={0.035}
          />
        )),
      )}
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          position={[-0.68 + i * 0.45, 1.95, 0.05]}
          size={[0.45, 0.05, 1.3]}
          color={awning[i % 2]}
          rotation={[0.18, 0, 0]}
        />
      ))}
      <Box
        position={[0, 0.62, 0]}
        size={[1.75, 0.08, 1.0]}
        color={C.woodLight}
      />
      <Box position={[0, 0.3, 0]} size={[1.6, 0.55, 0.9]} color="#8b6a46" />
      {goods === "fruit"
        ? Array.from({ length: 12 }, (_, i) => (
            <Fruit
              key={i}
              position={[
                -0.6 + (i % 6) * 0.24,
                0.75 + Math.floor(i / 6) * 0.04,
                -0.2 + Math.floor(i / 6) * 0.35,
              ]}
              color={["#f2c230", "#5c8f3a", "#d8572a", "#8bb34a"][i % 4]}
              r={0.1}
            />
          ))
        : null}
      {goods === "fish"
        ? [0, 1, 2, 3].map((i) => (
            <Orb
              key={i}
              position={[-0.5 + i * 0.33, 0.72, 0.05]}
              scale={[0.15, 0.045, 0.06]}
              color="#9aa7ad"
            />
          ))
        : null}
      {goods === "cloth"
        ? [0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[-0.6 + i * 0.3, 0.77, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.11, 0.11, 0.8, 12]} />
              <meshStandardMaterial
                color={
                  ["#c0392b", "#2e6f8e", "#e6b33a", "#5b8a4a", "#8e44ad"][i]
                }
              />
            </mesh>
          ))
        : null}
    </group>
  );
}

export function ConicalHat({
  position,
  rotation = [0, 0, 0],
}: {
  position: Vec3;
  rotation?: Vec3;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <coneGeometry args={[0.3, 0.22, 18]} />
      <meshStandardMaterial color="#e8d8a8" roughness={0.9} />
    </mesh>
  );
}

export function RiceDryingRack({
  position,
  rotation = 0,
}: {
  position: Vec3;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group rotation={[-0.55, 0, 0]} position={[0, 0.55, 0]}>
        <Box position={[0, 0, 0]} size={[1.5, 1.0, 0.04]} color="#b89a62" />
        {Array.from({ length: 6 }, (_, i) => (
          <mesh
            key={i}
            position={[
              -0.45 + (i % 3) * 0.45,
              -0.22 + Math.floor(i / 3) * 0.46,
              0.03,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.19, 0.19, 0.012, 20]} />
            <meshStandardMaterial color="#f4ecd8" roughness={0.6} />
          </mesh>
        ))}
      </group>
      <Segment
        from={[-0.6, 0, -0.45]}
        to={[-0.6, 0.6, 0.0]}
        radius={0.025}
        color="#8a6a3a"
      />
      <Segment
        from={[0.6, 0, -0.45]}
        to={[0.6, 0.6, 0.0]}
        radius={0.025}
        color="#8a6a3a"
      />
    </group>
  );
}

export function MarketScene({ onInspect }: SceneProps) {
  return (
    <>
      <Inspectable
        name="Sạp chợ"
        position={[0, 0, -1.9]}
        marker={[0, 2.45, 0.4]}
        onInspect={onInspect}
      >
        <Stall
          position={[-3.4, 0, 0]}
          awning={["#c0392b", "#f3ead8"]}
          goods="fruit"
        />
        <Stall
          position={[0, 0, -0.3]}
          awning={["#2e6f8e", "#f3ead8"]}
          goods="cloth"
        />
        <Stall
          position={[3.4, 0, 0]}
          awning={["#5b8a4a", "#f3ead8"]}
          goods="fish"
        />
        <ConicalHat position={[0.55, 0.95, -0.1]} rotation={[0.3, 0, 0.2]} />
        <ConicalHat position={[-3.0, 0.95, 0.2]} rotation={[0.2, 0, -0.3]} />
      </Inspectable>

      <Inspectable
        name="Bánh tráng phơi"
        position={[-3.6, 0, 0.55]}
        marker={[0, 1.6, 0]}
        onInspect={onInspect}
      >
        <RiceDryingRack position={[-0.5, 0, 0]} rotation={0.2} />
        <RiceDryingRack position={[1.1, 0, 0.05]} rotation={-0.15} />
      </Inspectable>

      <Inspectable
        name="Gánh hàng"
        position={[2.7, 0, 0.6]}
        marker={[0, 1.4, 0]}
        onInspect={onInspect}
      >
        <Segment
          from={[-0.9, 0.62, 0]}
          to={[0.9, 0.7, 0]}
          radius={0.035}
          color="#a07a4a"
        />
        {[-0.8, 0.8].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {[0, 1, 2].map((i) => (
              <Segment
                key={i}
                from={[0, 0.66, 0]}
                to={[Math.cos(i * 2.1) * 0.24, 0.32, Math.sin(i * 2.1) * 0.24]}
                radius={0.008}
                color="#5b3d26"
              />
            ))}
            <mesh position={[0, 0.18, 0]} castShadow>
              <cylinderGeometry args={[0.28, 0.22, 0.32, 14]} />
              <meshStandardMaterial color="#b8925a" roughness={0.95} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <Fruit
                key={i}
                position={[
                  Math.cos(i * 2) * 0.12,
                  0.38,
                  Math.sin(i * 2) * 0.12,
                ]}
                color={x < 0 ? "#5c8f3a" : "#f2c230"}
                r={0.1}
              />
            ))}
          </group>
        ))}
        <ConicalHat position={[0.0, 0.08, 0.45]} rotation={[-0.1, 0, 0.05]} />
      </Inspectable>

      <Bicycle position={[5.0, 0, 0.75]} rotation={-0.6} />
      <Tree position={[-5.2, 0, -3.3]} scale={0.8} />
    </>
  );
}

/* ---------------- 5. Cây đa đầu làng ---------------- */

export function Shuttlecock({
  position,
  reducedMotion = false,
}: {
  position: Vec3;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    const t = (clock.elapsedTime * 0.7) % 1;
    ref.current.position.y = position[1] + Math.sin(t * Math.PI) * 1.3;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 3) * 0.4;
  });
  return (
    <group ref={ref} position={position}>
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

export function OAnQuan({ position }: { position: Vec3 }) {
  const ink = "#6b5236";
  const pebbles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => [
        -0.9 + (i % 5) * 0.45 + (seeded(i) - 0.5) * 0.15,
        0.035,
        (i % 2 ? -0.2 : 0.2) + (seeded(i, 3) - 0.5) * 0.12,
      ]) as Vec3[],
    [],
  );
  return (
    <group position={position}>
      <Box position={[0, 0.02, 0]} size={[2.35, 0.012, 0.03]} color={ink} />
      {[-0.42, 0.42].map((z) => (
        <Box
          key={z}
          position={[0, 0.02, z]}
          size={[2.35, 0.012, 0.03]}
          color={ink}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          position={[-1.17 + i * 0.47, 0.02, 0]}
          size={[0.03, 0.012, 0.86]}
          color={ink}
        />
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 1.17, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, side > 0 ? -Math.PI / 2 : Math.PI / 2]}
        >
          <ringGeometry args={[0.41, 0.44, 20, 1, 0, Math.PI]} />
          <meshStandardMaterial color={ink} />
        </mesh>
      ))}
      {pebbles.map((p, i) => (
        <Orb
          key={i}
          position={p}
          scale={[0.04, 0.03, 0.04]}
          color={i % 3 ? "#8d8a80" : "#c9c2b3"}
        />
      ))}
      <Orb
        position={[-1.42, 0.06, 0]}
        scale={[0.09, 0.07, 0.09]}
        color="#6f6a5f"
      />
      <Orb
        position={[1.42, 0.06, 0]}
        scale={[0.09, 0.07, 0.09]}
        color="#6f6a5f"
      />
    </group>
  );
}

export function Well({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.7, 18, 1, true]} />
        <meshStandardMaterial
          color="#9a958a"
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.57, 0.06, 6, 22]} />
        <meshStandardMaterial color="#8a857a" />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.52, 18]} />
        <meshStandardMaterial color="#2f5560" />
      </mesh>
      {[-0.62, 0.62].map((x) => (
        <Pole key={x} position={[x, 0.95, 0]} height={1.9} radius={0.04} />
      ))}
      <Segment
        from={[-0.62, 1.75, 0]}
        to={[0.62, 1.75, 0]}
        radius={0.04}
        color={C.wood}
      />
      <Segment
        from={[0.1, 1.75, 0]}
        to={[0.1, 1.05, 0]}
        radius={0.008}
        color="#3b2a1a"
      />
      <mesh position={[0.1, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.2, 10]} />
        <meshStandardMaterial color="#6b4a2b" />
      </mesh>
    </group>
  );
}

export function VillageBanyanScene({ onInspect, reducedMotion }: SceneProps) {
  return (
    <>
      <Inspectable
        name="Cây đa"
        position={[-3.2, 0, -1.7]}
        marker={[0.4, 3.6, 0.6]}
        onInspect={onInspect}
      >
        <Tree position={[0, 0, 0]} kind="banyan" scale={1.35} />
      </Inspectable>
      <Bench position={[-2.6, 0, 0.35]} rotation={0.15} />

      {/* cổng làng */}
      <group position={[2.7, 0, -2.9]}>
        {[-1.15, 1.15].map((x) => (
          <Box
            key={x}
            position={[x, 1.1, 0]}
            size={[0.38, 2.2, 0.38]}
            color="#d9cdb0"
          />
        ))}
        <Box position={[0, 2.35, 0]} size={[3.0, 0.32, 0.5]} color="#cbbd9c" />
        <Box position={[0, 2.62, 0]} size={[3.3, 0.14, 0.7]} color={C.tile} />
        <Sign
          text="CỔNG LÀNG"
          position={[0, 2.35, 0.26]}
          width={1.6}
          height={0.24}
          color="#f1e3c0"
          ink={C.ink}
          fontSize={70}
        />
      </group>

      <Inspectable
        name="Ô ăn quan"
        position={[0.9, 0, 0.35]}
        marker={[0, 1.0, 0]}
        onInspect={onInspect}
      >
        <OAnQuan position={[0, 0, 0]} />
      </Inspectable>

      <Inspectable
        name="Đá cầu"
        position={[-0.9, 0, -1.0]}
        marker={[0, 2.2, 0]}
        onInspect={onInspect}
      >
        <Shuttlecock position={[0, 0.5, 0]} reducedMotion={reducedMotion} />
        <Orb
          position={[0, 0.02, 0]}
          scale={[0.35, 0.01, 0.35]}
          color="#7b8a55"
        />
      </Inspectable>

      <Well position={[4.6, 0, 0.35]} />
      <Bamboo position={[5.0, 0, -3.4]} scale={0.85} />
      <Pot position={[-5.0, 0, 0.9]} scale={0.9} />
    </>
  );
}

/** Registry used by the stage, keyed by chapter id in lib/story.ts. */
export const CHILDHOOD_SCENES: Record<string, ComponentType<SceneProps>> = {
  "tet-que": TetScene,
  "trung-thu": MidAutumnScene,
  "bien-que": SeasideScene,
  "cho-que": MarketScene,
  "cay-da": VillageBanyanScene,
};
