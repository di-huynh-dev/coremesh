"use client";

/* R3F intrinsic elements use Three.js properties instead of DOM attributes. */
/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  MathUtils,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  Vector3,
} from "three";
import { chapters } from "@/lib/story";
import {
  ATMOSPHERE,
  CHAPTER_COUNT,
  LOOKS,
  SHOTS,
  atmosphereAt,
  smoother,
} from "@/lib/story-journey";
import { environmentTheme } from "@/lib/explore/presentation";
import { AmbienceLayer } from "@/components/explore/ambience";
import {
  STORY_SCENE_HALF_WIDTH,
  STORY_SCENE_SPACING,
  STORY_WALKWAY_Z,
} from "@/lib/story-layout";
import { StoryCharacter, type StoryLocomotion } from "./character-3d";
import { CHILDHOOD_SCENES } from "./world-childhood";
import { STORY_SCENES, StoryGround, StoryWorld } from "./world-3d";

/** Renders the diorama for a chapter: original scenes by id, extra childhood scenes from the registry. */
function ChapterWorld({
  index,
  reduced,
  onInspect,
}: {
  index: number;
  reduced: boolean;
  onInspect: (name: string) => void;
}) {
  const id = chapters[index].id;
  const legacy = STORY_SCENES.findIndex((scene) => scene.id === id);
  if (legacy >= 0)
    return (
      <StoryWorld
        chapter={legacy}
        reducedMotion={reduced}
        onInspect={onInspect}
      />
    );
  const Extra = CHILDHOOD_SCENES[id];
  return (
    <group>
      <StoryGround chapter={0} />
      {Extra ? <Extra reducedMotion={reduced} onInspect={onInspect} /> : null}
    </group>
  );
}

export type StageProps = {
  /** Continuous chapter coordinate written by the scroll handler. */
  position: RefObject<number>;
  /** Chapter whose outfit / scene props are active. */
  chapter: number;
  /** Desktop keeps the scene right of the text; narrow screens lift it above the sheet. */
  layout: "wide" | "narrow";
  reduced: boolean;
  visible: boolean;
  onInspect: (name: string, chapter: number) => void;
  onUnavailable: () => void;
};

class SceneBoundary extends Component<
  { children: ReactNode; onUnavailable: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onUnavailable();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function RendererEvents({ onLost }: { onLost: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onLost);
    return () => canvas.removeEventListener("webglcontextlost", onLost);
  }, [gl, onLost]);
  return null;
}

/** Shifts the rendered frame so the subject sits beside (wide) or above (narrow) the text. */
function ViewShift({ layout }: { layout: StageProps["layout"] }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const { width: w, height: h } = size;
    if (layout === "wide") cam.setViewOffset(w, h, -w * 0.17, 0, w, h);
    else cam.setViewOffset(w, h, 0, h * 0.2, w, h);
    cam.updateProjectionMatrix();
    return () => {
      cam.clearViewOffset();
      cam.updateProjectionMatrix();
    };
  }, [camera, size, layout]);
  return null;
}

/** World units per second for an unhurried walk (a scene is 16 units apart). */
const WALK_PACE = 3.4;
/** Extra speed per unit of distance beyond 6 units, so big jumps don't crawl. */
const CATCH_UP = 0.55;

const tmpA = new Vector3();
const tmpB = new Vector3();
const lookAt = new Vector3();
const colorA = new Color();
const colorB = new Color();

function lerpShot(position: number) {
  const i = Math.min(CHAPTER_COUNT - 1, Math.max(0, Math.floor(position)));
  const j = Math.min(CHAPTER_COUNT - 1, i + 1);
  const t = smoother(Math.min(1, Math.max(0, position - i)));
  const a = SHOTS[i];
  const b = SHOTS[j];
  return {
    pos: tmpA
      .set(...a.pos)
      .lerp(tmpB.set(...b.pos), t)
      .clone(),
    look: tmpA
      .set(...a.look)
      .lerp(tmpB.set(...b.look), t)
      .clone(),
    fov: MathUtils.lerp(a.fov, b.fov, t),
  };
}

function Journey({
  position,
  chapter,
  layout,
  reduced,
  onInspect,
}: StageProps) {
  const { camera, scene, size, invalidate } = useThree();
  const actor = useRef<Group>(null);
  const rig = useRef<Group>(null);
  const sun = useRef<DirectionalLight>(null);
  const ambient = useRef<AmbientLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const sunTarget = useMemo(() => new Object3D(), []);
  const locomotion = useRef<StoryLocomotion>({ speed: 0, direction: 1 });
  const pointer = useRef({ x: 0, y: 0 });
  const lastX = useRef(0);
  const first = useRef(true);
  const [segment, setSegment] = useState(0);
  const segmentRef = useRef(0);
  // Portrait screens need the camera further back to keep a whole diorama in frame.
  const fit =
    layout === "narrow"
      ? Math.max(1.25, 1.02 / (size.width / size.height))
      : 1.32;

  useEffect(() => {
    // Fog distances scale with the camera so far scenes fade but the current one stays crisp.
    scene.fog = new Fog("#f1ece2", 24 * fit, 58 * fit);
    return () => {
      scene.fog = null;
    };
  }, [scene, fit]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => invalidate(), [chapter, invalidate]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    const wanted = reduced ? Math.round(position.current) : position.current;
    const targetX = wanted * STORY_SCENE_SPACING;

    // Character keeps a natural walking pace and catches up with the scroll,
    // instead of being dragged at whatever speed the wheel is spun. Long jumps
    // (table of contents) speed up in proportion to the remaining distance.
    let x = targetX;
    if (!reduced && !first.current) {
      const gap = targetX - lastX.current;
      const pace = WALK_PACE + Math.max(0, Math.abs(gap) - 6) * CATCH_UP;
      // Travel uses a looser cap than the camera so slow devices still walk in real time.
      const travelStep = Math.min(delta, 0.1);
      x =
        lastX.current +
        Math.sign(gap) * Math.min(Math.abs(gap), pace * travelStep);
    }
    const p = x / STORY_SCENE_SPACING;

    // Character: walks while it travels, idles when it arrives.
    const velocity = step > 0 ? (x - lastX.current) / step : 0;
    lastX.current = x;
    const speed = Math.min(Math.abs(velocity), 9);
    locomotion.current.speed = reduced ? 0 : speed;
    if (speed > 0.02) locomotion.current.direction = Math.sign(velocity);
    if (actor.current) {
      actor.current.position.set(x, 0, STORY_WALKWAY_Z);
      const facing = speed > 0.15 ? Math.sign(velocity) * (Math.PI / 2) : 0.2;
      const diff =
        MathUtils.euclideanModulo(
          facing - actor.current.rotation.y + Math.PI,
          Math.PI * 2,
        ) - Math.PI;
      actor.current.rotation.y +=
        diff * (reduced ? 1 : 1 - Math.exp(-step * 8));
    }

    // Camera: per-memory shot, eased between chapters, with gentle pointer parallax.
    const shot = lerpShot(p);
    const desired = shot.pos
      .sub(shot.look)
      .multiplyScalar(fit)
      .add(shot.look)
      .add(
        new Vector3(x + pointer.current.x * 0.7, -pointer.current.y * 0.35, 0),
      );
    const target = lookAt.copy(shot.look).add(new Vector3(x, 0, 0));
    const cam = camera as PerspectiveCamera;
    const k = reduced || first.current ? 1 : 1 - Math.exp(-step * 4.5);
    first.current = false;
    cam.position.lerp(desired, k);
    if (Math.abs(cam.fov - shot.fov) > 0.01) {
      cam.fov = MathUtils.lerp(cam.fov, shot.fov, k);
      cam.updateProjectionMatrix();
    }
    cam.lookAt(target);

    // Light, fog and colour follow the hour of this chapter of life.
    const { from, to, t } = atmosphereAt(p);
    if (rig.current) rig.current.position.x = x;
    sunTarget.position.set(x, 0, 0);
    if (sun.current) {
      sun.current.color.copy(colorA.set(from.sun).lerp(colorB.set(to.sun), t));
      sun.current.intensity = MathUtils.lerp(
        from.sunIntensity,
        to.sunIntensity,
        t,
      );
    }
    if (ambient.current)
      ambient.current.intensity = MathUtils.lerp(from.ambient, to.ambient, t);
    if (hemi.current) {
      hemi.current.color.copy(
        colorA.set(from.hemiSky).lerp(colorB.set(to.hemiSky), t),
      );
      hemi.current.groundColor.copy(
        colorA.set(from.hemiGround).lerp(colorB.set(to.hemiGround), t),
      );
    }
    if (scene.fog)
      (scene.fog as Fog).color.copy(
        colorA.set(from.haze).lerp(colorB.set(to.haze), t),
      );

    const nextSegment = Math.min(CHAPTER_COUNT - 1, Math.max(0, Math.floor(p)));
    if (nextSegment !== segmentRef.current) {
      segmentRef.current = nextSegment;
      setSegment(nextSegment);
    }
  });

  const indices = [segment - 1, segment, segment + 1, segment + 2].filter(
    (i) => i >= 0 && i < CHAPTER_COUNT,
  );
  const gap = STORY_SCENE_SPACING - STORY_SCENE_HALF_WIDTH * 2;
  const farEnd = (CHAPTER_COUNT - 1) * STORY_SCENE_SPACING;

  return (
    <>
      <group ref={rig}>
        <ambientLight ref={ambient} intensity={1.1} color="#fff6e6" />
        <hemisphereLight ref={hemi} args={["#f3f6ee", "#a8a18a", 1.4]} />
        <directionalLight
          position={[8, 5, -6]}
          intensity={1.2}
          color="#d5e8ee"
        />
        <directionalLight
          ref={sun}
          target={sunTarget}
          position={[-6, 12, 8]}
          intensity={3}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={10}
          shadow-camera-bottom={-8}
          shadow-normalBias={0.035}
          shadow-bias={-0.0003}
        />
      </group>
      <primitive object={sunTarget} />

      {indices.map((i) => (
        <group key={i} position={[i * STORY_SCENE_SPACING, 0, 0]}>
          <ChapterWorld
            index={i}
            reduced={reduced}
            onInspect={(name) => onInspect(name, i)}
          />
        </group>
      ))}

      {Array.from({ length: CHAPTER_COUNT - 1 }, (_, i) => (
        <group
          key={`path-${i}`}
          position={[
            i * STORY_SCENE_SPACING + STORY_SCENE_HALF_WIDTH + gap / 2,
            0,
            STORY_WALKWAY_Z,
          ]}
        >
          <mesh position={[0, -0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[gap + 0.12, 0.16, 1.3]} />
            <meshStandardMaterial color="#c6b48c" roughness={1} />
          </mesh>
          {[-0.7, 0.7].map((z) => (
            <mesh key={z} position={[0, -0.04, z]}>
              <boxGeometry args={[gap, 0.08, 0.06]} />
              <meshStandardMaterial color="#aa9470" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      <group ref={actor} position={[0, 0, STORY_WALKWAY_Z]} name="Di_Character">
        <StoryCharacter
          chapter={LOOKS[chapter].base}
          shirt={LOOKS[chapter].shirt}
          reducedMotion={reduced}
          locomotion={locomotion}
        />
      </group>

      {/* Life in the air follows Dĩ: butterflies by day, fireflies at night, leaves, birds. */}
      <AmbienceLayer
        theme={environmentTheme(chapters[chapter].id)}
        night={Boolean(ATMOSPHERE[chapter].night)}
        player={actor}
        reduced={reduced}
        groundShadows={false}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[farEnd / 2, -0.62, 0]}
        receiveShadow
      >
        <planeGeometry args={[farEnd + 120, 120]} />
        <shadowMaterial transparent opacity={0.12} />
      </mesh>
    </>
  );
}

export default function StoryStage(props: StageProps) {
  const [lost, setLost] = useState(false);
  const { onUnavailable } = props;
  useEffect(() => {
    if (lost) onUnavailable();
  }, [lost, onUnavailable]);

  if (lost) return null;
  return (
    <SceneBoundary onUnavailable={onUnavailable}>
      <Canvas
        aria-label={`Hành trình 3D. Đang ở chặng ${props.chapter + 1}: ${chapters[props.chapter].label}.`}
        role="img"
        shadows={{ type: PCFShadowMap }}
        dpr={[1, 1.6]}
        camera={{ position: [-6, 6.4, 15], fov: 36, near: 0.1, far: 260 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
        }}
        frameloop={props.visible ? "always" : "demand"}
        fallback={null}
      >
        <RendererEvents onLost={() => setLost(true)} />
        <ViewShift layout={props.layout} />
        <Journey {...props} />
      </Canvas>
    </SceneBoundary>
  );
}
