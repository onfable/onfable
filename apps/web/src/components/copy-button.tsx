"use client";

import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (http, old browser) — silently ignore.
    }
  }

  return (
    <button
      onClick={copy}
      aria-label={label ?? "Copy to clipboard"}
      className="shrink-0 rounded-md border border-edge bg-card p-2 text-muted transition-colors hover:border-white/30 hover:text-white"
    >
      {copied ? (
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 8.5l3.5 3.5 7.5-8" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.4">
          <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" />
          <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
        </svg>
      )}
    </button>
  );
}
