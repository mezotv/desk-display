import "@tanstack/react-start/server-only";

import { DateTime, Effect } from "effect";

import { serverRuntime } from "@/runtime/server-runtime";
import type { UpdateStatus } from "@/types/update";
import { compareSemanticVersions } from "@/utils/compare-semantic-versions";
import { getReleaseManifestEffect } from "@/utils/get-release-manifest.server";
import { readInstalledVersionEffect } from "@/utils/read-installed-version.server";

const getUpdateStatusEffect = Effect.fn("DeskDisplayUpdate.getStatus")(
  function*() {
    const currentVersion = yield* readInstalledVersionEffect();
    const manifest = yield* getReleaseManifestEffect();

    return {
      checkedAt: DateTime.formatIso(yield* DateTime.now),
      currentVersion,
      error: null,
      installSupported: process.platform === "linux",
      latestVersion: manifest.version,
      updateAvailable:
        compareSemanticVersions(currentVersion, manifest.version) < 0,
    } satisfies UpdateStatus;
  },
);

export function getUpdateStatus(): Promise<UpdateStatus> {
  return serverRuntime.runPromise(
    getUpdateStatusEffect().pipe(
      Effect.catch((error) =>
        Effect.gen(function*() {
          const currentVersion = yield* readInstalledVersionEffect().pipe(
            Effect.catch(() => Effect.succeed(__DESK_DISPLAY_VERSION__)),
          );

          return {
            checkedAt: DateTime.formatIso(yield* DateTime.now),
            currentVersion,
            error: error.message,
            installSupported: process.platform === "linux",
            latestVersion: null,
            updateAvailable: false,
          } satisfies UpdateStatus;
        }),
      ),
    ),
  );
}
