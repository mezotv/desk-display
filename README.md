# Desk Display

Desk Display is a full-screen, touch-friendly Raspberry Pi dashboard with a deliberately pixelated visual style. It combines live business and media integrations with practical local-first tools and ambient information screens.

The app is built with React, TanStack Start, Effect, and Tailwind CSS v4. The interface is utility-first end to end: `src/styles.css` only defines the shared Tailwind theme, browser reset, scrollbar utility, and global keyframes. It is designed for kiosk use on a small HDMI or DSI touchscreen, but it also adapts to phones and larger desktop browsers.

## Built-in apps

- Stripe MRR/ARR with normalized recurring revenue
- Spotify now playing, progress, and play/pause control
- Current weather and real local sunrise/sunset data
- Google Calendar with upcoming events
- Read-only X profile and touch-cycled 30-day analytics
- Touch-cycled Codex and Claude limits, reset countdowns, and seven-day token charts while a paired Mac is awake
- Seven-day API-equivalent AI cost estimates by model, input, output, cache read, and cache write
- Clock, world clock, alarms, countdown timer, stopwatch, and persistent Pomodoro sessions
- Touch-first Tic-Tac-Toe, Pong, and multi-hit Brick Breaker games
- Moon phase with dynamically rendered pixel illumination
- Day, week, month, and year progress
- Raspberry Pi temperature, uptime, CPU, memory, and network status
- Physical display sleep with one-tap touchscreen wake
- A dynamic slider that includes connected integrations and useful active local apps
- Touch settings, stable release updates, German and English UI, Night Mode, and OLED pixel shifting

Timer, stopwatch, navigation, alarm, and display-setting state is stored locally in the kiosk browser. It survives application and Pi restarts without sending personal content to another service.

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

### X

Create an app in the [X Developer Console](https://console.x.com/), give it read-only access, and add its generated bearer token plus the account name without `@`:

```text
X_USERNAME=example
X_BEARER_TOKEN=replace_me
```

The X app is hidden until both values are configured. It cycles through the account's follower count, impressions on posts published in the last 30 days, engagement rate and totals, and a daily post-impression chart. Single-tap anywhere to move between analytics screens; double-tap to return to the launcher.

The current bearer-token integration uses public metrics from original posts, excluding replies and reposts. Its 30-day impression figure is therefore the sum of current impressions on original posts published during that window, not X's private historical account-impression series. The chart groups those impressions by each post's publication date.

Desk Display requests at most 100 authored posts and caches X responses on the server for six hours, limiting automatic upstream refreshes to four per day. X bills reads per returned resource and normally deduplicates the same resource within a UTC day. Set a small monthly spending limit in the X Developer Console and consult [current X API pricing](https://docs.x.com/x-api/getting-started/pricing) before enabling the integration.

### Codex and Claude usage

The separate Codex and Claude apps read usage from a small authenticated bridge running on your Mac. This is necessary because personal subscription limits live with their signed-in desktop CLIs, not on the Raspberry Pi. When a provider rejects a refresh, the Mac sleeps, or it leaves the network, Desk Display preserves the last successful provider snapshot and labels it **Last good data** instead of blanking the screen.

The bridge uses the [official Codex app server](https://learn.chatgpt.com/docs/app-server.md) `account/rateLimits/read` and `account/usage/read` methods. For Claude it runs the [documented Claude Code `/usage` command](https://support.claude.com/en/articles/14553413-claude-code-cheatsheet) with tools disabled and a near-zero budget. Seven-day token and cost data is derived from local Codex and Claude session records; Claude messages are deduplicated by message ID. Prompt and response fields are never extracted, logged, or sent to the Pi. The bridge transmits only model names, numeric token categories, percentages, reset timestamps, and dates.

The AI Cost app estimates what the same local token mix would cost at standard API list prices. It is deliberately labeled **API equivalent** and **not your subscription bill**: Codex and Claude subscription usage is not an API invoice. Unknown models stay unpriced rather than inheriting a guessed rate. Prices were last reviewed on 2026-08-05 against [OpenAI's official model pricing](https://developers.openai.com/api/docs/models/compare) and [Anthropic's official pricing table](https://platform.claude.com/docs/en/about-claude/pricing).

Build and test the bridge on the Mac first:

```sh
npm install
npm run build
DESK_DISPLAY_BRIDGE_TOKEN="$(openssl rand -hex 32)" \
DESK_DISPLAY_BRIDGE_HOST=127.0.0.1 \
npm run bridge
```

Once the local test looks right, install it as a macOS LaunchAgent so it starts when you log in:

```sh
./scripts/install-agent-usage-bridge-macos.sh
```

The installer copies the compiled bridge and creates a private bearer token under `~/Library/Application Support/Desk Display`. It does not copy Codex or Claude credentials. Find the Mac's LAN address in **System Settings → Wi-Fi → Details → TCP/IP**, then add these two values to the Pi's owner-only `.env` file:

```text
AGENT_USAGE_BRIDGE_URL=http://192.168.1.23:4747
AGENT_USAGE_BRIDGE_TOKEN=copy_the_contents_of_the_generated_token_file
```

Keep the Mac and Pi on a trusted home network, leave the bearer token file and Pi `.env` readable only by their owners, and reserve the Mac's LAN address in your router so it does not change. The bridge caches expensive local collection for four minutes. Desk Display refreshes it once every five minutes while a usage or cost app is visible and once every 30 minutes in the background; it does not continuously poll either CLI.

## OLED protection

Pixel shifting is enabled by default. The entire rendered frame moves through a subtle 2-pixel pattern once per minute, completing a cycle every eight minutes. This is useful for OLED burn-in mitigation and is visually harmless on an LCD. It can be disabled in Settings.

Display technology cannot be detected reliably from a browser or from most HDMI/DSI identification data, so the feature is explicit and default-on instead of pretending to auto-detect OLED.

## Night mode

Night mode is enabled by default from 21:00 until 08:00 in the device's local time zone. It dims the entire rendered interface to 42% brightness and can be toggled or adjusted in 15-minute steps from the touch settings screen. A ringing alarm temporarily returns to full brightness.

This visual dimmer is independent of the optional systemd backlight schedule in `deploy/`. When both are enabled, Night Mode dims the evening interface and the backlight schedule can still turn the panel completely off overnight.

## Physical display power

The Display app turns off the physical panel or backlight while leaving the Raspberry Pi, server, integrations, alarms, and timers running. The touchscreen remains active; one tap anywhere on the dark panel restores it. A due alarm or finished countdown timer also wakes the display automatically.

Desk Display first tries a writable Linux backlight device, then the fixed privileged helper documented below, and finally the Wayland `wlopm` and `wlr-randr` output-power commands. It only shows the touch-to-wake layer after a hardware command succeeds; it never substitutes a black webpage for hardware power control. Set `DESK_DISPLAY_BACKLIGHT_DIRECTORY` in `.env` if the device is not `/sys/class/backlight/10-0045`. If the Pi has multiple displays, set `DESK_DISPLAY_OUTPUT_NAME` to the output reported by `wlr-randr`, such as `DSI-2`.

## Raspberry Pi deployment

The files in `deploy/` provide a production systemd service, Chromium kiosk launcher, and an optional midnight-to-08:00 physical backlight schedule. This guide deliberately uses a non-root `display` account, keeps the web server bound to localhost, and stores API credentials in an owner-only file.

The supplied service files assume all of the following:

- The Linux username is `display`.
- Desk Display is installed at `/home/display/desk-display`.
- Node.js is installed system-wide at `/usr/bin/node`.
- Raspberry Pi OS starts a desktop session automatically for `display`.

If you use a different username or path, update all occurrences in `deploy/desk-display.service`, `deploy/desk-display.desktop`, and the configuration helpers before installing them.

### 1. Prepare Raspberry Pi OS

Use 64-bit Raspberry Pi OS with Desktop. In Raspberry Pi Imager, create the `display` user, choose a strong password, configure Wi-Fi if needed, and enable SSH with a public key when possible. After the first boot:

```sh
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y chromium curl x11-xserver-utils
sudo raspi-config
```

In `raspi-config`, enable **Desktop Autologin** for the `display` user. Set the correct local timezone as well; both the in-app night mode and the physical backlight timer use the Pi's local clock.

This project requires Node.js 22.12 or newer. Install a current system-wide Node.js release, then verify both the version and path before continuing:

```sh
node --version
command -v node
npm --version
```

`command -v node` must print `/usr/bin/node` for the supplied systemd service. If it does not, either install Node system-wide or update `ExecStart` in `deploy/desk-display.service` to the absolute path printed on your Pi.

### 2. Install the latest release without Git

Run these commands as the `display` user, not as root:

```sh
install_root=/home/display/desk-display
release_temp="$(mktemp -d)"
trap 'rm -rf "$release_temp"' EXIT HUP INT TERM

curl --fail --location --retry 3 \
  https://github.com/mezotv/desk-display/releases/latest/download/desk-display-release.json \
  --output "$release_temp/manifest.json"

release_version="$(node -e '
  const manifest = require(process.argv[1])
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) process.exit(1)
  process.stdout.write(manifest.version)
' "$release_temp/manifest.json")"
release_checksum="$(node -e '
  const manifest = require(process.argv[1])
  if (!/^[a-f0-9]{64}$/.test(manifest.sha256)) process.exit(1)
  process.stdout.write(manifest.sha256)
' "$release_temp/manifest.json")"

test ! -e "$install_root"
mkdir "$install_root"

curl --fail --location --retry 3 \
  "https://github.com/mezotv/desk-display/archive/refs/tags/v$release_version.tar.gz" \
  --output "$release_temp/source.tar.gz"
tar -xzf "$release_temp/source.tar.gz" --strip-components=1 -C "$install_root"

curl --fail --location --retry 3 \
  "https://github.com/mezotv/desk-display/releases/download/v$release_version/desk-display-$release_version.tar.gz" \
  --output "$release_temp/app.tar.gz"
printf '%s  %s\n' "$release_checksum" "$release_temp/app.tar.gz" | sha256sum --check
tar -xzf "$release_temp/app.tar.gz" -C "$install_root"
printf '%s\n' "$release_version" > "$install_root/.desk-display-version"
```

This downloads the source snapshot for the matching immutable tag plus its prebuilt production bundle. It verifies the bundle against the release manifest before installing it. It does not run `git init`, create a `.git` directory, install npm packages, or compile the app on the Pi.

### 3. Configure secrets safely

Create the environment file with owner-only permissions before editing it:

```sh
cd /home/display/desk-display
install -m 600 .env.example .env
nano .env
```

Replace every credential placeholder you intend to use, and delete unused integration entries instead of leaving fake credentials in place. Keep these rules:

- Use a restricted Stripe key with read access only to the resources described above. Do not use a full-access secret key.
- Keep `.env` owned by `display` with mode `600`.
- Never commit `.env`, OAuth refresh tokens, or copied logs containing credentials.
- Keep the server on `127.0.0.1`. Do not change `HOST` to `0.0.0.0` unless you put an authenticated reverse proxy in front of it.

Confirm the file permissions without printing its contents:

```sh
stat -c '%U %G %a %n' .env
```

The expected result begins with `display display 600`.

### 4. Install and start the app service

Install the systemd unit as root, reload systemd, and start the app:

```sh
cd /home/display/desk-display
sudo install -o root -g root -m 644 deploy/desk-display.service /etc/systemd/system/desk-display.service
sudo systemctl daemon-reload
sudo systemctl enable --now desk-display.service
```

The service runs Node as `display`, binds only to `127.0.0.1:3000`, starts after networking, and restarts automatically after a crash. Verify it before configuring Chromium:

```sh
systemctl status desk-display.service --no-pager
curl --fail http://127.0.0.1:3000/logos/system-pixel.svg >/dev/null
```

If either command fails, inspect the recent logs:

```sh
journalctl -u desk-display.service -n 100 --no-pager
```

### 5. Start Chromium automatically

Install the launcher and desktop autostart entry as the `display` user:

```sh
install -D -m 755 deploy/desk-display-kiosk.sh /home/display/.local/bin/desk-display-kiosk
install -D -m 644 deploy/desk-display.desktop /home/display/.config/autostart/desk-display.desktop
sudo reboot
```

After the desktop session starts, the launcher waits for the local health endpoint and then opens Chromium in kiosk mode. If Chromium exits or crashes, the launcher starts it again. Check it over SSH with:

```sh
pgrep -af chromium
curl --fail http://127.0.0.1:3000/ >/dev/null
```

The supplied launcher disables unused Chromium background services and caps the kiosk at two renderer processes. This keeps extensions, sync, default apps, and background network subsystems out of the single-purpose display session without disabling normal page requests, media playback, or OAuth navigation.

The in-app updater replaces the Desk Display application but does not overwrite files outside its installation directory. After updating an existing installation to a release with a newer kiosk launcher, install that launcher once more and reboot:

```sh
install -D -m 755 deploy/desk-display-kiosk.sh /home/display/.local/bin/desk-display-kiosk
sudo reboot
```

### 6. Enable the physical backlight schedule safely

This step is optional and hardware-specific. The supplied script expects the tested Waveshare backlight at `/sys/class/backlight/10-0045`. Do not enable the timer until that directory exists on your Pi:

```sh
timedatectl
find /sys/class/backlight -mindepth 1 -maxdepth 1 -type l -printf '%f\n'
```

If your backlight has a different name, edit `BACKLIGHT_DIRECTORY` near the top of `deploy/desk-display-schedule.sh` before installing it. If `/sys/class/backlight` contains no suitable device, skip this section; in-app Night Mode will still dim the interface without touching hardware.

Once the path and timezone are correct, install and enable the schedule:

```sh
cd /home/display/desk-display
sudo install -o root -g root -m 755 deploy/desk-display-schedule.sh /usr/local/sbin/desk-display-schedule
sudo install -o root -g root -m 644 deploy/desk-display-schedule.service /etc/systemd/system/desk-display-schedule.service
sudo install -o root -g root -m 644 deploy/desk-display-schedule.timer /etc/systemd/system/desk-display-schedule.timer
sudo systemctl daemon-reload
sudo systemctl enable --now desk-display-schedule.timer
sudo systemctl start desk-display-schedule.service
```

Run the final command from SSH: if the current local time is between midnight and 08:00, it intentionally sets the panel brightness to zero. The timer has `Persistent=true`, so systemd applies a missed transition after the Pi was powered off. Verify both upcoming events and the last schedule run:

```sh
systemctl list-timers desk-display-schedule.timer --all --no-pager
systemctl status desk-display-schedule.service --no-pager
```

The hardware schedule turns the backlight fully off from 00:00 to 08:00. The separate in-app Night Mode defaults to dimming the UI from 21:00 to 08:00 and can be adjusted from Settings.

### 7. Allow the Display app to control a locked backlight

Try the Display app first. Some Raspberry Pi OS installations give the active desktop user permission to write the backlight or include compatible Wayland output-power tools, requiring no extra setup. If the app reports that hardware power control is unavailable, install `wlr-randr`, or install the narrowly scoped backlight helper below. Desk Display also uses `wlopm` automatically on newer Raspberry Pi OS releases where that package is available.

```sh
sudo apt update
sudo apt install -y wlr-randr
```

```sh
cd /home/display/desk-display
sudo install -o root -g root -m 755 deploy/desk-display-backlight.sh /usr/local/sbin/desk-display-backlight
sudo install -o root -g root -m 440 deploy/desk-display-backlight.sudoers /etc/sudoers.d/desk-display-backlight
sudo visudo -cf /etc/sudoers.d/desk-display-backlight
```

Before installing, edit `BACKLIGHT_DIRECTORY` in `deploy/desk-display-backlight.sh` if your device name differs. The sudo policy permits the `display` account to run exactly two fixed commands—`desk-display-backlight on` and `desk-display-backlight off`—without granting a shell or arbitrary root command access.

### Updating an installed Pi

Updates are manual. Open Settings, tap **Check** in the Software Update card, review the newest version, and tap **Install** if one is available. Desk Display never checks GitHub or installs a release in the background. The display reloads itself after the local server restarts.

The Pi does not need a Git repository. A requested update comes from the newest stable, immutable GitHub Release, is checked against its SHA-256 release manifest, and replaces only the verified prebuilt `.output` bundle. The previous build remains available as `.output.rollback`; local credentials and browser settings remain on the device.

If an update fails, the running build remains active and Settings shows the failure. Inspect `journalctl -u desk-display.service -n 100 --no-pager`; the updater never modifies `.env`. Before unplugging or moving the Pi, shut it down cleanly with `sudo systemctl poweroff` and wait for disk activity to stop.

## Publishing a release

Stable Pi updates are produced only from semantic version tags. Maintainers should bump the same version in `package.json` and `package-lock.json`, commit it, and push the tag:

```sh
npm version 0.3.0 --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: release 0.3.0"
git tag -a v0.3.0 -m "Desk Display 0.3.0"
git push origin main v0.3.0
```

The release workflow builds on GitHub, packages the production output, creates a SHA-256 manifest, and publishes both files to GitHub Releases. Drafts, prereleases, branches, and untagged commits are never offered by the manual update check. The updater uses GitHub's stable `/releases/latest/download/…` link for the manifest and the immutable versioned tag URL for the verified build archive.

## Reliability model

External integrations use Effect for typed errors, schema validation, request timeouts, bounded exponential retry with jitter, structured logging, and a single managed server runtime. OAuth access tokens are cached until shortly before expiry. The UI keeps the last good snapshot when a background refresh fails.

## License

Desk Display is available under the MIT License. See `LICENSE`.

## Pixel-art credits

Desk Display's original 24×24 app and control icons take visual direction from
[Generic Icons by Reff Pixels](https://reffpixels.itch.io/genericicons),
[App Icons by Reff Pixels](https://reffpixels.itch.io/appicons), and
[Bonus Pixel Art Icons by CactusPhD](https://cactusphd.itch.io/bonus-pixelart-icons).
Thank you to both artists for publishing such thoughtful pixel-art references.

The repository does not redistribute Reff Pixels' personal-use-only App Icons
pack. Brand and game icons are original, grid-drawn adaptations so the public
MIT repository remains safe to reuse. Reff Pixels' profile is also linked from
the in-app Settings screen: [reffpixels.itch.io](https://reffpixels.itch.io/).
