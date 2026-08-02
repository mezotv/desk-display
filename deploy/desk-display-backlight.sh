#!/bin/sh

set -eu

BACKLIGHT_DIRECTORY='/sys/class/backlight/10-0045'

if [ ! -d "$BACKLIGHT_DIRECTORY" ]; then
  echo "Backlight device not found: $BACKLIGHT_DIRECTORY" >&2
  exit 1
fi

case "${1:-}" in
  off)
    target_brightness=0
    ;;
  on)
    target_brightness=$(cat "$BACKLIGHT_DIRECTORY/max_brightness")
    ;;
  *)
    echo 'Usage: desk-display-backlight on|off' >&2
    exit 2
    ;;
esac

printf '%s\n' "$target_brightness" > "$BACKLIGHT_DIRECTORY/brightness"
