# onfable

The open-source autonomous AI agent that lives in your terminal — it runs commands, edits files, browses the web, and remembers you.

```sh
npm install -g onfable
onfable setup   # pick a provider (Anthropic, OpenAI, OpenRouter, custom), paste your key
onfable         # start chatting
```

One-shot tasks:

```sh
onfable run "organize my downloads folder by file type"
```

- Works with **any model**: Claude (default), OpenAI, OpenRouter, or any OpenAI-compatible endpoint
- **Runs 100% locally** — your keys and data stay in `~/.onfable/` on your machine
- **Guardrails by default** — every shell command and file write asks for your approval (`--yolo` to skip)
- **Persistent memory** — it remembers your preferences across sessions

Full docs, install scripts for macOS/Linux/Windows, and source:

- Website: [onfable.xyz](https://onfable.xyz)
- GitHub: [github.com/onfable/onfable](https://github.com/onfable/onfable)

MIT licensed.
