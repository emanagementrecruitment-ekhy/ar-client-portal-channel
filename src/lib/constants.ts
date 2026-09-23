export const CLIENT_STATUSES = ["AKTIF", "NONAKTIF"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const OTP_TTL_SECONDS = 5 * 60;
export const OTP_MAX_ATTEMPTS = 5;

// Outlet options for the ledger — seeded from the actual outlet roster in
// the "DATA CLIENT/CHANNEL" Excel format (HR_LINK_AR_CORP.pdf) AR Corp
// Admin already fills in by hand.
export const CLIENT_OUTLETS = [
  "HRV", "ROYAL", "SA", "MTR", "MEGA A", "LA", "MEDIKA", "V-CLUB", "COLLO",
  "EMVO", "CL T5 (S)", "CL T5 (D)", "BUNGKER", "TRAVEL", "MALIO", "CL T2",
  "KC", "SUMO", "LEVEL 5",
] as const;

// Fee/VCR preset tiers — Rp10.000 to Rp100.000 in Rp5.000 steps, matching
// the FEE column in the uploaded format.
export const CLIENT_FEE_TIERS: number[] = Array.from({ length: 19 }, (_, i) => (i + 2) * 5000);

// The standing demo Client account (see prisma/ensure-demo-client.ts) — its
// email/phone aren't real, so nobody can ever receive its OTP by email or
// WhatsApp. issueClientOtp() (src/lib/otp.ts) checks this code to always
// surface the code on-screen for this one account, in every environment
// including production, so the demo stays usable without real delivery —
// same mechanism as DEMO_TERA_CODE in the main AR Corp app.
export const DEMO_CLIENT_CODE = "DEMO-CH01";
