import "@tanstack/react-start/server-only";

import { readdir } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import {
  BACKLIGHT_ROOT_DIRECTORY,
  DEFAULT_BACKLIGHT_DIRECTORY,
} from "@/constants/display-power";

export async function getBacklightDirectories() {
  const configuredDirectory = process.env.DESK_DISPLAY_BACKLIGHT_DIRECTORY;
  const discoveredNames = await readdir(BACKLIGHT_ROOT_DIRECTORY).catch(
    () => [],
  );
  const candidates = [
    configuredDirectory,
    DEFAULT_BACKLIGHT_DIRECTORY,
    ...discoveredNames.map((name) => resolve(BACKLIGHT_ROOT_DIRECTORY, name)),
  ];
  const safeDirectories = new Set<string>();

  for (const candidate of candidates) {
    if (!candidate) continue;

    const resolvedCandidate = resolve(candidate);
    const relativeCandidate = relative(
      BACKLIGHT_ROOT_DIRECTORY,
      resolvedCandidate,
    );
    if (
      relativeCandidate.startsWith("..") ||
      isAbsolute(relativeCandidate)
    ) {
      continue;
    }

    safeDirectories.add(resolvedCandidate);
  }

  return [...safeDirectories];
}
