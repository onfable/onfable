<div align="center">

<img src="apps/web/public/logo.svg" alt="onfable" width="280" />

**Your machine. Your agent. Your story.**

The open-source autonomous AI agent that lives in your terminal —
it runs commands, edits files, browses the web, and remembers you.

[![npm](https://img.shields.io/npm/v/onfable?color=white&labelColor=black)](https://www.npmjs.com/package/onfable)
[![npm downloads](https://img.shields.io/npm/dm/onfable?color=white&labelColor=black)](https://www.npmjs.com/package/onfable)
[![CI](https://github.com/onfable/onfable/actions/workflows/ci.yml/badge.svg)](https://github.com/onfable/onfable/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-white?labelColor=black)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-white?labelColor=black)](CONTRIBUTING.md)

[**onfable.xyz**](https://onfable.xyz) · [X/Twitter](https://x.com/onfable) · [Install](#install) · [Quickstart](#quickstart) · [Features](#features) · [Architecture](#architecture) · [Contributing](CONTRIBUTING.md)

</div>

---

## What it looks like

```console
$ onfable

  ✳ onfable — your machine, your agent, your story

› organize my downloads folder by file type

  ⚒ list_dir: ~/Downloads → 38 lines
  ⚒ run_command: mkdir -p Images Docs Archives Installers
    ✓ approved
  ⚒ run_command: mv *.png *.jpg Images/ && mv *.pdf Docs/ …
    ✓ approved

Done — 34 files sorted into Images (19), Docs (9), Archives (4), and Installers (2).

  ⚒ memory_save: user likes Downloads organized by file type
```

One sentence in. Real work out — with your approval on every command. Next session, it already knows how you like things done.

## Why onfable?

|  | Chatbot | IDE copilot | **onfable** |
|---|:---:|:---:|:---:|
| Tells you the commands | ✅ | ✅ | ✅ |
| **Runs them for you** | ❌ | partial | ✅ |
| Edits any file on your machine | ❌ | in-project | ✅ |
| Searches & reads the web | varies | ❌ | ✅ no key needed |
| Remembers you across sessions | ❌ | ❌ | ✅ plain markdown |
| Your choice of model/provider | ❌ | ❌ | ✅ Claude, OpenAI, OpenRouter, local |
| Approval gate on every action | — | — | ✅ (or `--yolo`) |
| Open source, runs 100% locally | ❌ | ❌ | ✅ MIT |

## Install

**macOS / Linux**

```sh
curl -fsSL https://onfable.xyz/install.sh | sh
```

**Windows (PowerShell)**

```powershell
irm onfable.xyz/install.ps1 | iex
```

**npm (any platform, Node ≥ 20)**

```sh
npm install -g onfable
```

## Quickstart

```sh
onfable setup    # pick a provider (Anthropic / OpenAI / OpenRouter / custom), paste your key
onfable          # interactive chat — ask it to do things
```

One-shot tasks:

```sh
onfable run "organize my downloads folder by file type"
onfable run "find every TODO in this repo and write them to TODO.md" --yolo
```

In the REPL: `/new` resets the session, `/memory` shows what it remembers about you, `/exit` quits. Flags: `--yolo` skips approval prompts, `--model <id>` overrides the model for one session.

## Features

- **Runs 100% locally** — your API key, files, and history never leave your machine (`~/.onfable/`).
- **Any model** — Claude (default), OpenAI, OpenRouter, or any OpenAI-compatible endpoint (Ollama, LM Studio, vLLM…).
- **Real tools** — shell commands, file read/write/edit, directory listing, web search, web fetch.
- **Approval-first** — every shell command and file write shows you exactly what it wants to do and waits for your yes. `--yolo` when you trust it.
- **Persistent memory** — durable notes about you in plain markdown, injected into every session.
- **Hackable** — MIT licensed, lean TypeScript. A new tool is ~40 lines in [`packages/cli/src/tools/`](packages/cli/src/tools/).

## Architecture

```
onfable (CLI)
   │
   ├── commands/        setup wizard · chat REPL · one-shot run
   │
   ├── agent loop       stream → tool calls → approval → execute → repeat
   │     │              (max 25 iterations per turn)
   │     │
   │     ├── providers  Anthropic Messages API ─┐
   │     │              OpenAI-compatible API  ─┤→ one neutral stream interface
   │     │              (OpenAI/OpenRouter/custom baseURL)
   │     │
   │     └── tools      run_command · read/write/edit_file · list_dir
   │                    web_search · web_fetch · memory_save/recall
   │
   └── ~/.onfable/      config.json (0600) · memory.md · history/
```

## Monorepo

| Path | What it is |
|---|---|
| [`packages/cli`](packages/cli) | The `onfable` npm package — the agent itself |
| [`apps/web`](apps/web) | [onfable.xyz](https://onfable.xyz) — Next.js site, serves the install scripts |

### Develop

```sh
pnpm install
pnpm build              # build everything
pnpm typecheck          # CI mirror
pnpm dev:web            # site on localhost:3000
pnpm dev:cli            # rebuild CLI on change

# try your local CLI build
node packages/cli/dist/index.js --help
```

### Deploy the website (Vercel)

1. Import `onfable/onfable` in Vercel.
2. Set **Root Directory** to `apps/web` and enable **"Include files outside the Root Directory"** (the pnpm lockfile lives at the repo root).
3. Framework (Next.js) and install command are auto-detected.
4. Add the `onfable.xyz` domain.
5. Verify the installer is live: `curl -sI https://onfable.xyz/install.sh` → `200` with `text/x-shellscript`.

### Releasing the CLI

```sh
cd packages/cli
# bump "version" in package.json
pnpm build
npm publish --access public
```

The published tarball contains only `dist/` and the README (`files` allowlist).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `onfable: command not found` after npm install | Your npm global bin isn't on PATH. Run `npm prefix -g` and add `<that>/bin` to your shell profile (Windows: reopen the terminal). |
| `EACCES` on `npm install -g` | Don't sudo. Point npm at a user-writable prefix: `npm config set prefix ~/.npm-global` and add `~/.npm-global/bin` to PATH. |
| "Could not validate" in `onfable setup` | Wrong key, no credit on the provider account, or a typo'd model id. You can save anyway and fix later with `onfable setup`. |
| Agent says search is unavailable | The no-key DuckDuckGo endpoint is occasionally rate-limited; it recovers on its own. `web_fetch` with a direct URL always works. |
| Want to start completely fresh | `rm -rf ~/.onfable` removes config, memory, and history. |

## Roadmap

- [ ] Telegram & Discord channel adapters
- [ ] Scheduled tasks ("every morning, summarize my inbox")
- [ ] Subagents for parallel work
- [ ] Sandboxed execution backends
- [ ] Markdown rendering in the terminal

Want one of these sooner? [Open an issue](https://github.com/onfable/onfable/issues) or upvote an existing one — roadmap order follows demand.

## Contributing

Contributions of every size are welcome — a new tool is ~40 lines, a typo fix is one. Start with [CONTRIBUTING.md](CONTRIBUTING.md), or grab anything labeled [`good first issue`](https://github.com/onfable/onfable/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

If onfable saved you some typing today, a ⭐ helps other people find it.

## License

[MIT](LICENSE) — go build your own story.

<div align="center">
<sub><a href="https://onfable.xyz">onfable.xyz</a> · <a href="https://x.com/onfable">@onfable</a></sub>
</div>
