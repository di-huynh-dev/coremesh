import { Footer } from "@/components/layout/footer";
import { StoryHeader } from "@/components/story/story-header";
import { StorySection } from "@/components/story/story-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chuyện của Dĩ | Từ Cát Nhơn đến hôm nay",
  description:
    "Hành trình của Huỳnh Tiến Dĩ qua 16 bối cảnh 3D, từ làng quê Cát Nhơn, Tết, Trung thu, biển quê, những năm học trò đến UTE và nghề kỹ sư phần mềm.",
  openGraph: {
    title: "Chuyện của Dĩ | Huỳnh Tiến Dĩ",
    description:
      "Từ một làng nhỏ, đi những chặng dài. Một hành trình qua 16 miền ký ức.",
    type: "website",
  },
};

export default function StoryPage() {
  return (
    <main
      className="min-h-[100dvh] bg-background pt-16 text-foreground"
      lang="vi"
    >
      <StoryHeader />
      <StorySection />
      <Footer locale="vi" />
    </main>
  );
}
