import "@tanstack/react-start/server-only";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Effect, Schema } from "effect";

import {
  DeskDisplayUpdateError,
  deskDisplayPackageSchema,
} from "@/schemas/update";

export const getDeskDisplayRootEffect = Effect.fn(
  "DeskDisplayUpdate.getRoot",
)(function*() {
  const root = resolve(process.env.DESK_DISPLAY_ROOT ?? process.cwd());
  const packagePath = resolve(root, "package.json");
  const packageContents = yield* Effect.tryPromise({
    try: () => readFile(packagePath, "utf8"),
    catch: (cause) =>
      DeskDisplayUpdateError.make({
        cause,
        message: "Desk Display installation directory was not found",
        operation: "find installation",
      }),
  });
  const packagePayload = yield* Effect.try({
    try: () => JSON.parse(packageContents),
    catch: (cause) =>
      DeskDisplayUpdateError.make({
        cause,
        message: "Desk Display package metadata is invalid",
        operation: "read installation metadata",
      }),
  });

  yield* Schema.decodeUnknownEffect(deskDisplayPackageSchema)(
    packagePayload,
  ).pipe(
    Effect.mapError(
      (cause) =>
        DeskDisplayUpdateError.make({
          cause,
          message: "The update target is not a Desk Display installation",
          operation: "validate installation",
        }),
    ),
  );

  return root;
});
