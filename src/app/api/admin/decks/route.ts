import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * POST /api/admin/decks
 * Accepts a multipart/form-data body with:
 *   - file: PDF binary
 *   - title: string
 *   - description?: string
 *
 * Counts pages via pdfjs-dist and stores the file URL.
 * In production, replace the local /tmp write with an upload to GCS/S3
 * and use the resulting signed URL as fileUrl.
 */
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

  // Count pages
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  let slideCount = 0;
  try {
    const pdf = await getDocument({ data: uint8 }).promise;
    slideCount = pdf.numPages;
  } catch {
    return NextResponse.json({ error: "Could not parse PDF" }, { status: 422 });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TODO: replace with actual GCS/S3 upload.
  // Example (GCS):
  //   const storage = new Storage();
  //   const bucket = storage.bucket(process.env.STORAGE_BUCKET!);
  //   const blob = bucket.file(`decks/${userId}/${Date.now()}-${file.name}`);
  //   await blob.save(Buffer.from(arrayBuffer), { contentType: "application/pdf" });
  //   const [fileUrl] = await blob.getSignedUrl({ action: "read", expires: "2099-01-01" });
  // ──────────────────────────────────────────────────────────────────────────
  const fileUrl = `https://storage.googleapis.com/${process.env.STORAGE_BUCKET}/placeholder/${Date.now()}.pdf`;

  const deck = await db.pitchDeck.create({
    data: {
      ownerId: session.user!.id!,
      title,
      description,
      slideCount,
      fileUrl,
      fileName: file.name,
      status: "ACTIVE",
    },
  });

  return NextResponse.json(deck, { status: 201 });
}
