import { HomePage } from "@/components/home-page";
import { homeMetadata } from "@/lib/metadata";

export const metadata = homeMetadata("vi");

export default function HomeVi() {
  return <HomePage locale="vi" />;
}
