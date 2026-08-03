import "@tanstack/react-start/server-only";

import { readdir, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

export async function getWaylandEnvironment() {
  const userId = process.getuid?.();
  const runtimeDirectory =
    process.env.XDG_RUNTIME_DIR ??
    (userId === undefined ? null : `/run/user/${userId}`);
  if (!runtimeDirectory) {
    throw new Error("The Wayland runtime directory is unavailable");
  }

  const discoveredDisplays = await readdir(runtimeDirectory).catch(() => []);
  const displayCandidates = [
    process.env.WAYLAND_DISPLAY,
    ...discoveredDisplays.filter((name) => /^wayland-\d+$/.test(name)),
  ];

  for (const candidate of displayCandidates) {
    if (!candidate || basename(candidate) !== candidate) continue;

    const socketPath = resolve(runtimeDirectory, candidate);
    const socketStats = await stat(socketPath).catch(() => null);
    if (!socketStats?.isSocket()) continue;

    return {
      ...process.env,
      WAYLAND_DISPLAY: candidate,
      XDG_RUNTIME_DIR: runtimeDirectory,
    };
  }

  throw new Error("No active Wayland display socket was found");
}
