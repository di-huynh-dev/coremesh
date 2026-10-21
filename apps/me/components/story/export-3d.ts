import { Group, Scene } from "three";
import { chapters } from "@/lib/story";
import { createCharacterWalkClip } from "./character-3d";

/** GLTFExporter is kept out of the initial journey bundle. Embedded textures work offline. */
export async function downloadStoryModel(source: Group, chapter: number, kind: "scene" | "character") {
  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
  const model = source.clone(true);
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.setScalar(1);
  model.name = kind === "scene" ? `Scene_${chapters[chapter].id}` : "Huynh_Tien_Di";
  const scene = new Scene();
  scene.add(model);
  scene.updateMatrixWorld(true);
  const data = await new GLTFExporter().parseAsync(scene, {
    binary: true,
    trs: true,
    onlyVisible: true,
    animations: kind === "character" ? [createCharacterWalkClip()] : [],
    maxTextureSize: 1536,
  });
  if (!(data instanceof ArrayBuffer)) throw new Error("Không xuất được mô hình GLB.");
  const filename = kind === "scene"
    ? `${String(chapter + 1).padStart(2, "0")}-${chapters[chapter].id}.glb`
    : `nhan-vat-di-${chapters[chapter].id}.glb`;
  const url = URL.createObjectURL(new Blob([data], { type: "model/gltf-binary" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return filename;
}
