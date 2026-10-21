"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber registers native Three.js JSX properties. */

import { CHILDHOOD_SCENES } from "@/components/story/world-childhood";
import {
  STORY_SCENES,
  StoryGround,
  StoryWorld,
} from "@/components/story/world-3d";
import type { ReactNode } from "react";
import { useGroundTexture } from "../environment-details";

/**
 * Base for an explore map: a wide ground plane with the chapter's own
 * diorama (the island seen on the journey) placed at the origin. Maps add
 * their surroundings, effects and set dressing as children around it.
 *
 * The diorama occupies x -5.85..5.85, z -4.25..4.25; its walking lane runs
 * along z 2.15. Everything else on the map is free to design.
 */
export function DioramaMap({
  chapterId,
  ground = "#8d9c64",
  reducedMotion,
  showDiorama = true,
  children,
}: {
  chapterId: string;
  ground?: string;
  reducedMotion?: boolean;
  showDiorama?: boolean;
  children?: ReactNode;
}) {
  const legacy = STORY_SCENES.findIndex((scene) => scene.id === chapterId);
  const Extra = CHILDHOOD_SCENES[chapterId];
  const grain = useGroundTexture();
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, 0]}
        receiveShadow
      >
        <planeGeometry args={[120, 90]} />
        <meshStandardMaterial color={ground} roughness={1} bumpMap={grain} bumpScale={0.035} roughnessMap={grain} />
      </mesh>
      {showDiorama ? (
        legacy >= 0 ? (
          <StoryWorld chapter={legacy} reducedMotion={reducedMotion} />
        ) : (
          <group>
            <StoryGround chapter={0} />
            {Extra ? <Extra reducedMotion={reducedMotion} /> : null}
          </group>
        )
      ) : null}
      {children}
    </group>
  );
}
