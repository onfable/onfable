# Security Policy

## Supported versions

Only the latest published version of `onfable` receives security fixes. Always update before reporting:

```sh
npm install -g onfable@latest
```

## Reporting a vulnerability

Please **do not open a public issue** for security vulnerabilities.

Instead, report privately via [GitHub Security Advisories](https://github.com/onfable/onfable/security/advisories/new). Include:

- A description of the vulnerability and its impact
- Steps to reproduce
- Your environment (OS, Node version, onfable version)

You'll get an acknowledgement within a few days. Once a fix ships, we'll credit you in the release notes (unless you prefer otherwise).

## Scope notes

- onfable executes shell commands and edits files **by design**, gated behind user approval. "The agent can run commands when the user approves them" is expected behavior, not a vulnerability. Bypassing the approval gate without `--yolo` **is** a vulnerability.
- API keys are stored in `~/.onfable/config.json` with mode `0600`. Anything that causes the key to be written elsewhere, logged, or sent to a host other than the configured provider is a vulnerability.
- Prompt-injection hardening (e.g. a fetched web page steering the agent into destructive actions) is an active area of improvement — reports with concrete reproduction are very welcome.
