import Link from "next/link";
import { Button } from "@/components/ui/button";

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server configuration error",
    description:
      "The authentication provider is not configured correctly. Please ensure AUTH_SECRET, AUTH_GOOGLE_ID, and AUTH_GOOGLE_SECRET are set in your environment variables.",
  },
  AccessDenied: {
    title: "Access denied",
    description: "You do not have permission to sign in.",
  },
  Verification: {
    title: "Verification failed",
    description: "The sign-in link is no longer valid. It may have been used already or expired.",
  },
  Default: {
    title: "Authentication error",
    description: "An unexpected error occurred during sign-in. Please try again.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const key = error ?? "Default";
  const { title, description } = errorMessages[key] ?? errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand">
      <div className="w-full max-w-sm space-y-6 px-6 text-center">
        <div>
          <span className="text-3xl font-bold text-white tracking-tight">
            kinnect<span className="text-brand-accent">.</span>
          </span>
        </div>

        <div className="bg-white/10 rounded-xl p-6 space-y-3">
          <p className="text-white font-semibold text-lg">{title}</p>
          <p className="text-white/70 text-sm">{description}</p>
          {error && (
            <p className="text-white/40 text-xs font-mono">Error code: {error}</p>
          )}
        </div>

        <Link href="/login">
          <Button variant="outline" className="w-full">
            Back to sign-in
          </Button>
        </Link>
      </div>
    </div>
  );
}
