#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="${CLOUDFLARED_CONFIG:-$HOME/.cloudflared/config.yml}"
STAMP="$(date +%Y%m%d-%H%M%S)"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "cloudflared config not found: $CONFIG_FILE" >&2
  exit 1
fi

BACKUP_FILE="$CONFIG_FILE.$STAMP.bak"
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "Backed up cloudflared config to $BACKUP_FILE"

if grep -Eq 'hostname:[[:space:]]*oosu\.dev' "$CONFIG_FILE"; then
  echo "oosu.dev ingress already exists in $CONFIG_FILE"
  exit 0
fi

cat <<'EOF'
oosu.dev ingress was not found.

Add the DNS route and append this ingress entry above the final catch-all rule:

  cloudflared tunnel route dns macmini oosu.dev

  - hostname: oosu.dev
    service: http://localhost:8080

Then restart the LaunchAgent:

  launchctl kickstart -k gui/$(id -u)/com.cloudflare.cloudflared
EOF
