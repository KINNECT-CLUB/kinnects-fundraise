import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/track/complete
 * Called when the viewer reaches the last slide.
 * Marks the session as completed and records endedAt.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { viewId } = body as { viewId: string };

  if (!viewId) {
    return NextResponse.json({ error: "viewId required" }, { status: 400 });
  }

  await db.pitchDeckView.update({
    where: { id: viewId },
    data: { completed: true, endedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
