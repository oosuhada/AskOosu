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
TOKEN="${RAG_SYNC_SECRET:-${ASKOOSU_RAG_ADMIN_TOKEN:-}}"

if [[ -z "$TOKEN" ]]; then
  echo "RAG_SYNC_SECRET or ASKOOSU_RAG_ADMIN_TOKEN is required." >&2
  exit 1
fi

RESPONSE_FILE="$(mktemp)"
trap 'rm -f "$RESPONSE_FILE"' EXIT

HTTP_STATUS="$(
  curl -sS -o "$RESPONSE_FILE" -w "%{http_code}" \
    -X POST "$BASE_URL/api/rag/sync" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json"
)"

SYNC_RESPONSE_FILE="$RESPONSE_FILE" SYNC_HTTP_STATUS="$HTTP_STATUS" node <<'NODE'
const fs = require('node:fs');

const file = process.env.SYNC_RESPONSE_FILE;
const status = Number(process.env.SYNC_HTTP_STATUS || 0);
const raw = fs.readFileSync(file, 'utf8');
let payload;

try {
  payload = JSON.parse(raw);
} catch {
  console.error(`RAG sync returned non-JSON response (HTTP ${status}).`);
  console.error(raw.slice(0, 1000));
  process.exit(1);
}

const rows = [
  ['httpStatus', status],
  ['ok', payload.ok],
  ['sourceId', payload.sourceId ?? ''],
  ['syncRunId', payload.syncRunId ?? ''],
  ['blockCount', payload.blockCount ?? 0],
  ['chunkCount', payload.chunkCount ?? 0],
  ['inserted', payload.inserted ?? 0],
  ['updated', payload.updated ?? 0],
  ['deleted', payload.deleted ?? 0],
  ['skipped', payload.skipped ?? 0],
  ['answerCacheInvalidated', payload.answerCacheInvalidated ?? 0],
  ['cacheInvalidationMode', payload.cacheInvalidation?.mode ?? ''],
  ['cacheInvalidationReason', payload.cacheInvalidation?.reason ?? ''],
];

for (const [key, value] of rows) {
  console.log(`${key}: ${value}`);
}

const warnings = Array.isArray(payload.warnings) ? payload.warnings : [];
if (warnings.length > 0) {
  console.log('warnings:');
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
} else {
  console.log('warnings: none');
}

if (status < 200 || status >= 300 || payload.ok !== true) {
  if (payload.error) {
    console.error(`error: ${payload.error}`);
  }
  process.exit(1);
}
NODE
