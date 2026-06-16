'use client';

import Image from 'next/image';
import type { RoadmapId } from '@/lib/roadmap-content';

const svglLibraryIcons = {
  react: { label: 'React', src: '/icons/svgl/react.svg' },
  nestjs: { label: 'NestJS', src: '/icons/svgl/nestjs.svg' },
  typescript: { label: 'TypeScript', src: '/icons/svgl/typescript.svg' },
  javascript: { label: 'JavaScript', src: '/icons/svgl/javascript.svg' },
  nodejs: { label: 'Node.js', src: '/icons/svgl/nodejs.svg' },
  tailwindcss: { label: 'Tailwind CSS', src: '/icons/svgl/tailwindcss.svg' },
  nextjs: { label: 'Next.js', src: '/icons/svgl/nextjs.svg' },
  expressjs: { label: 'Express.js', src: '/icons/svgl/expressjs.svg' },
  prisma: { label: 'Prisma', src: '/icons/svgl/prisma.svg' },
  postgresql: { label: 'PostgreSQL', src: '/icons/svgl/postgresql.svg' },
} as const;

export type SvglLibraryIconId = keyof typeof svglLibraryIcons;

const libraryAliases: Record<string, SvglLibraryIconId> = {
  react: 'react',
  reactjs: 'react',
  nest: 'nestjs',
  nestjs: 'nestjs',
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  node: 'nodejs',
  nodejs: 'nodejs',
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
  next: 'nextjs',
  nextjs: 'nextjs',
  express: 'expressjs',
  expressjs: 'expressjs',
  prisma: 'prisma',
  postgresql: 'postgresql',
  postgres: 'postgresql',
};

const roadmapEcosystems: Record<RoadmapId, SvglLibraryIconId[]> = {
  react: ['react', 'typescript', 'javascript', 'tailwindcss', 'nextjs'],
  nestjs: ['nestjs', 'nodejs', 'typescript', 'expressjs', 'prisma', 'postgresql'],
};

function normalizeLibraryLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function findLibraryIconId(label: string): SvglLibraryIconId | null {
  const normalizedLabel = normalizeLibraryLabel(label);
  return libraryAliases[normalizedLabel] ?? null;
}

export function getRoadmapLibraryIconIds(roadmapId: RoadmapId) {
  return roadmapEcosystems[roadmapId];
}

export function SvglLibraryIcon({
  id,
  size = 20,
  className,
}: {
  id: SvglLibraryIconId;
  size?: number;
  className?: string;
}) {
  const icon = svglLibraryIcons[id];

  return (
    <Image
      src={icon.src}
      alt={icon.label}
      width={size}
      height={size}
      className={className}
    />
  );
}
