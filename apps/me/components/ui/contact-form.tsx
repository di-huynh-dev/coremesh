"use client";

import { useI18n } from "@/components/i18n-provider";
import { CONTACT_LIMITS, CONTACT_PURPOSES, type ContactPurpose } from "@/lib/contact";
import { profile } from "@/lib/data/profile";
import { trackEvent } from "@/lib/track";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { ArrowUpRight, Loader2, Send } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef, useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "fallback" | "error" | "rate_limited" | "captcha";

/** Cloudflare Turnstile site key; without it the widget is skipped (the server then skips the check too). */
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const fieldClass =
  "w-full rounded-none border border-edge bg-background px-3 py-2.5 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand";

export function ContactForm() {
  const { locale, t } = useI18n();
  const { resolvedTheme } = useTheme();
  const turnstile = useRef<TurnstileInstance>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const f = t.contact.form;
  const [purpose, setPurpose] = useState<ContactPurpose>("job");
  const [status, setStatus] = useState<Status>("idle");
  const [mailto, setMailto] = useState("");
  const [startedAt] = useState(() => Date.now());

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose,
          name,
          email,
          message,
          website: data.get("website"),
          startedAt,
          token,
        }),
      });
      // Turnstile tokens are single-use: get a fresh one for any retry.
      turnstile.current?.reset();
      setToken(null);

      if (response.ok) {
        trackEvent("contact_submit", { purpose });
        setStatus("sent");
        form.reset();
        return;
      }
      if (response.status === 503) {
        // Email sending isn't configured: hand the message to the visitor's mail app instead.
        const subject = `${f.purposes[purpose]} · ${name}`;
        setMailto(
          `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${message}\n\n${name} <${email}>`)}`,
        );
        setStatus("fallback");
        return;
      }
      if (response.status === 429) return setStatus("rate_limited");
      if (response.status === 400 && TURNSTILE_SITE_KEY) {
        const json = (await response.json().catch(() => ({}))) as { error?: string };
        if (json.error === "captcha") return setStatus("captcha");
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="border border-edge bg-card/60 p-5 font-mono text-sm leading-6">
        <p className="font-display text-2xl font-medium">
          {f.sentTitle}
          <span className="text-brand">.</span>
        </p>
        <p className="mt-2 text-muted-foreground">{f.sentBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <fieldset>
        <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {f.purposeLabel}
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_PURPOSES.map((value) => (
            <label
              key={value}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/50 ${
                purpose === value
                  ? "border-brand bg-brand/10 text-foreground"
                  : "border-edge text-muted-foreground hover:text-foreground"
              }`}
            >
              <input
                type="radio"
                name="purpose"
                value={value}
                checked={purpose === value}
                onChange={() => setPurpose(value)}
                className="sr-only"
              />
              {f.purposes[value]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">{f.name}</span>
          <input name="name" required maxLength={CONTACT_LIMITS.name} autoComplete="name" placeholder={f.name} className={fieldClass} />
        </label>
        <label className="block">
          <span className="sr-only">{f.email}</span>
          <input name="email" type="email" required maxLength={CONTACT_LIMITS.email} autoComplete="email" placeholder={f.email} className={fieldClass} />
        </label>
      </div>
      <label className="block">
        <span className="sr-only">{f.message}</span>
        <textarea
          name="message"
          required
          minLength={CONTACT_LIMITS.minMessage}
          maxLength={CONTACT_LIMITS.message}
          rows={4}
          placeholder={f.placeholders[purpose]}
          className={`${fieldClass} resize-y`}
        />
      </label>
      {/* Honeypot: hidden from people and assistive tech. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {TURNSTILE_SITE_KEY ? (
        <Turnstile
          ref={turnstile}
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={setToken}
          onExpire={() => setToken(null)}
          onError={() => setToken(null)}
          options={{
            theme: resolvedTheme === "light" ? "light" : "dark",
            language: locale,
            size: "flexible",
          }}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={status === "sending" || Boolean(TURNSTILE_SITE_KEY && !token)}
          className="group inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 font-mono text-sm text-background transition-colors hover:bg-brand disabled:opacity-60"
        >
          {status === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {status === "sending" ? f.sending : f.send}
        </button>
        <p className="font-mono text-xs text-muted-foreground">{f.replyTime}</p>
      </div>

      {status === "fallback" ? (
        <p role="status" className="font-mono text-sm text-muted-foreground">
          {f.fallback}{" "}
          <a href={mailto} className="inline-flex items-center gap-1 text-brand underline underline-offset-4">
            {f.openMail}
            <ArrowUpRight className="size-3.5" />
          </a>
        </p>
      ) : null}
      {status === "rate_limited" || status === "captcha" ? (
        <p role="alert" className="font-mono text-sm text-brand">
          {status === "rate_limited" ? f.rateLimited : f.captcha}
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="font-mono text-sm text-brand">
          {f.error(profile.email)}
        </p>
      ) : null}
    </form>
  );
}
