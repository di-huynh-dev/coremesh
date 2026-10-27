import { validateContact, type ContactPayload, type ContactPurpose } from "@/lib/contact";
import { profile } from "@/lib/data/profile";
import { mailerConfigured, sendMail } from "@/lib/mailer";
import {
  globalLimited,
  ipLimited,
  isDuplicate,
  looksLikeSpam,
  sameOrigin,
  verifyTurnstile,
} from "@/lib/spam";
import { NextResponse } from "next/server";

/*
 * Contact form → email (Nodemailer, see lib/mailer.ts), behind layered spam checks:
 * same origin, body size, honeypot, fill-time trap, validation, per-IP and global rate limits,
 * Cloudflare Turnstile, content heuristics and duplicate detection.
 * Obvious bots get a fake success so they don't adapt and retry.
 */

const MAX_BODY_BYTES = 10_000;
const MIN_FILL_MS = 3_000;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

const purposeLabel: Record<ContactPurpose, string> = {
  job: "Job opportunity",
  freelance: "Freelance project",
  chat: "Just saying hi",
};

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]!);

const ok = () => NextResponse.json({ ok: true });
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("forbidden", 403);
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return fail("too_large", 413);
  }

  let body: Partial<ContactPayload>;
  try {
    body = (await request.json()) as Partial<ContactPayload>;
  } catch {
    return fail("invalid", 400);
  }

  const age = body.startedAt ? Date.now() - body.startedAt : 0;
  if (body.website || age < MIN_FILL_MS || age > MAX_FORM_AGE_MS) return ok();

  const payload = validateContact(body);
  if (!payload) return fail("invalid", 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (ipLimited(ip) || globalLimited("all")) return fail("rate_limited", 429);
  if (!(await verifyTurnstile(body.token, ip))) return fail("captcha", 400);
  if (looksLikeSpam(payload.name, payload.message) || isDuplicate(payload.email, payload.message)) {
    return ok();
  }

  if (!mailerConfigured()) return fail("not_configured", 503);

  const name = payload.name.replace(/[\r\n]+/g, " ");
  const purpose = purposeLabel[payload.purpose];
  try {
    await sendMail({
      to: process.env.CONTACT_TO ?? profile.email,
      replyTo: `"${name.replace(/"/g, "")}" <${payload.email}>`,
      subject: `[Portfolio] ${purpose} · ${name}`,
      text: `${payload.message}\n\n—\n${name} <${payload.email}>\n${purpose}`,
      html: [
        `<p style="white-space:pre-wrap;font:15px/1.6 system-ui,sans-serif">${escapeHtml(payload.message)}</p>`,
        `<hr style="border:none;border-top:1px solid #ddd">`,
        `<p style="font:13px/1.6 system-ui,sans-serif;color:#555">${escapeHtml(name)} &lt;${escapeHtml(payload.email)}&gt;<br>${purpose}<br>Reply to this email to answer directly.</p>`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("[contact] send failed", error);
    return fail("send_failed", 502);
  }
  return ok();
}
