"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  slug: string;
  deckTitle: string;
}

export function EmailGate({ slug, deckTitle }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const params = new URLSearchParams({ email });
    if (name) params.set("name", name);
    router.push(`/d/${slug}?${params.toString()}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Branding */}
        <div className="text-center">
          <span className="text-3xl font-bold text-white tracking-tight">
            kinnect<span className="text-brand-accent">.</span>
          </span>
          <p className="mt-1 text-white/60 text-sm">You&apos;ve been invited to view</p>
          <p className="mt-2 text-white font-semibold text-lg">{deckTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70" htmlFor="name">
              Your name <span className="text-white/30">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70" htmlFor="email">
              Your email <span className="text-brand-accent">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@sequoia.com"
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading || !email}>
            {loading ? "Opening…" : "View deck"}
          </Button>
        </form>

        <p className="text-center text-xs text-white/30">
          Your email is only used to notify the sender. We won&apos;t spam you.
        </p>
      </div>
    </div>
  );
}
