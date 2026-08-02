import "@tanstack/react-start/server-only";

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Effect } from "effect";

import { DisplayPowerError } from "@/schemas/display-power";
import { getBacklightDirectories } from "@/utils/get-backlight-directories.server";

const rememberedBrightness = new Map<string, number>();

export const setBacklightPower = Effect.fn("DisplayPower.backlight")(
  function*(enabled: boolean) {
    yield* Effect.tryPromise({
      try: async () => {
        const directories = await getBacklightDirectories();
        let lastFailure: unknown = new Error("No backlight device found");

        for (const directory of directories) {
          try {
            const brightnessPath = resolve(directory, "brightness");
            const maxBrightnessPath = resolve(directory, "max_brightness");
            const currentBrightness = Number.parseInt(
              await readFile(brightnessPath, "utf8"),
              10,
            );
            const maxBrightness = Number.parseInt(
              await readFile(maxBrightnessPath, "utf8"),
              10,
            );

            if (!Number.isFinite(maxBrightness) || maxBrightness <= 0) {
              throw new Error(`Invalid maximum brightness for ${directory}`);
            }

            if (!enabled && currentBrightness > 0) {
              rememberedBrightness.set(directory, currentBrightness);
            }

            const targetBrightness = enabled
              ? rememberedBrightness.get(directory) ?? maxBrightness
              : 0;
            await writeFile(brightnessPath, `${targetBrightness}\n`, "utf8");
            return;
          } catch (cause) {
            lastFailure = cause;
          }
        }

        throw lastFailure;
      },
      catch: (cause) =>
        DisplayPowerError.make({
          cause,
          message: "No writable hardware backlight was found",
          operation: enabled ? "turn backlight on" : "turn backlight off",
        }),
    });
  },
);
