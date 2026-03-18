"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
      title={state === "copied" ? "Copied!" : state === "error" ? "Copy failed" : "Copy link"}
    >
      {state === "copied" ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className={`h-4 w-4 ${state === "error" ? "text-red-400" : ""}`} />
      )}
    </button>
  );
}
