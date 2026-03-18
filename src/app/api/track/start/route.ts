import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/track/start
 * Called when an investor opens the deck (after passing the email gate).
 * Returns a viewId used for all subsequent heartbeat/complete calls.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { linkId, viewerEmail, viewerName } = body as {
    linkId: string;
    viewerEmail?: string;
    viewerName?: string;
  };

  if (!linkId) {
    return NextResponse.json({ error: "linkId required" }, { status: 400 });
  }

  const link = await db.pitchDeckLink.findUnique({
    where: { id: linkId },
    include: { pitchDeck: true },
  });

  if (!link || link.status !== "ACTIVE") {
    return NextResponse.json({ error: "Link not found or inactive" }, { status: 404 });
  }

  if (link.expiresAt && link.expiresAt < new Date()) {
    await db.pitchDeckLink.update({ where: { id: linkId }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "Link has expired" }, { status: 410 });
  }

  if (link.maxViews) {
    const viewCount = await db.pitchDeckView.count({ where: { linkId } });
    if (viewCount >= link.maxViews) {
      return NextResponse.json({ error: "View limit reached" }, { status: 403 });
    }
  }

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined;

  const view = await db.pitchDeckView.create({
    data: {
      linkId,
      viewerEmail: viewerEmail ?? null,
      viewerName: viewerName ?? null,
      ipAddress,
      userAgent: req.headers.get("user-agent") ?? null,
    },
  });

  return NextResponse.json({
    viewId: view.id,
    slideCount: link.pitchDeck.slideCount,
  });
}
