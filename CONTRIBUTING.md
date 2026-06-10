# Contributing to onfable

Thanks for helping make onfable better! This is a pnpm monorepo with two packages: the CLI agent (`packages/cli`, published to npm as `onfable`) and the website (`apps/web`).

## Setup

```sh
# prerequisites: Node >= 20, pnpm >= 9
git clone https://github.com/onfable/onfable.git
cd onfable
pnpm install
pnpm build
```

## Day-to-day commands

| Command | What it does |
|---|---|
| `pnpm build` | Build CLI + website |
| `pnpm typecheck` | Typecheck everything (what CI runs) |
| `pnpm --filter onfable test` | Run the CLI unit tests (vitest) |
| `pnpm dev:cli` | Rebuild the CLI on every change |
| `pnpm dev:web` | Run the website at localhost:3000 |

## Testing the CLI locally

```sh
pnpm --filter onfable build
node packages/cli/dist/index.js --help

# or link it globally
cd packages/cli && npm link
onfable setup
```

The agent's state lives in `~/.onfable/` — delete that directory to reset to a fresh install.

## Adding a tool

Tools live in `packages/cli/src/tools/`. Implement the `Tool` interface (name, description, JSON Schema, `needsApproval`, `summarize`, `execute`) and register it in `tools/index.ts`. Set `needsApproval: true` for anything that mutates state outside `~/.onfable`.

## Pull requests

- Keep PRs focused — one change per PR.
- `pnpm typecheck && pnpm build` must pass.
- For user-facing changes, update the README and (if relevant) the website copy.
- Use clear commit messages: what + why.

## Reporting bugs

Open an issue with your OS, Node version, onfable version (`onfable --version`), provider, and steps to reproduce. Never include your API key in logs.
