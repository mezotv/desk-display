import "@tanstack/react-start/server-only";

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

import { Effect } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import {
  DESK_DISPLAY_UPDATE_MARKER,
  DESK_DISPLAY_UPDATE_WORK_DIRECTORY,
  UPDATE_DOWNLOAD_TIMEOUT,
} from "@/constants/update";
import { DeskDisplayUpdateError } from "@/schemas/update";
import { serverRuntime } from "@/runtime/server-runtime";
import type { UpdateInstallResult } from "@/types/update";
import { compareSemanticVersions } from "@/utils/compare-semantic-versions";
import { executeExternalRequest } from "@/utils/request-external-api.server";
import { getDeskDisplayRootEffect } from "@/utils/get-desk-display-root.server";
import { getReleaseAssetUrl } from "@/utils/get-release-asset-url";
import { getReleaseManifestEffect } from "@/utils/get-release-manifest.server";
import { readInstalledVersionEffect } from "@/utils/read-installed-version.server";

const execFilePromise = promisify(execFile);

function updateFailure(
  operation: string,
  message: string,
  cause: unknown,
) {
  return DeskDisplayUpdateError.make({ cause, message, operation });
}

const installUpdateEffect = Effect.fn("DeskDisplayUpdate.install")(function*() {
  const currentVersion = yield* readInstalledVersionEffect();
  const manifest = yield* getReleaseManifestEffect();

  if (compareSemanticVersions(currentVersion, manifest.version) >= 0) {
    return {
      currentVersion,
      error: null,
      latestVersion: manifest.version,
      restartRequired: false,
      status: "up-to-date",
    } satisfies UpdateInstallResult;
  }

  if (process.platform !== "linux") {
    return {
      currentVersion,
      error: "Desk Display can install updates on Linux only",
      latestVersion: manifest.version,
      restartRequired: false,
      status: "failed",
    } satisfies UpdateInstallResult;
  }

  const root = yield* getDeskDisplayRootEffect();
  const workDirectory = resolve(
    root,
    DESK_DISPLAY_UPDATE_WORK_DIRECTORY,
  );
  const stagingDirectory = resolve(workDirectory, `stage-${manifest.version}`);
  const archivePath = resolve(
    workDirectory,
    `desk-display-${manifest.version}.tar.gz`,
  );
  const outputPath = resolve(root, ".output");
  const rollbackPath = resolve(root, ".output.rollback");
  const stagedOutputPath = resolve(stagingDirectory, ".output");
  const stagedVersionPath = resolve(stagingDirectory, "VERSION");
  const versionMarkerPath = resolve(root, DESK_DISPLAY_UPDATE_MARKER);
  const temporaryVersionMarkerPath = resolve(
    root,
    `${DESK_DISPLAY_UPDATE_MARKER}.next`,
  );

  yield* Effect.tryPromise({
    try: async () => {
      await rm(workDirectory, { force: true, recursive: true });
      await mkdir(stagingDirectory, { recursive: true });
    },
    catch: (cause) =>
      updateFailure(
        "prepare update",
        "Unable to prepare the Desk Display update directory",
        cause,
      ),
  });

  const request = HttpClientRequest.get(
    getReleaseAssetUrl(manifest.version),
  );
  const response = yield* executeExternalRequest(
    "GitHub Releases",
    `download Desk Display ${manifest.version}`,
    request,
    UPDATE_DOWNLOAD_TIMEOUT,
  ).pipe(
    Effect.mapError((cause) =>
      updateFailure(
        "download update",
        "Unable to download the Desk Display update",
        cause,
      ),
    ),
  );
  const archiveBuffer = yield* response.arrayBuffer.pipe(
    Effect.mapError((cause) =>
      updateFailure(
        "read update",
        "Unable to read the Desk Display update archive",
        cause,
      ),
    ),
  );
  const archiveBytes = new Uint8Array(archiveBuffer);
  const actualDigest = createHash("sha256")
    .update(archiveBytes)
    .digest("hex");

  if (actualDigest !== manifest.sha256) {
    return yield* updateFailure(
      "verify update",
      "The Desk Display update checksum did not match",
      new Error("SHA-256 mismatch"),
    );
  }

  yield* Effect.tryPromise({
    try: () => writeFile(archivePath, archiveBytes),
    catch: (cause) =>
      updateFailure(
        "save update",
        "Unable to save the Desk Display update archive",
        cause,
      ),
  });

  const archiveEntries = yield* Effect.tryPromise({
    try: async () => {
      const result = await execFilePromise("tar", ["-tzf", archivePath], {
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
      });
      return result.stdout
        .split("\n")
        .map((entry) => entry.trim())
        .filter(Boolean);
    },
    catch: (cause) =>
      updateFailure(
        "inspect update",
        "Unable to inspect the Desk Display update archive",
        cause,
      ),
  });
  const archiveIsSafe = archiveEntries.every(
    (entry) =>
      entry === "VERSION" ||
      entry === ".output" ||
      entry.startsWith(".output/"),
  );

  if (!archiveIsSafe || archiveEntries.length === 0) {
    return yield* updateFailure(
      "inspect update",
      "The Desk Display update archive contains unexpected files",
      new Error("Unsafe archive layout"),
    );
  }

  yield* Effect.tryPromise({
    try: () =>
      execFilePromise(
        "tar",
        [
          "-xzf",
          archivePath,
          "--no-same-owner",
          "--no-same-permissions",
          "-C",
          stagingDirectory,
        ],
        { maxBuffer: 16 * 1024 * 1024 },
      ),
    catch: (cause) =>
      updateFailure(
        "extract update",
        "Unable to extract the Desk Display update archive",
        cause,
      ),
  });

  const stagedVersion = yield* Effect.tryPromise({
    try: () => readFile(stagedVersionPath, "utf8"),
    catch: (cause) =>
      updateFailure(
        "validate update",
        "The Desk Display update is missing version metadata",
        cause,
      ),
  });

  if (stagedVersion.trim() !== manifest.version) {
    return yield* updateFailure(
      "validate update",
      "The Desk Display update version did not match its manifest",
      new Error("Release version mismatch"),
    );
  }

  yield* Effect.tryPromise({
    try: () => readFile(resolve(stagedOutputPath, "server/index.mjs")),
    catch: (cause) =>
      updateFailure(
        "validate update",
        "The Desk Display update does not contain a runnable server",
        cause,
      ),
  });

  yield* Effect.tryPromise({
    try: async () => {
      await writeFile(temporaryVersionMarkerPath, `${manifest.version}\n`, {
        mode: 0o600,
      });
      await rm(rollbackPath, { force: true, recursive: true });
      await rename(outputPath, rollbackPath);

      try {
        await rename(stagedOutputPath, outputPath);
        await rename(temporaryVersionMarkerPath, versionMarkerPath);
      } catch (cause) {
        await rm(outputPath, { force: true, recursive: true });
        await rename(rollbackPath, outputPath);
        throw cause;
      }
    },
    catch: (cause) =>
      updateFailure(
        "activate update",
        "Unable to activate the Desk Display update; the previous build was restored",
        cause,
      ),
  });

  yield* Effect.tryPromise({
    try: () => rm(workDirectory, { force: true, recursive: true }),
    catch: () => null,
  }).pipe(Effect.catch(() => Effect.void));

  yield* Effect.logInfo("Desk Display update installed", {
    fromVersion: currentVersion,
    toVersion: manifest.version,
  });

  return {
    currentVersion: manifest.version,
    error: null,
    latestVersion: manifest.version,
    restartRequired: true,
    status: "installed",
  } satisfies UpdateInstallResult;
});

let activeInstallation: Promise<UpdateInstallResult> | null = null;

export function installLatestUpdate(): Promise<UpdateInstallResult> {
  if (activeInstallation) return activeInstallation;

  activeInstallation = serverRuntime
    .runPromise(
      installUpdateEffect().pipe(
        Effect.tapError(Effect.logError),
        Effect.catch((error) =>
          readInstalledVersionEffect().pipe(
            Effect.catch(() => Effect.succeed(__DESK_DISPLAY_VERSION__)),
            Effect.map(
              (currentVersion): UpdateInstallResult => ({
                currentVersion,
                error: error.message,
                latestVersion: null,
                restartRequired: false,
                status: "failed",
              }),
            ),
          ),
        ),
      ),
    )
    .finally(() => {
      activeInstallation = null;
    });

  return activeInstallation;
}
