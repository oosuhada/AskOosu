#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_CONF="${SOURCE_CONF:-$ROOT_DIR/ops/nginx/oosu.dev.conf}"
TARGET_CONF="${TARGET_CONF:-/opt/homebrew/etc/nginx/servers/oosu.dev.conf}"
BACKUP_DIR="${BACKUP_DIR:-/opt/homebrew/etc/nginx/servers/backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"

if [[ ! -f "$SOURCE_CONF" ]]; then
  echo "Nginx source config not found: $SOURCE_CONF" >&2
  exit 1
fi

sudo mkdir -p "$BACKUP_DIR"

if [[ -f "$TARGET_CONF" ]]; then
  sudo cp "$TARGET_CONF" "$BACKUP_DIR/oosu.dev.conf.$STAMP.bak"
  echo "Backed up existing config to $BACKUP_DIR/oosu.dev.conf.$STAMP.bak"
fi

sudo cp "$SOURCE_CONF" "$TARGET_CONF"

if nginx -t; then
  brew services restart nginx
  echo "Nginx config installed and service restarted."
else
  echo "nginx -t failed. Restore the backup before restarting nginx." >&2
  exit 1
fi
