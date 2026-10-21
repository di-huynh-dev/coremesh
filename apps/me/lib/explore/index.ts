import { amitMap } from "./amit";
import { bienQueMap } from "./bien-que";
import { cayDaMap } from "./cay-da";
import { choQueMap } from "./cho-que";
import { coiNguonMap } from "./coi-nguon";
import { diXaMap } from "./di-xa";
import { gocHocMap } from "./goc-hoc";
import { hienTaiMap } from "./hien-tai";
import { muaHeMap } from "./mua-he";
import { queNhaMap } from "./que-nha";
import { tetMap } from "./tet-que";
import { thcsMap } from "./thcs";
import { thptMap } from "./thpt";
import { tieuHocMap } from "./tieu-hoc";
import { trungThuMap } from "./trung-thu";
import { uteMap } from "./ute";
import type { ExploreMapData } from "./types";

/** Explorable maps, keyed by map id. Add a map here to give a chapter a "Bước vào" door. */
export const EXPLORE_MAPS: Record<string, ExploreMapData> = {
  [queNhaMap.id]: queNhaMap,
  [tetMap.id]: tetMap,
  [tieuHocMap.id]: tieuHocMap,
  [trungThuMap.id]: trungThuMap,
  [muaHeMap.id]: muaHeMap,
  [bienQueMap.id]: bienQueMap,
  [choQueMap.id]: choQueMap,
  [cayDaMap.id]: cayDaMap,
  [thcsMap.id]: thcsMap,
  [thptMap.id]: thptMap,
  [diXaMap.id]: diXaMap,
  [uteMap.id]: uteMap,
  [gocHocMap.id]: gocHocMap,
  [amitMap.id]: amitMap,
  [hienTaiMap.id]: hienTaiMap,
  [coiNguonMap.id]: coiNguonMap,
};

export function exploreMapForChapter(
  chapterId: string,
): ExploreMapData | undefined {
  return Object.values(EXPLORE_MAPS).find((map) => map.chapterId === chapterId);
}

export const progressKey = (mapId: string) => `story-explore:${mapId}`;
