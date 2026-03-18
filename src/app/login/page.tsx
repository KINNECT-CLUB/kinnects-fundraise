import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand">
      <div className="w-full max-w-sm space-y-8 px-6">
        {/* Kinnect wordmark */}
        <div className="text-center">
          <span className="text-3xl font-bold text-white tracking-tight">
            kinnect<span className="text-brand-accent">.</span>
          </span>
          <p className="mt-2 text-sm text-white/60">Pitch deck dashboard</p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <Button type="submit" className="w-full" size="lg">
            Continue with Google
          </Button>
        </form>
      </div>
    </div>
  );
}
