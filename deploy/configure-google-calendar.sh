#!/bin/sh

set -eu

ENVIRONMENT_FILE="${GOOGLE_CALENDAR_ENV_FILE:-/home/display/desk-display/.env}"

printf 'Google OAuth Client ID: '
IFS= read -r client_id
printf 'Google OAuth Client Secret: '
trap 'stty echo' EXIT INT TERM
stty -echo
IFS= read -r client_secret
stty echo
trap - EXIT INT TERM
printf '\n'

if [ -z "$client_id" ] || [ -z "$client_secret" ]; then
  printf 'Both values are required. Nothing changed.\n' >&2
  exit 1
fi

sed -i '/^GOOGLE_CALENDAR_CLIENT_ID=/d; /^GOOGLE_CALENDAR_CLIENT_SECRET=/d; /^GOOGLE_CALENDAR_REFRESH_TOKEN=/d' "$ENVIRONMENT_FILE"
printf '%s\n' \
  "GOOGLE_CALENDAR_CLIENT_ID=$client_id" \
  "GOOGLE_CALENDAR_CLIENT_SECRET=$client_secret" >> "$ENVIRONMENT_FILE"
chmod 600 "$ENVIRONMENT_FILE"
sudo -n systemctl restart desk-display

printf '\nSaved. Open Calendar on the display and tap once to connect.\n'
