import "@tanstack/react-start/server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { Effect } from "effect";

import { WLR_RANDR_EXECUTABLE } from "@/constants/display-power";
import { DisplayPowerError } from "@/schemas/display-power";
import { getWaylandEnvironment } from "@/utils/get-wayland-environment.server";

const executeFile = promisify(execFile);
const rememberedOutputNames = new Set<string>();

function parseOutputNames(output: string) {
  return output
    .split("\n")
    .filter((line) => line.length > 0 && !/^\s/.test(line))
    .map((line) => line.split(/\s+/, 1)[0])
    .filter((name): name is string => Boolean(name));
}

function prioritizeOutputNames(outputNames: readonly string[]) {
  return [...outputNames].sort((left, right) => {
    const leftIsDsi = left.startsWith("DSI-");
    const rightIsDsi = right.startsWith("DSI-");
    if (leftIsDsi === rightIsDsi) return 0;
    return leftIsDsi ? -1 : 1;
  });
}

export const setWlrRandrPower = Effect.fn("DisplayPower.wlrRandr")(
  function*(enabled: boolean) {
    yield* Effect.tryPromise({
      try: async () => {
        const environment = await getWaylandEnvironment();
        const configuredOutputName =
          process.env.DESK_DISPLAY_OUTPUT_NAME?.trim();
        const { stdout } = await executeFile(WLR_RANDR_EXECUTABLE, [], {
          env: environment,
          timeout: 4_000,
        });
        const outputNames = prioritizeOutputNames([
          ...(configuredOutputName ? [configuredOutputName] : []),
          ...rememberedOutputNames,
          ...parseOutputNames(stdout),
        ]);
        const uniqueOutputNames = [...new Set(outputNames)];
        if (uniqueOutputNames.length === 0) {
          throw new Error("No Wayland outputs were discovered");
        }

        const results = await Promise.allSettled(
          uniqueOutputNames.map((outputName) =>
            executeFile(
              WLR_RANDR_EXECUTABLE,
              ["--output", outputName, enabled ? "--on" : "--off"],
              { env: environment, timeout: 4_000 },
            ).then(() => rememberedOutputNames.add(outputName)),
          ),
        );
        if (!results.some((result) => result.status === "fulfilled")) {
          throw new Error("No Wayland output accepted the power command");
        }
      },
      catch: (cause) =>
        DisplayPowerError.make({
          cause,
          message: "Wayland output configuration is unavailable",
          operation: enabled ? "enable Wayland outputs" : "disable Wayland outputs",
        }),
    });
  },
);
