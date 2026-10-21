"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  Box,
  Chair,
  Coffee,
  Laptop,
  Monitor,
  Orb,
  Pole,
  Pot,
  Sign,
  type Vec3,
} from "@/components/story/world-3d";
import { HIEN_TAI_LAYOUT as L } from "@/lib/explore/hien-tai";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CityBackdrop,
  FloatingTag,
  Glass,
  HideWhenInside,
  Panel,
  PopIn,
  RoundTable,
  ScreenStand,
  Sofa,
  StickyNote,
  Stool,
  StringLights,
  WindowWall,
} from "./amit-map";
import { DioramaMap } from "./diorama-map";
import type { MapSceneProps } from "./registry";

const WALL = "#dfe3e0";
const NAVY = "#1f3b4d";
const TEAL = "#2f8f83";
const SCREEN = "#13212a";
const GREEN = "#2fbf71";
const RED = "#e5484d";
const AMBER = "#f29e3d";
const NOTE_COLORS = ["#f2d36b", "#f2a7b8", "#9cc3d5", "#b9dca0", "#f6b26b"];

/* ---------- building ---------- */

function Shell() {
  return (
    <group>
      <Box position={[0, -0.05, 0.1]} size={[34.8, 0.03, 19.4]} color="#cdd2ce" />
      <WindowWall x1={-17.4} x2={L.core.minX} z={-9.35} wall={WALL} frame={NAVY} />
      <WindowWall x1={L.core.maxX} x2={17.4} z={-9.35} wall={WALL} frame={NAVY} />
      <Box position={[-17.35, 1.67, 0.05]} size={[0.3, 3.34, 19.1]} color={WALL} />
      <Box position={[17.35, 1.67, -2.95]} size={[0.3, 3.34, 12.8]} color={WALL} />
      <Box position={[0, 0.0, 9.65]} size={[34.8, 0.05, 0.12]} color="#56646a" />
    </group>
  );
}

function Core() {
  const c = L.core;
  const w = c.maxX - c.minX;
  const d = c.maxZ - c.minZ;
  const cz = (c.minZ + c.maxZ) / 2;
  return (
    <group>
      <Box position={[0, 1.9, cz]} size={[w, 3.8, d]} color="#3b4a52" />
      <Box position={[0, 3.85, cz]} size={[w + 0.2, 0.12, d + 0.2]} color="#2b363c" />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.02), 0, -6.6]}>
          <Box position={[0, 1.2, 0]} size={[0.04, 2.4, 1.7]} color="#26323a" />
          {[-0.4, 0.4].map((z) => (
            <Box
              key={z}
              position={[s * 0.015, 1.15, z]}
              size={[0.03, 2.2, 0.74]}
              color="#a9b4b8"
              metalness={0.5}
            />
          ))}
          <Sign
            text="THANG MÁY"
            position={[s * 0.04, 2.75, 0]}
            rotation={[0, (s * Math.PI) / 2, 0]}
            width={1.3}
            height={0.28}
            color={NAVY}
            ink="#bfeee6"
            fontSize={84}
          />
          <mesh position={[s * 0.04, 1.9, 1.4]} rotation={[0, (s * Math.PI) / 2, 0]}>
            <planeGeometry args={[0.08, 3.0]} />
            <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={1.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- meeting room + PageSpeed ---------- */

function ScoreRing({
  score,
  color,
  position,
}: {
  score: number;
  color: string;
  position: Vec3;
}) {
  const len = (score / 100) * Math.PI * 2;
  return (
    <group position={position}>
      <mesh>
        <ringGeometry args={[0.4, 0.52, 48]} />
        <meshStandardMaterial color="#24333b" />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <ringGeometry args={[0.4, 0.52, 48, 1, Math.PI / 2 - len, len]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <Sign
        text={String(score)}
        position={[0, 0, 0.01]}
        width={0.62}
        height={0.38}
        color={SCREEN}
        ink={color}
        fontSize={380}
      />
    </group>
  );
}

function PageSpeedTV({
  good,
  reducedMotion,
}: {
  good: boolean;
  reducedMotion?: boolean;
}) {
  const metrics = ["LCP", "FCP", "CLS"];
  const before = [0.3, 0.42, 0.36];
  const after = [0.95, 0.97, 0.98];
  const content = (
    <group>
      <ScoreRing
        position={[-0.85, -0.06, 0]}
        score={good ? 98 : 30}
        color={good ? GREEN : RED}
      />
      {metrics.map((m, i) => {
        const v = good ? after[i]! : before[i]!;
        const y = 0.3 - i * 0.3;
        return (
          <group key={m}>
            <Sign
              text={m}
              position={[0.22, y, 0]}
              width={0.4}
              height={0.16}
              color={SCREEN}
              ink="#cfe3ea"
              fontSize={90}
            />
            <Box position={[1.0, y, 0]} size={[1.1, 0.1, 0.01]} color="#24333b" />
            <Box
              position={[0.45 + (1.1 * v) / 2, y, 0.006]}
              size={[1.1 * v, 0.1, 0.01]}
              color={good ? GREEN : i === 1 ? AMBER : RED}
            />
          </group>
        );
      })}
      <Sign
        text={good ? "SSR · ISR · 98+" : "CẦN TỐI ƯU"}
        position={[0.8, -0.62, 0]}
        width={1.4}
        height={0.18}
        color={SCREEN}
        ink={good ? GREEN : AMBER}
        fontSize={86}
      />
    </group>
  );
  return (
    <group position={[L.tv[0], 0, L.tv[1]]}>
      <Box position={[0, 1.95, -0.02]} size={[3.6, 2.0, 0.08]} color="#1b2328" />
      <Panel position={[0, 1.95, 0.025]} size={[3.44, 1.84]} color={SCREEN} glow={0.3} />
      <group position={[0, 1.95, 0.035]}>
        <Sign
          text="PAGESPEED INSIGHTS"
          position={[0, 0.72, 0]}
          width={2.4}
          height={0.22}
          color={SCREEN}
          ink="#cfe3ea"
          fontSize={80}
        />
        <Sign
          text="ĐIỂM HIỆU NĂNG"
          position={[-0.85, -0.7, 0]}
          width={0.9}
          height={0.13}
          color={SCREEN}
          ink="#8fa3ab"
          fontSize={80}
        />
        {good ? (
          <PopIn key="good" reducedMotion={reducedMotion}>
            {content}
          </PopIn>
        ) : (
          content
        )}
      </group>
    </group>
  );
}

function MeetingRoom({ effects, player, reducedMotion }: MapSceneProps) {
  const m = L.meeting;
  const cx = (m.minX + m.maxX) / 2;
  const cz = (m.minZ + m.maxZ) / 2;
  const w = m.maxX - m.minX;
  const d = m.maxZ - m.minZ;
  const leftLen = m.doorMinX - m.minX;
  const rightLen = m.maxX - m.doorMaxX;
  const [tx, tz] = L.meetingTable;
  return (
    <group>
      <Box position={[cx, 0.0, cz]} size={[w, 0.03, d]} color="#aeb9bd" />
      <Glass position={[m.minX + leftLen / 2, 1.3, m.maxZ]} size={[leftLen, 2.6, 0.06]} />
      <Glass position={[m.doorMaxX + rightLen / 2, 1.3, m.maxZ]} size={[rightLen, 2.6, 0.06]} />
      <Glass position={[m.maxX, 1.3, cz]} size={[0.06, 2.6, d]} />
      {[m.minX + 1.0, m.doorMinX, m.doorMaxX, m.maxX].map((x) => (
        <Box key={x} position={[x, 1.32, m.maxZ]} size={[0.08, 2.64, 0.1]} color={NAVY} />
      ))}
      {[-7.0, -4.6].map((z) => (
        <Box key={z} position={[m.maxX, 1.32, z]} size={[0.1, 2.64, 0.08]} color={NAVY} />
      ))}

      {/* table + chairs */}
      <group position={[tx, 0, tz]}>
        <Box position={[0, 0.8, 0]} size={[2.6, 0.06, 1.25]} color="#eef0ee" />
        <Box position={[0, 0.4, 0]} size={[0.5, 0.8, 0.5]} color="#2b3238" />
        <Laptop position={[-0.5, 0.83, -0.05]} scale={0.6} />
        <Coffee position={[0.6, 0.83, 0.2]} />
      </group>
      {[-0.6, 0.6].map((x) => (
        <Chair key={x} position={[tx + x, 0, tz + 1.15]} />
      ))}

      <PageSpeedTV good={effects.has("pagespeed")} reducedMotion={reducedMotion} />
      <Pot position={[m.minX + 0.6, 0, m.maxZ - 0.6]} scale={1.5} />

      <HideWhenInside player={player} area={m}>
        <Box position={[cx, 3.0, cz]} size={[w, 0.12, d]} color="#e3e7e5" />
        <Box position={[cx, 2.8, m.maxZ]} size={[w, 0.36, 0.14]} color={NAVY} />
        <Sign
          text="PHÒNG HỌP"
          position={[(m.doorMinX + m.doorMaxX) / 2, 2.8, m.maxZ + 0.08]}
          width={1.6}
          height={0.3}
          color={NAVY}
          ink="#bfeee6"
          fontSize={80}
        />
      </HideWhenInside>
    </group>
  );
}

/* ---------- open plan ---------- */

function BuildGauge({
  fast,
  reducedMotion,
}: {
  fast: boolean;
  reducedMotion?: boolean;
}) {
  const needle = useRef<THREE.Group>(null);
  const target = fast ? 2.6 : 0.35;
  useFrame((_, dt) => {
    const n = needle.current;
    if (!n) return;
    if (reducedMotion) {
      n.rotation.z = target;
      return;
    }
    n.rotation.z += (target - n.rotation.z) * Math.min(1, dt * 2.2);
  });
  const zones: Array<[number, string]> = [
    [0, RED],
    [Math.PI / 3, AMBER],
    [(2 * Math.PI) / 3, GREEN],
  ];
  return (
    <group>
      <Box position={[0, 0.02, 0]} size={[0.3, 0.04, 0.2]} color="#2b3238" />
      <Box position={[0, 0.15, 0]} size={[0.05, 0.26, 0.05]} color="#2b3238" />
      <Box position={[0, 0.6, 0]} size={[0.92, 0.68, 0.05]} color="#2b3238" />
      <Panel position={[0, 0.6, 0.03]} size={[0.86, 0.62]} color={SCREEN} glow={0.3} />
      <group position={[0, 0.5, 0.035]}>
        {zones.map(([start, c]) => (
          <mesh key={start}>
            <ringGeometry args={[0.2, 0.27, 16, 1, start, Math.PI / 3]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.7} />
          </mesh>
        ))}
        <group ref={needle} position={[0, 0, 0.006]} rotation={[0, 0, 0.35]}>
          <Box position={[0.12, 0, 0]} size={[0.25, 0.022, 0.01]} color="#f4f7f6" />
        </group>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.035, 12]} />
          <meshStandardMaterial color="#f4f7f6" />
        </mesh>
      </group>
      <Sign
        text="THỜI GIAN KHỞI ĐỘNG"
        position={[0, 0.84, 0.035]}
        width={0.8}
        height={0.1}
        color={SCREEN}
        ink="#cfe3ea"
        fontSize={70}
      />
      <Sign
        text={fast ? "VITE · NHANH HƠN ~70%" : "WEBPACK · ĐANG BUILD…"}
        position={[0, 0.38, 0.035]}
        width={0.8}
        height={0.11}
        color={SCREEN}
        ink={fast ? GREEN : RED}
        fontSize={70}
      />
    </group>
  );
}

function StandupBoard({
  updated,
  reducedMotion,
}: {
  updated: boolean;
  reducedMotion?: boolean;
}) {
  const [x, z] = L.standupBoard;
  const notes = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return {
          p: [
            (col - 1) * 0.9 + ((row % 2) - 0.5) * 0.3,
            0.32 - row * 0.27 + (col === 1 ? 0.05 : 0),
            0.04,
          ] as Vec3,
          c: NOTE_COLORS[(i * 2 + col) % NOTE_COLORS.length]!,
          tilt: Math.sin(i * 2.7) * 0.12,
        };
      }),
    [],
  );
  return (
    <group position={[x, 0, z]}>
      {[-1.25, 1.25].map((s) => (
        <Pole key={s} position={[s, 0.5, 0]} height={1.0} radius={0.04} color="#56646a" />
      ))}
      {[-1.25, 1.25].map((s) => (
        <Box key={s} position={[s, 0.03, 0]} size={[0.08, 0.06, 0.6]} color="#56646a" />
      ))}
      <group position={[0, 1.78, 0]}>
        <Box position={[0, 0, -0.02]} size={[2.9, 1.6, 0.05]} color="#56646a" />
        <Box position={[0, 0, 0.01]} size={[2.8, 1.5, 0.03]} color="#f4f7f6" />
        <Sign
          text="DAILY STANDUP"
          position={[0, 0.98, 0]}
          width={2.0}
          height={0.3}
          color={TEAL}
          ink="#ffffff"
          fontSize={86}
        />
        {["HÔM QUA", "HÔM NAY", "VƯỚNG"].map((t, i) => (
          <Sign
            key={t}
            text={t}
            position={[(i - 1) * 0.9, 0.6, 0.03]}
            width={0.8}
            height={0.16}
            color="#f4f7f6"
            ink={NAVY}
            fontSize={74}
          />
        ))}
        {notes.map((n, i) => (
          <StickyNote key={i} position={n.p} color={n.c} tilt={n.tilt} />
        ))}
        {updated
          ? ["Dĩ · REVIEW PR", "Dĩ · PAGESPEED"].map((t, i) => (
              <PopIn
                key={t}
                position={[0.0, -0.4 - i * 0.23, 0.05]}
                delay={i * 0.25}
                reducedMotion={reducedMotion}
              >
                <Box size={[0.78, 0.2, 0.012]} color="#bfeee6" />
                <Sign
                  text={t}
                  position={[0, 0, 0.008]}
                  width={0.72}
                  height={0.16}
                  color="#bfeee6"
                  ink={NAVY}
                  fontSize={70}
                />
              </PopIn>
            ))
          : null}
      </group>
    </group>
  );
}

function OpenPlan({ effects, reducedMotion }: MapSceneProps) {
  const b = L.benchDesk;
  const [mx, mz] = L.mySeat;
  const mate = L.seats[2]!;
  const tilt = 0.15;
  return (
    <group>
      <Box position={[11.8, 0.0, -5.5]} size={[10.4, 0.03, 7.4]} color="#b9c3c1" />
      {/* long bench desk with a felt divider */}
      <group position={[b.x, 0, b.z]}>
        <Box position={[0, 0.99, 0]} size={[b.width, 0.06, 1.2]} color="#eef0ee" />
        {[-b.width / 2 + 0.15, 0, b.width / 2 - 0.15].map((x) => (
          <Box key={x} position={[x, 0.48, 0]} size={[0.07, 0.96, 1.0]} color="#2b3238" />
        ))}
        <Box position={[0, 1.24, -0.52]} size={[b.width - 0.2, 0.44, 0.05]} color={TEAL} />
      </group>
      {L.seats.map((x, i) => (
        <group key={x}>
          <Monitor position={[x - 0.42, 1.02, b.z - 0.2]} scale={0.55} rotation={tilt} variant={i % 2} />
          <Monitor position={[x + 0.42, 1.02, b.z - 0.2]} scale={0.55} rotation={-tilt} variant={1} />
          <Box position={[x, 1.035, b.z + 0.3]} size={[0.66, 0.03, 0.2]} color="#c9cfcd" />
          {x === mate ? null : <Chair position={[x, 0, b.z + 0.95]} />}
        </group>
      ))}

      {/* Dĩ's seat: the build gauge */}
      <group position={[mx + 1.3, 1.02, mz - 0.15]}>
        <BuildGauge fast={effects.has("vite")} reducedMotion={reducedMotion} />
      </group>
      <Coffee position={[mx - 0.85, 1.02, mz + 0.2]} />
      {effects.has("vite") ? (
        <FloatingTag
          position={[mx + 0.7, 2.75, mz]}
          text="-70% THỜI GIAN CHỜ"
          color={GREEN}
          edge="#1d7a4a"
          width={1.9}
          reducedMotion={reducedMotion}
        />
      ) : null}

      {/* teammate's PR */}
      {effects.has("merged") ? (
        <>
          <Sign
            text="MERGED"
            position={[
              mate - 0.42 + Math.sin(tilt) * 0.05,
              1.405,
              b.z - 0.2 + Math.cos(tilt) * 0.05,
            ]}
            rotation={[0, tilt, 0]}
            width={0.72}
            height={0.44}
            color="#7c4dbd"
            ink="#ffffff"
            fontSize={190}
          />
          <FloatingTag
            position={[mate, 2.85, b.z + 0.6]}
            text="PR MERGED"
            color="#7c4dbd"
            edge="#55308c"
            reducedMotion={reducedMotion}
          />
        </>
      ) : null}

      <StandupBoard updated={effects.has("standup")} reducedMotion={reducedMotion} />

      {/* phone booth */}
      <group position={[16.3, 0, -4.4]}>
        <Box position={[0, 2.25, 0]} size={[1.3, 0.1, 1.3]} color={NAVY} />
        <Box position={[0.6, 1.1, 0]} size={[0.08, 2.2, 1.3]} color={NAVY} />
        <Glass position={[0, 1.1, 0.62]} size={[1.2, 2.2, 0.04]} />
        <Glass position={[-0.62, 1.1, 0]} size={[0.04, 2.2, 1.2]} />
        <Glass position={[0, 1.1, -0.62]} size={[1.2, 2.2, 0.04]} />
        <Stool position={[0.1, 0, 0]} color={TEAL} />
        <Sign
          text="PHONE BOOTH"
          position={[0, 2.45, 0.66]}
          width={1.2}
          height={0.22}
          color={NAVY}
          ink="#bfeee6"
          fontSize={80}
        />
      </group>

      <Pot position={[7.3, 0, -8.5]} scale={1.6} />
      <Pot position={[16.4, 0, -8.5]} scale={1.7} />
      <Pot position={[16.4, 0, -1.4]} scale={1.3} />
    </group>
  );
}

/* ---------- reception ---------- */

function Reception() {
  const [x, z] = L.reception;
  const [sx, sz] = L.crmScreen;
  return (
    <group>
      <Box position={[0.2, 0.0, 7.1]} size={[9.8, 0.03, 3.8]} color="#bfc7c3" />
      <group position={[x, 0, z]}>
        <Box position={[0, 0.53, 0]} size={[3.2, 1.06, 0.8]} color="#eef0ee" />
        <Box position={[0, 1.09, 0]} size={[3.4, 0.06, 0.95]} color={NAVY} />
        <mesh position={[0, 0.16, 0.405]}>
          <planeGeometry args={[3.0, 0.05]} />
          <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={1.4} />
        </mesh>
        <Sign
          text="ESTUARY SOLUTIONS"
          position={[0, 0.66, 0.41]}
          width={2.7}
          height={0.32}
          color="#eef0ee"
          ink={NAVY}
          fontSize={110}
        />
        <Monitor position={[0.9, 1.12, -0.15]} rotation={Math.PI} scale={0.5} />
        <Pot position={[-1.3, 1.12, 0]} scale={0.5} />
      </group>
      <ScreenStand position={[sx, 0, sz]} width={2.4} height={1.3} center={1.85} color="#2b3238">
        <Panel size={[2.4, 1.3]} color={SCREEN} glow={0.3} />
        <group position={[0, 0, 0.01]}>
          <Sign
            text="CRM PLATFORM"
            position={[0, 0.48, 0]}
            width={1.6}
            height={0.2}
            color={SCREEN}
            ink="#7fd6c8"
            fontSize={86}
          />
          <Sign
            text="30.000+"
            position={[-0.45, 0.06, 0]}
            width={1.2}
            height={0.42}
            color={SCREEN}
            ink="#ffffff"
            fontSize={300}
          />
          <Sign
            text="NGƯỜI DÙNG MỖI THÁNG"
            position={[-0.45, -0.3, 0]}
            width={1.2}
            height={0.14}
            color={SCREEN}
            ink="#8fa3ab"
            fontSize={84}
          />
          {[0.25, 0.38, 0.33, 0.5, 0.62].map((h, i) => (
            <Box
              key={i}
              position={[0.45 + i * 0.16, -0.45 + h / 2, 0]}
              size={[0.1, h, 0.01]}
              color={i === 4 ? "#7fd6c8" : TEAL}
            />
          ))}
        </group>
      </ScreenStand>
      <Pot position={[-5.2, 0, 8.6]} scale={1.6} />
      <Pot position={[5.4, 0, 8.6]} scale={1.6} />
    </group>
  );
}

/* ---------- global corner: world wall + globe ---------- */

const MARKERS: Array<[number, number]> = [
  [21, 105.8],
  [10.8, 106.7],
  [1.35, 103.8],
  [3.1, 101.7],
  [13.75, 100.5],
  [-6.2, 106.8],
  [14.6, 121],
  [-33.9, 151.2],
  [35.7, 139.7],
  [22.3, 114.2],
  [40.7, -74],
  [37.8, -122.4],
  [43.7, -79.4],
  [19.4, -99.1],
  [-23.5, -46.6],
  [4.7, -74.1],
];

function Globe({ lit, reducedMotion }: { lit: boolean; reducedMotion?: boolean }) {
  const spin = useRef<THREE.Group>(null);
  const r = 0.7;
  const dots = useMemo(
    () =>
      MARKERS.map(([lat, lon]) => {
        const p = (lat * Math.PI) / 180;
        const l = (lon * Math.PI) / 180;
        const k = r + 0.015;
        return [
          k * Math.cos(p) * Math.sin(l),
          k * Math.sin(p),
          k * Math.cos(p) * Math.cos(l),
        ] as Vec3;
      }),
    [],
  );
  useFrame((_, dt) => {
    if (!spin.current || reducedMotion) return;
    spin.current.rotation.y += dt * (lit ? 0.45 : 0.15);
  });
  const [gx, gz] = L.globe;
  return (
    <group position={[gx, 0, gz]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.48, 0.7, 20]} />
        <meshStandardMaterial color="#2b3238" />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.03, 8, 24]} />
        <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={lit ? 1.4 : 0.3} />
      </mesh>
      <group position={[0, 1.45, 0]} rotation={[0, 0, 0.41]}>
        <group ref={spin} rotation={[0, -1.9, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[r, 32, 20]} />
            <meshStandardMaterial color="#2f6f96" roughness={0.45} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r + 0.005, 0.006, 6, 48]} />
            <meshStandardMaterial color="#a9d6e5" />
          </mesh>
          {[0, Math.PI / 2].map((a) => (
            <mesh key={a} rotation={[0, a, 0]}>
              <torusGeometry args={[r + 0.005, 0.005, 6, 48]} />
              <meshStandardMaterial color="#a9d6e5" />
            </mesh>
          ))}
          {dots.map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[lit ? 0.055 : 0.04, 10, 8]} />
              <meshStandardMaterial
                color={lit ? "#ffb347" : "#7d8f97"}
                emissive={lit ? "#ff9a2a" : "#000000"}
                emissiveIntensity={lit ? 2.2 : 0}
              />
            </mesh>
          ))}
        </group>
      </group>
      {lit ? (
        <FloatingTag
          position={[0, 2.75, 0]}
          text="i18n · 10+ QUỐC GIA"
          color={AMBER}
          edge="#b5671c"
          width={2.0}
          reducedMotion={reducedMotion}
        />
      ) : null}
    </group>
  );
}

function WorldWall({ lit }: { lit: boolean }) {
  const [x, z] = L.worldWall;
  const tiles: Array<[number, number, string]> = [
    [-1.2, 0.12, "SEA"],
    [-1.2, -0.32, "APAC"],
    [1.2, 0.12, "NORTH AMERICA"],
    [1.2, -0.32, "LATAM"],
  ];
  return (
    <ScreenStand position={[x, 0, z]} width={3.6} height={1.5} center={2.0} color="#2b3238">
      <Panel size={[3.6, 1.5]} color={SCREEN} glow={0.3} />
      <group position={[0, 0, 0.01]}>
        <Sign
          text="SẢN PHẨM ĐẾN HƠN 11 QUỐC GIA"
          position={[0, 0.56, 0]}
          width={3.0}
          height={0.24}
          color={SCREEN}
          ink="#cfe3ea"
          fontSize={80}
        />
        {tiles.map(([tx, ty, t]) => (
          <group key={t} position={[tx, ty, 0]}>
            <Box size={[1.0, 0.34, 0.01]} color={lit ? AMBER : "#24333b"} />
            <Sign
              text={t}
              position={[0, 0, 0.008]}
              width={0.92}
              height={0.24}
              color={lit ? AMBER : "#24333b"}
              ink={lit ? SCREEN : "#8fa3ab"}
              fontSize={90}
            />
          </group>
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <Box
            key={i}
            position={[0, -0.5 + i * 0.22, 0]}
            size={[1.2, 0.008, 0.005]}
            color="#2c4a58"
          />
        ))}
      </group>
    </ScreenStand>
  );
}

function GlobalCorner({ lit, reducedMotion }: { lit: boolean; reducedMotion?: boolean }) {
  return (
    <group>
      <Box position={[-11.9, 0.0, 6.5]} size={[10.2, 0.03, 5.6]} color="#c3cbcc" />
      <WorldWall lit={lit} />
      <Globe lit={lit} reducedMotion={reducedMotion} />
      <Orb position={[-15.6, 0.32, 7.6]} scale={[0.5, 0.34, 0.5]} color={TEAL} />
      <Orb position={[-14.5, 0.3, 8.4]} scale={[0.46, 0.32, 0.46]} color={AMBER} />
      <Sofa position={[-16.4, 0, 5.6]} rotation={-Math.PI / 2} color="#2f4a5c" width={2.2} />
      <Pot position={[-16.5, 0, 3.9]} scale={1.4} />
      <Pot position={[-7.2, 0, 8.7]} scale={1.3} />
      <Pot position={[-8.4, 0, 3.9]} scale={1.1} />
    </group>
  );
}

/* ---------- lounge: chat demo ---------- */

function ChatBubble({
  position,
  text,
  mine,
  width = 1.0,
}: {
  position: Vec3;
  text: string;
  mine?: boolean;
  width?: number;
}) {
  const bg = mine ? TEAL : "#e1e6e4";
  return (
    <group position={position}>
      <Box size={[width, 0.2, 0.01]} color={bg} />
      <Sign
        text={text}
        position={[0, 0, 0.008]}
        width={width - 0.06}
        height={0.15}
        color={bg}
        ink={mine ? "#ffffff" : "#2b3238"}
        fontSize={80}
      />
    </group>
  );
}

function FloatingBubbles({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.children.forEach((c, i) => {
      c.position.y = 3.15 + i * 0.42 + Math.sin(clock.elapsedTime * 1.4 + i) * 0.07;
    });
  });
  const items: Array<[number, string, string]> = [
    [-0.7, "Tin nhắn mới", TEAL],
    [0.6, "Đã xem", "#56646a"],
    [-0.2, "1 thông báo", AMBER],
  ];
  const [x, z] = L.chatScreen;
  return (
    <group ref={ref} position={[x, 0, z]} userData={{ noCollide: true }}>
      {items.map(([bx, t, c], i) => (
        <group key={t} position={[bx, 3.15 + i * 0.42, 0]}>
          <PopIn delay={0.4 + i * 0.3} reducedMotion={reducedMotion}>
            <Box size={[1.1, 0.32, 0.05]} color={c} />
            <mesh position={[-0.35, -0.2, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.07, 0.12, 3]} />
              <meshStandardMaterial color={c} />
            </mesh>
            <Sign
              text={t}
              position={[0, 0, 0.03]}
              width={1.0}
              height={0.24}
              color={c}
              ink="#ffffff"
              fontSize={96}
            />
          </PopIn>
        </group>
      ))}
    </group>
  );
}

function ChatScreen({ live, reducedMotion }: { live: boolean; reducedMotion?: boolean }) {
  const [x, z] = L.chatScreen;
  return (
    <group>
      <ScreenStand position={[x, 0, z]} width={2.6} height={1.6} color="#2b3238">
        <Panel size={[2.6, 1.6]} color="#f4f7f6" glow={0.25} />
        <group position={[0, 0, 0.01]}>
          <Box position={[-0.98, 0, 0]} size={[0.6, 1.56, 0.01]} color={NAVY} />
          {[0.45, 0.15, -0.15].map((y, i) => (
            <group key={y} position={[-0.98, y, 0.008]}>
              <mesh position={[-0.15, 0, 0]}>
                <circleGeometry args={[0.08, 14]} />
                <meshStandardMaterial color={["#e46f4f", AMBER, "#7fd6c8"][i]!} />
              </mesh>
              <Box position={[0.08, 0, 0]} size={[0.26, 0.05, 0.005]} color="#56718a" />
            </group>
          ))}
          <Box position={[0.3, 0.66, 0]} size={[1.96, 0.22, 0.01]} color={TEAL} />
          <Sign
            text="CHAT · REAL-TIME"
            position={[0.3, 0.66, 0.008]}
            width={1.6}
            height={0.17}
            color={TEAL}
            ink="#ffffff"
            fontSize={84}
          />
          {live ? (
            <>
              <PopIn position={[0.0, 0.32, 0.005]} reducedMotion={reducedMotion}>
                <ChatBubble position={[0, 0, 0]} text="Chào bạn!" />
              </PopIn>
              <PopIn position={[0.66, 0.02, 0.005]} delay={0.3} reducedMotion={reducedMotion}>
                <ChatBubble position={[0, 0, 0]} text="Nhận được liền nè!" mine width={1.1} />
              </PopIn>
              <PopIn position={[0.05, -0.28, 0.005]} delay={0.6} reducedMotion={reducedMotion}>
                <ChatBubble position={[0, 0, 0]} text="Có thông báo mới" width={1.1} />
              </PopIn>
              <Sign
                text="● WEBSOCKET ĐÃ KẾT NỐI"
                position={[0.3, -0.64, 0.005]}
                width={1.6}
                height={0.13}
                color="#f4f7f6"
                ink="#1d9a5a"
                fontSize={80}
              />
            </>
          ) : (
            <Sign
              text="Đang kết nối…"
              position={[0.3, 0, 0.005]}
              width={1.4}
              height={0.18}
              color="#f4f7f6"
              ink="#8a9592"
              fontSize={90}
            />
          )}
        </group>
      </ScreenStand>
      {live ? <FloatingBubbles reducedMotion={reducedMotion} /> : null}
    </group>
  );
}

function Lounge({ live, reducedMotion }: { live: boolean; reducedMotion?: boolean }) {
  return (
    <group>
      <Box position={[9.6, 0.0, 6.5]} size={[7.0, 0.03, 5.6]} color="#c8cdc4" />
      <ChatScreen live={live} reducedMotion={reducedMotion} />
      <Sofa position={[8.6, 0, 8.3]} color="#2f4a5c" />
      <Box position={[8.6, 0.22, 7.15]} size={[1.2, 0.44, 0.6]} color="#eef0ee" />
      <Laptop position={[8.4, 0.44, 7.15]} scale={0.5} />
      <Orb position={[6.6, 0.32, 6.9]} scale={[0.5, 0.34, 0.5]} color={AMBER} />
      <Orb position={[6.5, 0.3, 5.6]} scale={[0.46, 0.32, 0.46]} color={TEAL} />
      <Pot position={[12.4, 0, 8.7]} scale={1.4} />
    </group>
  );
}

/* ---------- rooftop terrace ---------- */

function Terrace({ reducedMotion }: { reducedMotion?: boolean }) {
  const t = L.terrace;
  const w = t.maxX - t.minX;
  const d = t.maxZ - t.minZ;
  const cx = (t.minX + t.maxX) / 2;
  const cz = (t.minZ + t.maxZ) / 2;
  const [bx, bz] = L.coffeeBar;
  return (
    <group>
      <Box position={[cx, 0.0, cz]} size={[w, 0.04, d]} color="#8d6e52" />
      {Array.from({ length: 9 }, (_, i) => (
        <Box
          key={i}
          position={[t.minX + 0.2 + i * 0.45, 0.025, cz]}
          size={[0.02, 0.01, d]}
          color="#6f533c"
        />
      ))}
      <Box position={[t.maxX, 1.02, cz]} size={[0.08, 0.06, d]} color={NAVY} />
      <Glass position={[t.maxX, 0.55, cz]} size={[0.04, 0.9, d]} />
      <Box position={[cx, 1.02, t.maxZ]} size={[w, 0.06, 0.08]} color={NAVY} />
      <Glass position={[cx, 0.55, t.maxZ]} size={[w, 0.9, 0.04]} />
      <Pole position={[t.maxX, 1.45, t.maxZ]} height={2.9} radius={0.05} color={NAVY} />
      <Pole position={[t.maxX, 1.45, t.minZ]} height={2.9} radius={0.05} color={NAVY} />
      <Pole position={[t.minX, 1.45, t.maxZ]} height={2.9} radius={0.05} color={NAVY} />
      <StringLights
        from={[t.maxX, 2.85, t.minZ]}
        to={[t.maxX, 2.85, t.maxZ]}
        reducedMotion={reducedMotion}
      />
      <StringLights
        from={[t.minX, 2.85, t.maxZ]}
        to={[t.maxX, 2.85, t.maxZ]}
        reducedMotion={reducedMotion}
      />

      {/* coffee bar */}
      <group position={[bx, 0, bz]}>
        <Box position={[0, 0.5, 0]} size={[1.8, 1.0, 0.6]} color="#eef0ee" />
        <Box position={[0, 1.03, 0]} size={[1.9, 0.06, 0.7]} color="#8d6e52" />
        <Sign
          text="CÀ PHÊ"
          position={[0, 0.62, 0.31]}
          width={1.2}
          height={0.3}
          color="#eef0ee"
          ink={NAVY}
          fontSize={110}
        />
        <group position={[-0.45, 1.06, -0.05]}>
          <Box position={[0, 0.34, 0]} size={[0.55, 0.68, 0.42]} color="#2b3238" metalness={0.4} />
          <mesh position={[0.16, 0.52, 0.215]}>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshStandardMaterial color="#7fd6c8" emissive="#7fd6c8" emissiveIntensity={2} />
          </mesh>
        </group>
        <Coffee position={[0.25, 1.06, 0.1]} />
        <Coffee position={[0.55, 1.06, -0.05]} />
      </group>

      {/* parasol table */}
      <group position={[16.1, 0, 6.0]}>
        <RoundTable position={[0, 0, 0]} radius={0.5} color="#eef0ee" />
        <Pole position={[0, 1.4, 0]} height={2.0} radius={0.03} color="#56646a" />
        <mesh position={[0, 2.5, 0]} castShadow>
          <coneGeometry args={[1.15, 0.5, 8, 1, true]} />
          <meshStandardMaterial color={TEAL} side={THREE.DoubleSide} />
        </mesh>
        <Coffee position={[0.15, 0.79, 0.1]} />
      </group>
      <Stool position={[16.1, 0, 5.15]} color={AMBER} />
      <Pot position={[13.7, 0, 8.9]} scale={1.3} />
      <Pot position={[16.5, 0, 8.9]} scale={1.1} />
    </group>
  );
}

export function HienTaiMap({ effects, player, reducedMotion }: MapSceneProps) {
  return (
    <DioramaMap chapterId="hien-tai" ground="#9ea7a4" reducedMotion={reducedMotion}>
      <Shell />
      <Core />
      <MeetingRoom effects={effects} player={player} reducedMotion={reducedMotion} />
      <OpenPlan effects={effects} player={player} reducedMotion={reducedMotion} />
      <Reception />
      <GlobalCorner lit={effects.has("i18n")} reducedMotion={reducedMotion} />
      <Lounge live={effects.has("chat")} reducedMotion={reducedMotion} />
      <Terrace reducedMotion={reducedMotion} />
      <Pot position={[6.4, 0, -1.6]} scale={1.2} />
      <Pot position={[-6.6, 0, 3.2]} scale={1.2} />

      <CityBackdrop
        position={[0, 0, -13]}
        length={54}
        seed={9}
        maxHeight={12}
        palette={["#8ea3aa", "#a9b8bb", "#7c919b", "#b5c0bf", "#6f8791"]}
        glass="#cfe6ee"
      />
      <CityBackdrop
        position={[22, 0, 0]}
        rotation={-Math.PI / 2}
        length={30}
        seed={13}
        maxHeight={10}
        palette={["#8ea3aa", "#a9b8bb", "#7c919b", "#b5c0bf"]}
        glass="#cfe6ee"
      />
    </DioramaMap>
  );
}
