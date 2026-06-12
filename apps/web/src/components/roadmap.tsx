const PHASES = [
  {
    tag: "Shipped",
    state: "done" as const,
    title: "The agent",
    items: [
      "CLI agent: shell, files, web search/fetch, persistent memory",
      "Any model: Claude (incl. Fable 5), OpenAI, OpenRouter, Bankr, local",
      "One-line installers for macOS, Linux, Windows",
      "MCP support with Base built in — wallet, USDC, swaps, DeFi",
      "$ONFABLE launched on Virtuals Protocol (Base)",
    ],
  },
  {
    tag: "Now",
    state: "now" as const,
    title: "Community & reach",
    items: [
      "Contributor bounty program paid in $ONFABLE",
      "Telegram channel adapter — your agent in your pocket",
      "Markdown rendering in the terminal",
      "Growing the MCP server registry",
    ],
  },
  {
    tag: "Next",
    state: "next" as const,
    title: "Autonomy",
    items: [
      "Scheduled tasks — \"every morning, summarize my inbox\"",
      "Subagents for parallel work",
      "Discord adapter",
      "$ONFABLE roadmap governance (token-weighted voting)",
    ],
  },
  {
    tag: "Later",
    state: "later" as const,
    title: "Hosted onfable",
    items: [
      "Cloud agents that run while your machine sleeps",
      "Cross-device memory sync",
      "Sandboxed execution backends",
      "Hosted features gated & paid with $ONFABLE",
    ],
  },
];

const DOT: Record<string, string> = {
  done: "bg-white",
  now: "bg-white animate-pulse",
  next: "border border-white/50",
  later: "border border-edge",
};

export function Roadmap() {
  return (
    <section id="roadmap" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">
        Roadmap
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted">
        Built in the open — order follows demand.{" "}
        <a
          href="https://github.com/onfable/onfable/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-edge underline-offset-4 transition-colors hover:text-white"
        >
          Vote with an issue
        </a>
        .
      </p>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PHASES.map((phase) => (
          <div
            key={phase.tag}
            className={`rounded-xl border bg-card p-6 ${
              phase.state === "now" ? "border-white/30" : "border-edge"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${DOT[phase.state]}`} />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                {phase.tag}
              </span>
            </div>
            <h3 className="mt-3 font-medium">{phase.title}</h3>
            <ul className="mt-3 space-y-2">
              {phase.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                  <span className="text-faint">{phase.state === "done" ? "✓" : "·"}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
