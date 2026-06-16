import { RoadmapLayoutShell } from '@/components/roadmap/roadmap-layout-shell';

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoadmapLayoutShell>{children}</RoadmapLayoutShell>
  );
}
