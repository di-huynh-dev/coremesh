/** [x, z] on the ground plane. +z points towards the camera. */
export type Vec2 = [number, number];

export type Obstacle =
  | { kind: "circle"; at: Vec2; r: number }
  | { kind: "box"; min: Vec2; max: Vec2 };

export type VillagerLook = {
  shirt: string;
  pants: string;
  skin?: string;
  hair: "short" | "bun" | "crop" | "bald" | "pigtails";
  hairColor?: string;
  /** 1 = adult. Children ~0.72, elders ~0.93. */
  height?: number;
  hat?: "non-la" | "khan-dong";
  beard?: boolean;
  glasses?: boolean;
  /** Long tunic (áo dài / áo bà ba dài). */
  longShirt?: boolean;
};

/** Looping idle animation a villager performs (with a matching held prop). */
export type Activity =
  | "idle"
  | "talk"
  | "sweep"
  | "hoe"
  | "stir"
  | "read"
  | "drink"
  | "wave"
  | "fish"
  | "type"
  | "clap"
  | "carry"
  | "sell"
  | "write"
  | "phone"
  | "play";

/**
 * How a character moves on its own. Walkers stop and turn to face Dĩ when he
 * comes close (unless `ignorePlayer`), then carry on.
 */
export type Movement =
  /** Strolls to random spots within `radius` of its home position, pausing between. */
  | { kind: "wander"; radius: number; speed?: number; pause?: [number, number] }
  /** Walks to points[0], points[1], … in order and loops, pausing at each. */
  | {
      kind: "route";
      points: Vec2[];
      speed?: number;
      pause?: [number, number];
      ignorePlayer?: boolean;
    };

export type NpcSpec = {
  id: string;
  name: string;
  at: Vec2;
  /** Facing angle in radians (0 = towards the camera). */
  facing?: number;
  pose?: "stand" | "sit";
  look: VillagerLook;
  /** What they do while idle. Default "idle" (breathing, looking around). */
  activity?: Activity;
  movement?: Movement;
};

/** Non-interactive passer-by (a cyclist, a vendor with a shoulder pole…). */
export type ExtraSpec = {
  id: string;
  look: VillagerLook;
  at: Vec2;
  facing?: number;
  pose?: "stand" | "sit";
  activity?: Activity;
  movement?: Movement;
  /** Rides a bicycle while moving. */
  bicycle?: boolean;
};

export type AnimalSpec = {
  id: string;
  kind: "dog" | "cat" | "duck" | "chicken" | "buffalo" | "bird";
  at: Vec2;
  facing?: number;
  movement?: Movement;
  /** A dog trots after Dĩ once he gets close. */
  follow?: boolean;
  color?: string;
};

/** Short body animation Dĩ plays while an interaction is open. */
export type PlayerAction =
  | "bow"
  | "wave"
  | "pray"
  | "crouch"
  | "cheer"
  | "receive"
  | "nod"
  | "point"
  | "type";

export type DialogueLine = {
  /** Speaker name; "" for narration. */
  who: string;
  text: string;
};

export type Interaction = {
  id: string;
  /** Prompt shown when close, e.g. "Chúc Tết ông". */
  label: string;
  at: Vec2;
  radius?: number;
  /** NPC the player is talking to (for the portrait). */
  npc?: string;
  /** Point the camera frames during the interaction when there is no NPC (altar, tree…). */
  focus?: Vec2;
  lines: DialogueLine[];
  /** Quest ticked when the dialogue finishes. */
  quest?: string;
  /** Visual change applied to the map when finished (handled by the map scene). */
  effect?: string;
  /** Short reward toast. */
  reward?: string;
  /** What Dĩ does while this interaction plays (default: bow to elders, wave to others). */
  action?: PlayerAction;
};

export type Quest = { id: string; label: string };

export type ExploreMapData = {
  id: string;
  /** Chapter id in lib/story.ts this map expands. */
  chapterId: string;
  title: string;
  subtitle: string;
  spawn: Vec2;
  bounds: { min: Vec2; max: Vec2 };
  npcs: NpcSpec[];
  interactions: Interaction[];
  quests: Quest[];
  obstacles: Obstacle[];
  /** Passers-by that bring the map to life. */
  extras?: ExtraSpec[];
  /** Dogs, cats, ducks, birds… */
  animals?: AnimalSpec[];
  intro: DialogueLine[];
  outro: DialogueLine[];
  sky: {
    top: string;
    bottom: string;
    fog: string;
    sun: string;
    sunIntensity: number;
    ambient: number;
    /** Hemisphere (sky fill) intensity; lower it for night maps. Default 1.2. */
    hemi?: number;
    hemiSky?: string;
  };
};
