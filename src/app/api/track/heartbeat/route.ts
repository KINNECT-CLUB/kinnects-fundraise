import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/track/heartbeat
 * Called every 5 seconds by the viewer while a slide is visible.
 * Upserts the PitchDeckSlideView and keeps totalDurationSeconds up to date.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { viewId, slideIndex, secondsOnSlide } = body as {
    viewId: string;
    slideIndex: number;
    secondsOnSlide: number;
  };

  if (!viewId || !slideIndex || secondsOnSlide == null) {
    return NextResponse.json({ error: "viewId, slideIndex, secondsOnSlide required" }, { status: 400 });
  }

  const now = new Date();

  await db.pitchDeckSlideView.upsert({
    where: { viewId_slideIndex: { viewId, slideIndex } },
    create: {
      viewId,
      slideIndex,
      firstViewedAt: now,
      lastHeartbeatAt: now,
      durationSeconds: secondsOnSlide,
    },
    update: {
      lastHeartbeatAt: now,
      durationSeconds: secondsOnSlide,
      visitCount: { increment: 0 }, // visitCount incremented on slide-change, not heartbeat
    },
  });

  // Recompute total from all slide rows so it stays consistent
  const agg = await db.pitchDeckSlideView.aggregate({
    where: { viewId },
    _sum: { durationSeconds: true },
  });

  await db.pitchDeckView.update({
    where: { id: viewId },
    data: { totalDurationSeconds: agg._sum.durationSeconds ?? 0 },
  });

  return NextResponse.json({ ok: true });
}
