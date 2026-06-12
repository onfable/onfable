const FEATURES = [
  {
    title: "Runs 100% locally",
    body: "onfable lives on your machine — macOS, Linux, or Windows. Your API key, your files, your data: everything stays in ~/.onfable, nothing passes through our servers.",
    icon: (
      <path d="M4 5h16v10H4zM2 19h20M9 19v-4M15 19v-4" />
    ),
  },
  {
    title: "Works with any model",
    body: "Claude by default — up to Claude Fable 5, the most powerful model you can run (and yes, the name is fate). Or OpenAI, OpenRouter, and any OpenAI-compatible endpoint. Switch with one command.",
    icon: (
      <path d="M12 3v4m0 10v4m9-9h-4M7 12H3m13.6-5.6l-2.8 2.8m-3.6 3.6l-2.8 2.8m11.2 0l-2.8-2.8M9.2 9.2L6.4 6.4" />
    ),
  },
  {
    title: "Persistent memory",
    body: "It remembers you. Preferences, project context, how you like things done — saved to a plain markdown file you can read and edit yourself.",
    icon: (
      <path d="M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h6" />
    ),
  },
  {
    title: "Power with guardrails",
    body: "Full system access — shell, files, the lot — but every command and file write asks for your approval first. Trust it? Run with --yolo.",
    icon: (
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6zM9 12l2 2 4-4" />
    ),
  },
  {
    title: "Web-aware",
    body: "Built-in web search and page fetching. It can look things up, read documentation, and pull real data into your tasks — no extra API key needed.",
    icon: (
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z" />
    ),
  },
  {
    title: "MCP servers, incl. Base",
    body: "Connect Model Context Protocol servers and the agent gains their tools. Ships with Base — onchain wallet, USDC transfers, swaps, and DeFi — via a browser-authorized agentic wallet. No private keys in onfable.",
    icon: (
      <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2zM12 2v9m0 0l8-4.5M12 11l-8-4.5" />
    ),
  },
  {
    title: "Open source & hackable",
    body: "MIT licensed, one lean TypeScript codebase. Add a tool in ~40 lines. Read every prompt it sends. Fork it and make it yours.",
    icon: (
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13 4l-2 16" />
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">
        An agent, not a chatbot
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted">
        Chatbots tell you how. onfable just does it.
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-xl border border-edge bg-card p-6 transition-colors hover:border-white/20"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 fill-none stroke-white/80 transition-colors group-hover:stroke-white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {f.icon}
            </svg>
            <h3 className="mt-4 font-medium">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
