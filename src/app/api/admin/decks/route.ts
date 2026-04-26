import { NextRequest, NextResponse } from "next/server";
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

  // TODO: Implement storage provider (S3, GCS, or local storage)
  // Since Vercel Blob is removed, we return an error until a new provider is configured.
  return NextResponse.json(
    { error: "Storage provider not configured. Please implement a file upload solution." },
    { status: 501 }
  );
}
