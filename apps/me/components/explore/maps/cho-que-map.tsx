"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  ConicalHat,
  Fruit,
  RiceDryingRack,
  Smoke,
  Table,
} from "@/components/story/world-childhood";
import {
  Bamboo,
  Bicycle,
  Box,
  C,
  Orb,
  Pole,
  Roof,
  Segment,
  Sign,
  Tree,
  VillageHouse,
  type Vec3,
} from "@/components/story/world-3d";
import { CHO_QUE_LAYOUT as L } from "@/lib/explore/cho-que";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";
import { Chicken, Hedge } from "./tet-map";

const RICE_PAPER = "#efe2bf";
const BASKET = "#b8925a";

/* ---------- the shopping basket ---------- */

function BasketBody({ children }: { children?: ReactNode }) {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.21, 0.16, 0.24, 14, 1, true]} />
        <meshStandardMaterial
          color={BASKET}
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 14]} />
        <meshStandardMaterial color="#8a6a3a" />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <torusGeometry args={[0.2, 0.012, 5, 18, Math.PI]} />
        <meshStandardMaterial color="#8a6a3a" />
      </mesh>
      {children}
    </group>
  );
}

function Purchases({ effects }: { effects: ReadonlySet<string> }) {
  return (
    <group>
      {effects.has("banh-trang") ? (
        <group position={[-0.04, 0.26, -0.03]} rotation={[0.35, 0, 0.2]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, i * 0.014, 0]}>
              <cylinderGeometry args={[0.17, 0.17, 0.01, 20]} />
              <meshStandardMaterial color={RICE_PAPER} />
            </mesh>
          ))}
        </group>
      ) : null}
      {effects.has("ca") ? (
        <group position={[0.06, 0.24, 0.06]} rotation={[0, 0.5, 0.5]}>
          <Orb scale={[0.15, 0.05, 0.06]} color="#8fa0a8" />
          <mesh position={[-0.17, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.05, 0.08, 5]} />
            <meshStandardMaterial color="#7d8c93" />
          </mesh>
        </group>
      ) : null}
      {effects.has("trai-cay") ? (
        <group position={[0, 0.2, 0]}>
          <Fruit position={[0.08, 0.04, -0.07]} color="#f2c230" r={0.07} />
          <Fruit position={[-0.08, 0.05, 0.07]} color="#8bb34a" r={0.07} />
          {[0, 1, 2].map((i) => (
            <Segment
              key={i}
              from={[-0.1 + i * 0.05, 0.03, -0.05]}
              to={[-0.02 + i * 0.05, 0.16, 0.05]}
              radius={0.022}
              color="#f2d23a"
            />
          ))}
        </group>
      ) : null}
    </group>
  );
}

/** Dĩ carries mother's basket once he has offered to; it follows his right hand. */
function CarriedBasket({
  player,
  effects,
}: {
  player: RefObject<THREE.Group | null>;
  effects: ReadonlySet<string>;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = player.current;
    const g = ref.current;
    if (!p || !g) return;
    const ry = p.rotation.y;
    const lx = -0.36;
    const lz = 0.08;
    g.position.set(
      p.position.x + lx * Math.cos(ry) + lz * Math.sin(ry),
      0.3,
      p.position.z - lx * Math.sin(ry) + lz * Math.cos(ry),
    );
    g.rotation.y = ry;
  });
  return (
    <group ref={ref} userData={{ noCollide: true }} scale={0.85}>
      <BasketBody>
        <Purchases effects={effects} />
      </BasketBody>
    </group>
  );
}

/* ---------- bánh căn stall ---------- */

function BanhCanStall({
  cooking,
  reducedMotion,
}: {
  cooking: boolean;
  reducedMotion?: boolean;
}) {
  const cups = Array.from({ length: 7 }, (_, i) =>
    i === 0
      ? ([0, 0] as const)
      : ([
          Math.cos((i * Math.PI) / 3) * 0.25,
          Math.sin((i * Math.PI) / 3) * 0.25,
        ] as const),
  );
  return (
    <group>
      {/* market umbrella */}
      <group position={[L.stove[0] - 1.15, 0, L.stove[1] - 1.8]}>
        <Pole
          position={[0, 1.2, 0]}
          height={2.4}
          radius={0.04}
          color="#d9d6cf"
        />
        <mesh position={[0, 2.45, 0]} castShadow>
          <coneGeometry args={[1.7, 0.55, 8]} />
          <meshStandardMaterial color="#2e6f8e" roughness={0.8} />
        </mesh>
      </group>
      {/* clay stove + bánh căn mould */}
      <group position={[L.stove[0], 0, L.stove[1]]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.36, 0.44, 14]} />
          <meshStandardMaterial color="#a0573a" roughness={1} />
        </mesh>
        <mesh position={[0, 0.16, 0.3]}>
          <boxGeometry args={[0.2, 0.14, 0.08]} />
          <meshStandardMaterial
            color={cooking ? "#ff7a2a" : "#3a2a20"}
            emissive={cooking ? "#ff5a10" : "#000000"}
            emissiveIntensity={cooking ? 1.6 : 0}
          />
        </mesh>
        <mesh position={[0, 0.48, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.4, 0.08, 20]} />
          <meshStandardMaterial color="#6f4a33" roughness={1} />
        </mesh>
        {cups.map(([x, z], i) => (
          <group key={i} position={[x, 0.525, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.08, 12]} />
              <meshStandardMaterial color="#3a2a20" />
            </mesh>
            {cooking ? (
              <Orb
                position={[0, 0.02, 0]}
                scale={[0.07, 0.035, 0.07]}
                color="#e9b85a"
              />
            ) : (
              <Orb
                position={[0, 0.03, 0]}
                scale={[0.085, 0.05, 0.085]}
                color="#8a6a52"
              />
            )}
          </group>
        ))}
        {cooking ? (
          <Smoke position={[0, 0.6, 0]} reducedMotion={reducedMotion} />
        ) : null}
        {/* bowl of batter */}
        <mesh position={[0.62, 0.15, -0.2]} castShadow>
          <cylinderGeometry args={[0.2, 0.14, 0.3, 14]} />
          <meshStandardMaterial color="#e7e2d6" />
        </mesh>
      </group>
      {/* little table with stools */}
      <group position={[L.banhCanTable[0], 0, L.banhCanTable[1]]}>
        <Box position={[0, 0.5, 0]} size={[1.1, 0.06, 0.65]} color="#2e6f8e" />
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => (
            <Box
              key={`${sx}${sz}`}
              position={[sx * 0.48, 0.24, sz * 0.26]}
              size={[0.05, 0.48, 0.05]}
              color="#24576f"
            />
          )),
        )}
        {[-0.75, 0.75].map((x) => (
          <Box
            key={x}
            position={[x, 0.15, 0.1]}
            size={[0.3, 0.3, 0.3]}
            color="#c0392b"
          />
        ))}
        {/* nước mắm bowl */}
        <mesh position={[0.3, 0.57, -0.1]}>
          <cylinderGeometry args={[0.08, 0.06, 0.07, 12]} />
          <meshStandardMaterial color="#c97a3a" />
        </mesh>
        {cooking ? (
          <group position={[-0.15, 0.54, 0.05]}>
            <mesh>
              <cylinderGeometry args={[0.24, 0.2, 0.03, 18]} />
              <meshStandardMaterial color="#f3efe6" />
            </mesh>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Orb
                key={i}
                position={[
                  Math.cos(i * 1.05) * 0.13,
                  0.03,
                  Math.sin(i * 1.05) * 0.13,
                ]}
                scale={[0.06, 0.03, 0.06]}
                color="#e9b85a"
              />
            ))}
          </group>
        ) : null}
      </group>
    </group>
  );
}

/* ---------- bánh tráng seller ---------- */

function RicePaperStack({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.14, 20]} />
        <meshStandardMaterial color={RICE_PAPER} roughness={0.6} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <Orb
          key={i}
          position={[Math.cos(i) * 0.12, 0.072, Math.sin(i * 1.7) * 0.1]}
          scale={[0.012, 0.004, 0.008]}
          color="#3a2a20"
        />
      ))}
    </group>
  );
}

function BanhTrangCorner({ sold }: { sold: boolean }) {
  return (
    <group>
      <group position={[L.banhTrangTray[0], 0, L.banhTrangTray[1]]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.3, 0.44, 12]} />
          <meshStandardMaterial color={BASKET} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.55, 0.5, 0.04, 22]} />
          <meshStandardMaterial color="#c9a46a" roughness={0.95} />
        </mesh>
        <RicePaperStack position={[-0.2, 0.55, -0.12]} />
        <RicePaperStack position={[0.22, 0.55, 0.05]} />
        {sold ? null : <RicePaperStack position={[-0.05, 0.69, -0.04]} />}
        <RicePaperStack position={[-0.1, 0.55, 0.28]} />
      </group>
      {L.racks.map(([x, z], i) => (
        <RiceDryingRack
          key={`${x}-${z}`}
          position={[x, 0, z]}
          rotation={[0.25, -0.2, 0.1][i]}
        />
      ))}
    </group>
  );
}

/* ---------- fish corner ---------- */

function JumpingFish({
  position,
  reducedMotion,
}: {
  position: Vec3;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = reducedMotion ? 2 : (clock.elapsedTime * 0.7) % 2.4;
    if (t < 1) {
      g.visible = true;
      g.position.set(
        position[0] + (t - 0.5) * 0.5,
        position[1] + Math.sin(t * Math.PI) * 0.65,
        position[2],
      );
      g.rotation.z = (0.5 - t) * 2.4;
    } else {
      g.visible = false;
    }
  });
  return (
    <group ref={ref} position={position} userData={{ noCollide: true }}>
      <Orb scale={[0.14, 0.05, 0.05]} color="#a8b6bc" />
      <mesh position={[-0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.08, 5]} />
        <meshStandardMaterial color="#8fa0a8" />
      </mesh>
    </group>
  );
}

function FishCorner({
  bought,
  reducedMotion,
}: {
  bought: boolean;
  reducedMotion?: boolean;
}) {
  return (
    <group>
      {L.basins.map(([x, z], i) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.32, 0.44, 18, 1, true]} />
            <meshStandardMaterial
              color={i ? "#b8bcbc" : "#2e6f8e"}
              metalness={i ? 0.4 : 0}
              roughness={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.38, 18]} />
            <meshStandardMaterial color="#4f8a9a" roughness={0.2} />
          </mesh>
          {Array.from({ length: bought && i === 0 ? 2 : 4 }, (_, k) => (
            <Orb
              key={k}
              position={[
                Math.cos(k * 1.6) * 0.18,
                0.4,
                Math.sin(k * 1.6) * 0.16,
              ]}
              scale={[0.12, 0.035, 0.045]}
              color={k % 2 ? "#9aa7ad" : "#b8c2c6"}
            />
          ))}
        </group>
      ))}
      <JumpingFish
        position={[L.basins[1][0], 0.4, L.basins[1][1]]}
        reducedMotion={reducedMotion}
      />
      {/* cân đồng hồ */}
      <group position={[L.fishSeller[0] - 0.95, 0, L.fishSeller[1] + 0.2]}>
        <Box position={[0, 0.22, 0]} size={[0.32, 0.44, 0.3]} color="#c0392b" />
        <mesh position={[0, 0.3, 0.16]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#f3efe6" />
        </mesh>
        <mesh position={[0, 0.47, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.03, 16]} />
          <meshStandardMaterial color="#b8bcbc" metalness={0.5} />
        </mesh>
      </group>
      <ConicalHat
        position={[L.fishSeller[0] + 0.9, 0.11, L.fishSeller[1] + 0.3]}
        rotation={[0.2, 0, 0.1]}
      />
    </group>
  );
}

/* ---------- fruit seller with her đòn gánh ---------- */

function FruitCorner({ bought }: { bought: boolean }) {
  const [tx, tz] = L.fruitTray;
  const [gx, gz] = L.ganh;
  return (
    <group>
      <group position={[tx, 0, tz]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.3, 0.44, 12]} />
          <meshStandardMaterial color={BASKET} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.55, 0.5, 0.04, 22]} />
          <meshStandardMaterial color="#c9a46a" roughness={0.95} />
        </mesh>
        {Array.from({ length: bought ? 4 : 7 }, (_, i) => (
          <Fruit
            key={i}
            position={[Math.cos(i * 0.9) * 0.3, 0.56, Math.sin(i * 0.9) * 0.3]}
            color={["#f2c230", "#8bb34a", "#d8572a"][i % 3]}
            r={0.09}
          />
        ))}
        {/* thanh long in the middle */}
        <Orb
          position={[0, 0.6, 0]}
          scale={[0.12, 0.14, 0.12]}
          color="#d6336b"
        />
      </group>
      {/* đòn gánh resting on its two baskets */}
      <group position={[gx, 0, gz]}>
        {[-0.75, 0.75].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.24, 0.4, 14]} />
              <meshStandardMaterial color={BASKET} roughness={0.95} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <Orb
                key={i}
                position={[
                  Math.cos(i * 2.1) * 0.12,
                  0.42,
                  Math.sin(i * 2.1) * 0.12,
                ]}
                scale={[0.12, 0.08, 0.06]}
                color={z < 0 ? "#f2d23a" : "#5c8f3a"}
              />
            ))}
          </group>
        ))}
        <Segment
          from={[0.05, 0.5, -1.15]}
          to={[0.05, 0.5, 1.15]}
          radius={0.035}
          color="#a07a4a"
        />
      </group>
      {/* a cage of chickens for sale */}
      <group position={[gx + 1.8, 0, gz + 2.2]}>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={C.bamboo} wireframe />
        </mesh>
        <Box position={[0, 0.02, 0]} size={[1.0, 0.04, 1.0]} color="#a07a4a" />
        <Box position={[0, 0.2, 0]} size={[0.7, 0.36, 0.7]} color="#8a6a3a" />
      </group>
    </group>
  );
}

/* ---------- tea stall ---------- */

function TeaStall() {
  const [x, z] = L.teaTable;
  return (
    <group>
      <Table position={[x, 0, z]} width={1.0} depth={0.65} color="#8a5a3a" />
      <Orb
        position={[x + 0.15, 0.85, z]}
        scale={[0.12, 0.1, 0.12]}
        color="#e7e2d6"
      />
      {[-0.3, -0.12, 0.3].map((dx, i) => (
        <mesh key={dx} position={[x + dx, 0.81, z + (i === 2 ? 0.18 : -0.15)]}>
          <cylinderGeometry args={[0.045, 0.035, 0.08, 10]} />
          <meshStandardMaterial color="#f1ead9" />
        </mesh>
      ))}
      {/* phích nước + hũ kẹo */}
      <mesh position={[x + 0.8, 0.28, z - 0.2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.56, 12]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} position={[x - 0.3 + i * 0.25, 0.86, z - 0.22]}>
          <cylinderGeometry args={[0.07, 0.07, 0.18, 10]} />
          <meshStandardMaterial
            color={i ? "#f2b632" : "#e86a33"}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      {/* tarp over the stall */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Pole
            key={`${sx}${sz}`}
            position={[x + sx * 1.3, 1.05, z + sz * 0.8]}
            height={2.1}
            radius={0.035}
          />
        )),
      )}
      <Box
        position={[x, 2.12, z]}
        size={[2.8, 0.04, 1.85]}
        color="#3e6b8a"
        rotation={[0.08, 0, 0]}
      />
      <Sign
        text="QUÁN NƯỚC"
        position={[x, 1.9, z + 0.83]}
        width={1.3}
        height={0.26}
        color="#f1e3c0"
        ink={C.ink}
        fontSize={70}
      />
    </group>
  );
}

/* ---------- market hall ---------- */

function MarketHall() {
  const [hx, hz] = L.hall;
  return (
    <group position={[hx, 0, hz]}>
      <Box position={[0, 0.03, 0]} size={[8.6, 0.06, 3.6]} color="#b5aa8c" />
      {[-3.9, 0, 3.9].flatMap((x) =>
        [-1.45, 1.45].map((z) => (
          <Pole
            key={`${x}${z}`}
            position={[x, 1.3, z]}
            height={2.6}
            radius={0.08}
            color={C.wood}
          />
        )),
      )}
      <group position={[0, 2.6, 0]}>
        <Roof width={8.9} depth={3.8} height={1.0} />
      </group>
      <Table position={[-1.95, 0, -0.2]} width={2.8} depth={0.8} />
      <Table position={[1.95, 0, -0.2]} width={2.8} depth={0.8} />
      {/* rice sacks, greens, a stack of nón lá */}
      {[-3.0, -2.4, -1.8, -1.2].map((x, i) => (
        <Orb
          key={x}
          position={[x, 0.9, -0.2]}
          scale={[0.25, 0.18, 0.22]}
          color={i % 2 ? "#e9dfc6" : "#d9cdb0"}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <Orb
          key={i}
          position={[
            0.9 + (i % 4) * 0.55,
            0.85,
            -0.4 + Math.floor(i / 4) * 0.4,
          ]}
          scale={[0.2, 0.1, 0.16]}
          color={i % 3 ? "#5c8f3a" : "#7aa64a"}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ConicalHat key={i} position={[-0.6, 0.86 + i * 0.05, 0.1]} />
      ))}
      <Sign
        text="CHỢ LÀNG"
        position={[0, 2.35, 1.92]}
        width={1.8}
        height={0.32}
        color="#ad573e"
        ink="#fff1c9"
        fontSize={74}
      />
    </group>
  );
}

function MarketGate() {
  const [gx, gz] = L.gate;
  return (
    <group position={[gx, 0, gz]}>
      {[-1.25, 1.25].map((x) => (
        <Box
          key={x}
          position={[x, 1.1, 0]}
          size={[0.38, 2.2, 0.38]}
          color="#d9cdb0"
        />
      ))}
      <Box position={[0, 2.35, 0]} size={[3.1, 0.32, 0.5]} color="#cbbd9c" />
      <Box position={[0, 2.62, 0]} size={[3.4, 0.14, 0.7]} color={C.tile} />
      {[0.26, -0.26].map((z) => (
        <Sign
          key={z}
          text="CHỢ LÀNG"
          position={[0, 2.35, z]}
          rotation={[0, z > 0 ? 0 : Math.PI, 0]}
          width={1.6}
          height={0.24}
          color="#f1e3c0"
          ink={C.ink}
          fontSize={70}
        />
      ))}
    </group>
  );
}

/* ---------- whole map ---------- */

export function ChoQueMap({ effects, player, reducedMotion }: MapSceneProps) {
  const carrying = ["gio", "banh-trang", "ca", "trai-cay"].some((e) =>
    effects.has(e),
  );
  return (
    <DioramaMap
      chapterId="cho-que"
      ground="#ada57c"
      reducedMotion={reducedMotion}
    >
      {/* market lanes */}
      <Box position={[0, -0.02, 2.15]} size={[36, 0.04, 1.8]} color="#c6b48c" />
      <Box
        position={[L.gate[0], -0.02, 6.5]}
        size={[1.6, 0.04, 7]}
        color="#c6b48c"
      />
      <Box
        position={[-9.6, -0.02, -1.0]}
        size={[1.4, 0.04, 4.2]}
        color="#c6b48c"
      />
      <Box
        position={[9.6, -0.02, -0.6]}
        size={[1.4, 0.04, 3.4]}
        color="#c6b48c"
      />

      {/* Mẹ, her bicycle and (until Dĩ takes it) her basket */}
      <Bicycle position={[L.momBike[0], 0, L.momBike[1]]} rotation={0.5} />
      {carrying ? null : (
        <group position={[L.mom[0] + 0.6, 0, L.mom[1] - 0.2]}>
          <BasketBody />
        </group>
      )}
      {carrying ? <CarriedBasket player={player} effects={effects} /> : null}

      <BanhCanStall
        cooking={effects.has("banh-can")}
        reducedMotion={reducedMotion}
      />
      <BanhTrangCorner sold={effects.has("banh-trang")} />
      <FishCorner bought={effects.has("ca")} reducedMotion={reducedMotion} />
      <FruitCorner bought={effects.has("trai-cay")} />
      {[
        [11.9, 8.8],
        [13.6, 8.3],
      ].map(([x, z]) => (
        <Chicken key={x} position={[x, 0, z]} reducedMotion={reducedMotion} />
      ))}
      <TeaStall />
      <MarketHall />
      <MarketGate />

      {/* parked bicycles under the hall */}
      <Bicycle position={[6.6, 0, -5.0]} rotation={0.2} />
      <Bicycle position={[15.6, 0, -4.4]} rotation={-0.3} />

      {/* the village around the market */}
      {L.houses.map(([x, z]) => (
        <group key={x} position={[x, 0, z]} scale={0.9}>
          <VillageHouse position={[0, 0, 0]} />
        </group>
      ))}
      <Tree position={[-4.4, 0, -8.0]} scale={1.1} />
      <Tree position={[2.6, 0, -8.3]} scale={1.2} />
      <Tree position={[-16, 0, 9]} kind="palm" scale={1.2} />
      <Tree position={[16.2, 0, 9.2]} scale={1.2} />
      <Tree position={[-16.2, 0, -2.6]} kind="palm" scale={1.1} />
      <Bamboo position={[16.4, 0, -0.8]} scale={1.2} />
      <Bamboo position={[-7.0, 0, 9.4]} scale={1.0} />
      <Hedge from={[-17.4, -9.6]} to={[17.4, -9.6]} />
    </DioramaMap>
  );
}
