import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [decks, totalViews, uniqueViewers, recentViews] = await Promise.all([
    db.pitchDeck.findMany({
      where: { ownerId: userId },
      include: { links: { include: { _count: { select: { views: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    db.pitchDeckView.count({
      where: { link: { pitchDeck: { ownerId: userId } } },
    }),
    db.pitchDeckView.groupBy({
      by: ["viewerEmail"],
      where: {
        viewerEmail: { not: null },
        link: { pitchDeck: { ownerId: userId } },
      },
    }),
    db.pitchDeckView.findMany({
      where: { link: { pitchDeck: { ownerId: userId } } },
      include: { link: { include: { pitchDeck: true } } },
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
  ]);

  const avgDuration =
    totalViews > 0
      ? Math.round(
          (await db.pitchDeckView.aggregate({
            where: { link: { pitchDeck: { ownerId: userId } } },
            _avg: { totalDurationSeconds: true },
          }))._avg.totalDurationSeconds ?? 0
        )
      : 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">How investors are engaging with your decks</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FileText className="h-5 w-5 text-brand-accent" />} label="Decks" value={decks.length} />
        <StatCard icon={<Eye className="h-5 w-5 text-brand-accent" />} label="Total Views" value={totalViews} />
        <StatCard icon={<Users className="h-5 w-5 text-brand-accent" />} label="Unique Viewers" value={uniqueViewers.length} />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-brand-accent" />} label="Avg Time on Deck" value={formatDuration(avgDuration)} />
      </div>

      {/* Recent viewer activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Views</CardTitle>
        </CardHeader>
        <CardContent>
          {recentViews.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No views yet. Share a link to get started.
            </p>
          ) : (
            <div className="divide-y">
              {recentViews.map((view) => (
                <div key={view.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-semibold shrink-0">
                      {view.viewerEmail?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {view.viewerEmail ?? "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {view.link.pitchDeck.title}
                        {view.link.label ? ` · ${view.link.label}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-gray-500">
                      {formatDuration(view.totalDurationSeconds)}
                    </span>
                    <Badge variant={view.completed ? "success" : "secondary"}>
                      {view.completed ? "Completed" : "Partial"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decks list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Decks</CardTitle>
          <Link
            href="/admin/decks/new"
            className="text-sm text-brand-accent hover:underline font-medium"
          >
            + Upload deck
          </Link>
        </CardHeader>
        <CardContent>
          {decks.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No decks yet.{" "}
              <Link href="/admin/decks/new" className="text-brand-accent hover:underline">
                Upload your first deck
              </Link>
            </p>
          ) : (
            <div className="divide-y">
              {decks.map((deck) => {
                const deckViews = deck.links.reduce((s, l) => s + l._count.views, 0);
                return (
                  <Link
                    key={deck.id}
                    href={`/admin/decks/${deck.id}`}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-gray-50 -mx-6 px-6 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deck.title}</p>
                      <p className="text-xs text-gray-400">
                        {deck.slideCount} slides · {deck.links.length} link
                        {deck.links.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{deckViews} views</span>
                      <Badge
                        variant={
                          deck.status === "ACTIVE"
                            ? "success"
                            : deck.status === "DRAFT"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {deck.status}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
