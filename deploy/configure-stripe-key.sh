#!/usr/bin/env bash

set -euo pipefail

app_directory="${1:-/home/display/desk-display}"
environment_file="${app_directory}/.env"

if [[ ! -d "${app_directory}" ]]; then
  echo "Dashboard directory not found: ${app_directory}" >&2
  exit 1
fi

read -r -s -p "Paste your Stripe restricted key, then press Enter: " stripe_key
printf '\n'

if [[ "${stripe_key}" != rk_* && "${stripe_key}" != sk_* ]]; then
  echo "That does not look like a Stripe server key (expected rk_… or sk_…)." >&2
  unset stripe_key
  exit 1
fi

umask 077
printf 'STRIPE_SECRET_KEY=%s\n' "${stripe_key}" > "${environment_file}"
unset stripe_key
chmod 600 "${environment_file}"

echo "Stripe key saved to ${environment_file} with owner-only permissions."
