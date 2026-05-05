#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ASKOOSU_ENV_FILE:-$ROOT_DIR/.env.production}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

BASE_URL="${ASKOOSU_BASE_URL:-https://oosu.dev}"

cd "$ROOT_DIR"
corepack pnpm rag:eval -- --base-url "$BASE_URL" "$@"
