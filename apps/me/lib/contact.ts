/** Shared between the contact form and its API route. */

export const CONTACT_PURPOSES = ["job", "freelance", "chat"] as const;
export type ContactPurpose = (typeof CONTACT_PURPOSES)[number];

export type ContactPayload = {
  purpose: ContactPurpose;
  name: string;
  email: string;
  message: string;
  /** Honeypot: real visitors never see or fill this field. */
  website?: string;
  /** Epoch ms when the form was rendered; submissions faster than a human are dropped. */
  startedAt?: number;
  /** Cloudflare Turnstile token. */
  token?: string;
};

export const CONTACT_LIMITS = { name: 80, email: 120, message: 2000, minMessage: 10 } as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: Partial<ContactPayload>): ContactPayload | null {
  const purpose = input.purpose;
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  if (!purpose || !CONTACT_PURPOSES.includes(purpose)) return null;
  if (!name || name.length > CONTACT_LIMITS.name) return null;
  if (!EMAIL_PATTERN.test(email) || email.length > CONTACT_LIMITS.email) return null;
  if (message.length < CONTACT_LIMITS.minMessage || message.length > CONTACT_LIMITS.message) return null;

  return { purpose, name, email, message };
}
