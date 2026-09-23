import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/client-session";
import { apiError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const session = await requireClientSession();
    const body = await req.json().catch(() => null);
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    const event = await prisma.clientLoginEvent.create({
      data: { clientId: session.clientId, lat: hasCoords ? lat : null, lng: hasCoords ? lng : null },
    });

    return NextResponse.json({ ok: true, lat: hasCoords ? lat : null, lng: hasCoords ? lng : null, at: event.createdAt });
  } catch (e) {
    return apiError(e);
  }
}
