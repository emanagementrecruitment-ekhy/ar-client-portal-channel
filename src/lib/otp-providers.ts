import "server-only";
import nodemailer from "nodemailer";

/**
 * Real OTP delivery channels for Client login. All are optional and
 * activated purely by the presence of their env vars — set none and the app
 * falls back to console + on-screen dev codes (see src/lib/otp.ts).
 * Self-contained copy of the main AR Corp app's src/lib/otp-providers.ts —
 * this is a separate deployment with its own env vars, not a shared module.
 */

let mailer: ReturnType<typeof nodemailer.createTransport> | null | undefined;

function getMailer() {
  if (mailer !== undefined) return mailer;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    mailer = null;
    return mailer;
  }
  mailer = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 8_000,
  });
  return mailer;
}

function parseSender(raw: string): { name?: string; email: string } {
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) return { name: match[1].trim() || undefined, email: match[2].trim() };
  return { email: raw.trim() };
}

/** Sends over Brevo's HTTP API instead of SMTP — preferred whenever BREVO_API_KEY is set (see main AR Corp app's otp-providers.ts for why). */
async function sendOtpEmailViaBrevoApi(to: string, code: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("Brevo API key is not configured");
  const senderRaw = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!senderRaw) throw new Error("No sender email configured for Brevo API");
  const sender = parseSender(senderRaw);

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { email: sender.email, name: sender.name || "AR Corp Channel" },
      to: [{ email: to }],
      subject: "Kode verifikasi AR Corp Channel",
      textContent: `Kode verifikasi Anda: ${code} (berlaku 5 menit). Jangan bagikan kode ini kepada siapa pun.`,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Brevo API send failed: ${res.status} ${detail}`);
  }
}

export function emailProviderConfigured() {
  return Boolean(process.env.BREVO_API_KEY) || getMailer() !== null;
}

export async function sendOtpEmail(to: string, code: string) {
  if (process.env.BREVO_API_KEY) {
    await sendOtpEmailViaBrevoApi(to, code);
    return;
  }
  const transport = getMailer();
  if (!transport) throw new Error("SMTP is not configured");
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Kode verifikasi AR Corp Channel",
    text: `Kode verifikasi Anda: ${code} (berlaku 5 menit). Jangan bagikan kode ini kepada siapa pun.`,
  });
}

export function whatsappProviderConfigured() {
  return Boolean(process.env.FONNTE_TOKEN);
}

/** Sends via Fonnte (https://fonnte.com) — same gateway the main AR Corp app uses. */
export async function sendOtpWhatsapp(toPhoneDigits: string, code: string) {
  const token = process.env.FONNTE_TOKEN;
  if (!token) throw new Error("Fonnte is not configured");
  const target = toPhoneDigits.startsWith("62") ? toPhoneDigits : `62${toPhoneDigits.replace(/^0/, "")}`;
  const body = new URLSearchParams({
    target,
    message: `Kode verifikasi AR Corp Channel Anda: ${code} (berlaku 5 menit). Jangan bagikan kode ini kepada siapa pun.`,
  });
  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.status === false) {
    throw new Error(`Fonnte send failed: ${res.status} ${JSON.stringify(data)}`);
  }
}
