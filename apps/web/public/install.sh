#!/bin/sh
# onfable installer — macOS & Linux
# Usage: curl -fsSL https://onfable.xyz/install.sh | sh
set -eu

# Colors (only when stdout is a terminal)
if [ -t 1 ]; then
  BOLD="$(printf '\033[1m')"
  DIM="$(printf '\033[2m')"
  RED="$(printf '\033[31m')"
  GREEN="$(printf '\033[32m')"
  YELLOW="$(printf '\033[33m')"
  RESET="$(printf '\033[0m')"
else
  BOLD=""; DIM=""; RED=""; GREEN=""; YELLOW=""; RESET=""
fi

info()  { printf '%s\n' "${DIM}$1${RESET}"; }
ok()    { printf '%s\n' "${GREEN}✓${RESET} $1"; }
warn()  { printf '%s\n' "${YELLOW}!${RESET} $1"; }
fail()  { printf '%s\n' "${RED}✖ $1${RESET}" >&2; exit 1; }

printf '%s\n' ""
printf '%s\n' "  ${BOLD}✳ onfable${RESET}"
printf '%s\n' "  ${DIM}the agent that lives in your terminal${RESET}"
printf '%s\n' ""

# --- 1. Check Node.js >= 20 -------------------------------------------------
NODE_MIN=20
if ! command -v node >/dev/null 2>&1; then
  warn "Node.js is not installed (onfable needs Node ${NODE_MIN}+)."
  OS="$(uname -s)"
  case "$OS" in
    Darwin)
      info "Install it with Homebrew, then re-run this script:"
      info "  brew install node"
      ;;
    Linux)
      info "Install it with your package manager or fnm, then re-run this script:"
      info "  # Debian/Ubuntu:  sudo apt-get install -y nodejs npm"
      info "  # Fedora:         sudo dnf install -y nodejs npm"
      info "  # any distro:     curl -fsSL https://fnm.vercel.app/install | bash && fnm install --lts"
      ;;
    *)
      info "Install Node ${NODE_MIN}+ from https://nodejs.org and re-run this script."
      ;;
  esac
  fail "Node.js ${NODE_MIN}+ required."
fi

NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
if [ "$NODE_MAJOR" -lt "$NODE_MIN" ]; then
  fail "Node.js ${NODE_MIN}+ required (found $(node -v)). Please upgrade and re-run."
fi
ok "Node $(node -v) detected"

# --- 2. Install the package --------------------------------------------------
info "Installing onfable via npm…"
if npm install -g onfable >/dev/null 2>&1; then
  ok "onfable installed"
else
  warn "Global npm install failed (likely a permissions issue)."
  info "Fix npm's global prefix (no sudo needed), then re-run:"
  info "  mkdir -p ~/.npm-global"
  info "  npm config set prefix ~/.npm-global"
  info "  export PATH=\"\$HOME/.npm-global/bin:\$PATH\"   # add to your shell profile"
  fail "Could not install onfable."
fi

# --- 3. Verify it's on PATH --------------------------------------------------
if command -v onfable >/dev/null 2>&1; then
  ok "onfable $(onfable --version) is on your PATH"
else
  NPM_BIN="$(npm prefix -g 2>/dev/null)/bin"
  warn "Installed, but '${NPM_BIN}' isn't on your PATH."
  info "Add this to your shell profile (~/.bashrc, ~/.zshrc):"
  info "  export PATH=\"${NPM_BIN}:\$PATH\""
fi

printf '%s\n' ""
printf '%s\n' "  ${BOLD}Next:${RESET} run ${GREEN}onfable setup${RESET} to pick a provider and add your API key."
printf '%s\n' "  ${DIM}Docs: https://onfable.xyz${RESET}"
printf '%s\n' ""
