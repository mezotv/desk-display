import "@tanstack/react-start/server-only";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Effect, Option, Schema } from "effect";

import { DESK_DISPLAY_UPDATE_MARKER } from "@/constants/update";
import { serverRuntime } from "@/runtime/server-runtime";
import { semanticVersionSchema } from "@/schemas/update";
import { getDeskDisplayRootEffect } from "@/utils/get-desk-display-root.server";

const decodeSemanticVersion = Schema.decodeUnknownOption(
  semanticVersionSchema,
);

export const readInstalledVersionEffect = Effect.fn(
  "DeskDisplayUpdate.readInstalledVersion",
)(function*() {
  const root = yield* getDeskDisplayRootEffect();

  const storedVersion = yield* Effect.tryPromise({
    try: () => readFile(resolve(root, DESK_DISPLAY_UPDATE_MARKER), "utf8"),
    catch: () => null,
  }).pipe(
    Effect.map((version) => version.trim()),
    Effect.catch(() => Effect.succeed(null)),
  );
  const decodedVersion = decodeSemanticVersion(storedVersion);

  return Option.isSome(decodedVersion)
    ? decodedVersion.value
    : __DESK_DISPLAY_VERSION__;
});

export function readInstalledVersion() {
  return serverRuntime.runPromise(readInstalledVersionEffect());
}
