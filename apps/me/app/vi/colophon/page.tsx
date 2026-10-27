import { ColophonPage } from "@/components/colophon-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colophon | Huỳnh Tiến Dĩ",
  description: "me.nextdi.io.vn được làm thế nào: công nghệ, nguyên tắc và những thay đổi gần đây.",
  alternates: { canonical: "/vi/colophon", languages: { en: "/colophon", vi: "/vi/colophon" } },
};

export default function ColophonVi() {
  return <ColophonPage locale="vi" />;
}
