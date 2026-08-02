# Desk Display contributor instructions

## Effect

- Read `.repos/effect/LLMS.md` before changing Effect code.
- Treat `.repos/effect` as a read-only source reference. Never edit it and never import from it.
- Use the installed project skills in `.agents/skills` when their task applies.
- Keep integrations in typed `Effect` programs, expose failures with tagged error schemas, decode external data with `Schema`, and run framework boundaries through `src/runtime/server-runtime.ts`.
- Prefer Effect's services and layers over hidden global dependencies. External requests must keep a timeout and bounded retry schedule.

## Project organization

- Put shared types in `src/types`, runtime schemas and tagged errors in `src/schemas`, constants in `src/constants`, helpers in `src/utils`, runtime wiring in `src/runtime`, and React views in `src/components`.
- Import directly from concrete files. Do not add barrel files.
- Keep server-only modules suffixed with `.server.ts` and import `@tanstack/react-start/server-only` first.
- Never expose `.env` values, OAuth tokens, or Stripe keys in logs, browser bundles, screenshots, or commits.

## Verification

- Run `npm run build` after changes.
- This project intentionally has no automated test suite. Do not add tests unless the maintainer explicitly changes that policy.
