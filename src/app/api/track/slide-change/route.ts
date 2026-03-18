import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/track/slide-change
 * Called when the viewer navigates to a different slide.
 * Increments visitCount if the viewer is returning to a previously seen slide.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { viewId, slideIndex } = body as { viewId: string; slideIndex: number };

  if (!viewId || !slideIndex) {
    return NextResponse.json({ error: "viewId and slideIndex required" }, { status: 400 });
  }

  const existing = await db.pitchDeckSlideView.findUnique({
    where: { viewId_slideIndex: { viewId, slideIndex } },
  });

  if (existing) {
    await db.pitchDeckSlideView.update({
      where: { viewId_slideIndex: { viewId, slideIndex } },
      data: { visitCount: { increment: 1 }, lastHeartbeatAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
