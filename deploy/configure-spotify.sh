#!/bin/sh

set -eu

ENVIRONMENT_FILE="${SPOTIFY_ENV_FILE:-/home/display/desk-display/.env}"

printf 'Spotify Client ID: '
IFS= read -r client_id
printf 'Spotify Client Secret: '
stty -echo
IFS= read -r client_secret
stty echo
printf '\n'

if [ -z "$client_id" ] || [ -z "$client_secret" ]; then
  printf 'Both values are required. Nothing changed.\n' >&2
  exit 1
fi

sed -i '/^SPOTIFY_CLIENT_ID=/d; /^SPOTIFY_CLIENT_SECRET=/d; /^SPOTIFY_REFRESH_TOKEN=/d' "$ENVIRONMENT_FILE"
printf '%s\n' \
  "SPOTIFY_CLIENT_ID=$client_id" \
  "SPOTIFY_CLIENT_SECRET=$client_secret" >> "$ENVIRONMENT_FILE"
chmod 600 "$ENVIRONMENT_FILE"
sudo -n systemctl restart desk-display

printf '\nSaved. Open Spotify on the display and tap once to connect.\n'
