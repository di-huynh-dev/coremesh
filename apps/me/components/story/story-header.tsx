import { ModeToggle } from "@/components/ui/mode-toggle";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** Same fixed height as the home navbar so the pinned stage offset matches. */
export function StoryHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-edge bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1660px] items-center justify-between gap-4 px-[clamp(20px,3.8vw,68px)]">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <Image
            src="/round-avatar.svg"
            alt=""
            width={32}
            height={32}
            className="size-7"
          />
          <span className="max-sm:hidden">Trang chủ</span>
        </Link>

        <p className="font-display text-lg leading-relaxed font-medium italic">
          Chuyện của Dĩ<span className="text-brand">.</span>
        </p>

        <ModeToggle />
      </div>
    </header>
  );
}
