import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { EmailGate } from "./EmailGate";
import { DeckViewer } from "./DeckViewer";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ email?: string; name?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const link = await db.pitchDeckLink.findUnique({
    where: { slug: slug },
    include: { pitchDeck: true },
  });

  const title = link ? `${link.pitchDeck.title} — Kinnect` : "Kinnect Pitch";
  const description =
    "Kinnect is reimagining how families stay connected. View our pitch deck.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Kinnect",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function DeckPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { email, name } = await searchParams;

  const link = await db.pitchDeckLink.findUnique({
    where: { slug: slug },
    include: { pitchDeck: true },
  });

  if (!link || link.status === "DISABLED") notFound();

  if (link.expiresAt && link.expiresAt < new Date()) {
    return <ExpiredPage />;
  }

  // If email gate is required and email not yet provided, show the gate
  const viewerEmail = email;
  if (link.requireEmail && !viewerEmail) {
    return <EmailGate slug={slug} deckTitle={link.pitchDeck.title} />;
  }

  return (
    <DeckViewer
      linkId={link.id}
      deck={{
        title: link.pitchDeck.title,
        fileUrl: link.pitchDeck.fileUrl,
        slideCount: link.pitchDeck.slideCount,
      }}
      viewerEmail={viewerEmail}
      viewerName={name}
    />
  );
}

function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand">
      <div className="text-center space-y-3">
        <span className="text-3xl font-bold text-white tracking-tight">
          kinnect<span className="text-brand-accent">.</span>
        </span>
        <p className="text-white/70">This link has expired.</p>
        <p className="text-sm text-white/40">Please reach out to request a new one.</p>
      </div>
    </div>
  );
}
