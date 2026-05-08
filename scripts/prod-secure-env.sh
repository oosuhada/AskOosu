#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_SERVICE_DIR="/Users/gabrieljang/Services/askoosu-orbstack"

resolve_env_file() {
  if [[ -n "${ASKOOSU_ENV_FILE:-}" ]]; then
    printf '%s\n' "$ASKOOSU_ENV_FILE"
    return
  fi

  if [[ -f "$ROOT_DIR/.env.production" ]]; then
    printf '%s\n' "$ROOT_DIR/.env.production"
    return
  fi

  if [[ -f "$DEFAULT_SERVICE_DIR/.env.production" ]]; then
    printf '%s\n' "$DEFAULT_SERVICE_DIR/.env.production"
    return
  fi

  printf '%s\n' "$ROOT_DIR/.env.production"
}

ENV_FILE="$(resolve_env_file)"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "No .env.production file found."
  echo "Set ASKOOSU_ENV_FILE or create one in the repo root or $DEFAULT_SERVICE_DIR."
  if [[ -n "${ASKOOSU_ENV_FILE:-}" ]]; then
    exit 1
  fi
  exit 0
fi

chmod 600 "$ENV_FILE"
echo "Secured AskOosu production env file permissions: $ENV_FILE (mode 600)."
