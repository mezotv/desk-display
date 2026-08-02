#!/bin/sh
set -eu

repository_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

sudo install -o root -g root -m 644 \
  "$repository_root/deploy/desk-display-update.service" \
  /etc/systemd/system/desk-display-update.service
sudo install -o root -g root -m 644 \
  "$repository_root/deploy/desk-display-update.timer" \
  /etc/systemd/system/desk-display-update.timer
sudo systemctl daemon-reload
sudo systemctl enable --now desk-display-update.timer

systemctl list-timers desk-display-update.timer --all --no-pager
