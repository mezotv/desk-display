#!/bin/sh

set -eu

BACKLIGHT_DIRECTORY='/sys/class/backlight/10-0045'
WAKE_HOUR=8

if [ ! -d "$BACKLIGHT_DIRECTORY" ]; then
  echo "Backlight device not found: $BACKLIGHT_DIRECTORY" >&2
  exit 1
fi

current_hour=$(date +%-H)

if [ "$current_hour" -lt "$WAKE_HOUR" ]; then
  target_brightness=0
else
  target_brightness=$(cat "$BACKLIGHT_DIRECTORY/max_brightness")
fi

printf '%s\n' "$target_brightness" > "$BACKLIGHT_DIRECTORY/brightness"

