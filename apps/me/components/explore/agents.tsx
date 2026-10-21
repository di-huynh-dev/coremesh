"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { isWalkable } from "@/lib/explore/navigation";
import type {
  ExploreMapData,
  Movement,
  Obstacle,
  Vec2,
} from "@/lib/explore/types";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode, type RefObject } from "react";
import { Group, MathUtils } from "three";
import type { VillagerMotion } from "./villager";

/** Live positions of everything that moves, shared with collisions and interactions. */
export type AgentRegistry = Map<string, { x: number; z: number; r: number }>;

type MoverProps = {
  id: string;
  home: Vec2;
  facing?: number;
  movement?: Movement;
  /** Dogs: trot after the player when he is within range. */
  follow?: boolean;
  /** Collision radius registered for the player (0 = none). */
  radius: number;
  /** Stops and turns to the player when he is within this distance (0 = never). */
  attention?: number;
  /** Turns the whole body to the player while being talked to. */
  turnToTalk?: boolean;
  player: RefObject<Group | null>;
  /** Id of the NPC currently in conversation. */
  talking: RefObject<string | null>;
  registry: RefObject<AgentRegistry>;
  /** Static colliders (scene + authored), used to pick walkable wander targets. */
  obstacles: RefObject<Obstacle[]>;
  bounds: ExploreMapData["bounds"];
  reducedMotion?: boolean;
  children: (motion: RefObject<VillagerMotion>) => ReactNode;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Moves its children around the map: wandering near home, walking a route,
 * or following the player. Writes speed into `motion` so the figure animates.
 */
export function Mover({
  id,
  home,
  facing = 0,
  movement,
  follow = false,
  radius,
  attention = 2.6,
  turnToTalk = true,
  player,
  talking,
  registry,
  obstacles,
  bounds,
  reducedMotion = false,
  children,
}: MoverProps) {
  const group = useRef<Group>(null);
  const motion = useRef<VillagerMotion>({ speed: 0, talking: false });
  const state = useRef({
    x: home[0],
    z: home[1],
    heading: facing,
    target: null as Vec2 | null,
    wait: rand(0.5, 3),
    // -1 so the first leg heads to points[0].
    routeIndex: -1,
  });

  const pickWander = (r: number): Vec2 | null => {
    const s = state.current;
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = rand(r * 0.3, r);
      const p: Vec2 = [home[0] + Math.cos(a) * d, home[1] + Math.sin(a) * d];
      if (!isWalkable(p, obstacles.current ?? [], bounds, 0.35)) continue;
      // Make sure the straight walk there is clear too.
      let clear = true;
      for (let k = 1; k <= 6 && clear; k++) {
        const t = k / 6;
        clear = isWalkable(
          [s.x + (p[0] - s.x) * t, s.z + (p[1] - s.z) * t],
          obstacles.current ?? [],
          bounds,
          0.3,
        );
      }
      if (clear) return p;
    }
    return null;
  };

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const s = state.current;
    const step = Math.min(delta, 0.1);
    const p = player.current?.position;
    const dxp = p ? p.x - s.x : 0;
    const dzp = p ? p.z - s.z : 0;
    const playerDist = p ? Math.hypot(dxp, dzp) : Infinity;
    const isTalking = talking.current === id;
    motion.current.talking = isTalking;

    let speed = 0;
    let desiredHeading = s.heading;

    const ignorePlayer = movement?.kind === "route" && movement.ignorePlayer;
    const attentive =
      isTalking || (!ignorePlayer && attention > 0 && playerDist < attention);

    if (reducedMotion) {
      // Stay put; only face the player when talking.
      if (isTalking && turnToTalk) desiredHeading = Math.atan2(dxp, dzp);
    } else if (follow && p && playerDist < 7 && playerDist > 1.4) {
      // A dog trotting after Dĩ, keeping a polite distance.
      const target: Vec2 = [
        p.x - (dxp / playerDist) * 1.2,
        p.z - (dzp / playerDist) * 1.2,
      ];
      const tx = target[0] - s.x;
      const tz = target[1] - s.z;
      const d = Math.hypot(tx, tz);
      speed = Math.min(3.6, 1 + d * 1.2);
      desiredHeading = Math.atan2(tx, tz);
      const nx = s.x + (tx / d) * speed * step;
      const nz = s.z + (tz / d) * speed * step;
      if (
        isWalkable([nx, nz], obstacles.current ?? [], bounds, radius || 0.25)
      ) {
        s.x = nx;
        s.z = nz;
      } else speed = 0;
    } else if (attentive) {
      if (isTalking ? turnToTalk : true) desiredHeading = Math.atan2(dxp, dzp);
    } else if (movement) {
      if (!s.target) {
        s.wait -= step;
        if (s.wait <= 0) {
          if (movement.kind === "wander")
            s.target = pickWander(movement.radius);
          else {
            s.routeIndex = (s.routeIndex + 1) % movement.points.length;
            s.target = movement.points[s.routeIndex];
          }
          const pause = movement.pause ?? [1.5, 4.5];
          s.wait = rand(pause[0], pause[1]);
        }
      }
      if (s.target) {
        const tx = s.target[0] - s.x;
        const tz = s.target[1] - s.z;
        const d = Math.hypot(tx, tz);
        if (d < 0.08) {
          s.target = null;
        } else {
          speed = Math.min(
            movement.speed ?? (movement.kind === "route" ? 1.3 : 1.0),
            d / step,
          );
          desiredHeading = Math.atan2(tx, tz);
          s.x += (tx / d) * speed * step;
          s.z += (tz / d) * speed * step;
        }
      }
    }

    const diff =
      MathUtils.euclideanModulo(
        desiredHeading - s.heading + Math.PI,
        Math.PI * 2,
      ) - Math.PI;
    s.heading += diff * (1 - Math.exp(-step * (speed > 0 ? 8 : 5)));
    motion.current.speed = speed;
    g.position.set(s.x, 0, s.z);
    g.rotation.y = s.heading;
    if (radius > 0) registry.current?.set(id, { x: s.x, z: s.z, r: radius });
  });

  return (
    <group
      ref={group}
      position={[home[0], 0, home[1]]}
      rotation={[0, facing, 0]}
    >
      {children(motion)}
    </group>
  );
}
