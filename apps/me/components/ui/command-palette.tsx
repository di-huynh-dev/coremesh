"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const EMAIL = "dihuynhdev.contact@gmail.com";

type Command = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
};

export function CommandPalette({ blogsBaseUrl }: { blogsBaseUrl: string }) {
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const say = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const go = (hash: string) => () =>
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    const openUrl = (url: string) => () =>
      window.open(url, "_blank", "noopener,noreferrer");
    const blog = blogsBaseUrl.replace(/\/$/, "");

    return [
      { id: "n-about", group: "Navigate", label: "Summary", hint: "Tóm tắt", run: go("#about") },
      { id: "n-story", group: "Navigate", label: "Story", hint: "Câu chuyện", run: () => window.location.assign("/story") },
      { id: "n-stack", group: "Navigate", label: "Stack", hint: "Công cụ", run: go("#techstack") },
      { id: "n-exp", group: "Navigate", label: "Experience", hint: "Hành trình", run: go("#experience") },
      { id: "n-blog", group: "Navigate", label: "Blog", hint: "Ghi chép", run: go("#blog") },
      { id: "n-contact", group: "Navigate", label: "Contact", hint: "Liên hệ", run: go("#contact") },
      { id: "n-top", group: "Navigate", label: "Back to top", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
      { id: "t-light", group: "Theme", label: "Light", hint: "Giấy dó", keywords: "sáng", run: () => setTheme("light") },
      { id: "t-dark", group: "Theme", label: "Dark", hint: "Mực tàu", keywords: "tối", run: () => setTheme("dark") },
      { id: "t-night", group: "Theme", label: "Đêm Sài Gòn", hint: "Neon", keywords: "night neon", run: () => setTheme("night") },
      {
        id: "a-copy",
        group: "Actions",
        label: "Copy email",
        hint: EMAIL,
        run: () => {
          navigator.clipboard
            .writeText(EMAIL)
            .then(() => say("Đã copy email ✓"))
            .catch(() => say(EMAIL));
        },
      },
      { id: "a-mail", group: "Actions", label: "Send an email", run: () => (window.location.href = `mailto:${EMAIL}`) },
      { id: "a-gh", group: "Actions", label: "Open GitHub", hint: "di-huynh-dev", run: openUrl("https://github.com/di-huynh-dev") },
      { id: "a-in", group: "Actions", label: "Open LinkedIn", hint: "huynhtiendi", run: openUrl("https://www.linkedin.com/in/huynhtiendi/") },
      { id: "a-blog", group: "Actions", label: "Open all blog posts", run: openUrl(`${blog}/blog`) },
      { id: "f-drum", group: "Fun", label: "Drum frenzy", hint: "🥁", keywords: "trống konami easter", run: () => window.dispatchEvent(new Event("easter:run")) },
      { id: "f-hello", group: "Fun", label: "/hello", run: () => say("Xin chào! 👋 Cảm ơn bạn đã ghé thăm.") },
      { id: "f-coffee", group: "Fun", label: "/coffee", run: () => say("☕ Cà phê sữa đá, ít đường nhé.") },
      { id: "f-vn", group: "Fun", label: "/vietnam", run: () => say("🇻🇳 Việt Nam ơi, tự hào lắm!") },
    ];
  }, [blogsBaseUrl, say, setTheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.group} ${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      const el = event.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (command: Command | undefined) => {
    if (!command) return;
    close();
    window.setTimeout(command.run, 120);
  };

  const onInputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[active]);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="palette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[70] flex items-start justify-center bg-foreground/30 px-4 pt-[14vh] backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="corner-ticks w-full max-w-lg overflow-hidden border border-edge bg-popover text-popover-foreground shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-edge px-4">
                <Search className="size-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKey}
                  placeholder="Gõ để tìm… (sections, theme, /hello)"
                  aria-label="Search commands"
                  className="h-12 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/70"
                />
                <kbd className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  esc
                </kbd>
              </div>

              <ul ref={listRef} role="listbox" className="max-h-80 overflow-y-auto p-1.5">
                {results.length === 0 ? (
                  <li className="px-3 py-6 text-center font-mono text-sm text-muted-foreground">
                    Không tìm thấy lệnh nào.
                  </li>
                ) : null}
                {results.map((command, index) => {
                  const showGroup = index === 0 || results[index - 1].group !== command.group;
                  return (
                    <li key={command.id} role="presentation">
                      {showGroup ? (
                        <p className="px-3 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {command.group}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === active}
                        data-index={index}
                        onMouseMove={() => setActive(index)}
                        onClick={() => choose(command)}
                        className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left font-mono text-sm transition-colors ${
                          index === active ? "bg-brand/12 text-foreground" : "text-foreground/80"
                        }`}
                      >
                        <span>{command.label}</span>
                        <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{command.hint}</span>
                          {index === active ? <CornerDownLeft className="size-3.5 shrink-0 text-brand" /> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast}
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="font-display fixed bottom-6 left-1/2 z-[75] -translate-x-1/2 rounded-full bg-foreground px-5 py-2.5 text-base whitespace-nowrap text-background italic shadow-xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
