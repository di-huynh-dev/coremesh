import type { BlogTopic } from "@/lib/content/types";

// Literal class names so Tailwind can see them.
export const topicStyles: Record<
  BlogTopic,
  { dot: string; text: string; tile: string; border: string }
> = {
  systems: {
    dot: "bg-topic-systems",
    text: "text-topic-systems",
    tile: "bg-topic-systems/12 hover:bg-topic-systems/25",
    border: "border-topic-systems",
  },
  frontend: {
    dot: "bg-topic-frontend",
    text: "text-topic-frontend",
    tile: "bg-topic-frontend/12 hover:bg-topic-frontend/25",
    border: "border-topic-frontend",
  },
  performance: {
    dot: "bg-topic-performance",
    text: "text-topic-performance",
    tile: "bg-topic-performance/12 hover:bg-topic-performance/25",
    border: "border-topic-performance",
  },
  tooling: {
    dot: "bg-topic-tooling",
    text: "text-topic-tooling",
    tile: "bg-topic-tooling/12 hover:bg-topic-tooling/25",
    border: "border-topic-tooling",
  },
  growth: {
    dot: "bg-topic-growth",
    text: "text-topic-growth",
    tile: "bg-topic-growth/12 hover:bg-topic-growth/25",
    border: "border-topic-growth",
  },
};
