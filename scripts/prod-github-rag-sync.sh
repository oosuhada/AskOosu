#!/usr/bin/env bash
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ASKOOSU_ENV_FILE:-$ROOT_DIR/.env.production}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

BASE_URL="${ASKOOSU_BASE_URL:-https://oosu.dev}"
TOKEN="${RAG_SYNC_SECRET:-${ASKOOSU_RAG_ADMIN_TOKEN:-}}"

if [[ -z "$TOKEN" ]]; then
  echo "RAG_SYNC_SECRET or ASKOOSU_RAG_ADMIN_TOKEN is required." >&2
  exit 1
fi

curl -fsS \
  -X POST "$BASE_URL/api/rag/github-sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo
