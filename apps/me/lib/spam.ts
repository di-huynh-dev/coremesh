/** Server-side spam defences for the contact form. In-memory state is per server instance. */

const MINUTE = 60_000;

/** Sliding-window limiter: true once `key` exceeds `max` hits within `windowMs`. */
function createLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5_000) hits.clear(); // keep memory bounded
    return recent.length > max;
  };
}

/** 3 messages per IP per 10 minutes, and 30 per hour overall to cap any flood. */
export const ipLimited = createLimiter(3, 10 * MINUTE);
export const globalLimited = createLimiter(30, 60 * MINUTE);

/** The same sender and text within a day counts as a duplicate. */
const seen = new Map<string, number>();
export function isDuplicate(email: string, message: string) {
  const key = `${email.toLowerCase()}|${message.replace(/\s+/g, " ").trim().toLowerCase()}`;
  const now = Date.now();
  for (const [k, time] of seen) if (now - time > 24 * 60 * MINUTE) seen.delete(k);
  const duplicate = seen.has(key);
  seen.set(key, now);
  return duplicate;
}

const SPAM_PATTERNS = [
  /\b(seo|backlinks?|guest post|link ?building)\b/i,
  /\b(crypto|bitcoin|forex|binary options?|casino|betting|loan offer)\b/i,
  /\b(viagra|cialis|porn|xxx)\b/i,
  /\b(rank (your|on) (site|google)|increase (your )?traffic|web ?design services?)\b/i,
];

/** Content heuristics: too many links, known spam phrases, or hardly any real words. */
export function looksLikeSpam(name: string, message: string) {
  const links = message.match(/https?:\/\/|www\./gi)?.length ?? 0;
  if (links > 2) return true;
  if (/https?:\/\/|www\./i.test(name)) return true;
  if (SPAM_PATTERNS.some((pattern) => pattern.test(message))) return true;
  const letters = message.match(/\p{L}/gu)?.length ?? 0;
  return letters < message.length * 0.4;
}

/** Only accept posts sent from our own pages. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

/** Cloudflare Turnstile check; passes when no secret is configured (e.g. local dev). */
export async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
