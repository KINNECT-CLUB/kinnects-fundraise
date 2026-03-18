"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CreateLinkForm({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [requireEmail, setRequireEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId, label: label || null, requireEmail }),
    });
    if (res.ok) {
      setOpen(false);
      setLabel("");
      router.refresh();
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-brand-accent hover:underline font-medium"
      >
        <Plus className="h-4 w-4" />
        Create new link
      </button>
    );
  }

  return (
    <form onSubmit={handleCreate} className="border rounded-lg p-4 space-y-4 bg-gray-50">
      <p className="text-sm font-medium text-gray-700">New shareable link</p>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Label <span className="text-gray-400">(e.g. &ldquo;Sequoia&rdquo;, &ldquo;a16z&rdquo;)</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Investor firm name"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={requireEmail}
            onChange={(e) => setRequireEmail(e.target.checked)}
            className="rounded"
          />
          Require email before viewing
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Creating…" : "Create link"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
