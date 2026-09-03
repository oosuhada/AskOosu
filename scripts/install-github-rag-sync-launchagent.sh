#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_PLIST="$ROOT_DIR/ops/launchd/dev.oosu.askoosu-github-rag-sync.plist"
TARGET_PLIST="$HOME/Library/LaunchAgents/dev.oosu.askoosu-github-rag-sync.plist"
LABEL="dev.oosu.askoosu-github-rag-sync"
DOMAIN="gui/$(id -u)"

mkdir -p "$HOME/Library/LaunchAgents" "$ROOT_DIR/logs"
plutil -lint "$SOURCE_PLIST" >/dev/null
cp "$SOURCE_PLIST" "$TARGET_PLIST"
chmod +x "$ROOT_DIR/scripts/prod-github-rag-sync.sh"

launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
launchctl bootstrap "$DOMAIN" "$TARGET_PLIST"
launchctl enable "$DOMAIN/$LABEL"

echo "Installed $LABEL with a daily check interval (full refresh on change or after seven unchanged days)."
