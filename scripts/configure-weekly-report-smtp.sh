#!/bin/zsh
set -euo pipefail

SECRETS_DIR="/Users/gabrieljang/Secrets/askoosu"
SECRETS_FILE="$SECRETS_DIR/weekly-report.env"
REPORT_RUNNER="/Users/gabrieljang/Services/askoosu-orbstack/scripts/run-weekly-analytics-report.sh"
DEFAULT_USER="oosu.salon@gmail.com"

echo "Google app password: https://myaccount.google.com/apppasswords"
printf "SMTP Gmail account [%s]: " "$DEFAULT_USER"
IFS= read -r smtp_user
smtp_user="${smtp_user:-$DEFAULT_USER}"

printf "16-character Google app password (input hidden): "
IFS= read -rs smtp_password
echo
smtp_password="${smtp_password// /}"

if [[ -z "$smtp_user" || -z "$smtp_password" ]]; then
  echo "SMTP account and app password are required." >&2
  exit 1
fi

mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"
umask 077
cat > "$SECRETS_FILE" <<EOF
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$smtp_user
SMTP_PASSWORD=$smtp_password
ASKOOSU_REPORT_FROM=$smtp_user
ASKOOSU_REPORT_TO=oosuhada@oosu.dev
EOF
chmod 600 "$SECRETS_FILE"

echo "Sending one verification report to oosuhada@oosu.dev..."
if "$REPORT_RUNNER"; then
  echo "Verification report sent successfully. Weekly Monday 09:00 KST delivery is enabled."
else
  echo "Verification send failed. Check the app password and rerun this script." >&2
  exit 1
fi
