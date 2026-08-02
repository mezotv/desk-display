# Desk Display

Desk Display is a full-screen, touch-friendly Raspberry Pi dashboard with a deliberately pixelated visual style. It currently includes Stripe MRR/ARR, Spotify now playing and playback control, dynamic weather, Google Calendar, a clock, multiple alarms, a marquee mode, settings, and Raspberry Pi system status.

The app is built with React, TanStack Start, Effect, and Tailwind CSS v4. The interface is utility-first end to end: `src/styles.css` only defines the shared Tailwind theme, browser reset, scrollbar utility, and global keyframes. It is designed for kiosk use on a small HDMI or DSI touchscreen, but it also adapts to phones and larger desktop browsers.

## What you need

- Raspberry Pi 4 or newer; 2 GB RAM is comfortable for Chromium kiosk mode
- Raspberry Pi OS with a desktop session
- A touchscreen or monitor
- A reliable 5 V / 3 A USB-C power supply
- Network access over Wi-Fi or Ethernet

## Local setup

```sh
npm install
cp .env.example .env
npm run dev
```

Open `http://127.0.0.1:3000`. `npm install` also prepares a read-only Effect source checkout in `.repos/effect` and installs the official Effect coding-agent skills locally under `.agents/skills`.

## Configuration

All secrets stay in `.env`, which is ignored by Git. Start from `.env.example`.

### Stripe

Set `STRIPE_SECRET_KEY` to a restricted key with read access to subscriptions and prices. The app calculates normalized recurring revenue from active subscriptions; it does not display one-time revenue.

### Weather

Weather uses Open-Meteo and does not require an API key. Set `WEATHER_LATITUDE`, `WEATHER_LONGITUDE`, and `WEATHER_LOCATION_LABEL`. The public fallback is Berlin so a personal location is never baked into the repository.

### Spotify

Create a Spotify application, set its redirect URI to:

```text
http://127.0.0.1:3000/api/spotify/callback
```

Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`, then tap Spotify on the display to authorize. The requested scopes are `user-read-currently-playing` and `user-modify-playback-state`.

### Google Calendar

Create a Google OAuth web client, enable the Google Calendar API, and set its redirect URI to:

```text
http://127.0.0.1:3000/api/google-calendar/callback
```

Add `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET`, then tap Calendar to authorize. Desk Display requests read-only event access.

## OLED protection

Pixel shifting is enabled by default. The entire rendered frame moves through a subtle 2-pixel pattern once per minute, completing a cycle every eight minutes. This is useful for OLED burn-in mitigation and is visually harmless on an LCD. It can be disabled in Settings.

Display technology cannot be detected reliably from a browser or from most HDMI/DSI identification data, so the feature is explicit and default-on instead of pretending to auto-detect OLED.

## Night mode

Night mode is enabled by default from 21:00 until 08:00 in the device's local time zone. It dims the entire rendered interface to 42% brightness and can be toggled or adjusted in 15-minute steps from the touch settings screen. A ringing alarm temporarily returns to full brightness.

This visual dimmer is independent of the optional systemd backlight schedule in `deploy/`. When both are enabled, Night Mode dims the evening interface and the backlight schedule can still turn the panel completely off overnight.

## Raspberry Pi deployment

The files in `deploy/` provide a systemd service, Chromium kiosk launcher, and optional overnight backlight schedule. They assume the app lives at `/home/display/desk-display` and runs as the `display` user.

Build before copying the app:

```sh
npm run build
```

Install `deploy/desk-display.service` as `/etc/systemd/system/desk-display.service`, install `deploy/desk-display-kiosk.sh` as `/home/display/.local/bin/desk-display-kiosk`, and add `deploy/desk-display.desktop` to the desktop session's autostart directory.

## Reliability model

External integrations use Effect for typed errors, schema validation, request timeouts, bounded exponential retry with jitter, structured logging, and a single managed server runtime. OAuth access tokens are cached until shortly before expiry. The UI keeps the last good snapshot when a background refresh fails.

## License

A license has not been selected yet. Choose one before publishing the repository publicly.
