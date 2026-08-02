import "@tanstack/react-start/server-only";

import { readFile, rename, writeFile } from "node:fs/promises";

import { Effect } from "effect";

import { PersistenceError } from "@/schemas/service-error";

function isMissingFileError(value: unknown): boolean {
  return value instanceof Error && "code" in value && value.code === "ENOENT";
}

function fileOperation<A>(path: string, operation: () => Promise<A>) {
  return Effect.tryPromise({
    catch: (cause) =>
      new PersistenceError({
        cause,
        message: `Unable to update ${path}`,
        path,
      }),
    try: operation,
  });
}

export const persistEnvironmentValue = Effect.fn(
  "Environment.persistValue",
)(function*(path: string, key: string, value: string, temporarySuffix: string) {
  const currentEnvironment = yield* fileOperation(path, () =>
    readFile(path, "utf8"),
  ).pipe(
    Effect.catchTag("PersistenceError", (error) =>
      isMissingFileError(error.cause)
        ? Effect.succeed("")
        : Effect.fail(error),
    ),
  );
  const nextEnvironment = [
    ...currentEnvironment
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith(`${key}=`)),
    `${key}=${value}`,
    "",
  ].join("\n");
  const temporaryPath = `${path}.${temporarySuffix}`;

  yield* fileOperation(temporaryPath, () =>
    writeFile(temporaryPath, nextEnvironment, { mode: 0o600 }),
  );
  yield* fileOperation(path, () => rename(temporaryPath, path));
});
