import { ColophonPage } from "@/components/colophon-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colophon | Steven Huynh",
  description: "How me.nextdi.io.vn is built: stack, principles and recent changes.",
  alternates: { canonical: "/colophon", languages: { en: "/colophon", vi: "/vi/colophon" } },
};

export default function Colophon() {
  return <ColophonPage locale="en" />;
}
