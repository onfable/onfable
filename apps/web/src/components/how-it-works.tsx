const STEPS = [
  {
    n: "1",
    title: "Install",
    body: "One line in your terminal. macOS, Linux, or Windows.",
    code: "curl -fsSL onfable.xyz/install.sh | sh",
  },
  {
    n: "2",
    title: "Setup",
    body: "Pick your provider, paste your API key. Saved locally, chmod 600.",
    code: "onfable setup",
  },
  {
    n: "3",
    title: "Ask anything",
    body: "It plans, runs the tools, and reports back — approving with you along the way.",
    code: 'onfable run "clean up my git branches"',
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">
        Up and running in a minute
      </h2>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="rounded-xl border border-edge bg-card p-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-sm font-medium">
              {step.n}
            </div>
            <h3 className="mt-4 font-medium">{step.title}</h3>
            <p className="mt-2 text-sm text-muted">{step.body}</p>
            <code className="scrollbar-none mt-4 block overflow-x-auto whitespace-nowrap rounded-md border border-edge bg-black px-3 py-2 font-[family-name:var(--font-geist-mono)] text-xs text-white/80">
              {step.code}
            </code>
          </div>
        ))}
      </div>
    </section>
  );
}
