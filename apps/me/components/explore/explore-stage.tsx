"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import {
  StoryCharacter,
  type CharacterAction,
  type StoryLocomotion,
} from "@/components/story/character-3d";
import type {
  ExploreMapData,
  Obstacle,
  PlayerAction,
  Vec2,
} from "@/lib/explore/types";
import { chapters } from "@/lib/story";
import { LOOKS } from "@/lib/story-journey";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  Box3,
  DirectionalLight,
  Fog,
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  Object3D,
  PCFShadowMap,
  Vector3,
} from "three";
import { findPath } from "@/lib/explore/navigation";
import { Mover, type AgentRegistry } from "./agents";
import { Ambience } from "./ambience";
import { EnvironmentDetails } from "./environment-details";
import { Animal, ANIMAL_RADIUS } from "./fauna";
import { MAP_SCENES } from "./maps/registry";
import { Villager } from "./villager";

/**
 * Builds box colliders from the rendered scene: anything standing on the
 * ground (reaching above knee height, starting below head height) blocks the
 * player. Roofs, floors, canopies and thin overhead lines are ignored, and a
 * mesh (or a parent group) can opt out with `userData.noCollide = true`.
 */
function sceneColliders(root: Object3D): Obstacle[] {
  const out: Obstacle[] = [];
  const box = new Box3();
  root.updateWorldMatrix(true, true);
  root.traverse((obj) => {
    if (!(obj instanceof Mesh) || obj instanceof InstancedMesh) return;
    let skip = false;
    for (let o: Object3D | null = obj; o && o !== root; o = o.parent) {
      if (o.userData.noCollide || !o.visible) skip = true;
    }
    if (skip) return;
    const material = Array.isArray(obj.material)
      ? obj.material[0]
      : obj.material;
    if (material?.transparent && material.opacity < 0.2) return;
    box.setFromObject(obj);
    if (box.isEmpty()) return;
    const w = box.max.x - box.min.x;
    const d = box.max.z - box.min.z;
    if (box.max.y < 0.42 || box.min.y > 1.15) return;
    if (w > 16 || d > 16 || w * d < 0.006) return;
    out.push({
      kind: "box",
      min: [box.min.x + 0.04, box.min.z + 0.04],
      max: [box.max.x - 0.04, box.max.z - 0.04],
    });
  });
  return out;
}

export type ExploreStageProps = {
  map: ExploreMapData;
  effects: ReadonlySet<string>;
  /** Movement is locked while a dialogue is open. */
  frozen: boolean;
  reduced: boolean;
  /** Virtual joystick vector, x right / z down, length 0..1. */
  joystick: RefObject<{ x: number; z: number }>;
  /** When set, the character turns towards this point (the NPC being talked to). */
  lookTarget: Vec2 | null;
  onNearChange: (id: string | null) => void;
  /** Clicking an interactable's spot walks there; the page opens it on arrival. */
  onArrive?: (id: string) => void;
  /** Called once the world has rendered a few frames (to lift the loading cover). */
  onReady?: () => void;
  /** Quests already finished (hides their "!" markers). */
  doneQuests?: ReadonlySet<string>;
  /** NPC currently in conversation: they stop and turn to Dĩ. */
  talkingTo?: string | null;
  /** Gesture for Dĩ; a new nonce replays it. */
  playerAction?: { kind: PlayerAction; nonce: number } | null;
};

/** Bobbing gold marker over someone (or something) with a task for Dĩ. */
function QuestMarker({
  getPosition,
  height,
}: {
  getPosition: () => { x: number; z: number } | null;
  height: number;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    const p = getPosition();
    if (!g || !p) return;
    const t = clock.elapsedTime;
    g.position.set(p.x, height + Math.sin(t * 3) * 0.12, p.z);
    g.rotation.y = t * 1.6;
  });
  return (
    <group ref={ref} userData={{ noCollide: true }}>
      <mesh>
        <octahedronGeometry args={[0.16, 0]} />
        <meshBasicMaterial color="#f6c445" toneMapped={false} />
      </mesh>
      <mesh scale={1.5}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshBasicMaterial
          color="#f6c445"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

const WALK = 3.6;
const RUN = 6;
const PLAYER_R = 0.38;

function resolve(
  x: number,
  z: number,
  obstacles: Obstacle[],
  bounds: ExploreMapData["bounds"],
): Vec2 {
  for (let pass = 0; pass < 2; pass++) {
    for (const o of obstacles) {
      if (o.kind === "circle") {
        const dx = x - o.at[0];
        const dz = z - o.at[1];
        const min = o.r + PLAYER_R;
        const d2 = dx * dx + dz * dz;
        if (d2 < min * min) {
          const d = Math.sqrt(d2) || 0.0001;
          x = o.at[0] + (dx / d) * min;
          z = o.at[1] + (dz / d) * min;
        }
      } else {
        const minX = o.min[0] - PLAYER_R;
        const maxX = o.max[0] + PLAYER_R;
        const minZ = o.min[1] - PLAYER_R;
        const maxZ = o.max[1] + PLAYER_R;
        if (x > minX && x < maxX && z > minZ && z < maxZ) {
          const push = [x - minX, maxX - x, z - minZ, maxZ - z];
          const m = Math.min(...push);
          if (m === push[0]) x = minX;
          else if (m === push[1]) x = maxX;
          else if (m === push[2]) z = minZ;
          else z = maxZ;
        }
      }
    }
  }
  x = MathUtils.clamp(x, bounds.min[0], bounds.max[0]);
  z = MathUtils.clamp(z, bounds.min[1], bounds.max[1]);
  return [x, z];
}

const KEY_DIR: Record<string, [number, number]> = {
  KeyW: [0, -1],
  ArrowUp: [0, -1],
  KeyS: [0, 1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

function Player({
  map,
  effects,
  frozen,
  reduced,
  joystick,
  lookTarget,
  onNearChange,
  onArrive,
  onReady,
  doneQuests,
  talkingTo = null,
  playerAction = null,
}: ExploreStageProps) {
  const { camera, size, clock, gl, scene } = useThree();
  /** Live positions of villagers, passers-by and animals (for collisions). */
  const registry = useRef<AgentRegistry>(new Map());
  const talking = useRef<string | null>(talkingTo);
  talking.current = talkingTo;
  const gesture = useRef<CharacterAction | null>(null);
  const actor = useRef<Group>(null);
  const sun = useRef<DirectionalLight>(null);
  const sunTarget = useMemo(() => new Object3D(), []);
  const keys = useRef(new Set<string>());
  /** Click-to-walk route (A* waypoints) and the interaction to open on arrival. */
  const target = useRef<{ path: Vec2[]; arrive?: string } | null>(null);
  const locomotion = useRef<StoryLocomotion>({ speed: 0, direction: 1 });
  const near = useRef<string | null>(null);
  const first = useRef(true);
  const focus = useRef(new Vector3());
  const world = useRef<Group>(null);
  const obstacles = useRef<Obstacle[]>(map.obstacles);
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  // Static colliders = authored obstacles + whatever the scene renders.
  // People and animals move, so they are added live from the registry.
  useEffect(() => {
    obstacles.current = [...map.obstacles];
    const timer = window.setTimeout(() => {
      if (world.current)
        obstacles.current = [
          ...map.obstacles,
          ...sceneColliders(world.current),
        ];
    }, 400);
    return () => window.clearTimeout(timer);
  }, [map, effects]);

  /** Static colliders plus everyone's current position. */
  const allObstacles = (): Obstacle[] => {
    const live: Obstacle[] = [];
    registry.current.forEach((a) => {
      if (a.r > 0) live.push({ kind: "circle", at: [a.x, a.z], r: a.r });
    });
    return live.length ? [...obstacles.current, ...live] : obstacles.current;
  };

  /** Where an interaction is: its NPC's live position if they walk around. */
  const interactionPoint = (it: ExploreMapData["interactions"][number]) => {
    const npc = it.npc ? map.npcs.find((n) => n.id === it.npc) : undefined;
    const live = npc?.movement ? registry.current.get(npc.id) : undefined;
    return live
      ? { x: live.x, z: live.z, r: (it.radius ?? 1.8) + 0.4 }
      : { x: it.at[0], z: it.at[1], r: it.radius ?? 1.8 };
  };

  // Replay Dĩ's gesture whenever the page asks for one.
  useEffect(() => {
    if (playerAction && !reduced)
      gesture.current = { kind: playerAction.kind, start: clock.elapsedTime };
  }, [playerAction, reduced, clock]);

  const chapterIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === map.chapterId),
  );
  const look = LOOKS[chapterIndex];
  const zoom = size.width / size.height < 0.8 ? 1.45 : 1;
  const Scene = MAP_SCENES[map.id];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        /INPUT|TEXTAREA/.test(e.target.tagName)
      )
        return;
      if (
        KEY_DIR[e.code] ||
        e.code === "ShiftLeft" ||
        e.code === "ShiftRight"
      ) {
        if (KEY_DIR[e.code]) e.preventDefault();
        keys.current.add(e.code);
        target.current = null;
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  useEffect(() => {
    if (actor.current)
      actor.current.position.set(map.spawn[0], 0, map.spawn[1]);
  }, [map]);

  // Test hook (only with ?debug in the URL): teleport to a point for automated play-tests.
  useEffect(() => {
    if (!window.location.search.includes("debug")) return;
    const w = window as unknown as {
      __exploreTeleport?: (x: number, z: number) => void;
      __exploreMap?: ExploreMapData;
      __exploreWalk?: (x: number, z: number) => boolean;
      __explorePos?: () => Vec2 | null;
      __exploreAgents?: () => Record<string, { x: number; z: number }>;
    };
    w.__exploreMap = map;
    w.__exploreWalk = (x, z) => {
      walkRef.current([x, z]);
      return target.current !== null;
    };
    w.__exploreAgents = () =>
      Object.fromEntries(
        [...registry.current].map(([key, v]) => [
          key,
          { x: +v.x.toFixed(2), z: +v.z.toFixed(2) },
        ]),
      );
    w.__explorePos = () =>
      actor.current
        ? [actor.current.position.x, actor.current.position.z]
        : null;
    w.__exploreTeleport = (x, z) => {
      target.current = null;
      // Step out of whatever stands there, like a real walk would.
      let [rx, rz] = [x, z + 0.01];
      for (let i = 0; i < 4; i++)
        [rx, rz] = resolve(rx, rz, obstacles.current, map.bounds);
      actor.current?.position.set(rx, 0, rz);
    };
    return () => {
      delete w.__exploreTeleport;
      delete w.__exploreMap;
      delete w.__exploreWalk;
      delete w.__explorePos;
      delete w.__exploreAgents;
    };
  }, [map]);

  const frames = useRef(0);
  useFrame((_, delta) => {
    const a = actor.current;
    if (!a) return;
    const liveTalk = talkingTo ? registry.current.get(talkingTo) : undefined;
    const talkSubject: Vec2 | null = liveTalk
      ? [liveTalk.x, liveTalk.z]
      : lookTarget;
    if (frames.current < 3 && ++frames.current === 3) {
      // Compile every shader now, behind the painted cover, so walking into a
      // new area or opening a conversation never stalls on first sight.
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        onReady?.();
      };
      gl.compileAsync(scene, camera).then(finish, finish);
      window.setTimeout(finish, 12000);
    }
    const step = Math.min(delta, 0.1);
    let dx = 0;
    let dz = 0;
    if (!frozenRef.current && !reduced) {
      for (const code of keys.current) {
        const d = KEY_DIR[code];
        if (d) {
          dx += d[0];
          dz += d[1];
        }
      }
      dx += joystick.current.x;
      dz += joystick.current.z;
      if (dx === 0 && dz === 0 && target.current) {
        const route = target.current;
        while (route.path.length) {
          const [wx, wz] = route.path[0];
          if (Math.hypot(wx - a.position.x, wz - a.position.z) > 0.25) break;
          route.path.shift();
        }
        if (!route.path.length) {
          target.current = null;
          if (route.arrive) onArrive?.(route.arrive);
        } else {
          const tx = route.path[0][0] - a.position.x;
          const tz = route.path[0][1] - a.position.z;
          const dist = Math.hypot(tx, tz);
          dx = tx / dist;
          dz = tz / dist;
        }
      }
    } else if (reduced && !frozenRef.current && target.current) {
      // Reduced motion: jump straight to the end of the route.
      const end = target.current.path.at(-1);
      if (end) {
        const [x, z] = resolve(end[0], end[1], obstacles.current, map.bounds);
        a.position.set(x, 0, z);
      }
      const arrive = target.current.arrive;
      target.current = null;
      if (arrive) onArrive?.(arrive);
    }

    const len = Math.hypot(dx, dz);
    let speed = 0;
    if (len > 0.01) {
      const run =
        keys.current.has("ShiftLeft") || keys.current.has("ShiftRight");
      speed = (run ? RUN : WALK) * Math.min(1, len);
      const nx = a.position.x + (dx / len) * speed * step;
      const nz = a.position.z + (dz / len) * speed * step;
      const [x, z] = resolve(nx, nz, allObstacles(), map.bounds);
      const moved = Math.hypot(x - a.position.x, z - a.position.z);
      speed = step > 0 ? moved / step : 0;
      a.position.x = x;
      a.position.z = z;
      const facing = Math.atan2(dx, dz);
      const diff =
        MathUtils.euclideanModulo(
          facing - a.rotation.y + Math.PI,
          Math.PI * 2,
        ) - Math.PI;
      a.rotation.y += diff * (1 - Math.exp(-step * 12));
    } else if (talkSubject) {
      const facing = Math.atan2(
        talkSubject[0] - a.position.x,
        talkSubject[1] - a.position.z,
      );
      const diff =
        MathUtils.euclideanModulo(
          facing - a.rotation.y + Math.PI,
          Math.PI * 2,
        ) - Math.PI;
      a.rotation.y += diff * (1 - Math.exp(-step * 8));
    }
    locomotion.current.speed = speed;

    // Follow camera. During a conversation it swings to a three-quarter
    // shot framing both Dĩ and whoever (or whatever) he is facing.
    let focusX = a.position.x;
    let focusZ = a.position.z;
    let desired: Vector3;
    const subject = talkSubject;
    if (subject) {
      focusX = (a.position.x + subject[0]) / 2;
      focusZ = (a.position.z + subject[1]) / 2;
      // Two-shot: stand perpendicular to the line between Dĩ and the subject,
      // on the side facing the default camera, so both faces are in profile.
      const ldx = subject[0] - a.position.x;
      const ldz = subject[1] - a.position.z;
      const len = Math.hypot(ldx, ldz) || 1;
      let nx = -ldz / len;
      let nz = ldx / len;
      if (nz < 0 || (nz === 0 && nx < 0)) {
        nx = -nx;
        nz = -nz;
      }
      desired = new Vector3(
        focusX + nx * 5.4 * zoom,
        6.4 * zoom,
        focusZ + nz * 5.4 * zoom + 2.2 * zoom,
      );
    } else {
      desired = new Vector3(
        a.position.x,
        9.2 * zoom,
        a.position.z + 11.5 * zoom,
      );
    }
    const k = first.current || reduced ? 1 : 1 - Math.exp(-step * 3.5);
    first.current = false;
    camera.position.lerp(desired, k);
    focus.current.lerp(new Vector3(focusX, subject ? 1.4 : 1.1, focusZ), k);
    camera.lookAt(focus.current);

    // Sun follows so shadows stay crisp around the player.
    sunTarget.position.set(a.position.x, 0, a.position.z);
    if (sun.current)
      sun.current.position.set(a.position.x - 8, 15, a.position.z + 9);

    // Nearest interaction
    let best: string | null = null;
    let bestD = Infinity;
    for (const it of map.interactions) {
      const spot = interactionPoint(it);
      const d = Math.hypot(spot.x - a.position.x, spot.z - a.position.z);
      if (d < spot.r && d < bestD) {
        best = it.id;
        bestD = d;
      }
    }
    if (best !== near.current) {
      near.current = best;
      onNearChange(best);
    }
  });

  /** Plans an A* route around houses, trees and people instead of walking into them. */
  const walkTo = (goal: Vec2, arrive?: string) => {
    const a = actor.current;
    if (!a) return;
    // Talking to someone only needs Dĩ within reach, so allow a wider arrival.
    const path = findPath(
      [a.position.x, a.position.z],
      goal,
      obstacles.current,
      map.bounds,
      arrive ? 1.0 : 0.65,
    );
    if (path === null) {
      // Unreachable (inside a building or off the map): stay put rather than walk into a wall.
      target.current = null;
      return;
    }
    target.current = { path, arrive };
  };

  const walkRef = useRef(walkTo);
  walkRef.current = walkTo;

  const onGround = (event: ThreeEvent<MouseEvent>) => {
    if (frozenRef.current || event.delta > 6) return;
    event.stopPropagation();
    walkTo([event.point.x, event.point.z]);
  };

  return (
    <>
      <ambientLight intensity={map.sky.ambient} color="#fff6e6" />
      <hemisphereLight
        args={[map.sky.hemiSky ?? "#f3f6ee", "#a8a18a", map.sky.hemi ?? 1.2]}
      />
      <primitive object={sunTarget} />
      <directionalLight
        ref={sun}
        target={sunTarget}
        color={map.sky.sun}
        intensity={map.sky.sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-far={60}
        shadow-normalBias={0.04}
        shadow-bias={-0.0004}
      />

      <group ref={world}>
        {Scene ? (
          <Scene effects={effects} player={actor} reducedMotion={reduced} />
        ) : null}
        <EnvironmentDetails map={map} reduced={reduced} />
      </group>

      {/* click / tap to walk */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
        onClick={onGround}
      >
        <planeGeometry args={[80, 60]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* villagers: they work, stroll, and stop to look at Dĩ */}
      {map.npcs.map((npc) => (
        <group
          key={npc.id}
          onClick={(e) => {
            if (frozenRef.current || e.delta > 6) return;
            e.stopPropagation();
            const it = map.interactions.find((i) => i.npc === npc.id);
            if (!it) return;
            const live = registry.current.get(npc.id);
            walkTo(live && npc.movement ? [live.x, live.z] : it.at, it.id);
          }}
        >
          <Mover
            id={npc.id}
            home={npc.at}
            facing={npc.facing ?? 0}
            movement={npc.pose === "sit" ? undefined : npc.movement}
            radius={npc.pose === "sit" ? 0.55 : 0.42}
            turnToTalk={npc.pose !== "sit"}
            attention={npc.pose === "sit" ? 0 : 2.6}
            player={actor}
            talking={talking}
            registry={registry}
            obstacles={obstacles}
            bounds={map.bounds}
            reducedMotion={reduced}
          >
            {(motion) => (
              <Villager
                look={npc.look}
                position={[0, 0, 0]}
                pose={npc.pose}
                player={actor}
                reducedMotion={reduced}
                activity={npc.activity}
                motion={motion}
              />
            )}
          </Mover>
        </group>
      ))}

      {/* passers-by */}
      {(map.extras ?? []).map((extra) => (
        <Mover
          key={extra.id}
          id={`extra:${extra.id}`}
          home={extra.at}
          facing={extra.facing ?? 0}
          movement={extra.movement}
          radius={extra.bicycle ? 0.6 : 0.42}
          attention={extra.bicycle ? 0 : 2.2}
          player={actor}
          talking={talking}
          registry={registry}
          obstacles={obstacles}
          bounds={map.bounds}
          reducedMotion={reduced}
        >
          {(motion) => (
            <Villager
              look={extra.look}
              position={[0, 0, 0]}
              pose={extra.pose}
              player={actor}
              reducedMotion={reduced}
              activity={extra.activity}
              motion={motion}
              bicycle={extra.bicycle}
            />
          )}
        </Mover>
      ))}

      {/* animals */}
      {(map.animals ?? []).map((animal) => (
        <Mover
          key={animal.id}
          id={`animal:${animal.id}`}
          home={animal.at}
          facing={animal.facing ?? 0}
          movement={animal.movement}
          follow={animal.follow}
          radius={ANIMAL_RADIUS[animal.kind]}
          attention={0}
          player={actor}
          talking={talking}
          registry={registry}
          obstacles={obstacles}
          bounds={map.bounds}
          reducedMotion={reduced}
        >
          {(motion) => (
            <Animal
              kind={animal.kind}
              color={animal.color}
              motion={motion}
              reducedMotion={reduced}
            />
          )}
        </Mover>
      ))}

      {/* "!" over everyone and everything that still has a task for Dĩ */}
      {map.interactions
        .filter((it) => it.quest && !doneQuests?.has(it.quest))
        .map((it) => {
          const npc = it.npc
            ? map.npcs.find((n) => n.id === it.npc)
            : undefined;
          const height = npc
            ? 2.35 * (npc.look.height ?? 1) * (npc.pose === "sit" ? 0.8 : 1) +
              0.35
            : 1.9;
          const fixed = it.focus ?? it.at;
          return (
            <QuestMarker
              key={it.id}
              height={height}
              getPosition={() => {
                if (npc) {
                  const live = registry.current.get(npc.id);
                  return live ?? { x: npc.at[0], z: npc.at[1] };
                }
                return { x: fixed[0], z: fixed[1] };
              }}
            />
          );
        })}

      <Ambience map={map} player={actor} reduced={reduced} />

      <group ref={actor} name="Di_Explorer">
        <StoryCharacter
          chapter={look.base}
          shirt={look.shirt}
          reducedMotion={reduced}
          locomotion={locomotion}
          action={gesture}
        />
      </group>
    </>
  );
}

function SceneFog({ color }: { color: string }) {
  const { scene } = useThree();
  useEffect(() => {
    scene.fog = new Fog(color, 30, 75);
    return () => {
      scene.fog = null;
    };
  }, [scene, color]);
  return null;
}

/**
 * Keeps the frame rate up on modest hardware: measures frame time and steps
 * the pixel ratio down (never below 0.75) while frames are slow, back up when
 * there is headroom again.
 */
function AdaptiveQuality({ max }: { max: number }) {
  const { setDpr, viewport } = useThree();
  const sample = useRef({ time: 0, frames: 0, dpr: viewport.dpr });
  useFrame((_, delta) => {
    const s = sample.current;
    s.time += delta;
    s.frames += 1;
    if (s.time < 2) return;
    const fps = s.frames / s.time;
    s.time = 0;
    s.frames = 0;
    let next = s.dpr;
    if (fps < 32) next = Math.max(0.75, s.dpr - 0.25);
    else if (fps > 55) next = Math.min(max, s.dpr + 0.25);
    if (next !== s.dpr) {
      s.dpr = next;
      setDpr(next);
    }
  });
  return null;
}

/** Phones and low-core machines skip soft shadows and start at a lower resolution. */
function useLowPower() {
  const [low] = useState(() => {
    if (typeof window === "undefined") return false;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    return coarse || cores <= 4;
  });
  return low;
}

export default function ExploreStage(props: ExploreStageProps) {
  const low = useLowPower();
  const maxDpr = low ? 1.25 : 1.6;
  return (
    <Canvas
      shadows={low ? { type: BasicShadowMap } : { type: PCFShadowMap }}
      dpr={[0.75, maxDpr]}
      camera={{ position: [0, 9, 20], fov: 42, near: 0.1, far: 200 }}
      gl={{
        antialias: !low,
        alpha: true,
        toneMapping: ACESFilmicToneMapping,
        powerPreference: "high-performance",
      }}
      aria-label={`Bản đồ 3D: ${props.map.title}. Dùng phím mũi tên hoặc chạm vào mặt đất để đi.`}
      role="img"
    >
      <AdaptiveQuality max={maxDpr} />
      <SceneFog color={props.map.sky.fog} />
      <Player {...props} />
    </Canvas>
  );
}
