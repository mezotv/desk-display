import "@tanstack/react-start/server-only";

import { Effect } from "effect";

import { DisplayPowerError } from "@/schemas/display-power";
import { serverRuntime } from "@/runtime/server-runtime";
import type {
  DisplayPowerMethod,
  DisplayPowerResult,
} from "@/types/display-power";
import { setBacklightPower } from "@/utils/set-backlight-power.server";
import { setDpmsPower } from "@/utils/set-dpms-power.server";
import { setPrivilegedBacklightPower } from "@/utils/set-privileged-backlight-power.server";

function setWithMethod(
  enabled: boolean,
  method: DisplayPowerMethod,
): Effect.Effect<void, DisplayPowerError> {
  if (method === "backlight") return setBacklightPower(enabled);
  if (method === "helper") return setPrivilegedBacklightPower(enabled);
  return setDpmsPower(enabled);
}

const setWithFallbacks = Effect.fn("DisplayPower.setWithFallbacks")(
  function*(enabled: boolean) {
    return yield* setBacklightPower(enabled).pipe(
      Effect.map((): DisplayPowerMethod => "backlight"),
      Effect.catch(() =>
        setPrivilegedBacklightPower(enabled).pipe(
          Effect.map((): DisplayPowerMethod => "helper"),
        ),
      ),
      Effect.catch(() =>
        setDpmsPower(enabled).pipe(
          Effect.map((): DisplayPowerMethod => "dpms"),
        ),
      ),
    );
  },
);

const setDisplayPowerEffect = Effect.fn("DisplayPower.set")(
  function*(enabled: boolean, preferredMethod: DisplayPowerMethod | null) {
    if (!preferredMethod) return yield* setWithFallbacks(enabled);

    return yield* setWithMethod(enabled, preferredMethod).pipe(
      Effect.map(() => preferredMethod),
      Effect.catch(() => setWithFallbacks(enabled)),
    );
  },
);

export function setDisplayPower(
  enabled: boolean,
  preferredMethod: DisplayPowerMethod | null,
) {
  return serverRuntime.runPromise(
    setDisplayPowerEffect(enabled, preferredMethod).pipe(
      Effect.match({
        onFailure: (failure): DisplayPowerResult => ({
          error: failure.message,
          method: null,
          powered: enabled,
          success: false,
        }),
        onSuccess: (method): DisplayPowerResult => ({
          error: null,
          method,
          powered: enabled,
          success: true,
        }),
      }),
    ),
  );
}
