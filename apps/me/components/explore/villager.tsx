"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { Bicycle } from "@/components/story/world-3d";
import type { Activity, VillagerLook } from "@/lib/explore/types";
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import { Group, MathUtils, Vector3 } from "three";

const SKIN = "#e9bf96";
const tmp = new Vector3();
const dir = new Vector3();

function Part({
  position,
  rotation,
  scale,
  color,
  geometry,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  geometry: "sphere" | "cyl" | "cone" | "torus" | "box";
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      {geometry === "sphere" ? <sphereGeometry args={[1, 16, 12]} /> : null}
      {geometry === "cyl" ? <cylinderGeometry args={[1, 1, 1, 14]} /> : null}
      {geometry === "cone" ? <coneGeometry args={[1, 1, 20]} /> : null}
      {geometry === "torus" ? <torusGeometry args={[1, 0.18, 8, 20]} /> : null}
      {geometry === "box" ? <boxGeometry args={[1, 1, 1]} /> : null}
      <meshStandardMaterial color={color} roughness={0.82} />
    </mesh>
  );
}

/* ---------- props held in the right hand (hand origin, arm hanging along -y) ---------- */

function HeldProp({ activity }: { activity: Activity }) {
  switch (activity) {
    case "sweep":
      return (
        <group rotation={[0.5, 0, 0]}>
          <Part
            geometry="cyl"
            position={[0, -0.25, 0.05]}
            scale={[0.025, 1.3, 0.025]}
            color="#a07a4a"
          />
          <Part
            geometry="cone"
            position={[0, -0.95, 0.05]}
            rotation={[Math.PI, 0, 0]}
            scale={[0.16, 0.28, 0.06]}
            color="#c9a86a"
          />
        </group>
      );
    case "hoe":
      return (
        <group rotation={[1.4, 0, 0]}>
          <Part
            geometry="cyl"
            position={[0, -0.35, 0]}
            scale={[0.028, 1.1, 0.028]}
            color="#8a6a3a"
          />
          <Part
            geometry="box"
            position={[0, -0.92, 0.1]}
            scale={[0.22, 0.04, 0.22]}
            color="#6f6f6f"
          />
        </group>
      );
    case "stir":
      return (
        <group rotation={[0.6, 0, 0]}>
          <Part
            geometry="cyl"
            position={[0, -0.2, 0]}
            scale={[0.02, 0.5, 0.02]}
            color="#8a6a3a"
          />
          <Part
            geometry="sphere"
            position={[0, -0.45, 0]}
            scale={[0.07, 0.03, 0.07]}
            color="#8a6a3a"
          />
        </group>
      );
    case "read":
    case "write":
      return (
        <group position={[-0.1, -0.02, 0.12]} rotation={[-1.1, 0, 0]}>
          <Part
            geometry="box"
            scale={[0.3, 0.02, 0.22]}
            color={activity === "read" ? "#c0392b" : "#f1ead9"}
          />
          <Part
            geometry="box"
            position={[0, 0.012, 0]}
            scale={[0.27, 0.01, 0.2]}
            color="#fbf7ee"
          />
        </group>
      );
    case "drink":
      return (
        <Part
          geometry="cyl"
          position={[0, -0.02, 0.06]}
          scale={[0.045, 0.08, 0.045]}
          color="#f1ead9"
        />
      );
    case "fish":
      return (
        <group rotation={[1.0, 0, 0]}>
          <Part
            geometry="cyl"
            position={[0, -1.1, 0]}
            scale={[0.015, 2.4, 0.015]}
            color="#b08a4a"
          />
        </group>
      );
    case "phone":
      return (
        <Part
          geometry="box"
          position={[0, 0, 0.04]}
          scale={[0.06, 0.12, 0.015]}
          color="#1d1d24"
        />
      );
    case "type":
      return null;
    default:
      return null;
  }
}

/** Đòn gánh resting on the right shoulder (attached to the body). */
function ShoulderPole() {
  return (
    <group position={[0.18, 1.56, 0]} rotation={[0, 0, 0.05]}>
      <Part
        geometry="cyl"
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.03, 1.8, 0.03]}
        color="#a07a4a"
      />
      {[-0.82, 0.82].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Part
            geometry="cyl"
            position={[0, -0.45, 0]}
            scale={[0.008, 0.85, 0.008]}
            color="#5b3d26"
          />
          <Part
            geometry="cyl"
            position={[0, -0.95, 0]}
            scale={[0.24, 0.24, 0.24]}
            color="#b8925a"
          />
          <Part
            geometry="sphere"
            position={[0, -0.8, 0]}
            scale={[0.18, 0.08, 0.18]}
            color={z > 0 ? "#5c8f3a" : "#f2c230"}
          />
        </group>
      ))}
    </group>
  );
}

export type VillagerMotion = {
  /** Current ground speed (units/s); drives the walk cycle. */
  speed: number;
  /** True while this villager is being talked to (switches to "talk"). */
  talking?: boolean;
};

/**
 * A soft, rounded villager in the same toy-diorama style as the scenes.
 * Origin is at the feet; an adult is about 2 units tall like the main character.
 * It walks when `motion.speed` > 0, performs its `activity` when standing still,
 * and turns its head towards the player when he comes close.
 */
export function Villager({
  look,
  position,
  facing = 0,
  pose = "stand",
  player,
  reducedMotion = false,
  activity = "idle",
  motion,
  bicycle = false,
}: {
  look: VillagerLook;
  position: [number, number, number];
  facing?: number;
  pose?: "stand" | "sit";
  player?: RefObject<Group | null>;
  reducedMotion?: boolean;
  activity?: Activity;
  motion?: RefObject<VillagerMotion>;
  bicycle?: boolean;
}) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const gait = useRef({ phase: 0, amount: 0 });
  const skin = look.skin ?? SKIN;
  const hair = look.hairColor ?? "#1d1a18";
  const h = (look.height ?? 1) * 1.08;
  const sit = pose === "sit" || bicycle;
  const phase = position[0] * 1.7 + position[2];
  // Seat height in the villager's local (scaled) units; stool is 0.5 world units tall.
  const seat = (bicycle ? 0.95 : 0.5) / h;

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime + phase;
    const step = Math.min(delta, 0.1);
    const speed = reducedMotion ? 0 : (motion?.current?.speed ?? 0);
    const g = gait.current;
    g.amount +=
      (Math.min(speed / 1.6, 1) - g.amount) * (1 - Math.exp(-step * 8));
    g.phase += step * (2.2 + speed * 1.6) * Math.min(1, speed / 0.2);
    const walk = g.amount;
    const act: Activity = motion?.current?.talking ? "talk" : activity;

    if (body.current) {
      body.current.scale.y = reducedMotion ? 1 : 1 + Math.sin(t * 1.6) * 0.012;
      const bounce =
        act === "play" && !reducedMotion ? Math.abs(Math.sin(t * 5)) * 0.12 : 0;
      body.current.position.y =
        (sit ? seat - 0.92 : 0) +
        Math.abs(Math.sin(g.phase)) * 0.03 * walk +
        bounce;
      body.current.rotation.y =
        act === "sweep" && !reducedMotion
          ? Math.sin(t * 2.2) * 0.3 * (1 - walk)
          : 0;
      body.current.rotation.x =
        act === "hoe"
          ? 0.18 * (1 - walk)
          : act === "read" || act === "write" || act === "type"
            ? 0.06
            : 0;
    }

    // Legs: walking swing, pedalling, or still.
    const swing = Math.sin(g.phase) * 0.55 * walk;
    if (!sit) {
      if (leftLeg.current) leftLeg.current.rotation.x = swing;
      if (rightLeg.current) rightLeg.current.rotation.x = -swing;
    } else if (bicycle) {
      const pedal = reducedMotion ? 0 : g.phase * 1.2;
      if (leftLeg.current)
        leftLeg.current.rotation.x = -0.9 + Math.sin(pedal) * 0.45 * walk;
      if (rightLeg.current)
        rightLeg.current.rotation.x = -0.9 - Math.sin(pedal) * 0.45 * walk;
    }

    // Arms: blend the activity pose with the walking swing.
    let lx = 0.05 + Math.sin(t * 1.1) * 0.03;
    let lz = 0.12;
    let rx = 0.05 + Math.sin(t * 1.1 + 0.6) * 0.03;
    let rz = -0.12;
    if (!reducedMotion) {
      switch (act) {
        case "talk":
          rx = -0.55 + Math.sin(t * 3.1) * 0.28;
          rz = -0.2 + Math.sin(t * 2.3) * 0.1;
          lx = -0.3 + Math.sin(t * 2.4 + 1) * 0.18;
          break;
        case "sell":
          rx = -0.45 + Math.max(0, Math.sin(t * 0.9)) * -0.9;
          lx = -0.35;
          break;
        case "sweep":
          rx = -0.6 + Math.sin(t * 2.2) * 0.2;
          lx = -0.75 + Math.sin(t * 2.2) * 0.2;
          lz = -0.15;
          break;
        case "hoe": {
          const lift = (Math.sin(t * 2.0) + 1) / 2;
          rx = -0.6 - lift * 1.9;
          lx = rx;
          lz = -0.25;
          rz = 0.15;
          break;
        }
        case "stir":
          rx = -0.95 + Math.cos(t * 3) * 0.15;
          rz = -0.2 + Math.sin(t * 3) * 0.2;
          lx = -0.2;
          break;
        case "read":
        case "write":
          rx = -1.05 + (act === "write" ? Math.sin(t * 9) * 0.04 : 0);
          rz = 0.25;
          lx = -1.05;
          lz = -0.25;
          break;
        case "drink": {
          const sip = Math.pow(Math.max(0, Math.sin(t * 0.7)), 4);
          rx = -0.5 - sip * 1.6;
          rz = 0.1 + sip * 0.35;
          break;
        }
        case "wave":
          rz = -2.55 + Math.sin(t * 9) * 0.25;
          rx = -0.1;
          break;
        case "fish":
          rx = -0.75 + Math.sin(t * 0.8) * 0.05;
          lx = -0.75;
          lz = -0.2;
          rz = 0.2;
          break;
        case "type":
          rx = -1.15 + Math.sin(t * 14) * 0.05;
          lx = -1.15 + Math.sin(t * 13 + 1) * 0.05;
          rz = 0.2;
          lz = -0.2;
          break;
        case "clap": {
          const c = Math.abs(Math.sin(t * 5));
          rx = -1.1;
          lx = -1.1;
          rz = 0.15 + c * 0.25;
          lz = -0.15 - c * 0.25;
          break;
        }
        case "carry":
          rx = -0.5;
          rz = -0.6;
          break;
        case "phone":
          rx = -1.9;
          rz = 0.75;
          break;
        case "play":
          rz = -2.3 + Math.sin(t * 5) * 0.2;
          lz = 2.3 - Math.sin(t * 5) * 0.2;
          break;
        default:
          break;
      }
      if (bicycle) {
        rx = -0.95;
        lx = -0.95;
        rz = 0.1;
        lz = -0.1;
      }
    }
    const keep = act === "carry" || act === "phone" || bicycle ? 1 : 1 - walk;
    const armSwing = Math.sin(g.phase) * 0.45 * walk;
    // Poses above are authored mirrored (right arm out = negative z, left arm
    // out = positive z); three.js is the opposite, so flip on assignment.
    if (leftArm.current) {
      leftArm.current.rotation.x = lx * keep - armSwing * (1 - keep);
      leftArm.current.rotation.z = -lz;
    }
    if (rightArm.current) {
      rightArm.current.rotation.x = rx * keep + armSwing * (1 - keep);
      rightArm.current.rotation.z = -rz;
    }

    // Head: turn towards the player when he comes close.
    if (head.current && root.current) {
      let yaw = 0;
      let pitch =
        act === "read" || act === "write" ? 0.35 : act === "type" ? 0.15 : 0;
      if (player?.current) {
        root.current.getWorldPosition(tmp);
        root.current.getWorldDirection(dir);
        const worldFacing = Math.atan2(dir.x, dir.z);
        const dx = player.current.position.x - tmp.x;
        const dz = player.current.position.z - tmp.z;
        if (dx * dx + dz * dz < 16) {
          yaw = Math.atan2(dx, dz) - worldFacing;
          yaw = MathUtils.euclideanModulo(yaw + Math.PI, Math.PI * 2) - Math.PI;
          yaw = MathUtils.clamp(yaw, -1.0, 1.0);
          pitch = 0;
        } else if (!reducedMotion) {
          yaw = Math.sin(t * 0.35) * 0.25;
        }
      }
      if (act === "talk" && !reducedMotion) pitch += Math.sin(t * 2.6) * 0.06;
      const k = 1 - Math.exp(-step * 5);
      head.current.rotation.y = MathUtils.lerp(head.current.rotation.y, yaw, k);
      head.current.rotation.x = MathUtils.lerp(
        head.current.rotation.x,
        pitch,
        k,
      );
    }
  });

  return (
    <group ref={root} position={position} rotation={[0, facing, 0]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42 * h, 20]} />
        <meshBasicMaterial
          color="#000"
          transparent
          opacity={0.14}
          depthWrite={false}
        />
      </mesh>
      {pose === "sit" && !bicycle ? (
        <Part
          geometry="cyl"
          position={[0, 0.25, 0]}
          scale={[0.32, 0.5, 0.32]}
          color="#7a5333"
        />
      ) : null}
      {bicycle ? (
        <group rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0.05]}>
          <Bicycle position={[0, 0, 0]} />
        </group>
      ) : null}
      <group scale={h}>
        {/* legs */}
        {[-0.13, 0.13].map((x) =>
          sit ? (
            <group
              key={x}
              ref={x < 0 ? leftLeg : rightLeg}
              position={[x, seat, 0]}
              rotation={[bicycle ? -0.9 : 0, 0, 0]}
            >
              {bicycle ? (
                <>
                  <Part
                    geometry="cyl"
                    position={[0, -0.45, 0]}
                    scale={[0.1, 0.9, 0.1]}
                    color={look.pants}
                  />
                  <Part
                    geometry="sphere"
                    position={[0, -0.9, 0.05]}
                    scale={[0.09, 0.05, 0.14]}
                    color="#3a2a20"
                  />
                </>
              ) : (
                <>
                  <Part
                    geometry="cyl"
                    position={[0, 0, 0.22]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[0.1, 0.46, 0.1]}
                    color={look.pants}
                  />
                  <Part
                    geometry="cyl"
                    position={[0, -seat / 2, 0.44]}
                    scale={[0.095, seat, 0.095]}
                    color={look.pants}
                  />
                  <Part
                    geometry="sphere"
                    position={[0, -seat + 0.04, 0.5]}
                    scale={[0.09, 0.05, 0.14]}
                    color="#3a2a20"
                  />
                </>
              )}
            </group>
          ) : (
            <group
              key={x}
              ref={x < 0 ? leftLeg : rightLeg}
              position={[x, 0.92, 0]}
            >
              <Part
                geometry="cyl"
                position={[0, -0.46, 0]}
                scale={[0.1, 0.9, 0.1]}
                color={look.pants}
              />
              <Part
                geometry="sphere"
                position={[0, -0.88, 0.05]}
                scale={[0.09, 0.05, 0.14]}
                color="#3a2a20"
              />
            </group>
          ),
        )}

        <group ref={body}>
          {/* torso */}
          <Part
            geometry="cyl"
            position={[0, 1.22, 0]}
            scale={[0.3, 0.62, 0.24]}
            color={look.shirt}
          />
          {look.longShirt ? (
            <Part
              geometry="cone"
              position={[0, 0.82, 0]}
              scale={[0.36, 0.5, 0.29]}
              color={look.shirt}
            />
          ) : null}
          <Part
            geometry="sphere"
            position={[0, 1.52, 0]}
            scale={[0.32, 0.12, 0.25]}
            color={look.shirt}
          />
          {activity === "carry" && !sit ? <ShoulderPole /> : null}
          {/* arms (pivot at the shoulder) */}
          <group ref={leftArm} position={[-0.35, 1.5, 0]}>
            <Part
              geometry="cyl"
              position={[0, -0.27, 0]}
              scale={[0.075, 0.54, 0.075]}
              color={look.shirt}
            />
            <Part
              geometry="sphere"
              position={[0, -0.58, 0]}
              scale={[0.075, 0.075, 0.075]}
              color={skin}
            />
          </group>
          <group ref={rightArm} position={[0.35, 1.5, 0]}>
            <Part
              geometry="cyl"
              position={[0, -0.27, 0]}
              scale={[0.075, 0.54, 0.075]}
              color={look.shirt}
            />
            <Part
              geometry="sphere"
              position={[0, -0.58, 0]}
              scale={[0.075, 0.075, 0.075]}
              color={skin}
            />
            <group position={[0, -0.6, 0]}>
              <HeldProp activity={activity} />
            </group>
          </group>
          {/* neck + head */}
          <Part
            geometry="cyl"
            position={[0, 1.62, 0]}
            scale={[0.08, 0.12, 0.08]}
            color={skin}
          />
          <group ref={head} position={[0, 1.88, 0]}>
            <Part geometry="sphere" scale={[0.26, 0.28, 0.25]} color={skin} />
            {[-0.09, 0.09].map((x) => (
              <Part
                key={x}
                geometry="sphere"
                position={[x, 0.02, 0.23]}
                scale={[0.028, 0.034, 0.02]}
                color="#1a1410"
              />
            ))}
            {[-0.15, 0.15].map((x) => (
              <Part
                key={`b${x}`}
                geometry="sphere"
                position={[x, -0.06, 0.2]}
                scale={[0.045, 0.025, 0.02]}
                color="#eaa08a"
              />
            ))}
            <Part
              geometry="sphere"
              position={[0, -0.1, 0.235]}
              scale={[0.045, 0.012, 0.01]}
              color="#9b4d3d"
            />
            {look.glasses ? (
              <>
                {[-0.09, 0.09].map((x) => (
                  <Part
                    key={`g${x}`}
                    geometry="torus"
                    position={[x, 0.02, 0.25]}
                    scale={[0.06, 0.06, 0.06]}
                    color="#222"
                  />
                ))}
              </>
            ) : null}
            {look.hair !== "bald" ? (
              <Part
                geometry="sphere"
                position={[0, 0.07, -0.02]}
                scale={[0.275, 0.24, 0.265]}
                color={hair}
              />
            ) : null}
            {look.hair === "bun" ? (
              <Part
                geometry="sphere"
                position={[0, 0.12, -0.27]}
                scale={[0.12, 0.12, 0.1]}
                color={hair}
              />
            ) : null}
            {look.hair === "pigtails"
              ? [-1, 1].map((s) => (
                  <Part
                    key={s}
                    geometry="sphere"
                    position={[s * 0.27, -0.02, -0.08]}
                    scale={[0.08, 0.13, 0.08]}
                    color={hair}
                  />
                ))
              : null}
            {look.beard ? (
              <Part
                geometry="cone"
                position={[0, -0.27, 0.16]}
                rotation={[Math.PI, 0, 0]}
                scale={[0.09, 0.16, 0.06]}
                color={hair}
              />
            ) : null}
            {look.hat === "non-la" ? (
              <Part
                geometry="cone"
                position={[0, 0.3, 0]}
                scale={[0.5, 0.3, 0.5]}
                color="#e8d8a8"
              />
            ) : null}
            {look.hat === "khan-dong" ? (
              <Part
                geometry="cyl"
                position={[0, 0.17, -0.01]}
                scale={[0.27, 0.12, 0.26]}
                color="#1d1d24"
              />
            ) : null}
          </group>
        </group>
      </group>
    </group>
  );
}
