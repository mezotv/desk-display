#!/bin/sh

DASHBOARD_URL='http://127.0.0.1:3000'
DASHBOARD_HEALTH_URL="$DASHBOARD_URL/logos/system-pixel.svg"

# Keep the panel awake while the dashboard is running. This is harmless when
# the session does not expose the X11 power-management extension.
xset s off
xset s noblank
xset -dpms

while true; do
  until curl --fail --silent --max-time 5 "$DASHBOARD_HEALTH_URL" >/dev/null; do
    sleep 1
  done

  chromium \
    --ozone-platform=wayland \
    --kiosk \
    --no-first-run \
    --password-store=basic \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --autoplay-policy=no-user-gesture-required \
    --disable-features=Translate \
    "$DASHBOARD_URL"

  sleep 2
done

