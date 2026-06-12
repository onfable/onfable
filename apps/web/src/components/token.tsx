import { CopyButton } from "./copy-button";

const CONTRACT = "0xeC76Ee25C41B51927b24b173622547A8dC89dc5D";

const FACTS = [
  { label: "Ticker", value: "$ONFABLE" },
  { label: "Chain", value: "Base" },
  { label: "Standard", value: "ERC-20" },
  { label: "Total supply", value: "1,000,000,000" },
  { label: "Launched via", value: "Virtuals Protocol" },
  { label: "Contract", value: "verified ✓" },
];

const UTILITY = [
  {
    status: "live" as const,
    title: "Native to the agent",
    body: "onfable ships with Base MCP built in — your agent can check, hold, and transfer $ONFABLE (and any Base token) out of the box. The token lives where the product lives.",
  },
  {
    status: "live" as const,
    title: "The agent's onchain identity",
    body: "$ONFABLE is onfable's agent token on Virtuals Protocol — the onchain handle for the project's agent economy on Base.",
  },
  {
    status: "rolling out" as const,
    title: "Contributor bounties",
    body: "Open-source contributions paid in $ONFABLE, starting with the good-first-issue board. Ship code, earn the token.",
  },
  {
    status: "planned" as const,
    title: "Roadmap governance",
    body: "Token-weighted voting on what gets built next — channel adapters, MCP servers, hosted features.",
  },
  {
    status: "planned" as const,
    title: "Access to hosted onfable",
    body: "When cloud features ship (scheduled tasks, hosted agents, memory sync), $ONFABLE gates and pays for them.",
  },
];

const BADGE: Record<string, string> = {
  live: "bg-white text-black",
  "rolling out": "border border-white/40 text-white",
  planned: "border border-edge text-muted",
};

export function Token() {
  return (
    <section id="token" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">
        $ONFABLE
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted">
        The onfable ecosystem token — utility first, on the network the agent
        already speaks.
      </p>

      {/* facts strip */}
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {FACTS.map((f) => (
          <div key={f.label} className="rounded-xl border border-edge bg-card px-4 py-3 text-center">
            <div className="text-xs uppercase tracking-wide text-faint">{f.label}</div>
            <div className="mt-1 text-sm font-medium">{f.value}</div>
          </div>
        ))}
      </div>

      {/* contract address */}
      <div className="mx-auto mt-6 flex max-w-2xl items-center gap-2 rounded-lg border border-edge bg-card py-2 pl-4 pr-2">
        <code className="scrollbar-none flex-1 overflow-x-auto whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-sm text-white/90">
          {CONTRACT}
        </code>
        <CopyButton text={CONTRACT} label="Copy contract address" />
      </div>
      <p className="mt-3 text-center text-xs text-faint">
        Always verify the contract address — this is the only official $ONFABLE.
      </p>

      {/* utility cards */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {UTILITY.map((u) => (
          <div key={u.title} className="rounded-xl border border-edge bg-card p-6 transition-colors hover:border-white/20">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${BADGE[u.status]}`}>
              {u.status}
            </span>
            <h3 className="mt-3 font-medium">{u.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{u.body}</p>
          </div>
        ))}
        <div className="flex flex-col justify-center gap-3 rounded-xl border border-edge bg-card p-6">
          <a
            href={`https://basescan.org/token/${CONTRACT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-edge px-4 py-2.5 text-center text-sm transition-colors hover:border-white/30"
          >
            View on BaseScan
          </a>
          <a
            href={`https://dexscreener.com/base/${CONTRACT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-edge px-4 py-2.5 text-center text-sm transition-colors hover:border-white/30"
          >
            Chart on DexScreener
          </a>
          <a
            href="https://app.virtuals.io/virtuals/86251"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-medium text-black transition-opacity hover:opacity-85"
          >
            Trade on Virtuals
          </a>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-faint">
        $ONFABLE is a utility token for the onfable ecosystem. Nothing on this
        page is financial advice or a solicitation to invest; digital assets
        are volatile and carry risk. The onfable software is and will remain
        free and open source — no token is required to use it.
      </p>
    </section>
  );
}
