import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="profile-rail rail-box corner-ticks max-w-xl bg-background px-6 py-14 text-center">
        <div className="relative mx-auto size-40">
          <div
            className="trongdong-spin absolute inset-0 bg-contain bg-center bg-no-repeat opacity-25 mix-blend-multiply dark:mix-blend-screen"
            style={{ backgroundImage: "url('/trongdong.png')" }}
            aria-hidden="true"
          />
          <Image
            src="/round-avatar.svg"
            alt=""
            width={64}
            height={64}
            className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2"
          />
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-brand">
          404 — lạc đường
        </p>
        <h1 className="font-display mt-2 text-4xl leading-tight font-medium sm:text-5xl">
          Lạc đường ở{" "}
          <em className="pr-1 text-brand">Sài Gòn</em>?
        </h1>
        <p className="mx-auto mt-3 max-w-sm font-mono text-sm leading-6 text-muted-foreground">
          Trang này không tồn tại, hoặc đã rẽ vào một con hẻm khác. Quay lại
          đường chính nhé.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-10 items-center rounded-full bg-foreground px-5 font-mono text-sm text-background transition-colors hover:bg-brand"
        >
          ← Về trang chủ
        </Link>
      </div>
    </main>
  );
}
