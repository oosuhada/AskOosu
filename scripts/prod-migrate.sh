#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/ops/orbstack/compose.prod.yml}"
ENV_FILE="${ASKOOSU_ENV_FILE:-$ROOT_DIR/.env.production}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-$ROOT_DIR/db/migrations}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${POSTGRES_USER:-}" || -z "${POSTGRES_DB:-}" ]]; then
  echo "POSTGRES_USER and POSTGRES_DB are required in the environment." >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "Migrations directory not found: $MIGRATIONS_DIR" >&2
  exit 1
fi

echo "Applying AskOosu migrations with $COMPOSE_FILE"

for migration in "$MIGRATIONS_DIR"/*.sql; do
  [[ -e "$migration" ]] || continue
  echo "Applying $(basename "$migration")"
  docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_SERVICE" \
    psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    < "$migration"
done

echo "Migrations complete."
