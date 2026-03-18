import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deckId, label, requireEmail } = await req.json();

  const deck = await db.pitchDeck.findFirst({
    where: { id: deckId, ownerId: session.user!.id! },
  });
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Ensure slug uniqueness
  let slug = generateSlug();
  let attempts = 0;
  while (await db.pitchDeckLink.findUnique({ where: { slug } })) {
    slug = generateSlug();
    if (++attempts > 10) return NextResponse.json({ error: "Could not generate slug" }, { status: 500 });
  }

  const link = await db.pitchDeckLink.create({
    data: { pitchDeckId: deckId, slug, label, requireEmail: requireEmail ?? true },
  });

  return NextResponse.json(link, { status: 201 });
}
