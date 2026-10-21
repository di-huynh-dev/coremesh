"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

export type Vec3 = [number, number, number];
/** Each scene can be imported and placed in its own <group position={[x, 0, 0]}>. */
export type StorySceneProps = {
  chapter?: number;
  reducedMotion?: boolean;
  onInspect?: (name: string) => void;
};
export type StoryWorldProps = StorySceneProps & {
  chapter: number;
  includeIsland?: boolean;
};
type WorldProps = StorySceneProps;
type Palette = { grass: string; side: string; path: string };

/**
 * Layout contract for assembling a continuous horizontal journey:
 * local ground y=0, x=-5.85..5.85, z=-4.25..4.25; the unobstructed
 * walking lane runs left to right at z=2.15, between z=1.55 and z=2.75.
 * Scene components contain scenery only; add StoryGround separately or use
 * StoryWorld (which includes it by default). Character/camera belong to the host.
 */
export const STORY_SCENE_LAYOUT = {
  width: 11.7,
  depth: 8.5,
  groundY: 0,
  walkwayZ: 2.15,
  walkwayWidth: 1.2,
} as const;

export const C = {
  cream: "#f1dfba",
  plaster: "#dcc892",
  ochre: "#d8ae61",
  tile: "#a95736",
  tileLight: "#c7754b",
  wood: "#664b35",
  woodLight: "#ab8054",
  leaf: "#567044",
  leafLight: "#7c9252",
  leafDark: "#344e3b",
  bamboo: "#779553",
  rice: "#a6ad60",
  water: "#639898",
  blue: "#365a72",
  ink: "#263b43",
  brass: "#d6ae65",
};

export function Box({
  position = [0, 0, 0],
  size,
  color,
  rotation,
  ...props
}: {
  position?: Vec3;
  size: Vec3;
  color: string;
  rotation?: Vec3;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.78} {...props} />
    </mesh>
  );
}

export function Pole({
  position = [0, 0, 0],
  radius = 0.06,
  height,
  color = C.wood,
  rotation,
}: {
  position?: Vec3;
  radius?: number;
  height: number;
  color?: string;
  rotation?: Vec3;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius * 0.85, radius, height, 9]} />
      <meshStandardMaterial color={color} roughness={0.84} />
    </mesh>
  );
}

export function Orb({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  color,
}: {
  position?: Vec3;
  scale?: Vec3;
  color: string;
}) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[1, 12, 8]} />
      <meshStandardMaterial color={color} roughness={0.93} />
    </mesh>
  );
}

export function Segment({
  from,
  to,
  radius = 0.035,
  color = C.wood,
}: {
  from: Vec3;
  to: Vec3;
  radius?: number;
  color?: string;
}) {
  const { center, rotation, length } = useMemo(() => {
    const a = new THREE.Vector3(...from),
      b = new THREE.Vector3(...to),
      delta = b.clone().sub(a);
    return {
      center: a.add(b).multiplyScalar(0.5),
      length: delta.length(),
      rotation: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        delta.normalize(),
      ),
    };
  }, [from, to]);
  return (
    <mesh position={center} quaternion={rotation} castShadow>
      <cylinderGeometry args={[radius, radius, length, 7]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

export function Sign({
  text,
  position,
  width = 2.6,
  height = 0.38,
  color = C.cream,
  ink = C.ink,
  fontSize = 49,
  rotation = [0, 0, 0],
}: {
  text: string;
  position: Vec3;
  width?: number;
  height?: number;
  color?: string;
  ink?: string;
  fontSize?: number;
  rotation?: Vec3;
}) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1536;
    canvas.height = Math.round((1536 * height) / width);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${fontSize}px Arial, sans-serif`;
    ctx.fillText(
      text,
      canvas.width / 2,
      canvas.height / 2 + 2,
      canvas.width - 70,
    );
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
  }, [text, width, height, color, ink, fontSize]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={texture}
        color={texture ? "white" : color}
        roughness={0.85}
      />
    </mesh>
  );
}

export function Inspectable({
  name,
  position = [0, 0, 0],
  marker = [0, 1, 0],
  onInspect,
  children,
}: {
  name: string;
  position?: Vec3;
  marker?: Vec3;
  onInspect?: WorldProps["onInspect"];
  children: ReactNode;
}) {
  const over = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    document.body.style.cursor = "pointer";
  };
  const out = () => {
    document.body.style.cursor = "";
  };
  useEffect(() => out, []);
  return (
    <group
      position={position}
      onPointerOver={over}
      onPointerOut={out}
      onClick={(event) => {
        event.stopPropagation();
        if (event.delta > 4) return;
        onInspect?.(name);
      }}
    >
      {children}
      <group position={marker} rotation={[0.2, 0.55, 0]}>
        <mesh>
          <torusGeometry args={[0.095, 0.022, 7, 20]} />
          <meshStandardMaterial
            color={C.brass}
            emissive={C.brass}
            emissiveIntensity={0.25}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.032, 8, 6]} />
          <meshStandardMaterial color={C.cream} />
        </mesh>
      </group>
    </group>
  );
}

export function StoryGround({ chapter = 0 }: Pick<StorySceneProps, "chapter">) {
  const p: Palette =
    chapter >= 6 && chapter <= 9
      ? {
          grass: chapter === 7 ? "#53666b" : "#b7b9a5",
          side: "#6c776e",
          path: "#d1c8b5",
        }
      : { grass: "#8d9c64", side: "#89704e", path: "#c6b48c" };
  const shape = useMemo(() => {
    const s = new THREE.Shape(),
      w = 5.85,
      d = 4.25,
      r = 0.85;
    s.moveTo(-w + r, -d);
    s.lineTo(w - r, -d);
    s.quadraticCurveTo(w, -d, w, -d + r);
    s.lineTo(w, d - r);
    s.quadraticCurveTo(w, d, w - r, d);
    s.lineTo(-w + r, d);
    s.quadraticCurveTo(-w, d, -w, d - r);
    s.lineTo(-w, -d + r);
    s.quadraticCurveTo(-w, -d, -w + r, -d);
    return s;
  }, []);
  return (
    <group>
      <mesh
        position={[0, -0.48, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.35,
              bevelEnabled: true,
              bevelSegments: 3,
              steps: 1,
              bevelSize: 0.12,
              bevelThickness: 0.1,
              curveSegments: 10,
            },
          ]}
        />
        <meshStandardMaterial color={p.side} roughness={1} />
      </mesh>
      <mesh
        position={[0, -0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <shapeGeometry args={[shape, 12]} />
        <meshStandardMaterial color={p.grass} roughness={1} />
      </mesh>
      <Box
        position={[0, -0.005, 2.15]}
        size={[11.7, 0.08, 1.2]}
        color={p.path}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          position={[-1.25 + i * 0.63, 0.045, 3.4]}
          size={[0.5, 0.035, 0.34]}
          color="#d7c9a9"
        />
      ))}
      <Box
        position={[0, -0.32, 4.28]}
        size={[2.3, 0.12, 0.02]}
        color={C.brass}
      />
    </group>
  );
}

export function Roof({
  width = 4,
  depth = 2.8,
  height = 0.95,
  color = C.tile,
}: {
  width?: number;
  depth?: number;
  height?: number;
  color?: string;
}) {
  const geometry = useMemo(() => {
    const v = new Float32Array([
      -width / 2,
      0,
      depth / 2,
      width / 2,
      0,
      depth / 2,
      width / 2,
      height,
      0,
      -width / 2,
      0,
      depth / 2,
      width / 2,
      height,
      0,
      -width / 2,
      height,
      0,
      width / 2,
      0,
      -depth / 2,
      -width / 2,
      0,
      -depth / 2,
      -width / 2,
      height,
      0,
      width / 2,
      0,
      -depth / 2,
      -width / 2,
      height,
      0,
      width / 2,
      height,
      0,
      -width / 2,
      0,
      -depth / 2,
      -width / 2,
      0,
      depth / 2,
      -width / 2,
      height,
      0,
      width / 2,
      0,
      depth / 2,
      width / 2,
      0,
      -depth / 2,
      width / 2,
      height,
      0,
    ]);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }, [width, depth, height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const tiles = useRef<THREE.InstancedMesh>(null);
  const columns = Math.max(8, Math.round(width / 0.2)),
    rows = 6;
  useEffect(() => {
    if (!tiles.current) return;
    const matrix = new THREE.Object3D();
    let n = 0;
    for (const side of [-1, 1])
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < columns; c++) {
          const t = (r + 0.5) / rows;
          matrix.position.set(
            -width / 2 + ((c + 0.5) * width) / columns,
            height * (1 - t) + 0.017,
            ((side * depth) / 2) * t,
          );
          matrix.rotation.set(side * Math.atan2(height, depth / 2), 0, 0);
          matrix.updateMatrix();
          tiles.current.setMatrixAt(n++, matrix.matrix);
        }
    tiles.current.instanceMatrix.needsUpdate = true;
  }, [width, depth, height, columns]);
  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      <instancedMesh
        ref={tiles}
        args={[undefined, undefined, columns * rows * 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            width / columns - 0.016,
            0.032,
            Math.sqrt((depth / 2) ** 2 + height ** 2) / rows - 0.016,
          ]}
        />
        <meshStandardMaterial color={C.tileLight} roughness={0.9} />
      </instancedMesh>
      <Pole
        position={[0, height + 0.045, 0]}
        height={width + 0.1}
        radius={0.065}
        rotation={[0, 0, Math.PI / 2]}
        color={color}
      />
      <Box
        position={[0, -0.03, depth / 2]}
        size={[width + 0.05, 0.12, 0.1]}
        color={C.wood}
      />
    </group>
  );
}

export function VillageHouse({
  position = [-2.2, 0, -1.65],
  open = false,
}: {
  position?: Vec3;
  open?: boolean;
}) {
  return (
    <group position={position}>
      <Box position={[0, 0.13, 0.1]} size={[4.3, 0.26, 3]} color="#a49b80" />
      <Box position={[0, 1.1, -0.3]} size={[3.8, 1.9, 1.9]} color={C.plaster} />
      <group position={[0, 2.05, 0]}>
        <Roof width={4.45} depth={3.25} height={0.92} />
      </group>
      <Box
        position={[0, 1.02, 0.67]}
        size={[0.96, 1.65, 0.08]}
        color={open ? "#423d30" : C.wood}
      />
      {[-1.25, 1.25].map((x) => (
        <group key={x}>
          <Box
            position={[x, 1.2, 0.69]}
            size={[0.62, 0.65, 0.07]}
            color={C.wood}
          />
          <Box
            position={[x, 1.2, 0.74]}
            size={[0.42, 0.5, 0.035]}
            color="#7a856f"
          />
          {[-0.13, 0, 0.13].map((d) => (
            <Box
              key={d}
              position={[x + d, 1.2, 0.78]}
              size={[0.028, 0.51, 0.025]}
              color={C.woodLight}
            />
          ))}
        </group>
      ))}
      {[-1.8, 0.65, 1.8].map((x) => (
        <Pole
          key={x}
          position={[x, 1.03, 1.18]}
          radius={0.065}
          height={1.8}
          color={C.wood}
        />
      ))}
      <Box position={[0, 0.11, 1.76]} size={[2, 0.13, 0.35]} color="#b2a68a" />
      <Sign
        text="NHÀ · CÁT NHƠN"
        position={[0, 1.83, 0.72]}
        width={1.45}
        height={0.22}
        fontSize={88}
        color={C.wood}
        ink={C.cream}
      />
    </group>
  );
}

export function Tree({
  position,
  scale = 1,
  kind = "broad",
  blossom = false,
}: {
  position: Vec3;
  scale?: number;
  kind?: "broad" | "banyan" | "palm";
  blossom?: boolean;
}) {
  const foliage = blossom ? "#bd684a" : C.leaf;
  return (
    <group position={position} scale={scale}>
      <Pole
        position={[0, 1.15, 0]}
        radius={kind === "banyan" ? 0.18 : 0.12}
        height={2.3}
      />
      {kind === "palm" ? (
        <>
          {Array.from({ length: 7 }, (_, i) => (
            <group
              key={i}
              rotation={[0, (i * Math.PI * 2) / 7, 0]}
              position={[0, 2.3, 0]}
            >
              <Orb
                position={[0.47, 0.05, 0]}
                scale={[0.9, 0.12, 0.22]}
                color={C.leaf}
              />
              <Segment
                from={[0, 0, 0]}
                to={[1.1, -0.22, 0]}
                radius={0.023}
                color={C.leafDark}
              />
            </group>
          ))}
          <Orb
            position={[0.15, 2.2, 0]}
            scale={[0.14, 0.18, 0.14]}
            color="#877149"
          />
        </>
      ) : (
        <>
          <Segment from={[0, 1.3, 0]} to={[-0.7, 2.35, 0.2]} radius={0.07} />
          <Segment from={[0, 1.65, 0]} to={[0.7, 2.55, -0.1]} radius={0.065} />
          <Orb
            position={[0, 2.7, 0]}
            scale={[0.92, 0.65, 0.85]}
            color={foliage}
          />
          <Orb
            position={[-0.65, 2.45, 0.13]}
            scale={[0.71, 0.51, 0.67]}
            color={blossom ? "#d18051" : C.leafLight}
          />
          <Orb
            position={[0.61, 2.48, -0.17]}
            scale={[0.72, 0.56, 0.69]}
            color={foliage}
          />
          <Orb
            position={[0.08, 2.4, 0.56]}
            scale={[0.65, 0.45, 0.52]}
            color={C.leafDark}
          />
          {kind === "banyan" &&
            [-0.7, -0.35, 0.4, 0.72].map((x, i) => (
              <Pole
                key={x}
                position={[x, 1.35, 0.1 + i * 0.12]}
                radius={0.021}
                height={1.9}
                color="#93815a"
              />
            ))}
        </>
      )}
    </group>
  );
}

export function Bamboo({
  position = [4.2, 0, -2.5],
  scale = 1,
}: {
  position?: Vec3;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {Array.from({ length: 5 }, (_, i) => (
        <group
          key={i}
          position={[(i - 2) * 0.19, 0, Math.sin(i * 2) * 0.17]}
          rotation={[0, i * 0.7, (i - 2) * 0.06]}
        >
          <Pole
            position={[0, 1.5, 0]}
            radius={0.058}
            height={3}
            color={C.bamboo}
          />
          {[0.4, 0.9, 1.4, 1.9, 2.4, 2.9].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.035, 8]} />
              <meshStandardMaterial color="#a5b780" roughness={0.9} />
            </mesh>
          ))}
          {[1.9, 2.6].map((y, k) => (
            <group key={y} position={[0, y, 0]} rotation={[0, k, -0.55]}>
              <Segment
                from={[0, 0, 0]}
                to={[0.7, 0.3, 0]}
                radius={0.018}
                color={C.bamboo}
              />
              {[0.2, 0.45, 0.67].map((x, j) => (
                <Orb
                  key={x}
                  position={[x, 0.08 + j * 0.09, 0]}
                  scale={[0.25, 0.065, 0.09]}
                  color={j % 2 ? C.leafDark : C.leafLight}
                />
              ))}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

export function RicePaddy({
  position = [3.2, 0, 0.65],
  width = 3.25,
  depth = 4.3,
}: {
  position?: Vec3;
  width?: number;
  depth?: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = 180;
  useEffect(() => {
    if (!mesh.current) return;
    const object = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const col = i % 15,
        row = Math.floor(i / 15);
      object.position.set(
        (col / 14 - 0.5) * (width - 0.3),
        0.17,
        (row / 11 - 0.5) * (depth - 0.3),
      );
      object.rotation.set(
        Math.sin(i * 4.3) * 0.16,
        i * 2.399,
        Math.cos(i * 1.7) * 0.2,
      );
      object.scale.set(0.65 + (i % 3) * 0.18, 0.7 + (i % 5) * 0.1, 1);
      object.updateMatrix();
      mesh.current.setMatrixAt(i, object.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [width, depth]);
  return (
    <group position={position}>
      <Box position={[0, 0, 0]} size={[width, 0.06, depth]} color="#7e9779" />
      <Box
        position={[0, 0.01, 0]}
        size={[width - 0.16, 0.035, depth - 0.16]}
        color="#8b9e74"
      />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
        <coneGeometry args={[0.085, 0.5, 3]} />
        <meshStandardMaterial
          color={C.rice}
          roughness={1}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      {[-1, 1].map((s) => (
        <Box
          key={s}
          position={[(s * width) / 2, 0.055, 0]}
          size={[0.1, 0.15, depth]}
          color="#a6996a"
        />
      ))}
      {[-1, 1].map((s) => (
        <Box
          key={s}
          position={[0, 0.055, (s * depth) / 2]}
          size={[width, 0.15, 0.1]}
          color="#a6996a"
        />
      ))}
    </group>
  );
}

export function Hills() {
  return (
    <group>
      <Orb
        position={[-3.5, 0.15, -3.25]}
        scale={[2.05, 0.8, 0.8]}
        color="#8a9b79"
      />
      <Orb
        position={[-0.4, 0.1, -3.5]}
        scale={[2.1, 0.65, 0.6]}
        color="#a2ad87"
      />
      <Orb
        position={[3.3, 0.1, -3.5]}
        scale={[1.8, 1.02, 0.7]}
        color="#78917a"
      />
    </group>
  );
}

export function Bench({
  position,
  rotation = 0,
}: {
  position: Vec3;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box
        position={[0, 0.48, 0]}
        size={[1.4, 0.1, 0.42]}
        color={C.woodLight}
      />
      <Box
        position={[0, 0.85, -0.17]}
        size={[1.4, 0.4, 0.07]}
        color={C.woodLight}
      />
      {[-0.52, 0.52].map((x) => (
        <Box
          key={x}
          position={[x, 0.25, 0]}
          size={[0.1, 0.5, 0.35]}
          color={C.ink}
        />
      ))}
    </group>
  );
}

export function Book({
  position = [0, 0, 0],
  color = "#af654f",
  open = false,
  scale = 1,
}: {
  position?: Vec3;
  color?: string;
  open?: boolean;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <Box size={[open ? 0.72 : 0.42, 0.07, 0.52]} color={color} />
      <Box
        position={[0, 0.045, 0]}
        size={[open ? 0.67 : 0.38, 0.04, 0.48]}
        color="#eee0bf"
      />
      {open && (
        <Box
          position={[0, 0.073, 0]}
          size={[0.015, 0.015, 0.48]}
          color={C.woodLight}
        />
      )}
    </group>
  );
}

export function Bicycle({
  position = [0, 0, 0],
  rotation = 0,
}: {
  position?: Vec3;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.57, 0.57].map((x) => (
        <group key={x} position={[x, 0.4, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.37, 0.045, 7, 22]} />
            <meshStandardMaterial color="#333e3b" roughness={0.9} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.31, 0.017, 5, 20]} />
            <meshStandardMaterial color="#c4bca4" metalness={0.5} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <Segment
              key={i}
              from={[
                -Math.cos((i * Math.PI) / 4) * 0.31,
                -Math.sin((i * Math.PI) / 4) * 0.31,
                0,
              ]}
              to={[
                Math.cos((i * Math.PI) / 4) * 0.31,
                Math.sin((i * Math.PI) / 4) * 0.31,
                0,
              ]}
              radius={0.008}
              color="#b1b5a7"
            />
          ))}
        </group>
      ))}
      <Segment from={[-0.57, 0.4, 0]} to={[-0.2, 0.9, 0]} color="#709095" />
      <Segment from={[-0.2, 0.9, 0]} to={[0.15, 0.4, 0]} color="#709095" />
      <Segment from={[0.15, 0.4, 0]} to={[-0.57, 0.4, 0]} color="#709095" />
      <Segment from={[-0.2, 0.9, 0]} to={[0.4, 0.93, 0]} color="#709095" />
      <Segment from={[0.4, 0.93, 0]} to={[0.15, 0.4, 0]} color="#709095" />
      <Segment from={[0.36, 1.1, 0]} to={[0.57, 0.4, 0]} color="#709095" />
      <Box
        position={[-0.23, 1.01, 0]}
        size={[0.35, 0.08, 0.2]}
        color={C.wood}
      />
      <Segment
        from={[0.36, 1.1, -0.17]}
        to={[0.36, 1.1, 0.17]}
        radius={0.025}
        color={C.ink}
      />
      <Box
        position={[-0.58, 0.87, 0]}
        size={[0.4, 0.035, 0.3]}
        color="#70837d"
      />
    </group>
  );
}

export function Flag({
  position = [0, 0, 0],
  reducedMotion = false,
  height = 3.4,
}: {
  position?: Vec3;
  reducedMotion?: boolean;
  height?: number;
}) {
  const cloth = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (cloth.current && !reducedMotion)
      cloth.current.rotation.y = Math.sin(clock.elapsedTime * 1.8) * 0.12;
  });
  return (
    <group position={position}>
      <Box position={[0, 0.09, 0]} size={[0.65, 0.18, 0.65]} color="#b8afa0" />
      <Pole
        position={[0, height / 2, 0]}
        height={height}
        radius={0.028}
        color="#cdc8b4"
      />
      <group position={[0.04, height - 0.5, 0]} ref={cloth}>
        <Box
          position={[0.42, 0, 0]}
          size={[0.84, 0.52, 0.025]}
          color="#bb4338"
        />
        <Star position={[0.42, 0, 0.018]} scale={0.14} />
      </group>
    </group>
  );
}

export function Star({ position, scale }: { position: Vec3; scale: number }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI / 2 + (i * Math.PI) / 5,
        r = i % 2 ? 0.4 : 1;
      const x = Math.cos(angle) * r,
        y = Math.sin(angle) * r;
      if (!i) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);
  return (
    <mesh position={position} scale={scale}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#e5c35a" side={THREE.DoubleSide} />
    </mesh>
  );
}

export function Kite({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current && !reducedMotion) {
      ref.current.position.y = 3.85 + Math.sin(clock.elapsedTime * 0.8) * 0.1;
      ref.current.rotation.z =
        -0.18 + Math.sin(clock.elapsedTime * 0.65) * 0.08;
    }
  });
  return (
    <group ref={ref} position={[2.1, 3.85, -1.1]} rotation={[0.1, -0.2, -0.18]}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.65, 0.65]} />
        <meshStandardMaterial color="#d5a951" side={THREE.DoubleSide} />
      </mesh>
      <Segment from={[-0.46, 0, 0.01]} to={[0.46, 0, 0.01]} radius={0.013} />
      <Segment from={[0, -0.46, 0.01]} to={[0, 0.46, 0.01]} radius={0.013} />
      <Segment
        from={[0, -0.46, 0]}
        to={[-0.18, -1.2, 0]}
        radius={0.009}
        color={C.cream}
      />
      <Segment
        from={[-0.18, -1.2, 0]}
        to={[0, -1.65, 0]}
        radius={0.009}
        color={C.cream}
      />
      <Segment
        from={[0, 0, 0]}
        to={[-1.6, -3.2, 1.3]}
        radius={0.005}
        color="#e1d4ad"
      />
      {[-0.7, -1, -1.35].map((y) => (
        <mesh key={y} position={[-0.13, y, 0]} rotation={[0, 0, 0.3]}>
          <planeGeometry args={[0.23, 0.08]} />
          <meshStandardMaterial color="#b36345" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export function Pot({
  position = [0, 0, 0],
  scale = 1,
  plant = true,
}: {
  position?: Vec3;
  scale?: number;
  plant?: boolean;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.18, 0.44, 12]} />
        <meshStandardMaterial color="#aa7054" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.025, 12]} />
        <meshStandardMaterial color={C.wood} />
      </mesh>
      {plant && (
        <>
          <Pole
            position={[0, 0.8, 0]}
            height={0.8}
            radius={0.018}
            color={C.leafDark}
          />
          {Array.from({ length: 5 }, (_, i) => (
            <group
              key={i}
              rotation={[0, i * 2.4, 0]}
              position={[0, 0.65 + i * 0.11, 0]}
            >
              <Orb
                position={[0.17, 0.07, 0]}
                scale={[0.28, 0.1, 0.13]}
                color={i % 2 ? C.leafLight : C.leaf}
              />
            </group>
          ))}
        </>
      )}
    </group>
  );
}

export function School({ name, high = false }: { name: string; high?: boolean }) {
  const width = 7.7,
    y = high ? 3.0 : 2.6;
  return (
    <group position={[-0.5, 0, -2.1]}>
      <Box
        position={[0, 0.12, 0]}
        size={[width + 0.3, 0.24, 2.7]}
        color="#b0a78c"
      />
      <Box
        position={[0, y / 2 + 0.2, -0.2]}
        size={[width, y, 1.9]}
        color={high ? "#e3d2a8" : "#ddbb72"}
      />
      <group position={[0, y + 0.2, -0.2]}>
        <Roof width={width + 0.4} depth={2.6} height={0.8} />
      </group>
      {[-3, -1.5, 0, 1.5, 3].map((x) => (
        <group key={x}>
          {[1, high ? 2.45 : 2.05].map((h, i) => (
            <group key={i}>
              <Box
                position={[x, h, 0.77]}
                size={[0.85, 0.65, 0.08]}
                color={C.wood}
              />
              <Box
                position={[x, h, 0.82]}
                size={[0.69, 0.51, 0.025]}
                color="#557b80"
              />
              <Box
                position={[x, h, 0.85]}
                size={[0.035, 0.52, 0.03]}
                color={C.cream}
              />
            </group>
          ))}
        </group>
      ))}
      <Box
        position={[0, 1.6, 1.03]}
        size={[width, 0.12, 0.48]}
        color="#e9d9ac"
      />
      {[-3.65, -2.25, -0.75, 0.75, 2.25, 3.65].map((x) => (
        <Box
          key={x}
          position={[x, 1.12, 1.15]}
          size={[0.12, 2.05, 0.14]}
          color="#e9d9ac"
        />
      ))}
      <Box
        position={[0, 0.09, 1.5]}
        size={[width, 0.18, 0.45]}
        color="#ccc0a0"
      />
      <Sign
        text={name}
        position={[0, y + 0.12, 1.13]}
        width={6.6}
        height={0.38}
        fontSize={59}
        color="#ad573e"
        ink="#fff1c9"
      />
    </group>
  );
}

export function ChildhoodVillageScene({
  onInspect,
  reducedMotion,
}: WorldProps) {
  return (
    <>
      <Hills />
      <Inspectable
        name="Mái nhà"
        marker={[-2.2, 3.6, -1.65]}
        onInspect={onInspect}
      >
        <VillageHouse />
      </Inspectable>
      <Bamboo position={[4.65, 0, -2.65]} scale={0.83} />
      <RicePaddy position={[3.35, 0, -0.55]} width={3.25} depth={3.8} />
      <Tree position={[-4.6, 0, 1.3]} scale={0.86} kind="palm" />
      <Inspectable
        name="Cánh diều"
        position={[0, 0, 0]}
        marker={[2.1, 4.6, -1.1]}
        onInspect={onInspect}
      >
        <Kite reducedMotion={reducedMotion} />
      </Inspectable>
      <group position={[-2.7, 0.28, 0.05]}>
        <mesh
          position={[0, 0.13, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
        >
          <torusGeometry args={[0.4, 0.035, 6, 22]} />
          <meshStandardMaterial color="#b3945e" />
        </mesh>
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.39, 22]} />
          <meshStandardMaterial color="#a88b58" />
        </mesh>
        <Orb
          position={[0, 0.2, 0]}
          scale={[0.23, 0.11, 0.23]}
          color="#d2c08d"
        />
      </group>
      <Inspectable
        name="Đồng lúa"
        position={[3.2, 0, 3.5]}
        marker={[0, 0.75, 0]}
        onInspect={onInspect}
      >
        <Pole
          position={[0, 0.36, 0]}
          height={0.65}
          radius={0.11}
          color="#c5ac65"
        />
        <mesh position={[0, 0.5, 0]} castShadow>
          <coneGeometry args={[0.27, 0.55, 9]} />
          <meshStandardMaterial color="#ccaf69" />
        </mesh>
      </Inspectable>
      <Pot position={[-0.5, 0, -0.1]} scale={0.65} />
      <Box
        position={[-3.2, 0.03, 3.5]}
        size={[2, 0.05, 1]}
        color="#d0bb89"
        rotation={[0, 0.12, 0]}
      />
    </>
  );
}

export function PrimarySchoolScene({ onInspect, reducedMotion }: WorldProps) {
  return (
    <>
      <Inspectable
        name="Sân trường"
        marker={[-0.5, 3.9, -2.1]}
        onInspect={onInspect}
      >
        <School name="TIỂU HỌC SỐ 1 CÁT NHƠN" />
      </Inspectable>
      <Tree position={[4.3, 0, -0.4]} scale={1.08} blossom />
      <Tree position={[-4.8, 0, 0.8]} scale={0.73} />
      <Bench position={[3.7, 0, 1.15]} rotation={-0.25} />
      <Inspectable
        name="Lá cờ"
        position={[-2.6, 0, 0.55]}
        marker={[0.3, 3.65, 0]}
        onInspect={onInspect}
      >
        <Flag reducedMotion={reducedMotion} />
      </Inspectable>
      <Inspectable
        name="Trang vở"
        position={[-2.85, 0.5, 3.5]}
        marker={[0, 0.7, 0]}
        onInspect={onInspect}
      >
        <Box size={[1.3, 0.09, 0.85]} color={C.woodLight} />
        <Book position={[0, 0.08, 0]} open />
        <Segment
          from={[0.5, 0.07, -0.2]}
          to={[0.2, 0.07, 0.2]}
          color="#c5a34d"
          radius={0.018}
        />
        {[-0.45, 0.45].map((x) => (
          <Box
            key={x}
            position={[x, -0.25, 0]}
            size={[0.08, 0.5, 0.6]}
            color={C.wood}
          />
        ))}
      </Inspectable>
      <group position={[2.2, 0.08, 3.5]}>
        <Box
          position={[0, 0.27, 0]}
          size={[0.64, 0.55, 0.25]}
          color="#9c5b3d"
        />
        <Box
          position={[0, 0.38, 0.15]}
          size={[0.6, 0.16, 0.035]}
          color="#ba8057"
        />
        <mesh position={[0, 0.6, 0]}>
          <torusGeometry args={[0.13, 0.025, 6, 14, Math.PI]} />
          <meshStandardMaterial color={C.wood} />
        </mesh>
        <Box
          position={[0, 0.25, 0.16]}
          size={[0.07, 0.1, 0.02]}
          color={C.brass}
        />
      </group>
      <Box
        position={[0.1, 0.035, 0.7]}
        size={[3.2, 0.07, 1.6]}
        color="#c6b993"
      />
      <Pot position={[4.5, 0, 3.5]} scale={0.85} />
    </>
  );
}

export function Buffalo() {
  return (
    <group rotation={[0, -0.2, 0]}>
      <Orb position={[0, 0.8, 0]} scale={[0.85, 0.48, 0.43]} color="#62695b" />
      <Orb
        position={[0.8, 0.96, 0]}
        scale={[0.35, 0.37, 0.32]}
        color="#5c6256"
      />
      <Orb
        position={[1.03, 0.78, 0.05]}
        scale={[0.28, 0.18, 0.26]}
        color="#737766"
      />
      {[-0.48, 0.48].flatMap((x) =>
        [-0.24, 0.24].map((z) => (
          <Pole
            key={`${x}-${z}`}
            position={[x, 0.36, z]}
            height={0.68}
            radius={0.09}
            color="#5a6154"
          />
        )),
      )}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Segment
            from={[0.79, 1.16, s * 0.22]}
            to={[0.62, 1.35, s * 0.4]}
            radius={0.055}
            color="#d0c9ab"
          />
          <Segment
            from={[0.62, 1.35, s * 0.4]}
            to={[0.41, 1.45, s * 0.39]}
            radius={0.035}
            color="#d0c9ab"
          />
          <Orb
            position={[0.98, 1.01, s * 0.27]}
            scale={[0.027, 0.036, 0.02]}
            color="#282f2b"
          />
        </group>
      ))}
      <Segment
        from={[-0.78, 0.93, 0]}
        to={[-1, 0.4, 0.1]}
        radius={0.028}
        color="#485344"
      />
    </group>
  );
}

export function River({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const ripples = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ripples.current && !reducedMotion)
      ripples.current.position.z = Math.sin(clock.elapsedTime * 0.55) * 0.08;
  });
  return (
    <group position={[2.9, 0.02, 0]}>
      {/* A level causeway keeps the shared walking lane clear over the stream. */}
      <Box position={[0, 0, -1.15]} size={[2.1, 0.07, 5.4]} color={C.water} />
      <Box position={[0, 0, 3.3]} size={[2.1, 0.07, 1.1]} color={C.water} />
      <group ref={ripples}>
        {Array.from({ length: 12 }, (_, i) => i)
          .filter((i) => -3.2 + i * 0.56 < 1.4 || -3.2 + i * 0.56 > 2.9)
          .map((i) => (
            <Box
              key={i}
              position={[Math.sin(i * 2.3) * 0.65, 0.045, -3.2 + i * 0.56]}
              size={[0.4 + (i % 3) * 0.16, 0.008, 0.025]}
              color="#9db5a1"
            />
          ))}
      </group>
      {[-1.1, 1.1].map((x) => (
        <group key={x}>
          <Box
            position={[x, 0.05, -1.2]}
            size={[0.14, 0.18, 5.3]}
            color="#a0a079"
          />
          <Box
            position={[x, 0.05, 3.35]}
            size={[0.14, 0.18, 1]}
            color="#a0a079"
          />
        </group>
      ))}
    </group>
  );
}

export function RuralSummerScene({ onInspect, reducedMotion }: WorldProps) {
  return (
    <>
      <Hills />
      <River reducedMotion={reducedMotion} />
      <Inspectable
        name="Khóm tre"
        marker={[-4.7, 3.6, -2]}
        onInspect={onInspect}
      >
        <Bamboo position={[-4.7, 0, -2]} scale={0.95} />
      </Inspectable>
      <Tree position={[4.7, 0, -2.9]} scale={0.72} />
      <Tree position={[-2.9, 0, -2.6]} scale={0.65} kind="palm" />
      <Inspectable
        name="Chú trâu"
        position={[-3.15, 0, 0.6]}
        marker={[0, 1.85, 0]}
        onInspect={onInspect}
      >
        <Buffalo />
      </Inspectable>
      <Inspectable
        name="Chiếc cầu"
        position={[2.9, 0, -0.8]}
        marker={[0, 1.15, 0]}
        onInspect={onInspect}
      >
        <Box position={[0, 0.37, 0]} size={[2.65, 0.22, 1]} color="#aba78b" />
        {[-1.12, 1.12].map((x) => (
          <Box
            key={x}
            position={[x, 0.18, 0]}
            size={[0.25, 0.5, 0.9]}
            color="#949b87"
          />
        ))}
        {[-0.43, 0.43].map((z) => (
          <group key={z}>
            <Box
              position={[0, 0.83, z]}
              size={[2.65, 0.09, 0.09]}
              color="#c6bea0"
            />
            {[-1.16, -0.58, 0, 0.58, 1.16].map((x) => (
              <Pole
                key={x}
                position={[x, 0.64, z]}
                height={0.45}
                radius={0.04}
                color="#bab498"
              />
            ))}
          </group>
        ))}
      </Inspectable>
      <group position={[2.8, 0.13, 3.2]}>
        {[-0.45, 0.03, 0.5].map((x, i) => (
          <group key={x} position={[x, 0, (i % 2) * 0.4]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.3, 14]} />
              <meshStandardMaterial color="#6e8f67" />
            </mesh>
            <Pole
              position={[0.06, 0.18, 0]}
              height={0.34}
              radius={0.012}
              color={C.leaf}
            />
            <Orb
              position={[0.06, 0.37, 0]}
              scale={[0.13, 0.15, 0.13]}
              color="#d1a294"
            />
          </group>
        ))}
      </group>
      <RicePaddy position={[-2.7, 0, 3.5]} width={2.1} depth={1.2} />
      <Orb
        position={[4.6, 0.1, 3.55]}
        scale={[0.6, 0.3, 0.45]}
        color="#9a9d86"
      />
      <Orb
        position={[4.9, 0.1, 1.05]}
        scale={[0.3, 0.2, 0.35]}
        color="#b6b49a"
      />
    </>
  );
}

export function SecondarySchoolScene({ onInspect }: WorldProps) {
  return (
    <>
      <Inspectable
        name="Ngôi trường"
        marker={[-0.5, 3.9, -2.1]}
        onInspect={onInspect}
      >
        <School name="TRUNG HỌC CƠ SỞ CÁT NHƠN" />
      </Inspectable>
      <Tree position={[4.1, 0, 0]} kind="banyan" scale={1.15} />
      <Bench position={[3.45, 0, 1]} rotation={-0.3} />
      <Pot position={[-4.7, 0, 0]} scale={0.8} />
      <Inspectable
        name="Xe đạp"
        position={[-3.4, 0, 0.8]}
        marker={[0, 1.6, 0]}
        onInspect={onInspect}
      >
        <Bicycle rotation={0.25} />
      </Inspectable>
      <Inspectable
        name="Tủ sách"
        position={[-3.8, 0, -0.25]}
        marker={[0, 1.85, 0]}
        onInspect={onInspect}
      >
        <Bookcase width={1.25} height={1.55} />
      </Inspectable>
      <group position={[3.6, 0.1, 3.45]}>
        <Book open color="#6c8380" />
        <Book position={[0.35, 0.08, -0.1]} color="#b4a16a" scale={0.7} />
      </group>
      <Flag position={[-1.8, 0, 0.1]} height={2.8} reducedMotion />
    </>
  );
}

export function Bookcase({
  width = 1.4,
  height = 1.8,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <group>
      <Box
        position={[0, height / 2, -0.16]}
        size={[width, height, 0.1]}
        color={C.wood}
      />
      {[-1, 1].map((s) => (
        <Box
          key={s}
          position={[(s * width) / 2, height / 2, 0]}
          size={[0.07, height, 0.4]}
          color={C.woodLight}
        />
      ))}
      {[0.1, height / 2, height].map((y, row) => (
        <group key={y}>
          <Box
            position={[0, y, 0]}
            size={[width, 0.06, 0.4]}
            color={C.woodLight}
          />
          {row < 2 &&
            Array.from({ length: 6 }, (_, i) => (
              <Box
                key={i}
                position={[
                  -width * 0.36 + i * width * 0.14,
                  y + 0.2 + (i % 3) * 0.03,
                  0,
                ]}
                size={[width * 0.1, 0.34 + (i % 3) * 0.06, 0.28]}
                color={
                  [
                    "#8d5947",
                    "#657d71",
                    "#b2a273",
                    "#546c7d",
                    "#a27b53",
                    "#8b8d74",
                  ][i]!
                }
              />
            ))}
        </group>
      ))}
    </group>
  );
}

export function HighSchoolScene({ onInspect, reducedMotion }: WorldProps) {
  return (
    <>
      <Inspectable
        name="Cổng trường"
        marker={[-0.5, 4.35, -2.1]}
        onInspect={onInspect}
      >
        <School name="THPT SỐ 3 PHÙ CÁT" high />
      </Inspectable>
      <Tree position={[4.7, 0, -0.3]} scale={0.85} blossom />
      <Tree position={[-4.8, 0, 0.45]} scale={0.75} />
      <Flag
        position={[2.2, 0, -0.2]}
        reducedMotion={reducedMotion}
        height={3.4}
      />
      <Inspectable
        name="Bàn học"
        position={[-3.2, 0, 0.65]}
        marker={[0, 1.85, 0]}
        onInspect={onInspect}
      >
        <Desk width={2.0} />
        <Book position={[-0.35, 1.03, 0]} open color="#658078" />
        <Book position={[0.55, 1.07, -0.15]} color="#af7f50" />
        <DeskLamp position={[0.65, 1, -0.3]} />
      </Inspectable>
      <group position={[3.5, 0, 0.95]}>
        <Box position={[0, 0.55, 0]} size={[1.05, 1.1, 0.08]} color="#d7c394" />
        <Sign
          text="ƯỚC MƠ · UTE"
          position={[0, 0.76, 0.045]}
          width={0.95}
          height={0.26}
          fontSize={89}
        />
        <Sign
          text="HỌC · KHÁM PHÁ · ĐI XA"
          position={[0, 0.38, 0.045]}
          width={0.95}
          height={0.16}
          fontSize={65}
        />
      </group>
      <Inspectable
        name="Cặp kính"
        position={[-3.2, 0, 3.4]}
        marker={[0, 1.4, 0]}
        onInspect={onInspect}
      >
        <Box
          position={[0, 0.55, 0]}
          size={[1.2, 0.09, 0.7]}
          color={C.woodLight}
        />
        {[-0.44, 0.44].map((x) => (
          <Box
            key={x}
            position={[x, 0.28, 0]}
            size={[0.08, 0.5, 0.5]}
            color={C.wood}
          />
        ))}
        <group position={[0, 0.65, 0]} rotation={[-Math.PI / 2, 0, -0.12]}>
          {[-0.2, 0.2].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <torusGeometry args={[0.17, 0.025, 7, 20]} />
              <meshStandardMaterial color="#394644" metalness={0.4} />
            </mesh>
          ))}
          <Segment
            from={[-0.04, 0.03, 0]}
            to={[0.04, 0.03, 0]}
            radius={0.018}
            color={C.ink}
          />
          {[-0.37, 0.37].map((x) => (
            <Segment
              key={x}
              from={[x, 0, 0]}
              to={[x, 0.35, 0.12]}
              radius={0.018}
              color={C.ink}
            />
          ))}
        </group>
      </Inspectable>
      <Bench position={[3.45, 0, 0.4]} rotation={-0.3} />
    </>
  );
}

export function Suitcase({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: Vec3;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <Box position={[0, 0.48, 0]} size={[0.76, 0.85, 0.4]} color="#a26e48" />
      {[-0.24, 0.24].map((x) => (
        <Box
          key={x}
          position={[x, 0.49, 0.21]}
          size={[0.045, 0.83, 0.025]}
          color="#d2aa76"
        />
      ))}
      <mesh position={[0, 0.98, 0]}>
        <torusGeometry args={[0.14, 0.035, 6, 16, Math.PI]} />
        <meshStandardMaterial color={C.wood} />
      </mesh>
      <Sign
        text="CÁT NHƠN → SÀI GÒN"
        position={[0, 0.55, 0.225]}
        width={0.56}
        height={0.17}
        fontSize={61}
      />
      {[-0.27, 0.27].map((x) => (
        <Orb
          key={x}
          position={[x, 0.06, 0]}
          scale={[0.07, 0.07, 0.07]}
          color={C.ink}
        />
      ))}
    </group>
  );
}

export function DepartureStationScene({ onInspect }: WorldProps) {
  return (
    <>
      <Hills />
      <Box position={[0, 0.04, -2]} size={[10.7, 0.14, 2.7]} color="#aaa48e" />
      {[-2.7, -1.3].map((z) => (
        <Box
          key={z}
          position={[0, 0.17, z]}
          size={[11, 0.09, 0.08]}
          color="#626d69"
          metalness={0.5}
        />
      ))}
      {Array.from({ length: 22 }, (_, i) => (
        <Box
          key={i}
          position={[-5.1 + i * 0.48, 0.1, -2]}
          size={[0.2, 0.07, 1.85]}
          color="#6e715f"
        />
      ))}
      <Inspectable
        name="Chuyến tàu"
        position={[-0.2, 0, -2]}
        marker={[0, 3.3, 0]}
        onInspect={onInspect}
      >
        <Box position={[0, 1.22, 0]} size={[7.9, 1.82, 1.9]} color="#d6c7a2" />
        <Box
          position={[0, 0.71, 0.98]}
          size={[7.9, 0.46, 0.03]}
          color="#a8543f"
        />
        <Box
          position={[0, 2.17, 0]}
          size={[8.04, 0.18, 1.98]}
          color="#6f7972"
        />
        {[-3.1, -1.85, -0.6, 0.65, 1.9, 3.1].map((x) => (
          <group key={x}>
            <Box
              position={[x, 1.55, 0.97]}
              size={[0.84, 0.63, 0.045]}
              color="#466770"
            />
            <Box
              position={[x, 1.56, 1.005]}
              size={[0.025, 0.62, 0.02]}
              color="#d5cfb0"
            />
          </group>
        ))}
        {[-2.9, -2.2, 2.2, 2.9].map((x) => (
          <mesh
            key={x}
            position={[x, 0.37, 0.68]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.3, 0.3, 0.27, 12]} />
            <meshStandardMaterial color="#414e4a" />
          </mesh>
        ))}
        <Sign
          text="ĐƯỜNG SẮT VIỆT NAM"
          position={[0, 0.75, 1.01]}
          width={2.2}
          height={0.22}
          color="#a8543f"
          ink={C.cream}
          fontSize={80}
        />
      </Inspectable>
      <Box position={[0, 0.08, 0.1]} size={[10.7, 0.16, 1.4]} color="#c5b99e" />
      <Box
        position={[0, 0.18, -0.52]}
        size={[10.7, 0.04, 0.09]}
        color="#d5b86e"
      />
      <Inspectable
        name="Chiếc vali"
        position={[-2.65, 0.18, 0.95]}
        marker={[0, 1.5, 0]}
        onInspect={onInspect}
      >
        <Suitcase />
      </Inspectable>
      <Inspectable
        name="Biển chỉ đường"
        position={[3.5, 0, 1]}
        marker={[0, 2.5, 0]}
        onInspect={onInspect}
      >
        <Pole
          height={2.3}
          position={[0, 1.15, 0]}
          radius={0.055}
          color="#a39776"
        />
        <Box position={[0, 2.05, 0]} size={[1.8, 0.48, 0.13]} color={C.blue} />
        <Sign
          text="TP. HỒ CHÍ MINH →"
          position={[0, 2.05, 0.072]}
          width={1.7}
          height={0.3}
          color={C.blue}
          ink={C.cream}
          fontSize={65}
        />
      </Inspectable>
      <Bench position={[-4.1, 0.16, 0.25]} />
      <Tree position={[4.8, 0, -0.7]} scale={0.7} />
    </>
  );
}

export function UTECampusScene({ onInspect, reducedMotion }: WorldProps) {
  return (
    <>
      <group position={[-0.4, 0, -2.1]}>
        <Box position={[0, 1.9, 0]} size={[7.3, 3.7, 1.9]} color="#d9d7bd" />
        <Box position={[0, 2, 1.01]} size={[2.35, 3.4, 0.09]} color="#365f77" />
        {[-2.85, -1.85, 1.85, 2.85].flatMap((x) =>
          [0.7, 1.65, 2.6, 3.45].map((y) => (
            <Box
              key={`${x}-${y}`}
              position={[x, y, 1.0]}
              size={[0.69, 0.64, 0.08]}
              color="#5a8494"
            />
          )),
        )}
        {[1, 2, 3].map((y) => (
          <Box
            key={y}
            position={[0, y, 1.07]}
            size={[2.4, 0.06, 0.045]}
            color="#b9c9c0"
          />
        ))}
        <Box position={[0, 4.02, 0]} size={[7.7, 0.24, 2.3]} color="#e9e0bf" />
        <Box
          position={[0, 0.21, 1.5]}
          size={[4.5, 0.38, 1.1]}
          color="#b6b9aa"
        />
        <Box position={[0, 1.2, 1.12]} size={[3, 0.15, 1.0]} color="#c5cebf" />
        <Sign
          text="ĐẠI HỌC SƯ PHẠM KỸ THUẬT TP.HCM"
          position={[0, 3.89, 1.17]}
          width={6.6}
          height={0.34}
          fontSize={51}
          color="#e9e0bf"
          ink={C.blue}
        />
        <Sign
          text="UTE"
          position={[0, 2.85, 1.085]}
          width={1.6}
          height={0.62}
          fontSize={240}
          color="#365f77"
          ink="#e7d8ab"
        />
      </group>
      <Tree position={[-4.8, 0, -0.8]} scale={0.95} kind="palm" />
      <Tree position={[4.5, 0, -0.7]} scale={1.05} kind="palm" />
      <Inspectable
        name="Khuôn viên UTE"
        position={[0, 0, -0.3]}
        marker={[0, 1.7, 0]}
        onInspect={onInspect}
      >
        <Box position={[0, 0.26, 0]} size={[1.1, 0.52, 0.65]} color="#c5c4ae" />
        <Orb
          position={[0, 0.96, 0]}
          scale={[0.33, 0.33, 0.33]}
          color="#83988b"
        />
        <mesh position={[0, 0.96, 0]} rotation={[0, 0, 0.6]}>
          <torusGeometry args={[0.52, 0.025, 6, 25]} />
          <meshStandardMaterial
            color={C.brass}
            metalness={0.45}
            roughness={0.4}
          />
        </mesh>
      </Inspectable>
      <Inspectable
        name="Giảng đường"
        position={[-3.4, 0.15, 0.65]}
        marker={[0, 1.6, 0]}
        onInspect={onInspect}
      >
        <Desk width={1.8} />
        <Laptop position={[0, 1.04, 0]} />
        <Book position={[-0.58, 1.04, 0.1]} color="#a88754" scale={0.6} />
      </Inspectable>
      <Inspectable
        name="Ba lô"
        position={[3.35, 0, 3.5]}
        marker={[0, 1.55, 0]}
        onInspect={onInspect}
      >
        <Box position={[0, 0.16, 0]} size={[1.1, 0.28, 0.9]} color="#afb7a0" />
        <Box
          position={[0, 0.68, 0]}
          size={[0.66, 0.81, 0.38]}
          color="#526f77"
        />
        <Box
          position={[0, 0.54, 0.22]}
          size={[0.51, 0.32, 0.12]}
          color="#6b8a8a"
        />
        <Box
          position={[0, 0.74, 0.21]}
          size={[0.18, 0.11, 0.03]}
          color="#d0b277"
        />
        <mesh position={[0, 1.13, 0]}>
          <torusGeometry args={[0.11, 0.025, 6, 14, Math.PI]} />
          <meshStandardMaterial color="#385358" />
        </mesh>
        <Book position={[0.52, 0.31, 0.02]} scale={0.65} color="#b18e58" />
      </Inspectable>
      <Flag position={[3.1, 0, 0]} height={3.4} reducedMotion={reducedMotion} />
      <Bench position={[-4, 0, 0.3]} />
      <Pot position={[4.5, 0, 3.55]} scale={0.85} />
    </>
  );
}

export function Desk({
  width = 2.8,
  position = [0, 0, 0],
}: {
  width?: number;
  position?: Vec3;
}) {
  return (
    <group position={position}>
      <Box position={[0, 0.96, 0]} size={[width, 0.12, 1.15]} color="#ba9b70" />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box
            position={[s * (width / 2 - 0.17), 0.48, 0]}
            size={[0.07, 0.9, 0.87]}
            color="#495e5c"
          />
          <Box
            position={[s * (width / 2 - 0.17), 0.07, 0]}
            size={[0.14, 0.09, 1.03]}
            color="#495e5c"
          />
        </group>
      ))}
    </group>
  );
}

export function Laptop({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: Vec3;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <Box
        position={[0, 0.025, 0.1]}
        size={[0.9, 0.05, 0.62]}
        color="#a9b2a5"
        metalness={0.45}
      />
      <Box
        position={[0, 0.056, 0.02]}
        size={[0.7, 0.012, 0.3]}
        color="#526863"
      />
      <group position={[0, 0.34, -0.2]} rotation={[-0.14, 0, 0]}>
        <Box size={[0.92, 0.61, 0.045]} color="#70847c" />
        <Screen position={[0, 0, 0.027]} width={0.82} height={0.5} />
      </group>
    </group>
  );
}

export function Screen({
  position,
  width = 1.35,
  height = 0.83,
  variant = 0,
}: {
  position: Vec3;
  width?: number;
  height?: number;
  variant?: number;
}) {
  return (
    <group position={position}>
      <Box
        size={[width, height, 0.025]}
        color={variant === 1 ? "#354e60" : "#253e48"}
      />
      <Box
        position={[-width * 0.4, 0, 0.017]}
        size={[width * 0.12, height * 0.86, 0.008]}
        color="#3d5960"
      />
      {Array.from({ length: 7 }, (_, i) => (
        <Box
          key={i}
          position={[
            -width * 0.04 - (i % 3) * width * 0.025,
            height * (0.32 - i * 0.098),
            0.021,
          ]}
          size={[width * (0.49 - (i % 3) * 0.07), height * 0.021, 0.01]}
          color={i % 3 === 0 ? "#b7b084" : i % 3 === 1 ? "#88a99b" : "#6b96a5"}
        />
      ))}
    </group>
  );
}

export function Monitor({
  position = [0, 0, 0],
  scale = 1,
  rotation = 0,
  variant = 0,
}: {
  position?: Vec3;
  scale?: number;
  rotation?: number;
  variant?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      <Box position={[0, 0.025, 0]} size={[0.48, 0.05, 0.3]} color="#526662" />
      <Box
        position={[0, 0.26, -0.07]}
        size={[0.09, 0.5, 0.08]}
        color="#526662"
      />
      <Box position={[0, 0.7, 0]} size={[1.48, 0.95, 0.07]} color="#425855" />
      <Screen position={[0, 0.7, 0.042]} variant={variant} />
    </group>
  );
}

export function DeskLamp({ position = [0, 0, 0] }: { position?: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.025, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.19, 0.05, 14]} />
        <meshStandardMaterial color="#b6a578" metalness={0.35} />
      </mesh>
      <Segment
        from={[0, 0.05, 0]}
        to={[0.03, 0.5, 0]}
        radius={0.025}
        color="#b8aa7c"
      />
      <Segment
        from={[0.03, 0.5, 0]}
        to={[-0.25, 0.75, 0]}
        radius={0.025}
        color="#b8aa7c"
      />
      <mesh position={[-0.28, 0.71, 0]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.22, 0.23, 14, 1, true]} />
        <meshStandardMaterial color="#d8bc7a" side={THREE.DoubleSide} />
      </mesh>
      <Orb
        position={[-0.3, 0.65, 0]}
        scale={[0.08, 0.06, 0.08]}
        color="#efdfaf"
      />
    </group>
  );
}

export function Chair({
  position = [0, 0, 0],
  rotation = 0,
}: {
  position?: Vec3;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box position={[0, 0.54, 0]} size={[0.8, 0.13, 0.75]} color="#667b70" />
      <Box
        position={[0, 1.05, 0.29]}
        size={[0.78, 0.85, 0.1]}
        color="#667b70"
      />
      <Pole
        position={[0, 0.28, 0]}
        height={0.5}
        radius={0.06}
        color="#4b5c55"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <Segment
          key={i}
          from={[0, 0.08, 0]}
          to={[
            Math.cos((i * Math.PI * 2) / 5) * 0.4,
            0.04,
            Math.sin((i * Math.PI * 2) / 5) * 0.4,
          ]}
          radius={0.04}
          color="#4b5c55"
        />
      ))}
    </group>
  );
}

export function RoomShell({
  night = false,
  skyline = false,
}: {
  night?: boolean;
  skyline?: boolean;
}) {
  return (
    <>
      <Box
        position={[0, 0.04, -1.05]}
        size={[10.5, 0.13, 5]}
        color={night ? "#7f877b" : "#cbc5ac"}
      />
      <Box
        position={[-5.15, 1.9, -1.1]}
        size={[0.16, 3.8, 4.9]}
        color={night ? "#7f9389" : "#b8bca6"}
      />
      <Box
        position={[0, 1.9, -3.45]}
        size={[10.5, 3.8, 0.14]}
        color={night ? "#697f7a" : "#c8ceb8"}
      />
      <Box
        position={[1.3, 2.15, -3.35]}
        size={[6.9, 2.45, 0.1]}
        color={night ? "#2d4a58" : "#93b0ac"}
      />
      {[-2.1, 0.2, 2.5, 4.75].map((x) => (
        <Box
          key={x}
          position={[x, 2.15, -3.21]}
          size={[0.065, 2.5, 0.14]}
          color={night ? "#b3ba9f" : "#e0ddc3"}
        />
      ))}
      <Box
        position={[1.3, 0.88, -3.21]}
        size={[7, 0.12, 0.3]}
        color="#a5ac95"
      />
      {skyline && <Skyline night={night} />}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Box
          key={i}
          position={[-4.5 + i * 1.45, 0.115, -1.05]}
          size={[0.018, 0.01, 5]}
          color="#b5b29c"
        />
      ))}
    </>
  );
}

export function Skyline({ night = false }: { night?: boolean }) {
  return (
    <group position={[0.6, 0.95, -3.26]}>
      {Array.from({ length: 13 }, (_, i) => {
        const h = 0.45 + ((i * 7) % 11) * 0.12;
        return (
          <group key={i} position={[-3 + i * 0.55, 0, 0]}>
            <Box
              position={[0, h / 2, 0]}
              size={[0.42, h, 0.05]}
              color={i % 2 ? "#65868b" : "#79969a"}
            />
            {[0.22, 0.5, 0.78, 1.06, 1.34]
              .filter((y) => y < h)
              .map((y) => (
                <Box
                  key={y}
                  position={[0, y, 0.04]}
                  size={[0.25, 0.045, 0.015]}
                  color={night ? "#c7b674" : "#a2b5aa"}
                />
              ))}
          </group>
        );
      })}
      <Box
        position={[1.4, 1.08, 0.03]}
        size={[0.27, 2.1, 0.1]}
        color="#536e79"
      />
      <Pole
        position={[1.4, 2.23, 0.03]}
        height={0.45}
        radius={0.018}
        color="#536e79"
      />
    </group>
  );
}

export function NightStudyScene({ onInspect }: WorldProps) {
  return (
    <>
      <RoomShell night skyline />
      <Inspectable
        name="Góc học"
        position={[-1, 0.12, -1.6]}
        marker={[0, 2.7, 0]}
        onInspect={onInspect}
      >
        <Desk width={3.4} />
        <Inspectable
          name="Màn hình"
          position={[-0.55, 1.04, -0.18]}
          marker={[0, 1.45, 0]}
          onInspect={onInspect}
        >
          <Monitor scale={0.93} />
        </Inspectable>
        <Laptop position={[0.85, 1.04, 0.12]} scale={0.85} />
        <Box
          position={[-0.4, 1.035, 0.32]}
          size={[1.08, 0.035, 0.32]}
          color="#d2cfb4"
        />
        <Inspectable
          name="Đèn bàn"
          position={[-1.35, 1.02, -0.15]}
          marker={[-0.25, 1.15, 0]}
          onInspect={onInspect}
        >
          <DeskLamp />
        </Inspectable>
        <pointLight
          position={[-1.6, 1.65, -0.02]}
          color="#ffe0a0"
          intensity={2.8}
          distance={3.6}
          decay={2}
        />
      </Inspectable>
      <Chair position={[-1.2, 0.12, -0.05]} rotation={-0.2} />
      <group position={[-4.1, 0.14, -2.1]}>
        <Bookcase width={1.3} height={2.1} />
        <Book position={[0, 2.16, 0]} color="#ae8053" />
      </group>
      <group position={[3.2, 0.14, -1.5]}>
        <Pot scale={1.4} />
        <Box position={[0, 0.15, 0]} size={[1, 0.3, 0.9]} color="#859582" />
      </group>
      <Box
        position={[3.6, 0.4, 0.45]}
        size={[2.2, 0.55, 1.5]}
        color="#a4ad96"
      />
      <Box
        position={[3.6, 0.7, 0.45]}
        size={[2.12, 0.18, 1.45]}
        color="#d2c7a5"
      />
      <Box
        position={[3.6, 0.85, -0.04]}
        size={[1, 0.13, 0.4]}
        color="#e1d3ac"
      />
      <Sign
        text="HỌC MỖI NGÀY · TIẾN THÊM MỘT CHÚT"
        position={[-3.1, 2.9, -3.3]}
        width={3.2}
        height={0.38}
        fontSize={57}
        color="#697f7a"
        ink="#dfd6ae"
      />
    </>
  );
}

export function Coffee({ position = [0, 0, 0] }: { position?: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.24, 12]} />
        <meshStandardMaterial color="#e3d8b9" />
      </mesh>
      <mesh position={[0, 0.245, 0]}>
        <cylinderGeometry args={[0.103, 0.103, 0.012, 12]} />
        <meshStandardMaterial color="#665140" />
      </mesh>
      <mesh position={[0.13, 0.13, 0]}>
        <torusGeometry args={[0.065, 0.02, 6, 12]} />
        <meshStandardMaterial color="#e3d8b9" />
      </mesh>
    </group>
  );
}

export function AMITOfficeScene({ onInspect }: WorldProps) {
  return (
    <>
      <RoomShell skyline />
      <Sign
        text="AMIT GROUP"
        position={[-3.6, 2.7, -3.3]}
        width={2.25}
        height={0.62}
        fontSize={144}
        color="#c8ceb8"
        ink="#4c6c76"
      />
      <Inspectable
        name="Bàn làm việc"
        position={[-1.3, 0.13, -1.6]}
        marker={[0, 2.75, 0]}
        onInspect={onInspect}
      >
        <Desk width={3.6} />
        <Monitor position={[-0.5, 1.04, -0.1]} />
        <Laptop position={[0.95, 1.04, 0.07]} scale={0.75} />
        <Coffee position={[-1.35, 1.03, 0.15]} />
        <Box
          position={[-0.5, 1.04, 0.4]}
          size={[1.2, 0.035, 0.32]}
          color="#d9d4b8"
        />
      </Inspectable>
      <Chair position={[-1.4, 0.13, 0.1]} rotation={-0.25} />
      <Inspectable
        name="Bảng công việc"
        position={[3.3, 0.14, -1.1]}
        marker={[0, 2.7, 0]}
        onInspect={onInspect}
      >
        <Box position={[0, 1.55, 0]} size={[2.1, 1.7, 0.12]} color="#e4dfc3" />
        <Box position={[0, 0.7, 0]} size={[1.9, 0.08, 0.3]} color="#9aa991" />
        {[-0.8, 0.8].map((x) => (
          <Pole
            key={x}
            position={[x, 0.4, 0]}
            height={0.75}
            radius={0.035}
            color="#667d74"
          />
        ))}
        {[-0.55, 0.05, 0.65].map((x, i) => (
          <group key={x}>
            <Box
              position={[x, 1.7, 0.075]}
              size={[0.38, 0.38, 0.015]}
              color={["#ccbc7b", "#8fa89a", "#be9371"][i]!}
            />
            <Box
              position={[x, 1.1, 0.075]}
              size={[0.38, 0.26, 0.015]}
              color="#9aafa3"
            />
          </group>
        ))}
      </Inspectable>
      <Inspectable
        name="Bản thiết kế"
        position={[-3.6, 0.13, 3.5]}
        marker={[0, 1.35, 0]}
        onInspect={onInspect}
      >
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.08, 20]} />
          <meshStandardMaterial color="#c5aa7e" />
        </mesh>
        <Pole
          position={[0, 0.35, 0]}
          height={0.7}
          radius={0.08}
          color="#5d756a"
        />
        <Coffee position={[-0.44, 0.76, 0]} />
        <Box
          position={[0.12, 0.76, 0.05]}
          size={[0.65, 0.02, 0.7]}
          color="#e4ddbe"
        />
        <Box
          position={[0.12, 0.775, -0.13]}
          size={[0.52, 0.015, 0.15]}
          color="#7c9b91"
        />
        {[-0.04, 0.25].map((x) => (
          <Box
            key={x}
            position={[x, 0.775, 0.16]}
            size={[0.22, 0.015, 0.25]}
            color="#a9b6a0"
          />
        ))}
      </Inspectable>
      <Pot position={[4.3, 0.12, 1.05]} scale={1.5} />
      <group position={[-4.3, 0.13, -2.45]}>
        <Bookcase width={1.1} height={1.7} />
      </group>
    </>
  );
}

export function EstuaryOfficeScene({ onInspect }: WorldProps) {
  return (
    <>
      <RoomShell skyline />
      <Sign
        text="ESTUARY SOLUTIONS"
        position={[-2.65, 2.98, -3.3]}
        width={4.2}
        height={0.52}
        fontSize={108}
        color="#c8ceb8"
        ink="#365e5d"
      />
      <Inspectable
        name="Sản phẩm"
        position={[-0.5, 0.13, -1.5]}
        marker={[0, 3, 0]}
        onInspect={onInspect}
      >
        <Desk width={4.6} />
        <Monitor position={[-0.95, 1.04, -0.12]} rotation={0.1} />
        <Monitor position={[0.65, 1.04, -0.12]} rotation={-0.1} variant={1} />
        <Laptop position={[1.7, 1.04, 0.18]} scale={0.64} />
        <Box
          position={[-0.2, 1.04, 0.4]}
          size={[1.25, 0.035, 0.35]}
          color="#d7d4b8"
        />
        <Coffee position={[-1.95, 1.04, 0.24]} />
      </Inspectable>
      <Chair position={[-0.6, 0.13, 0.2]} rotation={-0.15} />
      <Inspectable
        name="Thành phố"
        position={[4, 0.13, -1.65]}
        marker={[0, 2.5, 0]}
        onInspect={onInspect}
      >
        <Pot scale={1.7} />
      </Inspectable>
      <Inspectable
        name="Hệ thống"
        position={[-3.8, 0.13, 0.7]}
        marker={[0, 1.6, 0]}
        onInspect={onInspect}
      >
        <Box position={[0, 0.55, 0]} size={[1.45, 1.1, 1.1]} color="#b2b8a2" />
        <Book position={[0.22, 1.14, 0]} color="#536f73" />
        <Book position={[0.15, 1.25, 0.02]} color="#be9c68" />
        <Orb
          position={[-0.4, 1.37, -0.07]}
          scale={[0.22, 0.22, 0.22]}
          color="#718f88"
        />
        <mesh position={[-0.4, 1.37, -0.07]} rotation={[0.3, 0, 0.6]}>
          <torusGeometry args={[0.3, 0.02, 7, 20]} />
          <meshStandardMaterial color={C.brass} metalness={0.4} />
        </mesh>
      </Inspectable>
      <group position={[-4.25, 0.13, -2.45]}>
        <Bookcase width={1.3} height={1.8} />
      </group>
      <Bench position={[3.75, 0.13, 1]} rotation={-0.25} />
    </>
  );
}

export function ReturnHomeScene({ onInspect, reducedMotion }: WorldProps) {
  return (
    <>
      <Hills />
      <Inspectable
        name="Hiên nhà"
        marker={[-2, 3.5, -1.7]}
        onInspect={onInspect}
      >
        <VillageHouse position={[-2, 0, -1.7]} open />
      </Inspectable>
      <Bamboo position={[4.7, 0, -2.6]} scale={0.8} />
      <Inspectable
        name="Cánh đồng"
        marker={[3.4, 0.8, 1]}
        onInspect={onInspect}
      >
        <RicePaddy position={[3.4, 0, -0.55]} width={3.2} depth={3.8} />
      </Inspectable>
      <Tree position={[-4.7, 0, 0.9]} kind="palm" scale={0.85} />
      <Inspectable
        name="Laptop"
        position={[-2.6, 0.2, 0.5]}
        marker={[0, 1.8, 0]}
        onInspect={onInspect}
      >
        <Desk width={2.0} />
        <Laptop position={[0, 1.04, 0]} />
        <Coffee position={[0.68, 1.04, 0.15]} />
      </Inspectable>
      <group position={[-3.3, 0, 3.5]}>
        <Suitcase scale={0.8} />
        <Book position={[0.05, 0.8, 0]} scale={0.8} color="#63827a" />
      </group>
      <group position={[3.4, 0.1, 3.5]}>
        <Pole
          position={[0, 0.5, 0]}
          height={0.9}
          radius={0.045}
          color={C.woodLight}
        />
        <Sign
          text="CÁT NHƠN · BÌNH ĐỊNH"
          position={[0, 0.9, 0.06]}
          width={1.65}
          height={0.36}
          color={C.wood}
          ink={C.cream}
          fontSize={70}
        />
        <Box position={[0, 0.9, 0]} size={[1.75, 0.43, 0.09]} color={C.wood} />
      </group>
      <Kite reducedMotion={reducedMotion} />
      <Pot position={[-0.5, 0, -0.15]} scale={0.7} />
    </>
  );
}

/** Public scene catalog. Illustrative school buildings are not surveyed replicas. */
export const STORY_SCENES = [
  { id: "que-nha", chapter: 0, Component: ChildhoodVillageScene },
  { id: "tieu-hoc", chapter: 1, Component: PrimarySchoolScene },
  { id: "mua-he", chapter: 2, Component: RuralSummerScene },
  { id: "thcs", chapter: 3, Component: SecondarySchoolScene },
  { id: "thpt", chapter: 4, Component: HighSchoolScene },
  { id: "di-xa", chapter: 5, Component: DepartureStationScene },
  { id: "ute", chapter: 6, Component: UTECampusScene },
  { id: "goc-hoc", chapter: 7, Component: NightStudyScene },
  { id: "amit", chapter: 8, Component: AMITOfficeScene },
  { id: "hien-tai", chapter: 9, Component: EstuaryOfficeScene },
  { id: "coi-nguon", chapter: 10, Component: ReturnHomeScene },
] as const;

/** Alternative ground export for standalone scene composition. */
export { StoryGround as SceneIsland };

export function StoryWorld({
  chapter,
  reducedMotion = false,
  onInspect,
  includeIsland = true,
}: StoryWorldProps) {
  const props = { chapter, reducedMotion, onInspect };
  const Scene =
    STORY_SCENES[Math.min(Math.max(chapter, 0), STORY_SCENES.length - 1)]!
      .Component;
  return (
    <group>
      {includeIsland && <StoryGround chapter={chapter} />}
      <Scene {...props} />
    </group>
  );
}
