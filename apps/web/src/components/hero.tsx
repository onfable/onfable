import { CopyButton } from "./copy-button";

const INSTALL_CMD = "curl -fsSL https://onfable.xyz/install.sh | sh";
const GITHUB_URL = "https://github.com/onfable/onfable";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-200px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-24 text-center sm:pt-32">
        <p className="rise mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-edge bg-card px-3 py-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Open source · MIT · macOS / Linux / Windows
        </p>
        <h1 className="rise text-balance text-5xl font-medium tracking-tight sm:text-7xl">
          Your machine.
          <br />
          Your agent. <span className="text-muted">Your story.</span>
        </h1>
        <p className="rise mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted">
          onfable is an open-source autonomous AI agent that lives in your
          terminal — it runs commands, edits files, browses the web, and
          remembers you. Bring any model: Claude, OpenAI, OpenRouter, or your
          own endpoint.
        </p>
        <div className="rise mx-auto mt-10 flex max-w-xl flex-col items-center gap-4">
          <div className="flex w-full items-center gap-2 rounded-lg border border-edge bg-card py-2 pl-4 pr-2">
            <code className="flex-1 overflow-x-auto whitespace-nowrap text-left font-[family-name:var(--font-geist-mono)] text-sm text-white/90">
              <span className="select-none text-faint">$ </span>
              {INSTALL_CMD}
            </code>
            <CopyButton text={INSTALL_CMD} label="Copy install command" />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <a
              href="#install"
              className="rounded-lg bg-white px-5 py-2.5 font-medium text-black transition-opacity hover:opacity-85"
            >
              Get started
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-edge px-5 py-2.5 text-white transition-colors hover:border-white/30"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
