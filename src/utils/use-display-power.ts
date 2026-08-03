import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";

import { DEFAULT_DISPLAY_SLEEP_STATE } from "@/constants/display-power";
import type {
  DisplaySleepState,
  UseDisplayPowerResult,
} from "@/types/display-power";
import { controlDisplayPower } from "@/utils/display-power.functions";
import {
  loadDisplaySleepState,
  saveDisplaySleepState,
} from "@/utils/display-power-storage";

export function useDisplayPower(): UseDisplayPowerResult {
  const controlPower = useServerFn(controlDisplayPower);
  const [state, setState] = useState<DisplaySleepState>(
    DEFAULT_DISPLAY_SLEEP_STATE,
  );
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadDisplaySleepState());
    setReady(true);
  }, []);

  const sleep = useCallback(async () => {
    if (changing) return;

    setChanging(true);
    setError(null);

    try {
      const result = await controlPower({
        data: { enabled: false, preferredMethod: state.method },
      });
      if (!result.success || !result.method) {
        setError(result.error ?? "Display power control is unavailable");
        return;
      }

      const nextState: DisplaySleepState = {
        method: result.method,
        sleeping: true,
      };
      setState(nextState);
      saveDisplaySleepState(nextState);
    } catch {
      setError("Display power control is unavailable");
    } finally {
      setChanging(false);
    }
  }, [changing, controlPower, state.method]);

  const wake = useCallback(async () => {
    if (changing) return;

    setChanging(true);
    setError(null);

    try {
      const result = await controlPower({
        data: { enabled: true, preferredMethod: state.method },
      });
      if (!result.success) {
        setError(result.error ?? "Display power control is unavailable");
        return;
      }

      setState(DEFAULT_DISPLAY_SLEEP_STATE);
      saveDisplaySleepState(DEFAULT_DISPLAY_SLEEP_STATE);
    } catch {
      setError("Display power control is unavailable");
    } finally {
      setChanging(false);
    }
  }, [changing, controlPower, state.method]);

  return {
    changing,
    error,
    ready,
    sleep,
    sleeping: state.sleeping,
    wake,
  };
}
