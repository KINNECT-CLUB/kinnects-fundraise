import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;
  const description = (formData.get("description") as string | null) ?? undefined;

  if (!file || !title) {
    return NextResponse.json({ error: "file and title are required" }, { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 413 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  let slideCount = 0;
  try {
    const pdf = await getDocument({ data: uint8 }).promise;
    slideCount = pdf.numPages;
  } catch {
    return NextResponse.json({ error: "Could not parse PDF" }, { status: 422 });
  }

  const blob = await put(`decks/${session.user!.id}/${Date.now()}-${file.name}`, file, {
    access: "public",
    contentType: "application/pdf",
  });

  const deck = await db.pitchDeck.create({
    data: {
      ownerId: session.user!.id!,
      title,
      description,
      slideCount,
      fileUrl: blob.url,
      fileName: file.name,
      status: "ACTIVE",
    },
  });

  return NextResponse.json(deck, { status: 201 });
}
