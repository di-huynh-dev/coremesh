import type { ExploreMapData, Obstacle, Vec2 } from "./types";

/** Clearance includes the explorer's body. Sampling edges prevents diagonal corner cuts. */
export function isWalkable(p: Vec2, obstacles: Obstacle[], bounds: ExploreMapData["bounds"], radius = 0.43) {
  if (p[0] < bounds.min[0] || p[0] > bounds.max[0] || p[1] < bounds.min[1] || p[1] > bounds.max[1]) return false;
  return !obstacles.some((o) => o.kind === "circle"
    ? Math.hypot(p[0] - o.at[0], p[1] - o.at[1]) < o.r + radius
    : p[0] > o.min[0] - radius && p[0] < o.max[0] + radius && p[1] > o.min[1] - radius && p[1] < o.max[1] + radius);
}

/** A bounded A* grid. Unreachable destinations return null, never a path through walls. */
export function findPath(start: Vec2, goal: Vec2, obstacles: Obstacle[], bounds: ExploreMapData["bounds"], arrivalRadius = 0.65): Vec2[] | null {
  const cell = 0.55;
  const width = Math.ceil((bounds.max[0] - bounds.min[0]) / cell) + 1;
  const height = Math.ceil((bounds.max[1] - bounds.min[1]) / cell) + 1;
  const point = (id: number): Vec2 => [bounds.min[0] + (id % width) * cell, bounds.min[1] + Math.floor(id / width) * cell];
  const idFor = (p: Vec2) => Math.max(0, Math.min(height - 1, Math.round((p[1] - bounds.min[1]) / cell))) * width + Math.max(0, Math.min(width - 1, Math.round((p[0] - bounds.min[0]) / cell)));
  const clear = new Map<number, boolean>();
  const passable = (id: number) => {
    if (!clear.has(id)) clear.set(id, isWalkable(point(id), obstacles, bounds));
    return clear.get(id)!;
  };
  const segment = (a: Vec2, b: Vec2) => {
    const steps = Math.ceil(Math.hypot(a[0] - b[0], a[1] - b[1]) / 0.16);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (!isWalkable([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], obstacles, bounds)) return false;
    }
    return true;
  };
  if (Math.hypot(start[0] - goal[0], start[1] - goal[1]) <= arrivalRadius) return [];
  if (isWalkable(goal, obstacles, bounds) && segment(start, goal)) return [goal];
  const origin = idFor(start);
  // Find a grid seed connected to the exact starting position.
  const seeds: number[] = [];
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
    const x = origin % width + dx, z = Math.floor(origin / width) + dz;
    const id = z * width + x;
    if (x >= 0 && x < width && z >= 0 && z < height && passable(id) && segment(start, point(id))) seeds.push(id);
  }
  if (!seeds.length) return null;
  const heuristic = (id: number) => Math.hypot(point(id)[0] - goal[0], point(id)[1] - goal[1]);
  const open = new Set(seeds);
  const closed = new Set<number>();
  const costs = new Map(seeds.map((id) => [id, Math.hypot(point(id)[0] - start[0], point(id)[1] - start[1])]));
  const parent = new Map<number, number>();
  while (open.size && closed.size < width * height) {
    let current = -1, best = Infinity;
    for (const id of open) {
      const score = costs.get(id)! + heuristic(id);
      if (score < best) { best = score; current = id; }
    }
    if (heuristic(current) <= arrivalRadius) {
      const path: Vec2[] = [point(current)];
      while (parent.has(current)) { current = parent.get(current)!; path.unshift(point(current)); }
      // Smooth only along collision-free segments.
      const smooth: Vec2[] = [];
      let from = start;
      for (let i = 0; i < path.length;) {
        let next = i;
        while (next + 1 < path.length && segment(from, path[next + 1])) next++;
        smooth.push(path[next]); from = path[next]; i = next + 1;
      }
      return smooth;
    }
    open.delete(current); closed.add(current);
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dz) continue;
      const x = current % width + dx, z = Math.floor(current / width) + dz;
      const next = z * width + x;
      if (x < 0 || x >= width || z < 0 || z >= height || closed.has(next) || !passable(next)) continue;
      if (!segment(point(current), point(next))) continue;
      const cost = costs.get(current)! + cell * Math.hypot(dx, dz);
      if (cost >= (costs.get(next) ?? Infinity)) continue;
      costs.set(next, cost); parent.set(next, current); open.add(next);
    }
  }
  return null;
}
