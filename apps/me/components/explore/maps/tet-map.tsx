"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { TET_LAYOUT as L } from "@/lib/explore/tet-que";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import {
  Fire,
  Lantern,
  MaiTree,
  Smoke,
  Table,
  Well,
} from "@/components/story/world-childhood";
import {
  Bamboo,
  Box,
  C,
  Orb,
  Pole,
  Pot,
  RicePaddy,
  Roof,
  Segment,
  Sign,
  Tree,
} from "@/components/story/world-3d";

type MapProps = {
  effects: ReadonlySet<string>;
  player: RefObject<THREE.Group | null>;
  reducedMotion?: boolean;
};

const RED = "#b3261e";
const GOLD = "#f6d36b";

function seeded(i: number, k = 1) {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------- small pieces ---------- */

export function Candle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.32, 10]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <coneGeometry args={[0.03, 0.09, 8]} />
        <meshStandardMaterial
          color="#ffb347"
          emissive="#ff9a2a"
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
}

export function Incense({
  position,
  lit,
  reducedMotion,
}: {
  position: [number, number, number];
  lit: boolean;
  reducedMotion?: boolean;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.18, 16]} />
        <meshStandardMaterial color={C.brass} metalness={0.4} roughness={0.4} />
      </mesh>
      {lit
        ? [-0.05, 0, 0.05].map((x, i) => (
            <group
              key={x}
              position={[x, 0.09, 0]}
              rotation={[0, 0, (i - 1) * 0.08]}
            >
              <Segment
                from={[0, 0, 0]}
                to={[0, 0.42, 0]}
                radius={0.008}
                color="#b0262a"
              />
              <mesh position={[0, 0.43, 0]}>
                <sphereGeometry args={[0.014, 6, 4]} />
                <meshStandardMaterial
                  color="#ff6a2a"
                  emissive="#ff5a1a"
                  emissiveIntensity={3}
                />
              </mesh>
            </group>
          ))
        : null}
      {lit ? (
        <group scale={0.55}>
          <Smoke position={[0, 0.85, 0]} reducedMotion={reducedMotion} />
        </group>
      ) : null}
    </group>
  );
}

export function FruitTray({
  position,
}: {
  position: [number, number, number];
}) {
  const fruits: Array<[number, number, number, string, number]> = [
    [0, 0.16, 0, "#7aa64a", 0.15],
    [-0.15, 0.1, 0.06, "#f2c230", 0.11],
    [0.15, 0.1, 0.05, "#e9a23b", 0.12],
    [0, 0.1, -0.14, "#6b9b3a", 0.11],
    [-0.08, 0.27, 0, "#d8572a", 0.08],
    [0.09, 0.26, -0.02, "#8bb34a", 0.07],
  ];
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.22, 0.06, 18]} />
        <meshStandardMaterial color={C.brass} metalness={0.4} roughness={0.4} />
      </mesh>
      {fruits.map(([x, y, z, c, r], i) => (
        <Orb key={i} position={[x, y, z]} scale={[r, r, r]} color={c} />
      ))}
    </group>
  );
}

export function Kumquat({ position }: { position: [number, number, number] }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = seeded(i) * Math.PI * 2;
        const y = 0.85 + seeded(i, 2) * 0.55;
        return [Math.cos(a) * 0.36, y, Math.sin(a) * 0.36] as [
          number,
          number,
          number,
        ];
      }),
    [],
  );
  return (
    <group position={position}>
      <Pot scale={1.2} plant={false} />
      <Orb position={[0, 1.1, 0]} scale={[0.42, 0.42, 0.42]} color="#3f6b35" />
      {dots.map((p, i) => (
        <Orb key={i} position={p} scale={[0.06, 0.06, 0.06]} color="#f28a1e" />
      ))}
    </group>
  );
}

export function Chicken({
  position,
  reducedMotion,
}: {
  position: [number, number, number];
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const seed = position[0] * 3.1 + position[2];
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime + seed;
    if (head.current)
      head.current.rotation.x = Math.max(0, Math.sin(t * 3)) * 0.9;
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(t * 0.3) * 0.8;
      ref.current.rotation.y =
        Math.cos(t * 0.3) > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
  });
  return (
    <group ref={ref} position={position}>
      <Orb
        position={[0, 0.22, 0]}
        scale={[0.18, 0.15, 0.13]}
        color={seed % 2 > 1 ? "#f3efe6" : "#a8643a"}
      />
      <Orb
        position={[-0.15, 0.3, 0]}
        scale={[0.06, 0.1, 0.08]}
        color="#6b3a1e"
      />
      <group ref={head} position={[0.14, 0.33, 0]}>
        <Orb
          position={[0.04, 0.05, 0]}
          scale={[0.07, 0.07, 0.07]}
          color="#f3efe6"
        />
        <Orb
          position={[0.04, 0.13, 0]}
          scale={[0.03, 0.03, 0.015]}
          color="#d6342b"
        />
        <mesh position={[0.11, 0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.02, 0.05, 6]} />
          <meshStandardMaterial color="#f2a62a" />
        </mesh>
      </group>
      <Segment
        from={[0.02, 0.1, 0.04]}
        to={[0.02, 0, 0.04]}
        radius={0.01}
        color="#f2a62a"
      />
      <Segment
        from={[0.02, 0.1, -0.04]}
        to={[0.02, 0, -0.04]}
        radius={0.01}
        color="#f2a62a"
      />
    </group>
  );
}

export function Petals({
  center,
  reducedMotion,
}: {
  center: [number, number, number];
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.children.forEach((child, i) => {
      const t = (clock.elapsedTime * 0.18 + seeded(i)) % 1;
      child.position.set(
        Math.cos(i * 1.7) * (0.6 + t * 0.9),
        2.6 - t * 2.6,
        Math.sin(i * 1.7) * (0.6 + t * 0.9),
      );
      child.rotation.set(t * 8, t * 5, 0);
    });
  });
  return (
    <group ref={ref} position={center}>
      {Array.from({ length: 22 }, (_, i) => (
        <mesh key={i}>
          <circleGeometry args={[0.05, 5]} />
          <meshStandardMaterial
            color="#f7d34a"
            side={THREE.DoubleSide}
            emissive="#f2b632"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

export function YardTiles() {
  const lines = useMemo(() => {
    const out: Array<{
      p: [number, number, number];
      s: [number, number, number];
    }> = [];
    for (let x = -9; x <= 9; x += 1.5)
      out.push({ p: [x, 0.025, 1], s: [0.03, 0.01, 10] });
    for (let z = -4; z <= 6; z += 1.5)
      out.push({ p: [0, 0.025, z], s: [18, 0.01, 0.03] });
    return out;
  }, []);
  return (
    <group>
      <Box position={[0, 0.0, 1]} size={[18, 0.04, 10]} color="#c99d74" />
      {lines.map((l, i) => (
        <Box key={i} position={l.p} size={l.s} color="#b5865e" />
      ))}
    </group>
  );
}

export function Hedge({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  return (
    <group
      position={[(from[0] + to[0]) / 2, 0, (from[1] + to[1]) / 2]}
      rotation={[0, -angle, 0]}
    >
      <Box position={[0, 0.55, 0]} size={[length, 1.1, 0.6]} color="#5d7d42" />
      <Box position={[0, 1.15, 0]} size={[length, 0.12, 0.5]} color="#6f9150" />
    </group>
  );
}

/* ---------- house ---------- */

function House({ effects, player, reducedMotion }: MapProps) {
  const roof = useRef<THREE.Group>(null);
  const eave = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = player.current?.position;
    if (!roof.current || !p) return;
    // Dollhouse cut-away: lift the roof and front eave off while Dĩ is inside the hall.
    const inside =
      p.z < L.house.frontZ + 0.4 && Math.abs(p.x) < L.house.maxX + 0.3;
    roof.current.visible = !inside;
    if (eave.current) eave.current.visible = !inside;
  });
  const columns = [-5.6, -1.9, 1.9, 5.6];
  return (
    <group>
      {/* floor, walls */}
      <Box position={[0, 0.03, -7]} size={[12.4, 0.12, 6.2]} color="#b9775a" />
      <Box
        position={[0, 1.55, -10]}
        size={[12.6, 3.1, 0.4]}
        color={C.plaster}
      />
      <Box
        position={[-6.05, 1.55, -7.1]}
        size={[0.4, 3.1, 5.8]}
        color={C.plaster}
      />
      <Box
        position={[6.05, 1.55, -7.1]}
        size={[0.4, 3.1, 5.8]}
        color={C.plaster}
      />
      <Box
        position={[-6.05, 1.3, -4.6]}
        size={[0.42, 0.9, 0.6]}
        color="#cdb98a"
      />
      {/* columns + beam */}
      {columns.map((x) => (
        <Pole
          key={x}
          position={[x, 1.45, -4.1]}
          height={2.9}
          radius={0.16}
          color="#7a3b22"
        />
      ))}
      <group ref={eave}>
        <Box
          position={[0, 2.95, -4.1]}
          size={[12.6, 0.22, 0.26]}
          color="#6a321d"
        />
        <Sign
          text="CHÚC MỪNG NĂM MỚI"
          position={[0, 2.6, -3.95]}
          width={3.2}
          height={0.36}
          color={RED}
          ink={GOLD}
          fontSize={66}
        />
        {[-3.75, 3.75].map((x) => (
          <Lantern
            key={x}
            position={[x, 2.85, -4.05]}
            reducedMotion={reducedMotion}
          />
        ))}
      </group>
      {/* steps */}
      <Box
        position={[0, 0.06, -3.75]}
        size={[3.4, 0.12, 0.5]}
        color="#a8a091"
      />

      {/* altar (bàn thờ) */}
      <group position={[L.altar[0], 0, L.altar[1]]}>
        <Box position={[0, 0.62, 0]} size={[3.2, 1.24, 1.1]} color="#5a2f1e" />
        <Box position={[0, 0.62, 0.56]} size={[3.0, 1.0, 0.04]} color={RED} />
        <Box
          position={[0, 1.08, 0.585]}
          size={[3.0, 0.08, 0.02]}
          color={GOLD}
        />
        <Box
          position={[0, 1.42, -0.15]}
          size={[2.2, 0.36, 0.7]}
          color="#4a2617"
        />
        <Incense
          position={[0, 1.69, -0.15]}
          lit={effects.has("incense")}
          reducedMotion={reducedMotion}
        />
        <Candle position={[-0.85, 1.76, -0.15]} />
        <Candle position={[0.85, 1.76, -0.15]} />
        {effects.has("fruit") ? (
          <FruitTray position={[0.0, 1.27, 0.32]} />
        ) : (
          <mesh position={[0, 1.27, 0.32]}>
            <cylinderGeometry args={[0.32, 0.22, 0.06, 18]} />
            <meshStandardMaterial
              color={C.brass}
              metalness={0.4}
              roughness={0.4}
            />
          </mesh>
        )}
        {/* vase with a mai branch */}
        <mesh position={[-1.25, 1.36, 0.25]}>
          <cylinderGeometry args={[0.1, 0.14, 0.3, 12]} />
          <meshStandardMaterial color="#2e6f8e" />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <Orb
            key={i}
            position={[
              -1.25 + Math.cos(i) * 0.18,
              1.62 + (i % 3) * 0.12,
              0.25 + Math.sin(i) * 0.12,
            ]}
            scale={[0.05, 0.05, 0.05]}
            color="#f7d34a"
          />
        ))}
        {/* portraits + banner on the back wall */}
        {[-0.55, 0.55].map((x) => (
          <group key={x} position={[x, 2.15, -0.78]}>
            <Box size={[0.62, 0.78, 0.05]} color="#3a2416" />
            <Box
              position={[0, 0, 0.03]}
              size={[0.48, 0.62, 0.01]}
              color="#d8cfc0"
            />
          </group>
        ))}
        <Sign
          text="CUNG CHÚC TÂN XUÂN"
          position={[0, 2.85, -0.77]}
          width={3.2}
          height={0.36}
          color={RED}
          ink={GOLD}
          fontSize={62}
        />
      </group>

      {/* tea table where Ông sits */}
      <group position={[L.teaTable[0], 0, L.teaTable[1]]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.75, 0.75, 0.08, 24]} />
          <meshStandardMaterial color={C.woodLight} />
        </mesh>
        <Pole
          position={[0, 0.25, 0]}
          height={0.5}
          radius={0.1}
          color={C.wood}
        />
        <Orb
          position={[0.15, 0.66, 0]}
          scale={[0.13, 0.11, 0.13]}
          color="#e7e2d6"
        />
        {[-0.3, 0.35, 0.05].map((x, i) => (
          <mesh key={i} position={[x, 0.58, i === 2 ? 0.35 : -0.2]}>
            <cylinderGeometry args={[0.05, 0.04, 0.08, 10]} />
            <meshStandardMaterial color="#f1ead9" />
          </mesh>
        ))}
        <mesh position={[0.45, 0.57, 0.25]}>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 16]} />
          <meshStandardMaterial color={RED} />
        </mesh>
      </group>

      {/* roof (hidden while inside) */}
      <group ref={roof} position={[0, 3.05, -7]}>
        <Roof width={13.6} depth={7.4} height={1.7} />
      </group>
    </group>
  );
}

/* ---------- whole map ---------- */

export function TetMap({ effects, player, reducedMotion }: MapProps) {
  const fireBoost = effects.has("banh-tet");
  return (
    <group>
      {/* ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#8d9c64" roughness={1} />
      </mesh>
      <YardTiles />
      <Box position={[0, 0.0, 8.3]} size={[3, 0.04, 4.6]} color="#c6b48c" />

      <House effects={effects} player={player} reducedMotion={reducedMotion} />

      {/* yard */}
      <group position={[L.mai[0], 0, L.mai[1]]} scale={1.3}>
        <MaiTree position={[0, 0, 0]} />
      </group>
      {effects.has("mai") ? (
        <Petals
          center={[L.mai[0], 0, L.mai[1]]}
          reducedMotion={reducedMotion}
        />
      ) : null}
      {L.kumquats.map(([x, z]) => (
        <Kumquat key={x} position={[x, 0, z]} />
      ))}

      <Table
        position={[L.momTable[0], 0, L.momTable[1]]}
        width={1.3}
        depth={0.8}
      />
      {effects.has("fruit") ? null : (
        <FruitTray position={[L.momTable[0], 0.8, L.momTable[1]]} />
      )}

      <group position={[L.fire[0], 0, L.fire[1]]} scale={fireBoost ? 1.25 : 1}>
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
          <cylinderGeometry args={[0.46, 0.4, 0.66, 18]} />
          <meshStandardMaterial
            color="#2c2c2e"
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
        <Smoke position={[0, 0.98, 0]} reducedMotion={reducedMotion} />
      </group>
      {/* firewood pile and finished bánh tét */}
      {Array.from({ length: fireBoost ? 6 : 3 }, (_, i) => (
        <mesh
          key={i}
          position={[
            L.fire[0] + 1.4,
            0.09 + Math.floor(i / 3) * 0.16,
            L.fire[1] - 0.9 + (i % 3) * 0.17,
          ]}
          rotation={[0, 0.2, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.08, 0.08, 0.62, 10]} />
          <meshStandardMaterial color="#4e7a3a" roughness={0.9} />
        </mesh>
      ))}

      {/* bầu cua mat */}
      <group position={[L.mat[0], 0.03, L.mat[1]]}>
        <Box size={[2.2, 0.02, 1.5]} color="#d9c79a" />
        {["#d6342b", "#2e6f8e", "#f2b632", "#5b8a4a", "#8e44ad", "#e86a33"].map(
          (c, i) => (
            <Box
              key={c}
              position={[
                -0.6 + (i % 3) * 0.6,
                0.02,
                -0.3 + Math.floor(i / 3) * 0.6,
              ]}
              size={[0.5, 0.01, 0.5]}
              color={c}
            />
          ),
        )}
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            position={[0.95 - i * 0.14, 0.08, 0.55]}
            size={[0.11, 0.11, 0.11]}
            color="#f3efe6"
            rotation={[0.3 * i, 0.6 * i, 0]}
          />
        ))}
      </group>

      {/* gate + hedges */}
      <group position={[0, 0, L.gateZ]}>
        {[-1.9, 1.9].map((x) => (
          <Box
            key={x}
            position={[x, 1.25, 0]}
            size={[0.5, 2.5, 0.5]}
            color="#d9cdb0"
          />
        ))}
        <Box position={[0, 2.6, 0]} size={[4.4, 0.3, 0.6]} color="#cbbd9c" />
        <Box position={[0, 2.85, 0]} size={[4.8, 0.14, 0.8]} color={C.tile} />
        <Sign
          text="CHÚC MỪNG NĂM MỚI"
          position={[0, 2.6, 0.31]}
          width={3.4}
          height={0.3}
          color={RED}
          ink={GOLD}
          fontSize={60}
        />
      </group>
      <Hedge from={[-15.6, 10.3]} to={[-2.3, 10.3]} />
      <Hedge from={[2.3, 10.3]} to={[15.6, 10.3]} />
      <Hedge from={[-15.6, -10.4]} to={[-6.6, -10.4]} />
      <Hedge from={[6.6, -10.4]} to={[15.6, -10.4]} />
      <Hedge from={[-15.6, -10.4]} to={[-15.6, 10.3]} />
      <Hedge from={[15.6, -10.4]} to={[15.6, 10.3]} />

      <Well position={[L.well[0], 0, L.well[1]]} />
      {[
        [10.2, 4.2],
        [11.4, 5.4],
        [9.4, 6.1],
      ].map(([x, z]) => (
        <Chicken key={x} position={[x, 0, z]} reducedMotion={reducedMotion} />
      ))}

      {/* surroundings */}
      <Tree position={[-13, 0, -7.5]} kind="palm" scale={1.3} />
      <Tree position={[13.2, 0, 7.2]} kind="palm" scale={1.2} />
      <Tree position={[-12.5, 0, 6.5]} scale={1.3} />
      <Tree position={[12.5, 0, -7.8]} scale={1.2} />
      <Bamboo position={[-9, 0, -9.2]} scale={1.3} />
      <Bamboo position={[9.5, 0, -9.3]} scale={1.2} />
      <Bamboo position={[-14.2, 0, 1.0]} scale={1.1} />
      <RicePaddy position={[-24, 0, 0]} width={12} depth={18} />
      <RicePaddy position={[24, 0, 0]} width={12} depth={18} />
      <RicePaddy position={[0, 0, -16]} width={30} depth={8} />
    </group>
  );
}
