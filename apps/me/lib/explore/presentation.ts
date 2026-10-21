export type EnvironmentTheme = "village" | "festival" | "school" | "city";
export function environmentTheme(id: string): EnvironmentTheme {
  if (["tet-que", "trung-thu"].includes(id)) return "festival";
  if (["tieu-hoc", "thcs", "thpt"].includes(id)) return "school";
  if (["ute", "goc-hoc", "amit", "hien-tai", "di-xa"].includes(id)) return "city";
  return "village";
}
export const mapArtwork = (id: string) => `/story-assets/artwork/${environmentTheme(id)}.webp`;
