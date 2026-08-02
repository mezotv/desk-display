import "@tanstack/react-start/server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { Effect } from "effect";

import {
  DISPLAY_BACKLIGHT_HELPER,
  SUDO_EXECUTABLE,
} from "@/constants/display-power";
import { DisplayPowerError } from "@/schemas/display-power";

const executeFile = promisify(execFile);

export const setPrivilegedBacklightPower = Effect.fn(
  "DisplayPower.privilegedBacklight",
)(function*(enabled: boolean) {
  yield* Effect.tryPromise({
    try: () =>
      executeFile(
        SUDO_EXECUTABLE,
        ["--non-interactive", DISPLAY_BACKLIGHT_HELPER, enabled ? "on" : "off"],
        { timeout: 4_000 },
      ),
    catch: (cause) =>
      DisplayPowerError.make({
        cause,
        message: "The privileged backlight helper is unavailable",
        operation: enabled
          ? "turn privileged backlight on"
          : "turn privileged backlight off",
      }),
  });
});
