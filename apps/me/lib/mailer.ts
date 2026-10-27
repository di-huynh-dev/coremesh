import nodemailer, { type Transporter } from "nodemailer";

/*
 * SMTP mail via Nodemailer. Works with a free Gmail account:
 *   SMTP_USER=you@gmail.com
 *   SMTP_PASS=<16-char Google App Password>  (Google Account → Security → App passwords; needs 2-Step Verification)
 * Optional: SMTP_HOST (default smtp.gmail.com), SMTP_PORT (default 465), CONTACT_TO (default: the profile email).
 */

let transporter: Transporter | undefined;

export function mailerConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  const port = Number(process.env.SMTP_PORT ?? 465);
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export async function sendMail(options: {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}) {
  await getTransporter().sendMail({
    from: { name: "me.nextdi.io.vn", address: process.env.SMTP_USER! },
    ...options,
  });
}
