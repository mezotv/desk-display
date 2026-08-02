import "@tanstack/react-start/server-only";

import { execFile } from "node:child_process";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { promisify } from "node:util";

import { Effect } from "effect";

import { XSET_EXECUTABLE } from "@/constants/display-power";
import { DisplayPowerError } from "@/schemas/display-power";

const executeFile = promisify(execFile);

export const setDpmsPower = Effect.fn("DisplayPower.dpms")(
  function*(enabled: boolean) {
    yield* Effect.tryPromise({
      try: () =>
        executeFile(
          XSET_EXECUTABLE,
          [
            "-display",
            process.env.DISPLAY ?? ":0",
            "dpms",
            "force",
            enabled ? "on" : "off",
          ],
          {
            env: {
              ...process.env,
              DISPLAY: process.env.DISPLAY ?? ":0",
              XAUTHORITY:
                process.env.XAUTHORITY ?? resolve(homedir(), ".Xauthority"),
            },
            timeout: 4_000,
          },
        ),
      catch: (cause) =>
        DisplayPowerError.make({
          cause,
          message: "Display power management is unavailable",
          operation: enabled ? "force DPMS on" : "force DPMS off",
        }),
    });
  },
);
