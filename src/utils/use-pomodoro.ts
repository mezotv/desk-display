import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_POMODORO_STATE,
  MAX_POMODORO_PLAN_MS,
  MIN_POMODORO_PLAN_MS,
} from "@/constants/pomodoro";
import type {
  PomodoroModeId,
  PomodoroUpdater,
  UsePomodoroResult,
} from "@/types/pomodoro";
import { getPomodoroElapsedMs } from "@/utils/get-pomodoro-elapsed";
import {
  loadPomodoroState,
  savePomodoroState,
} from "@/utils/pomodoro-storage";

export function usePomodoro(): UsePomodoroResult {
  const [state, setState] = useState(() =>
    structuredClone(DEFAULT_POMODORO_STATE),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadPomodoroState());
    setReady(true);
  }, []);

  const updateState = useCallback((updater: PomodoroUpdater) => {
    setState((currentState) => {
      const nextState = updater(currentState);
      savePomodoroState(nextState);
      return nextState;
    });
  }, []);

  const changePlanDuration = useCallback(
    (durationMs: number) => {
      const safeDurationMs = Math.max(
        MIN_POMODORO_PLAN_MS,
        Math.min(MAX_POMODORO_PLAN_MS, durationMs),
      );
      updateState((currentState) => ({
        ...currentState,
        elapsedMs: 0,
        planDurationMs: safeDurationMs,
        running: false,
        startedAt: null,
      }));
    },
    [updateState],
  );

  const changeMode = useCallback(
    (mode: PomodoroModeId) => {
      updateState((currentState) => ({
        ...currentState,
        elapsedMs: 0,
        mode,
        running: false,
        startedAt: null,
      }));
    },
    [updateState],
  );

  const reset = useCallback(() => {
    updateState((currentState) => ({
      ...currentState,
      elapsedMs: 0,
      running: false,
      startedAt: null,
    }));
  }, [updateState]);

  const toggle = useCallback(() => {
    updateState((currentState) => {
      if (currentState.running) {
        return {
          ...currentState,
          elapsedMs: getPomodoroElapsedMs(currentState, Date.now()),
          running: false,
          startedAt: null,
        };
      }

      const shouldRestart =
        currentState.elapsedMs >= currentState.planDurationMs;
      return {
        ...currentState,
        elapsedMs: shouldRestart ? 0 : currentState.elapsedMs,
        running: true,
        startedAt: new Date().toISOString(),
      };
    });
  }, [updateState]);

  useEffect(() => {
    if (!ready || !state.running || !state.startedAt) return;

    const remainingMs =
      state.planDurationMs - getPomodoroElapsedMs(state, Date.now());
    const completionTimer = window.setTimeout(() => {
      updateState((currentState) => ({
        ...currentState,
        elapsedMs: currentState.planDurationMs,
        running: false,
        startedAt: null,
      }));
    }, Math.max(0, remainingMs));

    return () => window.clearTimeout(completionTimer);
  }, [ready, state.planDurationMs, state.running, state.startedAt, updateState]);

  return {
    changeMode,
    changePlanDuration,
    ready,
    reset,
    state,
    toggle,
  };
}
