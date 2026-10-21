"use client";

/* React Three Fiber elements use Three.js properties rather than DOM attributes. */
/* eslint-disable react/no-unknown-property */

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  AnimationClip,
  BoxGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  MeshStandardMaterial,
  Euler,
  Quaternion,
  QuaternionKeyframeTrack,
  Shape,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  CatmullRomCurve3,
  Vector3,
  VectorKeyframeTrack,
} from "three";

type Point = [number, number, number];
type Paint = keyof typeof paints;

// One small, shared geometry/material library keeps this illustrated person light
// enough to sit inside every chapter. None of these resources are animated.
const sphere = new SphereGeometry(1, 24, 16);
const box = new BoxGeometry(1, 1, 1);
const arm = new CapsuleGeometry(0.117, 0.23, 5, 12);
const forearm = new CapsuleGeometry(0.086, 0.22, 5, 12);
const upperLeg = new CapsuleGeometry(0.159, 0.25, 5, 14);
const lowerLeg = new CapsuleGeometry(0.151, 0.235, 5, 14);
const hairCap = new SphereGeometry(1, 28, 18, 0, Math.PI * 2, 0, 1.68);
const glassesRing = new TorusGeometry(0.103, 0.009, 6, 28);
const coffeeCup = new CylinderGeometry(0.083, 0.06, 0.215, 18);
const coffeeSleeve = new CylinderGeometry(0.077, 0.069, 0.087, 18);
const coffeeLid = new CylinderGeometry(0.088, 0.088, 0.025, 18);
const spoolCore = new CylinderGeometry(0.06, 0.06, 0.17, 12);
const spoolRim = new CylinderGeometry(0.096, 0.096, 0.025, 16);
const conicalHat = new ConeGeometry(0.327, 0.232, 32, 1, true);
const hatRim = new TorusGeometry(0.326, 0.012, 6, 32);

const paints = {
  skin: new MeshStandardMaterial({ color: "#d9a47b", roughness: 0.79 }),
  skinLight: new MeshStandardMaterial({ color: "#e7b68b", roughness: 0.78 }),
  skinShade: new MeshStandardMaterial({ color: "#bb805e", roughness: 0.86 }),
  cheek: new MeshStandardMaterial({ color: "#d99a7c", roughness: 0.88 }),
  lip: new MeshStandardMaterial({ color: "#8a5141", roughness: 0.91 }),
  hair: new MeshStandardMaterial({ color: "#182022", roughness: 0.7 }),
  hairLight: new MeshStandardMaterial({ color: "#263033", roughness: 0.7 }),
  pupil: new MeshStandardMaterial({ color: "#111b1c", roughness: 0.36 }),
  iris: new MeshStandardMaterial({ color: "#49362d", roughness: 0.5 }),
  white: new MeshStandardMaterial({ color: "#fffbec", roughness: 0.76 }),
  eyeWhite: new MeshStandardMaterial({ color: "#ffefda", roughness: 0.42 }),
  shirt: new MeshStandardMaterial({ color: "#f4e9ce", roughness: 0.95 }),
  cream: new MeshStandardMaterial({ color: "#e2d1aa", roughness: 0.98 }),
  saffron: new MeshStandardMaterial({ color: "#d6a258", roughness: 0.95 }),
  olive: new MeshStandardMaterial({ color: "#677564", roughness: 0.97 }),
  blue: new MeshStandardMaterial({ color: "#597d8a", roughness: 0.95 }),
  teal: new MeshStandardMaterial({ color: "#3b676b", roughness: 0.95 }),
  charcoal: new MeshStandardMaterial({ color: "#46565a", roughness: 0.94 }),
  terracotta: new MeshStandardMaterial({ color: "#ad7558", roughness: 0.95 }),
  navy: new MeshStandardMaterial({ color: "#263d4d", roughness: 0.98 }),
  denim: new MeshStandardMaterial({ color: "#3a5663", roughness: 0.98 }),
  red: new MeshStandardMaterial({
    color: "#b74938",
    roughness: 0.91,
    side: DoubleSide,
  }),
  canvas: new MeshStandardMaterial({ color: "#a57e51", roughness: 1 }),
  leather: new MeshStandardMaterial({ color: "#775c44", roughness: 0.94 }),
  rubber: new MeshStandardMaterial({ color: "#394544", roughness: 0.95 }),
  metal: new MeshStandardMaterial({
    color: "#b6ab8c",
    roughness: 0.48,
    metalness: 0.5,
  }),
  laptop: new MeshStandardMaterial({
    color: "#627775",
    roughness: 0.52,
    metalness: 0.26,
  }),
  screen: new MeshStandardMaterial({
    color: "#163f45",
    emissive: "#3a8f8d",
    emissiveIntensity: 0.42,
    roughness: 0.52,
  }),
  code: new MeshStandardMaterial({
    color: "#a4d6bc",
    emissive: "#a4d6bc",
    emissiveIntensity: 0.22,
  }),
  paper: new MeshStandardMaterial({
    color: "#ffefd0",
    roughness: 1,
    side: DoubleSide,
  }),
};

const torsoShape = new Shape();
torsoShape.moveTo(-0.33, -0.48);
torsoShape.quadraticCurveTo(-0.39, -0.48, -0.39, -0.38);
torsoShape.lineTo(-0.435, 0.28);
torsoShape.quadraticCurveTo(-0.43, 0.38, -0.31, 0.42);
torsoShape.lineTo(-0.17, 0.49);
torsoShape.lineTo(0.17, 0.49);
torsoShape.lineTo(0.31, 0.42);
torsoShape.quadraticCurveTo(0.43, 0.38, 0.435, 0.28);
torsoShape.lineTo(0.39, -0.38);
torsoShape.quadraticCurveTo(0.39, -0.48, 0.33, -0.48);
torsoShape.closePath();
const torso = new ExtrudeGeometry(torsoShape, {
  depth: 0.35,
  bevelEnabled: true,
  bevelSegments: 3,
  steps: 1,
  bevelSize: 0.045,
  bevelThickness: 0.045,
  curveSegments: 8,
});
torso.translate(0, 0, -0.175);

function triangle(a: Point, b: Point, c: Point) {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute([...a, ...b, ...c], 3),
  );
  geometry.computeVertexNormals();
  return geometry;
}

function curve(points: Point[], radius = 0.012) {
  return new TubeGeometry(
    new CatmullRomCurve3(points.map((point) => new Vector3(...point))),
    16,
    radius,
    6,
    false,
  );
}

const smile = curve(
  [
    [-0.088, -0.177, 0.322],
    [0, -0.202, 0.347],
    [0.088, -0.177, 0.322],
  ],
  0.009,
);
const lowerLip = curve(
  [
    [-0.045, -0.216, 0.329],
    [0, -0.222, 0.339],
    [0.045, -0.216, 0.329],
  ],
  0.006,
);
const leftCollar = triangle(
  [-0.17, 2.17, 0.242],
  [-0.3, 2.055, 0.256],
  [-0.12, 1.99, 0.272],
);
const rightCollar = triangle(
  [0.17, 2.17, 0.242],
  [0.12, 1.99, 0.272],
  [0.3, 2.055, 0.256],
);
const scarfLeft = triangle(
  [-0.24, 2.086, 0.277],
  [-0.02, 2.009, 0.303],
  [-0.035, 1.72, 0.285],
);
const scarfRight = triangle(
  [0.24, 2.086, 0.277],
  [0.09, 1.78, 0.285],
  [-0.02, 2.009, 0.303],
);
const shoulderStrap = curve(
  [
    [-0.32, 2.12, 0.265],
    [-0.12, 1.87, 0.303],
    [0.24, 1.49, 0.308],
    [0.47, 1.24, 0.277],
  ],
  0.037,
);
const packStrapLeft = curve(
  [
    [-0.32, 2.07, -0.12],
    [-0.34, 2.13, 0.14],
    [-0.31, 1.91, 0.275],
    [-0.29, 1.59, 0.257],
    [-0.37, 1.5, -0.12],
  ],
  0.037,
);
const packStrapRight = curve(
  [
    [0.32, 2.07, -0.12],
    [0.34, 2.13, 0.14],
    [0.31, 1.91, 0.275],
    [0.29, 1.59, 0.257],
    [0.37, 1.5, -0.12],
  ],
  0.037,
);
const glassesBridge = curve(
  [
    [-0.044, 0.022, 0.368],
    [0, 0.037, 0.383],
    [0.044, 0.022, 0.368],
  ],
  0.009,
);
const glassesLeft = curve(
  [
    [-0.247, 0.037, 0.355],
    [-0.33, 0.045, 0.23],
    [-0.368, 0.027, 0.04],
  ],
  0.008,
);
const glassesRight = curve(
  [
    [0.247, 0.037, 0.355],
    [0.33, 0.045, 0.23],
    [0.368, 0.027, 0.04],
  ],
  0.008,
);
const paperPlaneLeft = triangle(
  [0, 0, 0.32],
  [-0.27, -0.02, -0.2],
  [0, 0.045, -0.11],
);
const paperPlaneRight = triangle(
  [0, 0, 0.32],
  [0, 0.045, -0.11],
  [0.27, -0.02, -0.2],
);

function Soft({
  at = [0, 0, 0],
  size = [1, 1, 1],
  rotation,
  paint,
}: {
  at?: Point;
  size?: Point;
  rotation?: Point;
  paint: Paint;
}) {
  return (
    <mesh
      geometry={sphere}
      material={paints[paint]}
      position={at}
      scale={size}
      rotation={rotation}
      castShadow
      receiveShadow
      dispose={null}
    />
  );
}

function Patch({
  geometry,
  paint,
}: {
  geometry: BufferGeometry;
  paint: Paint;
}) {
  return (
    <mesh
      geometry={geometry}
      material={paints[paint]}
      castShadow
      receiveShadow
      dispose={null}
    />
  );
}

function Block({
  at,
  size,
  paint,
  rotation,
}: {
  at: Point;
  size: Point;
  paint: Paint;
  rotation?: Point;
}) {
  return (
    <mesh
      geometry={box}
      position={at}
      scale={size}
      rotation={rotation}
      material={paints[paint]}
      castShadow
      receiveShadow
      dispose={null}
    />
  );
}

function Face({
  glasses,
  eyes,
}: {
  glasses: boolean;
  eyes: RefObject<Group | null>;
}) {
  return (
    <>
      <Soft size={[0.367, 0.432, 0.332]} paint="skin" />
      <Soft at={[0, -0.155, 0.018]} size={[0.293, 0.276, 0.302]} paint="skin" />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Soft
            at={[side * 0.367, -0.044, 0]}
            size={[0.067, 0.102, 0.067]}
            paint="skin"
          />
          <Soft
            at={[side * 0.391, -0.043, 0.047]}
            size={[0.028, 0.058, 0.023]}
            paint="skinShade"
          />
          <Soft
            at={[side * 0.234, -0.099, 0.271]}
            size={[0.067, 0.038, 0.027]}
            paint="cheek"
          />
          <Soft
            at={[side * 0.144, 0.111, 0.306]}
            size={[0.093, 0.016, 0.021]}
            rotation={[0, 0, side * -0.08]}
            paint="hair"
          />
        </group>
      ))}
      <group ref={eyes} position={[0, 0.02, 0]}>
        {[-1, 1].map((side) => (
          <group
            key={side}
            position={[side * 0.143, 0, 0.307]}
            rotation={[0, side * 0.14, 0]}
          >
            <Soft size={[0.089, 0.045, 0.026]} paint="eyeWhite" />
            <Soft
              at={[0, 0, 0.023]}
              size={[0.031, 0.034, 0.012]}
              paint="iris"
            />
            <Soft
              at={[0, 0, 0.032]}
              size={[0.018, 0.027, 0.006]}
              paint="pupil"
            />
            <Soft
              at={[-0.008, 0.013, 0.038]}
              size={[0.007, 0.009, 0.004]}
              paint="white"
            />
            <Soft
              at={[0, 0.039, 0.002]}
              size={[0.087, 0.009, 0.027]}
              paint="skinShade"
            />
          </group>
        ))}
      </group>
      <Soft
        at={[0, -0.048, 0.319]}
        size={[0.046, 0.09, 0.065]}
        paint="skinLight"
      />
      <Soft
        at={[0, -0.103, 0.365]}
        size={[0.055, 0.035, 0.038]}
        paint="skinLight"
      />
      <Soft
        at={[-0.033, -0.116, 0.364]}
        size={[0.01, 0.006, 0.008]}
        paint="skinShade"
      />
      <Soft
        at={[0.033, -0.116, 0.364]}
        size={[0.01, 0.006, 0.008]}
        paint="skinShade"
      />
      <Patch geometry={smile} paint="lip" />
      <Patch geometry={lowerLip} paint="skinLight" />
      <mesh
        geometry={hairCap}
        material={paints.hair}
        position={[0, 0.096, -0.014]}
        scale={[0.383, 0.418, 0.347]}
        castShadow
        dispose={null}
      />
      <Soft
        at={[-0.343, 0.003, -0.008]}
        size={[0.046, 0.15, 0.159]}
        rotation={[0, 0, -0.08]}
        paint="hair"
      />
      <Soft
        at={[0.343, 0.018, -0.008]}
        size={[0.046, 0.134, 0.15]}
        rotation={[0, 0, 0.08]}
        paint="hair"
      />
      {/* Swept, overlapping locks give a deliberate side part, rather than a ball-shaped cap. */}
      <Soft
        at={[-0.247, 0.245, 0.221]}
        size={[0.108, 0.224, 0.098]}
        rotation={[0.2, -0.14, -0.56]}
        paint="hair"
      />
      <Soft
        at={[-0.135, 0.32, 0.226]}
        size={[0.112, 0.22, 0.105]}
        rotation={[0.13, 0, -0.7]}
        paint="hairLight"
      />
      <Soft
        at={[0.003, 0.349, 0.208]}
        size={[0.102, 0.221, 0.103]}
        rotation={[0.12, 0, -0.86]}
        paint="hair"
      />
      <Soft
        at={[0.14, 0.333, 0.19]}
        size={[0.095, 0.185, 0.1]}
        rotation={[0.15, 0.1, -1.0]}
        paint="hairLight"
      />
      <Soft
        at={[0.26, 0.25, 0.172]}
        size={[0.078, 0.153, 0.11]}
        rotation={[0.1, 0.1, -0.62]}
        paint="hair"
      />
      {glasses ? (
        <group>
          {[-1, 1].map((side) => (
            <mesh
              geometry={glassesRing}
              key={side}
              position={[side * 0.143, 0.02, 0.357]}
              scale={[1.04, 0.79, 1]}
              material={paints.hair}
              castShadow
              dispose={null}
            />
          ))}
          <Patch geometry={glassesBridge} paint="hair" />
          <Patch geometry={glassesLeft} paint="hair" />
          <Patch geometry={glassesRight} paint="hair" />
        </group>
      ) : null}
    </>
  );
}

function Backpack() {
  return (
    <group>
      <Soft
        at={[0, 1.745, -0.355]}
        size={[0.358, 0.448, 0.179]}
        paint="canvas"
      />
      <Soft
        at={[0, 1.59, -0.484]}
        size={[0.266, 0.198, 0.072]}
        paint="leather"
      />
      <Soft at={[0, 1.92, -0.488]} size={[0.111, 0.046, 0.012]} paint="cream" />
      <Patch geometry={packStrapLeft} paint="canvas" />
      <Patch geometry={packStrapRight} paint="canvas" />
    </group>
  );
}

function Book({ paint = "teal" }: { paint?: Paint }) {
  return (
    <group position={[0.58, 1.25, 0.18]} rotation={[0.05, -0.3, -0.11]}>
      <Block at={[0, 0, 0]} size={[0.25, 0.38, 0.073]} paint={paint} />
      <Block
        at={[0.012, 0.005, 0.043]}
        size={[0.22, 0.346, 0.027]}
        paint="paper"
      />
      <Block
        at={[0.013, 0.005, 0.063]}
        size={[0.235, 0.37, 0.012]}
        paint={paint}
      />
      <Block
        at={[0.012, 0.09, 0.071]}
        size={[0.12, 0.016, 0.005]}
        paint="cream"
      />
      <Block
        at={[0.012, 0.055, 0.071]}
        size={[0.084, 0.008, 0.005]}
        paint="cream"
      />
    </group>
  );
}

function Satchel() {
  return (
    <group>
      <Patch geometry={shoulderStrap} paint="leather" />
      <Soft
        at={[0.47, 1.03, 0.113]}
        size={[0.155, 0.287, 0.345]}
        rotation={[0, 0, -0.09]}
        paint="canvas"
      />
      <Block
        at={[0.54, 1.06, 0.303]}
        size={[0.025, 0.077, 0.044]}
        paint="metal"
        rotation={[0, 0, -0.09]}
      />
    </group>
  );
}

function Laptop({ open }: { open: boolean }) {
  return (
    <group position={[0.16, 1.3, 0.48]} rotation={[0.1, -0.22, -0.04]}>
      <Block at={[0, 0, 0]} size={[0.77, 0.035, 0.46]} paint="laptop" />
      {open ? (
        <>
          <Block
            at={[0, 0.02, -0.025]}
            size={[0.65, 0.008, 0.25]}
            paint="charcoal"
          />
          <Block
            at={[0, 0.021, 0.155]}
            size={[0.22, 0.009, 0.08]}
            paint="metal"
          />
          <group position={[0, 0, -0.21]} rotation={[-0.2, 0, 0]}>
            <Block
              at={[0, 0.235, 0]}
              size={[0.77, 0.47, 0.032]}
              paint="laptop"
            />
            <Block
              at={[0, 0.237, 0.02]}
              size={[0.69, 0.389, 0.008]}
              paint="screen"
            />
            {[0, 1, 2, 3].map((line) => (
              <Block
                key={line}
                at={[-0.12 + (line % 2) * 0.045, 0.34 - line * 0.055, 0.027]}
                size={[0.24 - (line % 2) * 0.055, 0.009, 0.005]}
                paint="code"
              />
            ))}
          </group>
        </>
      ) : (
        <Soft at={[0, 0.025, 0]} size={[0.046, 0.004, 0.046]} paint="cream" />
      )}
    </group>
  );
}

function Coffee() {
  return (
    <group position={[0.595, 1.38, 0.17]} rotation={[0, 0, -0.04]}>
      <mesh
        geometry={coffeeCup}
        material={paints.paper}
        castShadow
        dispose={null}
      />
      <mesh
        geometry={coffeeSleeve}
        position={[0, 0.002, 0]}
        material={paints.canvas}
        castShadow
        dispose={null}
      />
      <mesh
        geometry={coffeeLid}
        position={[0, 0.113, 0]}
        material={paints.white}
        castShadow
        dispose={null}
      />
    </group>
  );
}

function HeldProp({ chapter }: { chapter: number }) {
  return (
    <>
      {chapter === 1 || chapter === 3 || chapter === 4 || chapter === 6 ? (
        <Book
          paint={chapter === 1 ? "red" : chapter === 4 ? "saffron" : "teal"}
        />
      ) : null}
      {chapter === 0 ? (
        <group
          position={[0.587, 1.335, 0.184]}
          rotation={[0.25, 0, Math.PI / 2]}
        >
          <mesh
            geometry={spoolCore}
            material={paints.canvas}
            castShadow
            dispose={null}
          />
          {[-1, 1].map((side) => (
            <mesh
              geometry={spoolRim}
              key={side}
              position={[0, side * 0.095, 0]}
              material={paints.leather}
              castShadow
              dispose={null}
            />
          ))}
        </group>
      ) : null}
      {chapter === 2 ? (
        <group position={[0.57, 1.38, 0.249]} rotation={[0.2, -0.25, -0.16]}>
          <Patch geometry={paperPlaneLeft} paint="paper" />
          <Patch geometry={paperPlaneRight} paint="white" />
        </group>
      ) : null}
      {chapter === 7 || chapter === 9 ? <Laptop open={chapter === 7} /> : null}
      {chapter === 8 ? <Coffee /> : null}
      {chapter === 10 ? (
        <group position={[0.637, 1.127, 0.17]} rotation={[0.75, 0.1, -0.37]}>
          <mesh
            geometry={conicalHat}
            material={paints.cream}
            castShadow
            receiveShadow
            dispose={null}
          />
          <mesh
            geometry={hatRim}
            position={[0, -0.116, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={paints.canvas}
            castShadow
            dispose={null}
          />
        </group>
      ) : null}
    </>
  );
}

export type CharacterAction = {
  kind:
    | "bow"
    | "wave"
    | "pray"
    | "crouch"
    | "cheer"
    | "receive"
    | "nod"
    | "point"
    | "type";
  /** Clock time (seconds, three.js elapsedTime) the gesture started. */
  start: number;
};

const ACTION_DURATION: Record<CharacterAction["kind"], number> = {
  bow: 1.5,
  wave: 1.9,
  pray: 3.2,
  crouch: 2.6,
  cheer: 1.6,
  receive: 2.0,
  nod: 1.3,
  point: 1.6,
  type: 3,
};

export type StoryLocomotion = {
  /** Absolute world units per second; zero returns the rig to its idle pose. */
  speed: number;
  /** World travel direction. The containing scene owns the character's facing. */
  direction: number;
};

type LegPose = { hip: number; knee: number; ankle: number };

const HIP_HEIGHT = 1.23;
const LEG_SEGMENT = 0.52;
const ANKLE_HEIGHT = 0.19;

function hipDrop(phase: number, amount: number) {
  return -(0.05 + 0.03 * Math.cos(phase) ** 2) * amount;
}

/** Two-bone IK keeps the contact foot flat at y=0 through the stride. */
function solveLeg(phase: number, amount: number, drop: number, pose: LegPose) {
  const forward = Math.cos(phase) * 0.36 * amount;
  const lift = Math.max(0, -Math.sin(phase)) * 0.125 * amount;
  const down = HIP_HEIGHT + drop - ANKLE_HEIGHT - lift;
  const reach = Math.min(LEG_SEGMENT * 2, Math.hypot(down, forward));
  const knee = 2 * Math.acos(reach / (LEG_SEGMENT * 2));
  pose.hip = Math.atan2(-forward, down) - knee / 2;
  pose.knee = knee;
  pose.ankle = -pose.hip - knee;
}

function WalkingLeg({
  side,
  pants,
  sandals,
  hip,
  knee,
  ankle,
}: {
  side: number;
  pants: Paint;
  sandals: boolean;
  hip: RefObject<Group | null>;
  knee: RefObject<Group | null>;
  ankle: RefObject<Group | null>;
}) {
  const label = side === -1 ? "Left" : "Right";
  return (
    <group
      ref={hip}
      name={`Di_${label}Hip`}
      position={[side * 0.205, HIP_HEIGHT, -0.025]}
    >
      <mesh
        geometry={upperLeg}
        material={paints[pants]}
        position={[0, -0.245, 0]}
        castShadow
        receiveShadow
        dispose={null}
      />
      <group
        ref={knee}
        name={`Di_${label}Knee`}
        position={[0, -LEG_SEGMENT, 0]}
      >
        <mesh
          geometry={lowerLeg}
          material={paints[pants]}
          position={[0, -0.255, 0]}
          castShadow
          receiveShadow
          dispose={null}
        />
        <group
          ref={ankle}
          name={`Di_${label}Ankle`}
          position={[0, -LEG_SEGMENT, 0]}
        >
          <group
            position={[0, -ANKLE_HEIGHT, 0]}
            rotation={[0, side * -0.09, 0]}
          >
            <Soft
              at={[0, 0.073, 0.081]}
              size={[0.184, 0.058, 0.326]}
              paint={sandals ? "rubber" : "cream"}
            />
            <Soft
              at={[0, 0.158, 0.069]}
              size={[0.173, 0.115, 0.289]}
              paint={sandals ? "skin" : "white"}
            />
            {sandals ? (
              <>
                <Soft
                  at={[0, 0.213, 0.137]}
                  size={[0.177, 0.032, 0.055]}
                  paint="leather"
                />
                <Soft
                  at={[0, 0.21, -0.027]}
                  size={[0.168, 0.04, 0.052]}
                  paint="leather"
                />
              </>
            ) : (
              <>
                <Soft
                  at={[0, 0.228, 0.02]}
                  size={[0.1, 0.03, 0.122]}
                  paint="cream"
                />
                <Block
                  at={[0, 0.254, 0.057]}
                  size={[0.124, 0.013, 0.022]}
                  paint="white"
                />
                <Block
                  at={[0, 0.252, -0.002]}
                  size={[0.124, 0.013, 0.022]}
                  paint="white"
                />
              </>
            )}
            <Soft
              at={[0, 0.307, -0.021]}
              size={[0.164, 0.06, 0.167]}
              paint={pants}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

/**
 * An in-place one-second walk for GLTFExporter / Blender / three.js mixers.
 * Unique rig node names are stable across ages and chapters. No world-position
 * track is included: a parent scene controls travel along its own route.
 */
export function createCharacterWalkClip() {
  const frames = 32;
  const times: number[] = [];
  const tracks: (QuaternionKeyframeTrack | VectorKeyframeTrack)[] = [];
  const rotations = new Map<string, number[]>();
  const bodyPositions: number[] = [];
  const legPositions: number[] = [];
  const pose: LegPose = { hip: 0, knee: 0, ankle: 0 };
  const quaternion = new Quaternion();
  const euler = new Euler();
  const appendRotation = (name: string, x: number, y = 0, z = 0) => {
    const values = rotations.get(name) ?? [];
    quaternion.setFromEuler(euler.set(x, y, z));
    values.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    rotations.set(name, values);
  };

  for (let frame = 0; frame <= frames; frame++) {
    const time = frame / frames;
    const phase = time * Math.PI * 2;
    const drop = hipDrop(phase, 1);
    times.push(time);
    bodyPositions.push(0, drop, 0);
    legPositions.push(0, drop, 0);
    for (const side of [-1, 1]) {
      const label = side === -1 ? "Left" : "Right";
      solveLeg(phase + (side === -1 ? 0 : Math.PI), 1, drop, pose);
      appendRotation(`Di_${label}Hip`, pose.hip);
      appendRotation(`Di_${label}Knee`, pose.knee);
      appendRotation(`Di_${label}Ankle`, pose.ankle);
    }
    appendRotation("Di_LeftArm", -Math.cos(phase) * 0.24, 0, 0.035);
    appendRotation("Di_RightArm", Math.cos(phase) * 0.11, 0, -0.035);
    appendRotation(
      "Di_Body",
      0,
      Math.sin(phase) * 0.024,
      Math.sin(phase) * 0.012,
    );
  }
  for (const [name, values] of rotations) {
    tracks.push(
      new QuaternionKeyframeTrack(`${name}.quaternion`, times, values),
    );
  }
  tracks.push(
    new VectorKeyframeTrack("Di_Body.position", times, bodyPositions),
  );
  tracks.push(new VectorKeyframeTrack("Di_Legs.position", times, legPositions));
  return new AnimationClip("Di_GentleWalk", 1, tracks);
}

/**
 * One gentle, continuous portrait across the chapters. Adult proportions are
 * deliberately compact and sturdy, following the owner's 1m60 / 69kg reference.
 * Glasses begin in high school (chapter 4), matching his actual myopia timeline.
 */
export function StoryCharacter({
  chapter,
  reducedMotion = false,
  locomotion,
  shirt: shirtOverride,
  action,
}: {
  chapter: number;
  reducedMotion?: boolean;
  locomotion?: RefObject<StoryLocomotion>;
  /** One-shot gesture layered over the idle/walk pose (explore maps). */
  action?: RefObject<CharacterAction | null>;
  /** Optional shirt colour for chapters that reuse another chapter's look. */
  shirt?: Paint;
}) {
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const legs = useRef<Group>(null);
  const leftHip = useRef<Group>(null);
  const rightHip = useRef<Group>(null);
  const leftKnee = useRef<Group>(null);
  const rightKnee = useRef<Group>(null);
  const leftAnkle = useRef<Group>(null);
  const rightAnkle = useRef<Group>(null);
  const gestureClock = useRef<{ of: CharacterAction | null; age: number }>({
    of: null,
    age: 0,
  });
  const gait = useRef({
    phase: 0,
    amount: 0,
    speed: 0,
    pose: { hip: 0, knee: 0, ankle: 0 },
  });
  const child = chapter <= 2;
  const teen = chapter === 3 || chapter === 4;
  const school = chapter === 1 || chapter === 3 || chapter === 4;
  const scarf = chapter === 1 || chapter === 3;
  const scale = child ? 0.76 : teen ? 0.91 : 1;
  const shirt: Paint = shirtOverride
    ? shirtOverride
    : school
      ? "shirt"
      : chapter === 0
        ? "saffron"
        : chapter === 2
          ? "cream"
          : chapter === 5
            ? "olive"
            : chapter === 6
              ? "blue"
              : chapter === 7
                ? "teal"
                : chapter === 8
                  ? "charcoal"
                  : chapter === 10
                    ? "terracotta"
                    : "cream";
  const backpack = school || chapter === 6;
  const sandals = chapter === 0 || chapter === 2;

  useFrame(({ clock }, delta) => {
    if (reducedMotion) {
      gait.current.amount = 0;
      gait.current.speed = 0;
      if (body.current) {
        body.current.position.y = 0;
        body.current.rotation.set(0, 0, 0);
      }
      if (legs.current) legs.current.position.y = 0;
      for (const joint of [
        leftHip,
        rightHip,
        leftKnee,
        rightKnee,
        leftAnkle,
        rightAnkle,
      ]) {
        if (joint.current) joint.current.rotation.x = 0;
      }
      if (head.current) head.current.rotation.set(0, 0, -0.025);
      if (eyes.current) eyes.current.scale.y = 1;
      if (leftArm.current) leftArm.current.rotation.set(0, 0, 0.035);
      if (rightArm.current) rightArm.current.rotation.set(0, 0, -0.035);
      return;
    }
    const time = clock.elapsedTime;
    const state = gait.current;
    const speed = Math.min(6, Math.abs(locomotion?.current.speed ?? 0));
    const smoothing = 1 - Math.exp(-Math.min(delta, 0.1) * 10);
    state.speed += (speed - state.speed) * smoothing;
    state.amount += (Math.min(speed / 1.4, 1) - state.amount) * smoothing;
    if (state.amount < 0.001 && speed === 0) state.amount = 0;
    const cadence = Math.min(1.7, 0.62 + state.speed / (4 * scale));
    state.phase +=
      Math.min(delta, 0.05) *
      Math.PI *
      2 *
      cadence *
      Math.min(state.speed / 0.3, 1);
    const drop = hipDrop(state.phase, state.amount);
    if (legs.current) legs.current.position.y = drop;
    solveLeg(state.phase, state.amount, drop, state.pose);
    if (leftHip.current) leftHip.current.rotation.x = state.pose.hip;
    if (leftKnee.current) leftKnee.current.rotation.x = state.pose.knee;
    if (leftAnkle.current) leftAnkle.current.rotation.x = state.pose.ankle;
    solveLeg(state.phase + Math.PI, state.amount, drop, state.pose);
    if (rightHip.current) rightHip.current.rotation.x = state.pose.hip;
    if (rightKnee.current) rightKnee.current.rotation.x = state.pose.knee;
    if (rightAnkle.current) rightAnkle.current.rotation.x = state.pose.ankle;
    const weightShift = Math.sin(state.phase) * state.amount;
    if (body.current) {
      body.current.position.y = drop + Math.sin(time * 1.65) * 0.009;
      body.current.rotation.y = weightShift * 0.024;
      body.current.rotation.z = weightShift * 0.012;
      // Cleared every frame so a finished gesture never leaves a residual lean.
      body.current.rotation.x = 0;
      body.current.position.z = 0;
    }
    if (head.current) {
      head.current.rotation.x = 0;
      head.current.rotation.y = Math.sin(time * 0.42) * 0.065;
      head.current.rotation.z =
        -0.025 + Math.sin(time * 0.57) * 0.018 - weightShift * 0.012;
    }
    // A short blink with a long open interval; transform writes never render React.
    const blinkPhase = time % 5.2;
    if (eyes.current)
      eyes.current.scale.y =
        blinkPhase > 4.95
          ? Math.max(0.06, Math.abs(blinkPhase - 5.075) / 0.125)
          : 1;
    const armSwing = Math.cos(state.phase) * state.amount;
    if (leftArm.current) {
      leftArm.current.rotation.x = -armSwing * (chapter === 7 ? 0.035 : 0.24);
      leftArm.current.rotation.z = 0.035 + Math.sin(time * 1.1) * 0.014;
    }
    if (rightArm.current) {
      rightArm.current.rotation.x =
        armSwing * (chapter === 7 ? 0.035 : chapter === 8 ? 0.07 : 0.11);
      rightArm.current.rotation.z = -0.035 - Math.sin(time * 1.1 + 0.6) * 0.012;
    }

    // One-shot gestures (bow to elders, wave, pray with incense…). Signs follow
    // the rig: negative arm x = forward, right arm out = +z, left arm out = -z.
    const gesture = action?.current;
    if (gesture !== gestureClock.current.of) {
      gestureClock.current = { of: gesture ?? null, age: 0 };
    }
    if (gesture) {
      // Advance by rendered frame time (capped) so a slow frame can't skip it.
      gestureClock.current.age += Math.min(delta, 1 / 30);
      const age = gestureClock.current.age;
      const duration = ACTION_DURATION[gesture.kind];
      if (age > duration || age < 0) {
        action.current = null;
      } else {
        const ramp = Math.max(
          0,
          Math.min(1, age / 0.3, (duration - age) / 0.35),
        );
        const w = ramp * ramp * (3 - 2 * ramp);
        const lean = (angle: number) => {
          // Bend at the hip, keeping the hips planted on the legs.
          if (!body.current) return;
          body.current.rotation.x = angle;
          body.current.position.y += HIP_HEIGHT - HIP_HEIGHT * Math.cos(angle);
          body.current.position.z = -HIP_HEIGHT * Math.sin(angle);
        };
        const arms = (lx: number, lz: number, rx: number, rz: number) => {
          if (leftArm.current) {
            leftArm.current.rotation.x += (lx - leftArm.current.rotation.x) * w;
            leftArm.current.rotation.z += (lz - leftArm.current.rotation.z) * w;
          }
          if (rightArm.current) {
            rightArm.current.rotation.x +=
              (rx - rightArm.current.rotation.x) * w;
            rightArm.current.rotation.z +=
              (rz - rightArm.current.rotation.z) * w;
          }
        };
        switch (gesture.kind) {
          case "bow":
            lean(
              0.42 *
                w *
                Math.min(1, Math.sin((age / duration) * Math.PI) * 1.6),
            );
            arms(-0.15, 0.1, -0.15, -0.1);
            break;
          case "pray": {
            // Hands together at the chest, three small bows (vái).
            const bob = Math.max(0, Math.sin(age * 4.2)) * 0.22;
            lean((0.06 + bob) * w);
            arms(-1.25, -0.42, -1.25, 0.42);
            break;
          }
          case "receive":
            lean(0.18 * w);
            arms(-1.0, -0.22, -1.0, 0.22);
            break;
          case "wave":
            arms(0, 0.04, -0.15, 2.55 + Math.sin(age * 10) * 0.28);
            break;
          case "point":
            arms(0, 0.04, -1.45, 0.15);
            break;
          case "type":
            arms(
              -1.15 + Math.sin(age * 13) * 0.05,
              -0.2,
              -1.15 + Math.sin(age * 12 + 1) * 0.05,
              0.2,
            );
            break;
          case "nod":
            if (head.current)
              head.current.rotation.x = Math.sin(age * 9) * 0.22 * w;
            break;
          case "crouch": {
            const down = 0.55 * w;
            if (legs.current) legs.current.position.y -= down;
            if (body.current) body.current.position.y -= down;
            for (const [hip, knee, ankle] of [
              [leftHip, leftKnee, leftAnkle],
              [rightHip, rightKnee, rightAnkle],
            ]) {
              if (hip.current) hip.current.rotation.x = -1.2 * w;
              if (knee.current) knee.current.rotation.x = 2.0 * w;
              if (ankle.current) ankle.current.rotation.x = -0.8 * w;
            }
            lean(0.3 * w);
            arms(-0.2, 0.1, -0.85, -0.1);
            break;
          }
          case "cheer": {
            const hop = Math.abs(Math.sin(age * 6.5)) * 0.32 * w;
            if (legs.current) legs.current.position.y += hop;
            if (body.current) body.current.position.y += hop;
            arms(-0.2, -2.5, -0.2, 2.5);
            break;
          }
          default:
            break;
        }
      }
    }
  });

  return (
    <group name="Di_Character" scale={scale} dispose={null}>
      <group ref={legs} name="Di_Legs">
        <WalkingLeg
          side={-1}
          pants={child || school ? "navy" : "denim"}
          sandals={sandals}
          hip={leftHip}
          knee={leftKnee}
          ankle={leftAnkle}
        />
        <WalkingLeg
          side={1}
          pants={child || school ? "navy" : "denim"}
          sandals={sandals}
          hip={rightHip}
          knee={rightKnee}
          ankle={rightAnkle}
        />
      </group>
      <group ref={body} name="Di_Body">
        <Soft
          at={[0, 1.231, 0]}
          size={[0.35, 0.187, 0.207]}
          paint={child || school ? "navy" : "denim"}
        />
        <mesh
          geometry={torso}
          position={[0, 1.689, 0]}
          scale={[child ? 1 : 1.095, 1, child ? 1 : 1.12]}
          material={paints[shirt]}
          castShadow
          receiveShadow
          dispose={null}
        />
        {!child ? (
          <Soft
            at={[0, 1.53, 0.033]}
            size={[0.417, 0.28, 0.232]}
            paint={shirt}
          />
        ) : null}
        {!school ? (
          <Soft
            at={[0, 1.94, 0.201]}
            size={[0.17, 0.268, 0.045]}
            paint="shirt"
          />
        ) : null}
        <Soft at={[0, 2.242, 0]} size={[0.143, 0.178, 0.135]} paint="skin" />
        <Patch geometry={leftCollar} paint={school ? "white" : shirt} />
        <Patch geometry={rightCollar} paint={school ? "white" : shirt} />
        {[1.48, 1.67, 1.86].map((height) => (
          <Soft
            key={height}
            at={[school ? 0 : 0.125, height, 0.227]}
            size={[0.018, 0.018, 0.009]}
            paint={school ? "cream" : "metal"}
          />
        ))}
        {school ? (
          <group>
            <Block
              at={[-0.247, 1.93, 0.232]}
              size={[0.137, 0.07, 0.008]}
              paint="white"
            />
            <Block
              at={[-0.247, 1.941, 0.24]}
              size={[0.094, 0.009, 0.004]}
              paint="blue"
            />
            <Block
              at={[-0.247, 1.919, 0.24]}
              size={[0.063, 0.006, 0.004]}
              paint="blue"
            />
          </group>
        ) : null}
        {scarf ? (
          <group>
            <Patch geometry={scarfLeft} paint="red" />
            <Patch geometry={scarfRight} paint="red" />
            <Soft
              at={[-0.017, 2.004, 0.301]}
              size={[0.043, 0.048, 0.025]}
              rotation={[0, 0, -0.2]}
              paint="red"
            />
          </group>
        ) : null}
        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={side === -1 ? leftArm : rightArm}
            name={side === -1 ? "Di_LeftArm" : "Di_RightArm"}
            position={[side * (child ? 0.433 : 0.47), 2.022, 0]}
          >
            <mesh
              geometry={arm}
              material={paints[shirt]}
              position={[side * 0.078, -0.187, 0]}
              rotation={[0, 0, side * 0.27]}
              castShadow
              receiveShadow
              dispose={null}
            />
            <Soft
              at={[side * 0.123, -0.327, 0.013]}
              size={[0.12, 0.065, 0.121]}
              rotation={[0, 0, side * 0.1]}
              paint={school ? "white" : shirt}
            />
            <mesh
              geometry={forearm}
              material={paints.skin}
              position={[side * 0.142, -0.506, 0.05]}
              rotation={[-0.15, 0, side * -0.04]}
              castShadow
              receiveShadow
              dispose={null}
            />
            <Soft
              at={[side * 0.14, -0.704, 0.082]}
              size={[0.087, 0.116, 0.067]}
              paint="skin"
            />
            <Soft
              at={[side * 0.079, -0.681, 0.114]}
              size={[0.035, 0.064, 0.037]}
              rotation={[0, 0, side * -0.24]}
              paint="skinLight"
            />
            {side === 1 ? (
              <group position={[-(child ? 0.433 : 0.47), -2.022, 0]}>
                <HeldProp chapter={chapter} />
              </group>
            ) : null}
          </group>
        ))}
        {backpack ? <Backpack /> : null}
        {chapter === 5 || chapter === 8 || chapter === 9 ? <Satchel /> : null}
        <group
          ref={head}
          name="Di_Head"
          position={[0, child ? 2.697 : 2.693, 0.001]}
          scale={child ? 1.085 : 1}
          rotation={[0, 0, -0.025]}
        >
          <Face glasses={chapter >= 4} eyes={eyes} />
        </group>
      </group>
    </group>
  );
}
