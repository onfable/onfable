# onfable tools reference

The agent decides which tools to call; you approve the dangerous ones. This page documents every built-in tool, what it can do, and when it asks for approval.

Source of truth: [`packages/cli/src/tools/`](../packages/cli/src/tools/).

## Approval model

| Needs your approval | Runs freely |
|---|---|
| `run_command`, `write_file`, `edit_file` | `read_file`, `list_dir`, `web_fetch`, `web_search`, `memory_save`, `memory_recall` |

- Approval prompt offers **Yes**, **Yes & don't ask again for this tool this session**, and **No**.
- A denial is reported back to the model as "User declined" — the agent adapts instead of crashing.
- `--yolo` (flag on `onfable` and `onfable run`) skips all approvals.

## Tools

### `run_command`
Runs a shell command (`/bin/sh -c` on macOS/Linux, `cmd.exe /c` on Windows) in your current working directory.
Limits: 60-second timeout, output truncated at 16,000 characters, exit codes and timeouts reported to the model.

### `read_file`
Reads a text file (up to 50,000 characters per call; the model can page with `offset`).

### `write_file`
Creates or overwrites a file, creating parent directories as needed. The approval prompt shows the path, size, and the first lines of content.

### `edit_file`
Exact string replacement. `old_string` must be unique in the file — ambiguous or missing matches return an error instead of guessing. The approval prompt shows a before/after snippet.

### `list_dir`
Lists directory entries (directories marked with a trailing `/`).

### `web_fetch`
Fetches a URL (15-second timeout), strips HTML to readable text, caps at 20,000 characters.

### `web_search`
Searches DuckDuckGo's HTML endpoint and returns up to 5 results as title/url/snippet. No API key required. Best-effort: if parsing fails, the agent is told to fall back to `web_fetch`.

### `memory_save`
Appends a dated bullet to `~/.onfable/memory.md`. The newest ~4,000 characters of that file are injected into the agent's system prompt every session — this is how it "remembers you".

### `memory_recall`
Reads the full memory file, optionally filtered by substring, for memories older than the injected window.

## Adding your own tool

Implement the `Tool` interface in `packages/cli/src/tools/` (name, description, JSON Schema, `needsApproval`, `summarize`, `execute`) and register it in `tools/index.ts`. Set `needsApproval: true` for anything that mutates state outside `~/.onfable`. See [CONTRIBUTING.md](../CONTRIBUTING.md).
