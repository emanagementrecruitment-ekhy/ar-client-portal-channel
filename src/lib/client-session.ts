import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { ApiAuthError } from "./auth";

// A Client (ClientAccount) session — deliberately a separate cookie/JWT from
// the admin session in src/lib/auth.ts, so an AR Corp staff member's admin
// login and a Mami/Channel's own login can never be confused for one another.
const CLIENT_SESSION_COOKIE = "arclientportal_client_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set.");
  return new TextEncoder().encode(secret);
}

export interface ClientSessionPayload {
  clientId: string;
  name: string;
  code: string;
}

export async function createClientSession(payload: ClientSessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS)
    .sign(secretKey());

  const store = await cookies();
  store.set(CLIENT_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroyClientSession() {
  const store = await cookies();
  store.delete(CLIENT_SESSION_COOKIE);
}

export async function getClientSession(): Promise<ClientSessionPayload | null> {
  const store = await cookies();
  const token = store.get(CLIENT_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      clientId: payload.clientId as string,
      name: payload.name as string,
      code: payload.code as string,
    };
  } catch {
    return null;
  }
}

export async function requireClientSession(): Promise<ClientSessionPayload> {
  const session = await getClientSession();
  if (!session) throw new ApiAuthError(401, "Silakan login kembali.");
  return session;
}
