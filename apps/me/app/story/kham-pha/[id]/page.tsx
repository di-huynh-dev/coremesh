import { ExplorePage } from "@/components/explore/explore-page";
import { EXPLORE_MAPS } from "@/lib/explore";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return Object.keys(EXPLORE_MAPS).map((id) => ({ id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const map = EXPLORE_MAPS[id];
  if (!map) return {};
  return {
    title: `${map.title} | Chuyện của Dĩ`,
    description: `Bước vào ${map.title.toLowerCase()} trong hành trình của Huỳnh Tiến Dĩ: đi quanh, gặp mọi người và trải nghiệm một miền ký ức.`,
  };
}

export default async function ExploreRoute({ params }: Params) {
  const { id } = await params;
  const map = EXPLORE_MAPS[id];
  if (!map) notFound();
  return <ExplorePage map={map} />;
}
