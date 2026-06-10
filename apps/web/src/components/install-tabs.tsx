"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";

const TABS = [
  {
    id: "unix",
    label: "macOS / Linux",
    command: "curl -fsSL https://onfable.xyz/install.sh | sh",
    prompt: "$",
  },
  {
    id: "windows",
    label: "Windows",
    command: "irm onfable.xyz/install.ps1 | iex",
    prompt: ">",
  },
  {
    id: "npm",
    label: "npm",
    command: "npm install -g onfable",
    prompt: "$",
  },
] as const;

export function InstallTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("unix");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section id="install" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">
        Installed in one line
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted">
        Node.js 20+ is the only prerequisite. Your API key stays on your
        machine.
      </p>

      <div className="mt-10 overflow-hidden rounded-xl border border-edge bg-card">
        <div className="flex border-b border-edge" role="tablist" aria-label="Install method">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              onClick={() => setActive(t.id)}
              className={`px-5 py-3 text-sm transition-colors ${
                active === t.id
                  ? "border-b-2 border-white text-white"
                  : "text-muted hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-5 py-5">
          <code className="scrollbar-none flex-1 overflow-x-auto whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-sm text-white/90">
            <span className="select-none text-faint">{tab.prompt} </span>
            {tab.command}
          </code>
          <CopyButton text={tab.command} label={`Copy ${tab.label} install command`} />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Then run{" "}
        <code className="rounded border border-edge bg-card px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-white/90">
          onfable setup
        </code>{" "}
        — pick a provider, paste your key, done.
      </p>
    </section>
  );
}
