import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { SlideHeatmap } from "./SlideHeatmap";
import { CreateLinkForm } from "./CreateLinkForm";
import { Copy, Eye, Clock, CheckCircle } from "lucide-react";

interface Props {
  params: { id: string };
}

export default async function DeckDetailPage({ params }: Props) {
  const session = await auth();
  const userId = session!.user!.id!;

  const deck = await db.pitchDeck.findFirst({
    where: { id: params.id, ownerId: userId },
    include: {
      links: {
        include: {
          views: {
            include: { slideViews: true },
            orderBy: { startedAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!deck) notFound();

  // Flatten all views across all links
  const allViews = deck.links.flatMap((l) => l.views);
  const totalViews = allViews.length;
  const uniqueEmails = new Set(allViews.map((v) => v.viewerEmail).filter(Boolean)).size;
  const completedViews = allViews.filter((v) => v.completed).length;
  const avgDuration =
    totalViews > 0
      ? Math.round(allViews.reduce((s, v) => s + v.totalDurationSeconds, 0) / totalViews)
      : 0;

  // Build per-slide aggregate for heatmap
  const slideMap = new Map<number, { totalSeconds: number; viewerCount: number }>();
  for (const view of allViews) {
    for (const sv of view.slideViews) {
      const existing = slideMap.get(sv.slideIndex) ?? { totalSeconds: 0, viewerCount: 0 };
      slideMap.set(sv.slideIndex, {
        totalSeconds: existing.totalSeconds + sv.durationSeconds,
        viewerCount: existing.viewerCount + 1,
      });
    }
  }

  const slideStats = Array.from({ length: deck.slideCount }, (_, i) => {
    const s = slideMap.get(i + 1);
    return {
      slideIndex: i + 1,
      avgDurationSeconds: s && s.viewerCount > 0 ? s.totalSeconds / s.viewerCount : 0,
      viewerCount: s?.viewerCount ?? 0,
    };
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deck.title}</h1>
          {deck.description && <p className="text-sm text-gray-500 mt-1">{deck.description}</p>}
        </div>
        <Badge
          variant={deck.status === "ACTIVE" ? "success" : deck.status === "DRAFT" ? "warning" : "secondary"}
        >
          {deck.status}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon={<Eye className="h-4 w-4 text-brand-accent" />} label="Total Views" value={totalViews} />
        <MiniStat icon={<Eye className="h-4 w-4 text-brand-accent" />} label="Unique Viewers" value={uniqueEmails} />
        <MiniStat icon={<Clock className="h-4 w-4 text-brand-accent" />} label="Avg Time" value={formatDuration(avgDuration)} />
        <MiniStat
          icon={<CheckCircle className="h-4 w-4 text-brand-accent" />}
          label="Completion"
          value={totalViews > 0 ? `${Math.round((completedViews / totalViews) * 100)}%` : "—"}
        />
      </div>

      {/* Slide heatmap */}
      {deck.slideCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Slide Engagement Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <SlideHeatmap slideStats={slideStats} />
          </CardContent>
        </Card>
      )}

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Shareable Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deck.links.map((link) => (
            <div key={link.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {link.label ?? "Unnamed link"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">
                    {appUrl}/d/{link.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={link.status === "ACTIVE" ? "success" : "secondary"}>
                    {link.status}
                  </Badge>
                  <CopyButton text={`${appUrl}/d/${link.slug}`} />
                </div>
              </div>

              {/* Per-link viewer rows */}
              {link.views.length > 0 && (
                <div className="border-t pt-3 space-y-1">
                  {link.views.map((view) => (
                    <div key={view.id} className="flex items-center justify-between text-xs text-gray-500 py-1">
                      <span className="font-medium text-gray-700">
                        {view.viewerEmail ?? "Anonymous"}
                        {view.viewerName ? ` (${view.viewerName})` : ""}
                      </span>
                      <div className="flex items-center gap-3">
                        <span>{formatDuration(view.totalDurationSeconds)}</span>
                        <Badge variant={view.completed ? "success" : "outline"} className="text-xs">
                          {view.completed ? "Done" : "Partial"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <CreateLinkForm deckId={deck.id} />
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-gray-500">{label}</span></div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={undefined} // handled client-side via the client component below
      data-copy={text}
      className="copy-btn p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
      title="Copy link"
    >
      <Copy className="h-4 w-4" />
    </button>
  );
}
