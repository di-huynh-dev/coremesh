/** Shared assembly contract. One scene unit is a modeling unit, with Y pointing up. */
export const STORY_SCENE_SPACING = 16;
export const STORY_SCENE_HALF_WIDTH = 5.85;
export const STORY_WALKWAY_Z = 2.15;
export const STORY_WALK_SPEED = 4;

export type StoryWalkInput = { axis: -1 | 0 | 1 };
export type StoryDestination = { chapter: number; revision: number };
export type StoryExportRequest = { kind: "scene" | "character"; revision: number };
