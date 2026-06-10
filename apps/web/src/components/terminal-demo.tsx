"use client";

import { useEffect, useRef, useState } from "react";

type Line = {
  text: string;
  kind: "cmd" | "user" | "agent" | "tool" | "ok" | "blank";
  /** "type" animates char by char; "instant" appears at once */
  mode: "type" | "instant";
  /** pause after the line completes, ms */
  pause: number;
};

const SCRIPT: Line[] = [
  { text: "onfable", kind: "cmd", mode: "type", pause: 500 },
  { text: "✳ onfable — your machine, your agent, your story", kind: "ok", mode: "instant", pause: 600 },
  { text: "", kind: "blank", mode: "instant", pause: 0 },
  { text: "› organize my downloads folder by file type", kind: "user", mode: "type", pause: 700 },
  { text: "", kind: "blank", mode: "instant", pause: 0 },
  { text: "⚒ list_dir: ~/Downloads → 38 lines", kind: "tool", mode: "instant", pause: 550 },
  { text: "⚒ run_command: mkdir -p Images Docs Archives Installers", kind: "tool", mode: "instant", pause: 350 },
  { text: "  ✓ approved", kind: "ok", mode: "instant", pause: 500 },
  { text: "⚒ run_command: mv *.png *.jpg Images/ && mv *.pdf Docs/ …", kind: "tool", mode: "instant", pause: 350 },
  { text: "  ✓ approved", kind: "ok", mode: "instant", pause: 700 },
  {
    text: "Done — 34 files sorted into Images (19), Docs (9), Archives (4), and Installers (2).",
    kind: "agent",
    mode: "type",
    pause: 500,
  },
  { text: "⚒ memory_save: user likes Downloads organized by file type", kind: "tool", mode: "instant", pause: 2600 },
];

const STYLES: Record<Line["kind"], string> = {
  cmd: "text-white",
  user: "text-white",
  agent: "text-zinc-300",
  tool: "text-zinc-500",
  ok: "text-emerald-400/80",
  blank: "",
};

const TYPE_SPEED_MS = 26;

export function TerminalDemo() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
    }
  }, []);

  useEffect(() => {
    if (reduced) return;
    if (lineIndex >= SCRIPT.length) {
      // Loop after a pause
      const timer = setTimeout(() => {
        setLineIndex(0);
        setCharIndex(0);
      }, 1200);
      return () => clearTimeout(timer);
    }

    const line = SCRIPT[lineIndex];
    const lineDone =
      line.mode === "instant" || charIndex >= line.text.length;

    const timer = setTimeout(
      () => {
        if (lineDone) {
          setLineIndex((i) => i + 1);
          setCharIndex(0);
        } else {
          setCharIndex((c) => c + 1);
        }
      },
      lineDone ? line.pause || 60 : TYPE_SPEED_MS,
    );
    return () => clearTimeout(timer);
  }, [lineIndex, charIndex, reduced]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lineIndex, charIndex]);

  const visible = reduced ? SCRIPT : SCRIPT.slice(0, lineIndex + 1);

  return (
    <section id="demo" className="mx-auto max-w-4xl px-6 py-20">
      <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">
        See it in action
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted">
        One sentence in. Real work out — with your approval on every command.
      </p>
      <div className="mt-10 overflow-hidden rounded-xl border border-edge bg-card shadow-2xl shadow-white/5">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-edge px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="ml-3 text-xs text-faint">onfable — ~/Downloads</span>
        </div>
        {/* Screen */}
        <div
          ref={scrollRef}
          className="h-80 overflow-hidden p-5 font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed sm:text-sm"
          aria-label="Demo of an onfable terminal session"
        >
          {visible.map((line, i) => {
            const isCurrent = !reduced && i === lineIndex;
            const text =
              isCurrent && line.mode === "type"
                ? line.text.slice(0, charIndex)
                : line.text;
            return (
              <div
                key={i}
                className={`${STYLES[line.kind]} ${isCurrent ? "caret" : ""} min-h-[1.5em] whitespace-pre-wrap`}
              >
                {line.kind === "cmd" && (
                  <span className="select-none text-faint">$ </span>
                )}
                {text}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
