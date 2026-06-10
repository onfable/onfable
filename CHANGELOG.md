# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-06-10

### Added

- Initial release of the `onfable` CLI agent
  - Interactive REPL (`onfable`) with `/new`, `/memory`, `/exit` slash commands
  - Onboarding wizard (`onfable setup`) for Anthropic, OpenAI, OpenRouter, and custom OpenAI-compatible endpoints
  - One-shot mode (`onfable run "task"`) with `--yolo` for unattended use
  - `onfable config` to inspect the redacted local configuration
- Nine built-in tools: `run_command`, `read_file`, `write_file`, `edit_file`, `list_dir`, `web_fetch`, `web_search`, `memory_save`, `memory_recall`
- Approval-first execution for shell commands and file mutations
- Persistent memory in `~/.onfable/memory.md`, injected into the system prompt
- Session history saved to `~/.onfable/history/`
- onfable.xyz website with one-line installers for macOS/Linux (`install.sh`) and Windows (`install.ps1`)
- CI (typecheck, build, smoke test) and npm release workflow

[Unreleased]: https://github.com/onfable/onfable/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/onfable/onfable/releases/tag/v0.1.0
