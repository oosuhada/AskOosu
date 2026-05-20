#!/bin/zsh
set -euo pipefail

SERVICE_DIR="${ASKOOSU_SERVICE_DIR:-/Users/gabrieljang/Services/askoosu-orbstack}"
SECRETS_FILE="${ASKOOSU_REPORT_SECRETS:-/Users/gabrieljang/Secrets/askoosu/weekly-report.env}"
REPORTER="$SERVICE_DIR/scripts/weekly-analytics-report.py"

if [[ -f "$SECRETS_FILE" ]]; then
  set -a
  source "$SECRETS_FILE"
  set +a
fi

export ASKOOSU_SERVICE_DIR="$SERVICE_DIR"
export DOCKER_BIN="${DOCKER_BIN:-/Applications/OrbStack.app/Contents/MacOS/xbin/docker}"
export ASKOOSU_REPORT_TO="${ASKOOSU_REPORT_TO:-oosuhada@oosu.dev}"

exec /usr/bin/python3 "$REPORTER" "$@"
