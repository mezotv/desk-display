#!/bin/sh
set -eu

if [ "$(uname -s)" != "Darwin" ]; then
  echo "This installer is only for macOS" >&2
  exit 1
fi

repository_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
bridge_source="$repository_root/.output/agent-bridge/desk-display-agent-bridge.mjs"
node_path=$(command -v node || true)

if [ ! -f "$bridge_source" ]; then
  echo "Run npm run build before installing the bridge" >&2
  exit 1
fi

if [ -z "$node_path" ]; then
  echo "Node.js is required" >&2
  exit 1
fi

application_directory="$HOME/Library/Application Support/Desk Display"
launch_agent_directory="$HOME/Library/LaunchAgents"
launch_agent_path="$launch_agent_directory/com.desk-display.agent-usage-bridge.plist"
bridge_path="$application_directory/desk-display-agent-bridge.mjs"
token_path="$application_directory/agent-usage-bridge.token"
stdout_path="$application_directory/agent-usage-bridge.log"
stderr_path="$application_directory/agent-usage-bridge.error.log"

install -d -m 700 "$application_directory" "$launch_agent_directory"
install -m 600 "$bridge_source" "$bridge_path"

if [ ! -s "$token_path" ]; then
  umask 077
  openssl rand -hex 32 > "$token_path"
fi

temporary_plist=$(mktemp)
trap 'rm -f "$temporary_plist"' EXIT HUP INT TERM

sed \
  -e "s|__NODE_PATH__|$node_path|g" \
  -e "s|__BRIDGE_PATH__|$bridge_path|g" \
  -e "s|__TOKEN_PATH__|$token_path|g" \
  -e "s|__STDOUT_PATH__|$stdout_path|g" \
  -e "s|__STDERR_PATH__|$stderr_path|g" \
  "$repository_root/deploy/com.desk-display.agent-usage-bridge.plist" \
  > "$temporary_plist"

plutil -lint "$temporary_plist" >/dev/null
install -m 600 "$temporary_plist" "$launch_agent_path"
launchctl bootout "gui/$(id -u)/com.desk-display.agent-usage-bridge" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$launch_agent_path"
launchctl kickstart -k "gui/$(id -u)/com.desk-display.agent-usage-bridge"

echo "Agent usage bridge installed and started"
echo "Bridge port: 4747"
echo "Bearer token: $token_path"
echo "Add the Mac's LAN address and that token to the Pi as documented in README.md"
