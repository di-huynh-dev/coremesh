"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { Villager } from "@/components/explore/villager";
import {
  Bench,
  Bicycle,
  Book,
  Bookcase,
  Box,
  C,
  DeskLamp,
  Orb,
  Pole,
  Roof,
  Segment,
  Sign,
  Tree,
} from "@/components/story/world-3d";
import { Stall, Table } from "@/components/story/world-childhood";
import { THCS_LAYOUT as L } from "@/lib/explore/thcs";
import type { VillagerLook } from "@/lib/explore/types";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";
import { Hedge } from "./tet-map";

const WALL = "#e3d2a8";
const TRIM = "#3e6b8a";

const LAWNS = [
  { x: -13.0, z: 6.0, w: 7.6, d: 4.4 },
  { x: -15.2, z: 0.4, w: 3.6, d: 4.0 },
  { x: 2.0, z: 6.4, w: 5.0, d: 2.6 },
];

const KEEPER: VillagerLook = {
  shirt: "#e6b33a",
  pants: "#2c3550",
  hair: "short",
  hairColor: "#1d1a18",
  height: 0.88,
};
const STUDENT: VillagerLook = {
  shirt: "#f4f1ea",
  pants: "#2c3550",
  hair: "short",
  hairColor: "#1d1a18",
  height: 0.87,
};

/* ---------- library (cut-away like the Tết house) ---------- */

function Stool({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.18, 0.2, 0.46, 12]} />
      <meshStandardMaterial color="#8a6a46" roughness={0.9} />
    </mesh>
  );
}

function Library({ effects, player }: MapSceneProps) {
  const roof = useRef<THREE.Group>(null);
  const r = L.library;
  const cx = (r.minX + r.maxX) / 2;
  const cz = (r.backZ + r.frontZ) / 2;
  const w = r.maxX - r.minX;
  const d = r.frontZ - r.backZ;
  useFrame(() => {
    const p = player.current?.position;
    if (!roof.current || !p) return;
    // Dollhouse cut-away: lift the roof off while Dĩ is inside the library.
    roof.current.visible = !(
      p.x > r.minX - 0.2 &&
      p.x < r.maxX + 0.2 &&
      p.z > r.backZ - 0.2 &&
      p.z < r.frontZ + 0.4
    );
  });
  const borrowed = effects.has("sach");
  return (
    <group>
      <Box position={[cx, 0.03, cz]} size={[w, 0.06, d]} color="#b98f68" />
      {Array.from({ length: 5 }, (_, i) => (
        <Box
          key={i}
          position={[cx, 0.065, r.backZ + 0.9 + i * 1.1]}
          size={[w, 0.01, 0.02]}
          color="#a07a56"
        />
      ))}
      {/* rug */}
      <Box
        position={[cx, 0.07, -5.4]}
        size={[2.2, 0.01, 2.6]}
        color="#a8473a"
      />
      <Box
        position={[cx, 0.075, -5.4]}
        size={[1.9, 0.01, 2.3]}
        color="#c7754b"
      />

      <Box
        position={[cx, 1.45, r.backZ]}
        size={[w + 0.3, 2.9, 0.3]}
        color={WALL}
      />
      {[r.minX, r.maxX].map((x) => (
        <group key={x}>
          <Box position={[x, 1.45, cz]} size={[0.3, 2.9, d]} color={WALL} />
          <Box
            position={[x + (x < cx ? -0.17 : 0.17), 1.7, cz + 0.8]}
            size={[0.06, 0.9, 1.4]}
            color="#7fa3a8"
          />
        </group>
      ))}
      <Sign
        text="ĐỌC SÁCH · MỞ RỘNG CHÂN TRỜI"
        position={[cx, 2.45, r.backZ + 0.16]}
        width={3.8}
        height={0.34}
        color={TRIM}
        ink="#fff1c9"
        fontSize={60}
      />

      {/* shelves */}
      {[-14.3, -12.85, -11.4, -9.95].map((x) => (
        <group key={x} position={[x, 0, r.backZ + 0.36]}>
          <Bookcase width={1.4} height={1.8} />
        </group>
      ))}
      {[-6.6, -4.7].map((z) => (
        <group
          key={z}
          position={[r.minX + 0.36, 0, z]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <Bookcase width={1.5} height={1.6} />
        </group>
      ))}

      {/* lending counter */}
      <group position={[L.counter[0], 0, L.counter[1]]}>
        <Box position={[0, 0.45, 0]} size={[2.0, 0.9, 0.6]} color="#8a5a36" />
        <Box position={[0, 0.93, 0]} size={[2.1, 0.06, 0.7]} color="#b48a5a" />
        <Book position={[-0.5, 1.0, 0.05]} open color="#3e6b8a" scale={0.8} />
        <DeskLamp position={[0.7, 0.96, -0.1]} />
        {borrowed ? null : (
          <group>
            <Book position={[0.15, 1.0, 0.05]} color="#c0392b" scale={0.7} />
            <Book position={[0.15, 1.06, 0.05]} color="#5b8a4a" scale={0.65} />
          </group>
        )}
      </group>

      {/* reading tables */}
      {[L.readingTable, L.readingTable2].map(([x, z]) => (
        <group key={x}>
          <Table position={[x, 0, z]} width={1.4} depth={0.8} />
          {[-0.4, 0.4].map((dx) => (
            <Stool key={dx} position={[x + dx, 0.23, z + 0.7]} />
          ))}
        </group>
      ))}
      <Book
        position={[L.readingTable2[0] - 0.3, 0.8, L.readingTable2[1]]}
        open
        color="#b4a16a"
        scale={0.75}
      />
      {borrowed ? (
        <group userData={{ noCollide: true }}>
          <Book
            position={[L.readingTable[0] - 0.25, 0.8, L.readingTable[1] + 0.05]}
            open
            color="#2e3f6e"
            scale={0.8}
          />
          <Book
            position={[L.readingTable[0] + 0.4, 0.8, L.readingTable[1] - 0.1]}
            color="#c0392b"
            scale={0.7}
          />
          <Book
            position={[L.readingTable[0] + 0.4, 0.86, L.readingTable[1] - 0.1]}
            color="#5b8a4a"
            scale={0.65}
          />
          {/* little stars for the space book */}
          {[0, 1, 2, 3].map((i) => (
            <Orb
              key={i}
              position={[
                L.readingTable[0] - 0.25 + Math.cos(i * 1.6) * 0.3,
                1.15 + i * 0.12,
                L.readingTable[1] + Math.sin(i * 1.6) * 0.2,
              ]}
              scale={[0.04, 0.04, 0.04]}
              color="#f6d36b"
            />
          ))}
        </group>
      ) : null}

      {/* roof (hidden while inside) */}
      <group ref={roof} position={[cx, 2.9, cz]}>
        <Roof width={w + 0.9} depth={d + 0.9} height={1.4} />
        <Sign
          text="THƯ VIỆN"
          position={[0, -0.3, d / 2 + 0.36]}
          width={1.8}
          height={0.34}
          color={TRIM}
          ink="#fff1c9"
          fontSize={110}
        />
      </group>
    </group>
  );
}

/* ---------- bike shed ---------- */

function BikeShed({ parked }: { parked: boolean }) {
  const s = L.shed;
  const cx = (s.minX + s.maxX) / 2;
  const cz = (s.frontZ + s.backZ) / 2;
  const w = s.maxX - s.minX;
  return (
    <group>
      <Box
        position={[cx, -0.03, cz]}
        size={[w + 0.4, 0.04, s.backZ - s.frontZ + 0.6]}
        color="#a8a091"
      />
      {[s.minX, 10.0, 12.8, s.maxX].flatMap((x) =>
        [s.frontZ, s.backZ].map((z) => (
          <Pole
            key={`${x}${z}`}
            position={[x, z === s.frontZ ? 1.25 : 1.05, z]}
            height={z === s.frontZ ? 2.5 : 2.1}
            radius={0.06}
            color="#6b7b80"
          />
        )),
      )}
      <Box
        position={[cx, 2.35, cz]}
        size={[w + 0.6, 0.06, s.backZ - s.frontZ + 0.8]}
        rotation={[-0.14, 0, 0]}
        color="#5f8a8a"
      />
      <Sign
        text="NHÀ XE HỌC SINH"
        position={[cx, 2.15, s.frontZ - 0.42]}
        width={2.4}
        height={0.3}
        color={TRIM}
        ink="#fff1c9"
        fontSize={80}
      />
      {L.bikes.map((x) => (
        <Bicycle
          key={x}
          position={[x, 0, L.mySlot[1]]}
          rotation={Math.PI / 2}
        />
      ))}
      {parked ? (
        <group position={[L.mySlot[0], 0, L.mySlot[1]]}>
          <Bicycle rotation={Math.PI / 2} />
          <Orb
            position={[0, 1.1, -0.36]}
            scale={[0.06, 0.06, 0.06]}
            color="#d6342b"
          />
          <Box
            position={[0, 0.95, 0.6]}
            size={[0.32, 0.22, 0.24]}
            color="#3e6b8a"
          />
        </group>
      ) : null}
    </group>
  );
}

/* ---------- football field ---------- */

function Goal({ x, facing }: { x: number; facing: 1 | -1 }) {
  const z = L.goal[1];
  return (
    <group position={[x, 0, z]}>
      {[-1, 1].map((s) => (
        <Pole
          key={s}
          position={[0, 0.65, s * 1.0]}
          height={1.3}
          radius={0.05}
          color="#f4f1ea"
        />
      ))}
      <Segment
        from={[0, 1.3, -1.0]}
        to={[0, 1.3, 1.0]}
        radius={0.05}
        color="#f4f1ea"
      />
      <mesh position={[facing * 0.45, 0.65, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.0, 1.3, 8, 5]} />
        <meshBasicMaterial color="#f4f1ea" wireframe />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[facing * 0.22, 0.65, s * 1.0]}
          userData={{ noCollide: true }}
        >
          <planeGeometry args={[0.45, 1.3, 3, 5]} />
          <meshBasicMaterial
            color="#f4f1ea"
            wireframe
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function Ball({
  scored,
  reducedMotion,
}: {
  scored: boolean;
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, delta) => {
    const b = ref.current;
    if (!b) return;
    const tx = scored ? L.goal[0] + 0.2 : L.striker[0] + 0.6;
    const tz = scored ? L.goal[1] + 0.3 : L.striker[1] - 0.1;
    if (reducedMotion) {
      b.position.set(tx, 0.16, tz);
      return;
    }
    const k = 1 - Math.exp(-delta * 1.6);
    b.position.x = THREE.MathUtils.lerp(b.position.x, tx, k);
    b.position.z = THREE.MathUtils.lerp(b.position.z, tz, k);
    b.rotation.z -= delta * Math.abs(tx - b.position.x) * 4;
    b.position.y =
      0.16 + (scored ? 0 : Math.abs(Math.sin(clock.elapsedTime * 2)) * 0.05);
  });
  return (
    <mesh
      ref={ref}
      position={[L.striker[0] + 0.6, 0.16, L.striker[1] - 0.1]}
      castShadow
    >
      <icosahedronGeometry args={[0.16, 1]} />
      <meshStandardMaterial color="#f4f1ea" flatShading roughness={0.6} />
    </mesh>
  );
}

function Field({
  scored,
  reducedMotion,
}: {
  scored: boolean;
  reducedMotion?: boolean;
}) {
  const f = L.field;
  const cx = (f.minX + f.maxX) / 2;
  const cz = (f.minZ + f.maxZ) / 2;
  const w = f.maxX - f.minX;
  const d = f.maxZ - f.minZ;
  return (
    <group>
      <Box position={[cx, -0.035, cz]} size={[w, 0.04, d]} color="#7fa35a" />
      {[0, 2, 4].map((i) => (
        <Box
          key={i}
          position={[f.minX + (i + 0.5) * (w / 6), -0.03, cz]}
          size={[w / 6, 0.04, d]}
          color="#8bb066"
        />
      ))}
      {/* chalk lines */}
      <group position={[cx, -0.008, cz]}>
        {[-1, 1].map((s) => (
          <Box
            key={`x${s}`}
            position={[0, 0, (s * (d - 0.4)) / 2]}
            size={[w - 0.4, 0.01, 0.06]}
            color="#f4f1ea"
          />
        ))}
        {[-1, 0, 1].map((s) => (
          <Box
            key={`z${s}`}
            position={[(s * (w - 0.4)) / 2, 0, 0]}
            size={[0.06, 0.01, d - 0.4]}
            color="#f4f1ea"
          />
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.07, 32]} />
          <meshBasicMaterial color="#f4f1ea" />
        </mesh>
      </group>
      <Goal x={L.goal[0]} facing={1} />
      <Goal x={f.minX + 0.5} facing={-1} />
      <Villager
        look={KEEPER}
        position={[L.goal[0] - 0.9, 0, L.goal[1] - 0.4]}
        facing={-Math.PI / 2 + (scored ? 0.6 : 0)}
        reducedMotion={reducedMotion}
      />
      <Ball scored={scored} reducedMotion={reducedMotion} />
    </group>
  );
}

/* ---------- study group corner ---------- */

function StudyCorner({
  solved,
  reducedMotion,
}: {
  solved: boolean;
  reducedMotion?: boolean;
}) {
  const [tx, tz] = L.groupTable;
  return (
    <group>
      <Tree position={[-13.8, 0, 3.4]} scale={1.35} />
      <mesh position={[tx, 0.36, tz]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 0.72, 12]} />
        <meshStandardMaterial color="#9a958a" roughness={1} />
      </mesh>
      <mesh position={[tx, 0.75, tz]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.62, 0.08, 24]} />
        <meshStandardMaterial color="#b9b3a3" roughness={0.9} />
      </mesh>
      <Book
        position={[tx - 0.2, 0.83, tz - 0.15]}
        open
        color="#6c8380"
        scale={0.7}
      />
      <Book position={[tx + 0.3, 0.83, tz + 0.2]} color="#b4a16a" scale={0.6} />
      <Villager
        look={STUDENT}
        position={[L.groupMate2[0], 0, L.groupMate2[1]]}
        pose="sit"
        reducedMotion={reducedMotion}
      />
      {solved ? (
        <Sign
          text="Bài 4: giải xong!"
          position={[tx + 0.05, 0.8, tz + 0.25]}
          rotation={[-Math.PI / 2, 0, 0]}
          width={0.62}
          height={0.3}
          color="#fbf6e6"
          ink="#c0392b"
          fontSize={130}
        />
      ) : null}

      {/* little chalkboard easel */}
      <group position={[L.easel[0], 0, L.easel[1]]} rotation={[0, -0.45, 0]}>
        {[-0.55, 0.55].map((x) => (
          <Segment
            key={x}
            from={[x, 0, 0.2]}
            to={[x * 0.85, 1.85, 0]}
            radius={0.035}
          />
        ))}
        <Segment from={[0, 1.7, -0.02]} to={[0, 0, -0.55]} radius={0.03} />
        <Box
          position={[0, 1.25, 0.06]}
          size={[1.25, 0.95, 0.05]}
          color={C.wood}
        />
        <Sign
          text="NHÓM HỌC · TOÁN"
          position={[0, 1.5, 0.09]}
          width={1.1}
          height={0.3}
          color="#2f4a3a"
          ink="#f4f1e6"
          fontSize={86}
        />
        <Sign
          text={solved ? "x = 12 · đúng rồi!" : "Bài 4: tìm x = ?"}
          position={[0, 1.1, 0.09]}
          width={1.1}
          height={0.5}
          color="#2f4a3a"
          ink={solved ? "#f6d36b" : "#f4f1e6"}
          fontSize={92}
        />
      </group>
    </group>
  );
}

/* ---------- gate + fence ---------- */

function Fence({ from, to, z }: { from: number; to: number; z: number }) {
  const w = to - from;
  const posts = Math.max(2, Math.round(w / 1.6));
  return (
    <group position={[(from + to) / 2, 0, z]}>
      <Box position={[0, 0.25, 0]} size={[w, 0.5, 0.26]} color="#d9cdb0" />
      <Box position={[0, 0.82, 0]} size={[w, 0.08, 0.1]} color={TRIM} />
      <Box position={[0, 1.12, 0]} size={[w, 0.08, 0.1]} color={TRIM} />
      {Array.from({ length: posts + 1 }, (_, i) => (
        <Box
          key={i}
          position={[-w / 2 + (i * w) / posts, 0.7, 0]}
          size={[0.22, 1.4, 0.3]}
          color="#d9cdb0"
        />
      ))}
    </group>
  );
}

export function ThcsMap({ effects, player, reducedMotion }: MapSceneProps) {
  return (
    <DioramaMap chapterId="thcs" ground="#c4bc98" reducedMotion={reducedMotion}>
      {/* yard surfaces */}
      <Box position={[0, -0.04, 2.15]} size={[34, 0.04, 1.6]} color="#c6b48c" />
      <Box position={[0, -0.04, 9.6]} size={[40, 0.04, 2.6]} color="#a99f88" />
      {LAWNS.map(({ x, z, w, d }) => (
        <Box
          key={`${x}${z}`}
          position={[x, -0.035, z]}
          size={[w, 0.04, d]}
          color="#9aae6c"
        />
      ))}

      <Library
        effects={effects}
        player={player}
        reducedMotion={reducedMotion}
      />
      <BikeShed parked={effects.has("xe")} />
      <Field scored={effects.has("ghi-ban")} reducedMotion={reducedMotion} />
      <StudyCorner solved={effects.has("nhom")} reducedMotion={reducedMotion} />

      {/* notice board */}
      <group position={[L.noticeBoard[0], 0, L.noticeBoard[1]]}>
        {[-0.85, 0.85].map((x) => (
          <Pole
            key={x}
            position={[x, 0.9, -0.05]}
            height={1.8}
            radius={0.05}
            color={C.wood}
          />
        ))}
        <Box
          position={[0, 1.3, -0.05]}
          size={[1.9, 1.0, 0.06]}
          color="#c49a6c"
        />
        <Sign
          text="BẢNG TIN"
          position={[0, 1.66, -0.01]}
          width={1.0}
          height={0.2}
          color={TRIM}
          ink="#fff1c9"
          fontSize={110}
        />
        {[
          { x: -0.5, c: "#f4f1ea" },
          { x: 0.05, c: "#f6e3a1" },
          { x: 0.55, c: "#d9ecd0" },
        ].map(({ x, c }) => (
          <Box
            key={x}
            position={[x, 1.2, -0.01]}
            size={[0.42, 0.55, 0.01]}
            color={c}
          />
        ))}
      </group>

      {/* canteen */}
      <group
        position={[L.canteen[0], 0, L.canteen[1]]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <Stall
          position={[0, 0, 0]}
          awning={["#2e6f8e", "#f3ead8"]}
          goods="fruit"
        />
        <Sign
          text="CĂNG TIN"
          position={[0, 2.35, 0.55]}
          width={1.2}
          height={0.26}
          color="#2e6f8e"
          ink="#fff8e6"
          fontSize={110}
        />
      </group>

      {/* gate, fence and the village road */}
      <Fence from={-17.4} to={-2.3} z={L.gateZ} />
      <Fence from={2.3} to={17.4} z={L.gateZ} />
      <group position={[0, 0, L.gateZ]}>
        {[-2.05, 2.05].map((x) => (
          <Box
            key={x}
            position={[x, 1.45, 0]}
            size={[0.55, 2.9, 0.55]}
            color="#d9cdb0"
          />
        ))}
        <Box position={[0, 3.05, 0]} size={[4.8, 0.5, 0.42]} color={TRIM} />
        <Sign
          text="TRƯỜNG THCS CÁT NHƠN"
          position={[0, 3.05, 0.22]}
          width={4.5}
          height={0.4}
          color={TRIM}
          ink="#fff1c9"
          fontSize={70}
        />
      </group>
      <Bicycle
        position={[L.neighborBike[0], 0, L.neighborBike[1]]}
        rotation={-0.15}
      />

      {/* trees, benches, hedges */}
      <Tree position={[6.4, 0, 6.9]} scale={1.2} />
      <Bench position={[5.0, 0, 6.6]} rotation={0.1} />
      <Tree position={[-6.6, 0, -6.6]} scale={1.2} blossom />
      <Bench position={[-6.6, 0, -5.2]} />
      <Tree position={[6.2, 0, -7.6]} kind="banyan" scale={1.15} />
      <Tree position={[16.2, 0, 1.0]} kind="palm" scale={1.1} />
      <Tree position={[-16.3, 0, 6.6]} kind="palm" scale={1.1} />
      <Tree position={[-6.8, 0, -1.6]} scale={0.95} />
      <Hedge from={[-17.4, -9.6]} to={[17.4, -9.6]} />
      <Hedge from={[-17.4, -9.6]} to={[-17.4, 8.0]} />
      <Hedge from={[17.4, -9.6]} to={[17.4, 8.0]} />
    </DioramaMap>
  );
}
