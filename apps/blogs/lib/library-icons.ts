// Client-safe: logos for skills and roadmap ecosystems (files in public/icons/svgl).

const LIBRARY_ICONS = {
  react: "React",
  nestjs: "NestJS",
  typescript: "TypeScript",
  javascript: "JavaScript",
  nodejs: "Node.js",
  tailwindcss: "Tailwind CSS",
  nextjs: "Next.js",
  expressjs: "Express.js",
  prisma: "Prisma",
  postgresql: "PostgreSQL",
} as const;

export type LibraryIconId = keyof typeof LIBRARY_ICONS;

const LIBRARY_ALIASES: Record<string, LibraryIconId> = {
  react: "react",
  reactjs: "react",
  nest: "nestjs",
  nestjs: "nestjs",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  node: "nodejs",
  nodejs: "nodejs",
  tailwind: "tailwindcss",
  tailwindcss: "tailwindcss",
  next: "nextjs",
  nextjs: "nextjs",
  express: "expressjs",
  expressjs: "expressjs",
  prisma: "prisma",
  postgresql: "postgresql",
  postgres: "postgresql",
};

export const ROADMAP_ECOSYSTEMS: Record<"react" | "nestjs", LibraryIconId[]> = {
  react: ["react", "typescript", "javascript", "tailwindcss", "nextjs"],
  nestjs: ["nestjs", "nodejs", "typescript", "expressjs", "prisma", "postgresql"],
};

export function findLibraryIcon(label: string): LibraryIconId | null {
  return LIBRARY_ALIASES[label.toLowerCase().replace(/[^a-z0-9]+/g, "")] ?? null;
}

export function libraryIconLabel(id: LibraryIconId) {
  return LIBRARY_ICONS[id];
}
