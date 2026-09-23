import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { OTP_MAX_ATTEMPTS, OTP_TTL_SECONDS } from "./constants";
import { emailProviderConfigured, whatsappProviderConfigured, sendOtpEmail, sendOtpWhatsapp } from "./otp-providers";
import type { IdentifierKind } from "./lookup";

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * alwaysReturnCode overrides production gating for the standing demo Client
 * account (see DEMO_CLIENT_CODE) whose email/phone aren't real — otherwise
 * nobody could ever retrieve its code at all.
 */
export async function issueClientOtp(clientId: string, target: string, kind: IdentifierKind, alwaysReturnCode = false) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

  await prisma.clientOtpCode.create({ data: { clientId, codeHash, expiresAt } });

  const channel = kind === "email" ? "email" : whatsappProviderConfigured() ? "whatsapp" : null;

  if (channel === "email" && emailProviderConfigured()) {
    try {
      await sendOtpEmail(target, code);
      return { devCode: alwaysReturnCode ? code : undefined, delivered: true as const };
    } catch (err) {
      console.error(`[client-portal-otp] email delivery failed for client ${clientId}, falling back to console:`, err);
    }
  } else if (channel === "whatsapp") {
    try {
      await sendOtpWhatsapp(target, code);
      return { devCode: alwaysReturnCode ? code : undefined, delivered: true as const };
    } catch (err) {
      console.error(`[client-portal-otp] whatsapp delivery failed for client ${clientId}, falling back to console:`, err);
    }
  }

  console.log(`[client-portal-otp] code for client ${clientId}: ${code} (expires ${expiresAt.toISOString()})`);
  const showCode = alwaysReturnCode || process.env.NODE_ENV !== "production";
  return { devCode: showCode ? code : undefined, delivered: false as const };
}

export type ClientOtpVerifyResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "too_many_attempts" | "mismatch" };

export async function verifyClientOtp(clientId: string, code: string): Promise<ClientOtpVerifyResult> {
  const otp = await prisma.clientOtpCode.findFirst({
    where: { clientId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { ok: false, reason: "not_found" };
  if (otp.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  const match = await bcrypt.compare(code, otp.codeHash);
  if (!match) {
    await prisma.clientOtpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, reason: "mismatch" };
  }

  await prisma.clientOtpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return { ok: true };
}
