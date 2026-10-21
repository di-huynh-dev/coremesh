export function Footer() {
  return (
    <footer className="profile-rail rail-box px-4 py-8 text-center font-mono text-xs text-muted-foreground">
      <p className="font-display text-xl text-foreground italic">
        Code bằng cả trái tim<span className="text-brand">.</span>
      </p>
      <p className="mt-2">
        © {new Date().getFullYear()} · Built by{" "}
        <a
          href="https://github.com/di-huynh-dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline decoration-brand/60 underline-offset-4 hover:text-brand"
        >
          di-huynh-dev
        </a>{" "}
        in Sài Gòn.
      </p>
    </footer>
  );
}
