import "@tanstack/react-start/server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { Effect } from "effect";

import { WLOPM_EXECUTABLE } from "@/constants/display-power";
import { DisplayPowerError } from "@/schemas/display-power";
import { getWaylandEnvironment } from "@/utils/get-wayland-environment.server";

const executeFile = promisify(execFile);

export const setWlopmPower = Effect.fn("DisplayPower.wlopm")(
  function*(enabled: boolean) {
    yield* Effect.tryPromise({
      try: async () => {
        const environment = await getWaylandEnvironment();
        await executeFile(
          WLOPM_EXECUTABLE,
          [enabled ? "--on" : "--off", "*"],
          { env: environment, timeout: 4_000 },
        );
      },
      catch: (cause) =>
        DisplayPowerError.make({
          cause,
          message: "Wayland output power management is unavailable",
          operation: enabled ? "turn Wayland outputs on" : "turn Wayland outputs off",
        }),
    });
  },
);
