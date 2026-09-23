import { NextResponse } from "next/server";
import { ApiAuthError } from "./auth";

export function apiError(e: unknown) {
  if (e instanceof ApiAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error(e);
  return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
}
