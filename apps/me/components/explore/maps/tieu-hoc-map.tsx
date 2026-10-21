"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { Villager } from "@/components/explore/villager";
import {
  Bench,
  Bicycle,
  Book,
  Bookcase,
  Box,
  Orb,
  Pole,
  Roof,
  Segment,
  Sign,
  Star,
  Tree,
} from "@/components/story/world-3d";
import {
  OAnQuan,
  Shuttlecock,
  Stall,
} from "@/components/story/world-childhood";
import { TIEU_HOC_LAYOUT as L } from "@/lib/explore/tieu-hoc";
import type { Vec2, VillagerLook } from "@/lib/explore/types";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";
import { Hedge } from "./tet-map";

const RED = "#d0342c";
const GOLD = "#f6d36b";
const WALL = "#ecd28c";

const BOY: VillagerLook = {
  shirt: "#f4f1ea",
  pants: "#2c3550",
  hair: "short",
  hairColor: "#1d1a18",
  height: 0.7,
};
const GIRL: VillagerLook = {
  shirt: "#f4f1ea",
  pants: "#2c3550",
  hair: "pigtails",
  hairColor: "#1d1a18",
  height: 0.68,
};

const LAWNS = [
  { x: -13.2, z: 6.6, w: 6.6, d: 3.8 },
  { x: 13.2, z: 6.6, w: 6.6, d: 3.8 },
  { x: -15.2, z: -1.0, w: 3.6, d: 3.0 },
];

/* ---------- pupils ---------- */

/** Red scarf (khăn quàng đỏ) sized to a Villager of the given height. */
function Scarf({
  at,
  facing = 0,
  height = 0.7,
  y = 0,
}: {
  at: Vec2;
  facing?: number;
  height?: number;
  y?: number;
}) {
  return (
    <group
      position={[at[0], y, at[1]]}
      rotation={[0, facing, 0]}
      scale={height * 1.08}
      userData={{ noCollide: true }}
    >
      <mesh position={[0, 1.62, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.045, 6, 18]} />
        <meshStandardMaterial color={RED} roughness={0.7} />
      </mesh>
      <mesh position={[0.04, 1.4, 0.25]} rotation={[0.12, 0, Math.PI - 0.15]}>
        <coneGeometry args={[0.06, 0.26, 4]} />
        <meshStandardMaterial color={RED} roughness={0.7} />
      </mesh>
      <mesh position={[-0.05, 1.42, 0.25]} rotation={[0.12, 0, Math.PI + 0.3]}>
        <coneGeometry args={[0.055, 0.22, 4]} />
        <meshStandardMaterial color={RED} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Pupil({
  at,
  facing = 0,
  look,
  player,
  reducedMotion,
}: {
  at: Vec2;
  facing?: number;
  look: VillagerLook;
  player: RefObject<THREE.Group | null>;
  reducedMotion?: boolean;
}) {
  return (
    <group>
      <Villager
        look={look}
        position={[at[0], 0, at[1]]}
        facing={facing}
        player={player}
        reducedMotion={reducedMotion}
      />
      <Scarf at={at} facing={facing} height={look.height} />
    </group>
  );
}

/* ---------- classroom (cut-away like the Tết house) ---------- */

function SchoolDesk({
  position,
  children,
}: {
  position: [number, number, number];
  children?: ReactNode;
}) {
  return (
    <group position={position}>
      <Box position={[0, 0.62, 0]} size={[1.5, 0.07, 0.55]} color="#b48a5a" />
      <Box
        position={[0, 0.42, -0.24]}
        size={[1.44, 0.36, 0.04]}
        color="#9a7348"
      />
      {[-0.68, 0.68].map((x) => (
        <Box
          key={x}
          position={[x, 0.3, 0]}
          size={[0.06, 0.6, 0.5]}
          color="#7a5636"
        />
      ))}
      {/* bench behind the desk */}
      <Box
        position={[0, 0.36, 0.55]}
        size={[1.5, 0.06, 0.28]}
        color="#b48a5a"
      />
      {[-0.65, 0.65].map((x) => (
        <Box
          key={x}
          position={[x, 0.17, 0.55]}
          size={[0.06, 0.34, 0.24]}
          color="#7a5636"
        />
      ))}
      {children}
    </group>
  );
}

function Classroom({ effects, player }: MapSceneProps) {
  const roof = useRef<THREE.Group>(null);
  const r = L.classroom;
  const cx = (r.minX + r.maxX) / 2;
  const cz = (r.backZ + r.frontZ) / 2;
  const w = r.maxX - r.minX;
  const d = r.frontZ - r.backZ;
  useFrame(() => {
    const p = player.current?.position;
    if (!roof.current || !p) return;
    // Dollhouse cut-away: lift the roof off while Dĩ is inside the classroom.
    roof.current.visible = !(
      p.x > r.minX - 0.2 &&
      p.x < r.maxX + 0.2 &&
      p.z > r.backZ - 0.2 &&
      p.z < r.frontZ + 0.4
    );
  });
  const written = effects.has("tap-viet");
  return (
    <group>
      {/* floor + walls */}
      <Box position={[cx, 0.03, cz]} size={[w, 0.06, d]} color="#c9a27a" />
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          position={[r.minX + 0.6 + i * 1.18, 0.065, cz]}
          size={[0.02, 0.01, d]}
          color="#b08a64"
        />
      ))}
      <Box
        position={[cx, 1.4, r.backZ]}
        size={[w + 0.3, 2.8, 0.3]}
        color={WALL}
      />
      {[r.minX, r.maxX].map((x) => (
        <group key={x}>
          <Box position={[x, 1.4, cz]} size={[0.3, 2.8, d]} color={WALL} />
          {[-1.1, 1.1].map((dz) => (
            <group
              key={dz}
              position={[x + (x < cx ? -0.17 : 0.17), 1.6, cz + dz]}
            >
              <Box size={[0.05, 0.9, 1.0]} color="#6b4a2e" />
              <Box size={[0.07, 0.75, 0.85]} color="#7fa3a8" />
            </group>
          ))}
        </group>
      ))}
      {/* skirting stripe */}
      <Box
        position={[cx, 0.35, r.backZ + 0.16]}
        size={[w - 0.3, 0.7, 0.02]}
        color="#c79a4e"
      />

      {/* blackboard + motto */}
      <group position={[cx, 0, r.backZ + 0.17]}>
        <Box position={[0, 1.65, 0]} size={[3.5, 1.45, 0.06]} color="#6b4a2e" />
        <Sign
          text={
            written ? "a   ă   â   b   c   d   đ" : "Thứ Hai · Bài 1: Tập viết"
          }
          position={[0, 1.65, 0.035]}
          width={3.3}
          height={1.25}
          color="#2f4a3a"
          ink="#f4f1e6"
          fontSize={written ? 150 : 96}
        />
        <Sign
          text="TIÊN HỌC LỄ · HẬU HỌC VĂN"
          position={[0, 2.6, 0.02]}
          width={3.4}
          height={0.34}
          color={RED}
          ink={GOLD}
          fontSize={62}
        />
        <Box
          position={[0, 0.88, 0.1]}
          size={[3.2, 0.05, 0.16]}
          color="#8a6a46"
        />
        <Box
          position={[0.9, 0.92, 0.1]}
          size={[0.14, 0.04, 0.04]}
          color="#f4f1e6"
        />
      </group>

      {/* teacher's desk with a vase */}
      <group position={[L.teacherDesk[0], 0, L.teacherDesk[1]]}>
        <Box position={[0, 0.74, 0]} size={[1.4, 0.08, 0.7]} color="#8a5a36" />
        <Box
          position={[0, 0.38, 0.3]}
          size={[1.36, 0.7, 0.04]}
          color="#7a4e2e"
        />
        {[-0.62, 0.62].map((x) => (
          <Box
            key={x}
            position={[x, 0.37, 0]}
            size={[0.07, 0.74, 0.62]}
            color="#6a4228"
          />
        ))}
        <mesh position={[0.4, 0.9, -0.1]}>
          <cylinderGeometry args={[0.07, 0.09, 0.24, 12]} />
          <meshStandardMaterial color="#2e6f8e" />
        </mesh>
        {[0, 1, 2].map((i) => (
          <Orb
            key={i}
            position={[0.36 + i * 0.05, 1.08 + (i % 2) * 0.06, -0.1]}
            scale={[0.06, 0.06, 0.06]}
            color={i === 1 ? "#f2a7b8" : RED}
          />
        ))}
        <Book position={[-0.3, 0.82, 0]} color="#3e6b8a" />
      </group>

      {/* pupils' desks */}
      {L.desks.map(([x, z]) => (
        <SchoolDesk key={`${x}${z}`} position={[x, 0, z]}>
          {x === L.myDesk[0] && z === L.myDesk[1] && written ? (
            <group userData={{ noCollide: true }}>
              <Book
                position={[-0.3, 0.68, 0.02]}
                open
                color="#5b8a4a"
                scale={0.8}
              />
              <Segment
                from={[0.15, 0.68, -0.05]}
                to={[0.35, 0.68, 0.12]}
                radius={0.012}
                color="#6b3fa0"
              />
            </group>
          ) : null}
          <Box
            position={[0.4, 0.27, -0.12]}
            size={[0.32, 0.2, 0.12]}
            color="#8a4a3a"
          />
        </SchoolDesk>
      ))}

      {/* roof (hidden while inside) */}
      <group ref={roof} position={[cx, 2.8, cz]}>
        <Roof width={w + 0.9} depth={d + 0.9} height={1.4} />
        <Sign
          text="LỚP 1A"
          position={[0, -0.28, d / 2 + 0.36]}
          width={1.3}
          height={0.3}
          color="#f3ead6"
          ink="#7a3b22"
          fontSize={110}
        />
      </group>
    </group>
  );
}

/* ---------- flag ceremony ---------- */

function CeremonyFlag({
  raised,
  reducedMotion,
}: {
  raised: boolean;
  reducedMotion?: boolean;
}) {
  const cloth = useRef<THREE.Group>(null);
  const height = 5.4;
  useFrame(({ clock }, delta) => {
    const c = cloth.current;
    if (!c) return;
    const target = raised ? height - 0.45 : 1.25;
    c.position.y = reducedMotion
      ? target
      : THREE.MathUtils.lerp(c.position.y, target, 1 - Math.exp(-delta * 0.7));
    if (!reducedMotion)
      c.rotation.y = raised ? Math.sin(clock.elapsedTime * 1.8) * 0.14 : 0;
  });
  return (
    <group position={[L.flagPole[0], 0, L.flagPole[1]]}>
      <Box position={[0, 0.12, 0]} size={[2.2, 0.24, 2.2]} color="#b8afa0" />
      <Box position={[0, 0.3, 0]} size={[1.3, 0.12, 1.3]} color="#cfc6b4" />
      <Pole
        position={[0, height / 2, 0]}
        height={height}
        radius={0.05}
        color="#d9d4c4"
      />
      <Orb
        position={[0, height + 0.05, 0]}
        scale={[0.09, 0.09, 0.09]}
        color={GOLD}
      />
      <group
        ref={cloth}
        position={[0.05, 1.25, 0]}
        userData={{ noCollide: true }}
      >
        <Box position={[0.6, 0, 0]} size={[1.2, 0.78, 0.025]} color={RED} />
        <Star position={[0.6, 0, 0.018]} scale={0.2} />
        <Star position={[0.6, 0, -0.018]} scale={0.2} />
      </group>
    </group>
  );
}

/* ---------- school drum ---------- */

function DrumBeats({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    ref.current?.children.forEach((child, i) => {
      const t = reducedMotion
        ? (i + 1) / 4
        : (clock.elapsedTime * 0.55 + i / 3) % 1;
      child.scale.setScalar(0.5 + t * 2.2);
      const mesh = child as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.MeshBasicMaterial
      >;
      mesh.material.opacity = 0.75 * (1 - t);
    });
  });
  return (
    <group
      ref={ref}
      position={[L.drum[0] + 0.5, 1.2, L.drum[1]]}
      rotation={[0, Math.PI / 2, 0]}
      userData={{ noCollide: true }}
    >
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <torusGeometry args={[0.5, 0.025, 6, 32]} />
          <meshBasicMaterial color="#f6d36b" transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function SchoolDrum({
  beating,
  reducedMotion,
}: {
  beating: boolean;
  reducedMotion?: boolean;
}) {
  const drum = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!drum.current) return;
    drum.current.rotation.z =
      beating && !reducedMotion ? Math.sin(clock.elapsedTime * 9) * 0.03 : 0;
  });
  return (
    <group position={[L.drum[0], 0, L.drum[1]]}>
      {/* little pavilion */}
      {[-0.8, 0.8].flatMap((x) =>
        [-0.8, 0.8].map((z) => (
          <Pole
            key={`${x}${z}`}
            position={[x, 1.15, z]}
            height={2.3}
            radius={0.07}
            color="#7a3b22"
          />
        )),
      )}
      <group position={[0, 2.3, 0]}>
        <Roof width={2.3} depth={2.2} height={0.7} />
      </group>
      <Box position={[0, 0.04, 0]} size={[2.0, 0.08, 2.0]} color="#a8a091" />
      {/* frame */}
      {[-0.55, 0.55].map((z) => (
        <Box
          key={z}
          position={[0, 0.8, z]}
          size={[0.12, 1.6, 0.12]}
          color="#5a3a24"
        />
      ))}
      <Box position={[0, 1.66, 0]} size={[0.14, 0.12, 1.3]} color="#5a3a24" />
      <group ref={drum} position={[0, 1.15, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.8, 22]} />
          <meshStandardMaterial color="#9b3b25" roughness={0.6} />
        </mesh>
        {[-0.41, 0.41].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.47, 0.47, 0.04, 22]} />
            <meshStandardMaterial color="#e8d3a4" roughness={0.9} />
          </mesh>
        ))}
        {[-0.25, 0.25].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.46, 0.02, 6, 24]} />
            <meshStandardMaterial color={GOLD} metalness={0.4} />
          </mesh>
        ))}
      </group>
      <Segment
        from={[0.7, 0.9, 0.3]}
        to={[0.62, 0.15, 0.55]}
        radius={0.03}
        color="#c9a46a"
      />
      {beating ? <DrumBeats reducedMotion={reducedMotion} /> : null}
    </group>
  );
}

/* ---------- recess ---------- */

function JumpRope({
  player,
  reducedMotion,
}: {
  player: RefObject<THREE.Group | null>;
  reducedMotion?: boolean;
}) {
  const rope = useRef<THREE.Group>(null);
  const jumper = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime * 5;
    if (rope.current) rope.current.rotation.x = t;
    if (jumper.current)
      jumper.current.position.y = Math.abs(Math.sin(t / 2)) * 0.28;
  });
  const [x, z] = L.jumpRope;
  return (
    <group>
      <Pupil
        at={[x - 1.15, z]}
        facing={Math.PI / 2}
        look={BOY}
        player={player}
        reducedMotion={reducedMotion}
      />
      <Pupil
        at={[x + 1.15, z]}
        facing={-Math.PI / 2}
        look={GIRL}
        player={player}
        reducedMotion={reducedMotion}
      />
      <group ref={jumper}>
        <Pupil
          at={[x, z]}
          look={{ ...GIRL, hair: "bun" }}
          player={player}
          reducedMotion={reducedMotion}
        />
      </group>
      <group ref={rope} position={[x, 0.78, z]} userData={{ noCollide: true }}>
        <group scale={[1, 0.72, 0.72]}>
          <mesh>
            <torusGeometry args={[0.92, 0.018, 6, 28, Math.PI]} />
            <meshStandardMaterial color="#e86a33" />
          </mesh>
        </group>
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
      <Box position={[0, 0.25, 0]} size={[w, 0.5, 0.26]} color="#e2d6b8" />
      <Box position={[0, 0.82, 0]} size={[w, 0.08, 0.1]} color="#3e6b8a" />
      <Box position={[0, 1.12, 0]} size={[w, 0.08, 0.1]} color="#3e6b8a" />
      {Array.from({ length: posts + 1 }, (_, i) => (
        <Box
          key={i}
          position={[-w / 2 + (i * w) / posts, 0.7, 0]}
          size={[0.22, 1.4, 0.3]}
          color="#e2d6b8"
        />
      ))}
    </group>
  );
}

export function TieuHocMap({ effects, player, reducedMotion }: MapSceneProps) {
  const ceremony = effects.has("chao-co");
  const recess = effects.has("trong");
  return (
    <DioramaMap
      chapterId="tieu-hoc"
      ground="#cdbb92"
      reducedMotion={reducedMotion}
    >
      {/* yard surfaces */}
      <Box position={[0, -0.04, 2.15]} size={[34, 0.04, 1.6]} color="#c6b48c" />
      <Box
        position={[12.4, -0.04, -5.6]}
        size={[7.4, 0.04, 5.2]}
        color="#d6c7a2"
      />
      <Box position={[0, -0.04, 9.6]} size={[40, 0.04, 2.6]} color="#a99f88" />
      {LAWNS.map(({ x, z, w, d }) => (
        <Box
          key={`${x}${z}`}
          position={[x, -0.035, z]}
          size={[w, 0.04, d]}
          color="#9aae6c"
        />
      ))}

      <Classroom
        effects={effects}
        player={player}
        reducedMotion={reducedMotion}
      />
      <SchoolDrum beating={recess} reducedMotion={reducedMotion} />

      {/* Monday flag ceremony */}
      <CeremonyFlag raised={ceremony} reducedMotion={reducedMotion} />
      <Scarf at={L.flagTeacher} facing={0.6} height={1} />
      {ceremony
        ? L.lineup.map((at, i) => (
            <Pupil
              key={i}
              at={at}
              facing={Math.PI}
              look={i % 2 ? GIRL : BOY}
              player={player}
              reducedMotion={reducedMotion}
            />
          ))
        : null}

      {/* recess corner */}
      <Scarf at={L.friend} facing={0.9} height={0.68} />
      <group position={[L.oAnQuan[0], 0, L.oAnQuan[1]]} scale={0.9}>
        <OAnQuan position={[0, 0, 0]} />
      </group>
      {effects.has("da-cau") ? (
        <group userData={{ noCollide: true }}>
          <Shuttlecock
            position={[L.friend[0] + 0.55, 0.55, L.friend[1] + 0.3]}
            reducedMotion={reducedMotion}
          />
        </group>
      ) : null}
      {recess ? (
        <JumpRope player={player} reducedMotion={reducedMotion} />
      ) : null}

      {/* reading corner under the banyan */}
      <Tree position={[15.4, 0, -0.6]} kind="banyan" scale={1.25} />
      <group position={[L.shelf[0], 0, L.shelf[1]]}>
        <Bookcase width={1.4} height={1.4} />
        <Sign
          text="TỦ SÁCH LỚP EM"
          position={[0, 1.62, 0.02]}
          width={1.4}
          height={0.24}
          color="#3e6b8a"
          ink="#fff1c9"
          fontSize={90}
        />
      </group>
      <Bench position={[L.readingBench[0], 0, L.readingBench[1]]} />
      {effects.has("truyen") ? (
        <group userData={{ noCollide: true }}>
          <Book
            position={[L.readingBench[0] - 0.2, 0.56, L.readingBench[1]]}
            open
            color="#d6342b"
            scale={0.8}
          />
          {[0, 1, 2].map((i) => (
            <Orb
              key={i}
              position={[
                L.readingBench[0] - 0.2 + (i - 1) * 0.25,
                1.0 + i * 0.18,
                L.readingBench[1],
              ]}
              scale={[0.05, 0.05, 0.05]}
              color={GOLD}
            />
          ))}
        </group>
      ) : null}

      {/* gate, fence and the road outside */}
      <Fence from={-17.4} to={-2.3} z={L.gateZ} />
      <Fence from={2.3} to={17.4} z={L.gateZ} />
      <group position={[0, 0, L.gateZ]}>
        {[-2.05, 2.05].map((x) => (
          <Box
            key={x}
            position={[x, 1.4, 0]}
            size={[0.5, 2.8, 0.5]}
            color="#e2d6b8"
          />
        ))}
        <Box position={[0, 2.95, 0]} size={[4.7, 0.5, 0.4]} color="#3e6b8a" />
        <Sign
          text="TRƯỜNG TIỂU HỌC SỐ 1 CÁT NHƠN"
          position={[0, 2.95, 0.21]}
          width={4.5}
          height={0.4}
          color="#3e6b8a"
          ink="#fff1c9"
          fontSize={64}
        />
      </group>
      <Bicycle position={[L.momBike[0], 0, L.momBike[1]]} rotation={0.1} />
      <Stall
        position={[L.stall[0], 0, L.stall[1]]}
        awning={["#e86a8a", "#f3ead8"]}
        goods="fruit"
      />
      <Sign
        text="QUÀ VẶT"
        position={[L.stall[0], 2.35, L.stall[1] + 0.55]}
        width={1.2}
        height={0.26}
        color="#e86a8a"
        ink="#fff8e6"
        fontSize={110}
      />

      {/* shade trees, benches, hedges */}
      <Tree position={[-7.4, 0, 6.6]} scale={1.2} blossom />
      <Bench position={[-6.0, 0, 7.4]} />
      <Tree position={[6.8, 0, -3.6]} scale={1.15} blossom />
      <Tree position={[-16.2, 0, -1.2]} scale={1.1} />
      <Tree position={[16, 0, 6.6]} kind="palm" scale={1.15} />
      <Tree position={[-16.3, 0, 5.4]} kind="palm" scale={1.1} />
      <Tree position={[5.6, 0, -8.2]} scale={1.05} />
      <Bench position={[13.0, 0, 6.4]} rotation={-0.2} />
      <Hedge from={[-17.4, -9.6]} to={[17.4, -9.6]} />
      <Hedge from={[-17.4, -9.6]} to={[-17.4, 8.0]} />
      <Hedge from={[17.4, -9.6]} to={[17.4, 8.0]} />
    </DioramaMap>
  );
}
