"use client";

import { useI18n } from "@/components/i18n-provider";
import { blogUrl, profile, socials } from "@/lib/data/profile";
import { homePath } from "@/lib/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const EMAIL = profile.email;

type Command = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
};

export function CommandPalette() {
  const { locale, t } = useI18n();
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

    const p = t.palette;
    const g = p.groups;
    const h = t.headings;
    const otherLocale = locale === "en" ? "vi" : "en";

    return [
      { id: "n-about", group: g.navigate, label: h.summary.title, hint: h.summary.alt, run: go("#about") },
      { id: "n-story", group: g.navigate, label: t.nav.story, keywords: "story 3d câu chuyện", run: () => window.location.assign("/story") },
      { id: "n-stack", group: g.navigate, label: h.stack.title, hint: h.stack.alt, run: go("#techstack") },
      { id: "n-exp", group: g.navigate, label: h.experience.title, hint: h.experience.alt, run: go("#experience") },
      { id: "n-projects", group: g.navigate, label: h.projects.title, hint: h.projects.alt, keywords: "case study work", run: go("#projects") },
      { id: "n-blog", group: g.navigate, label: h.blog.title, hint: h.blog.alt, run: go("#blog") },
      { id: "n-contact", group: g.navigate, label: h.contact.title, hint: h.contact.alt, run: go("#contact") },
      { id: "n-top", group: g.navigate, label: p.backToTop, run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
      { id: "n-lang", group: g.navigate, label: p.switchLanguage, keywords: "language ngôn ngữ english tiếng việt", run: () => window.location.assign(homePath(otherLocale)) },
      { id: "t-light", group: g.theme, label: "Light", hint: "Giấy dó", keywords: "sáng", run: () => setTheme("light") },
      { id: "t-dark", group: g.theme, label: "Dark", hint: "Mực tàu", keywords: "tối", run: () => setTheme("dark") },
      { id: "t-night", group: g.theme, label: "Đêm Sài Gòn", hint: "Neon", keywords: "night neon", run: () => setTheme("night") },
      {
        id: "a-copy",
        group: g.actions,
        label: p.copyEmail,
        hint: EMAIL,
        run: () => {
          navigator.clipboard
            .writeText(EMAIL)
            .then(() => say(p.copied))
            .catch(() => say(EMAIL));
        },
      },
      { id: "a-mail", group: g.actions, label: p.sendEmail, run: () => (window.location.href = `mailto:${EMAIL}`) },
      { id: "a-gh", group: g.actions, label: p.openGithub, hint: socials.github.handle, run: openUrl(socials.github.href) },
      { id: "a-in", group: g.actions, label: p.openLinkedin, hint: socials.linkedin.handle, run: openUrl(socials.linkedin.href) },
      { id: "a-blog", group: g.actions, label: p.openBlog, run: openUrl(blogUrl(locale, "/blog")) },
      { id: "f-game", group: g.fun, label: p.drumGame, hint: "Tùng · Cắc", keywords: "game trống drum rhythm nhịp play chơi", run: () => window.dispatchEvent(new Event("drumgame:open")) },
      { id: "f-drum", group: g.fun, label: "Drum frenzy", hint: "🥁", keywords: "trống konami easter", run: () => window.dispatchEvent(new Event("easter:run")) },
      { id: "f-hello", group: g.fun, label: "/hello", run: () => say(p.hello) },
      { id: "f-coffee", group: g.fun, label: "/coffee", run: () => say(p.coffee) },
      { id: "f-vn", group: g.fun, label: "/vietnam", run: () => say(p.vietnam) },
    ];
  }, [locale, say, setTheme, t]);

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
                  placeholder={t.palette.placeholder}
                  aria-label={t.palette.search}
                  className="h-12 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/70"
                />
                <kbd className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  esc
                </kbd>
              </div>

              <ul ref={listRef} role="listbox" className="max-h-80 overflow-y-auto p-1.5">
                {results.length === 0 ? (
                  <li className="px-3 py-6 text-center font-mono text-sm text-muted-foreground">
                    {t.palette.empty}
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
