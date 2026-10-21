import type { ComponentType, RefObject } from "react";
import type { Group } from "three";
import { AmitMap } from "./amit-map";
import { BienQueMap } from "./bien-que-map";
import { CayDaMap } from "./cay-da-map";
import { ChoQueMap } from "./cho-que-map";
import { CoiNguonMap } from "./coi-nguon-map";
import { DiXaMap } from "./di-xa-map";
import { GocHocMap } from "./goc-hoc-map";
import { HienTaiMap } from "./hien-tai-map";
import { MuaHeMap } from "./mua-he-map";
import { QueNhaMap } from "./que-nha-map";
import { TetMap } from "./tet-map";
import { ThcsMap } from "./thcs-map";
import { ThptMap } from "./thpt-map";
import { TieuHocMap } from "./tieu-hoc-map";
import { TrungThuMap } from "./trung-thu-map";
import { UteMap } from "./ute-map";

export type MapSceneProps = {
  /** Effects unlocked by finished interactions (see Interaction.effect). */
  effects: ReadonlySet<string>;
  /** The player's group, e.g. to hide a roof while inside. */
  player: RefObject<Group | null>;
  reducedMotion?: boolean;
};

/** 3D scene per explore map id. Data lives in lib/explore/<id>.ts. */
export const MAP_SCENES: Record<string, ComponentType<MapSceneProps>> = {
  "que-nha": QueNhaMap,
  "tet-que": TetMap,
  "tieu-hoc": TieuHocMap,
  "trung-thu": TrungThuMap,
  "mua-he": MuaHeMap,
  "bien-que": BienQueMap,
  "cho-que": ChoQueMap,
  "cay-da": CayDaMap,
  thcs: ThcsMap,
  thpt: ThptMap,
  "di-xa": DiXaMap,
  ute: UteMap,
  "goc-hoc": GocHocMap,
  amit: AmitMap,
  "hien-tai": HienTaiMap,
  "coi-nguon": CoiNguonMap,
};
