#!/usr/bin/env sh

set -eu

./scripts/prepare-effect.sh

if [ -f ".agents/skills/jsdocs/SKILL.md" ] && [ -f ".agents/skills/scratchpad/SKILL.md" ]; then
  exit 0
fi

npx --yes skills add Effect-TS/effect --skill '*' --agent codex --yes --copy
