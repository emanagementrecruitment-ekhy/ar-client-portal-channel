export type IdentifierKind = "email" | "phone";

export function normalizeIdentifier(raw: string) {
  const v = raw.trim().toLowerCase();
  if (v.includes("@")) return { kind: "email" as const, value: v };
  return { kind: "phone" as const, value: v.replace(/\D/g, "") };
}
