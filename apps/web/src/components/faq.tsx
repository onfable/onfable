const FAQS = [
  {
    q: "Is it free?",
    a: "Yes — onfable is MIT-licensed open source and free forever. You only pay your AI provider for the tokens you use (bring your own API key).",
  },
  {
    q: "Which models can I use?",
    a: "Anthropic Claude (recommended), OpenAI, anything on OpenRouter, or any OpenAI-compatible endpoint — including local servers like Ollama or LM Studio that expose one. Switch anytime with `onfable setup`.",
  },
  {
    q: "Is it safe to let an AI run commands on my machine?",
    a: "onfable is built around approval-first execution: every shell command, file write, and file edit shows you exactly what it wants to do and waits for your yes. Reads don't need approval. When you trust a workflow, `--yolo` skips the prompts.",
  },
  {
    q: "Where is my data stored?",
    a: "Only on your machine. Your config (API key, chmod 600), memory, and session history live in ~/.onfable/. Conversations go directly from your machine to your chosen AI provider — there is no onfable server in between.",
  },
  {
    q: "How is this different from a chatbot?",
    a: "A chatbot tells you the commands to run. onfable runs them — it lists your files, edits them, searches the web, retries when something fails, and remembers your preferences for next time. It's an agent with hands, not just a voice.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">
        Questions, answered
      </h2>
      <div className="mt-10 space-y-3">
        {FAQS.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-xl border border-edge bg-card px-5 py-4 transition-colors hover:border-white/20"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span className="ml-4 text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
