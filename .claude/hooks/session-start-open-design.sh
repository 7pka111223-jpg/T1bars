#!/bin/bash
# Ensures the Open Design `od` daemon is built, on PATH, registered as an MCP
# server, and running for the open-design@open-design plugin (see
# .claude/settings.json). The daemon has no npm package (private monorepo)
# and its hosted installer at open-design.ai is blocked by this sandbox's
# egress policy, so it's built from source and cached under ~/.cache.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

CACHE_DIR="${HOME}/.cache/open-design"
REPO_DIR="$CACHE_DIR/open-design"
BIN_DIR="/usr/local/bin"
DAEMON_LOG="$CACHE_DIR/daemon.log"
DAEMON_PORT=7456

mkdir -p "$CACHE_DIR"

DAEMON_ENTRY="$REPO_DIR/apps/daemon/bin/od.mjs"

if [ ! -f "$DAEMON_ENTRY" ]; then
  if [ -d "$REPO_DIR/.git" ]; then
    rm -rf "$REPO_DIR"
  fi
  git clone --depth 1 https://github.com/nexu-io/open-design.git "$REPO_DIR"
  # Scope to the daemon package: the sibling desktop app pulls Electron,
  # whose binary download is blocked by this sandbox's egress policy.
  (cd "$REPO_DIR" && pnpm install --frozen-lockfile --filter @open-design/daemon...)
fi

chmod +x "$DAEMON_ENTRY"

# /usr/bin/od is the unrelated Unix octal-dump tool; /usr/local/bin wins on PATH.
if [ "$(readlink -f "$BIN_DIR/od" 2>/dev/null || true)" != "$(readlink -f "$DAEMON_ENTRY")" ]; then
  ln -sf "$DAEMON_ENTRY" "$BIN_DIR/od"
fi

od mcp install claude >/dev/null 2>&1 || true

if ! curl -s "http://127.0.0.1:${DAEMON_PORT}/api/health" 2>/dev/null | grep -q '"ok":true'; then
  nohup od --no-open --port "$DAEMON_PORT" > "$DAEMON_LOG" 2>&1 &
  disown
  for _ in $(seq 1 20); do
    sleep 0.5
    curl -s "http://127.0.0.1:${DAEMON_PORT}/api/health" 2>/dev/null | grep -q '"ok":true' && break
  done
fi
