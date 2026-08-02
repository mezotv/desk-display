import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_PRODUCTIVITY_STATE,
  MAX_TIMER_DURATION_MS,
  MIN_TIMER_DURATION_MS,
} from "@/constants/productivity";
import type {
  ProductivityUpdater,
  UseProductivityResult,
} from "@/types/productivity";
import {
  loadProductivityState,
  saveProductivityState,
} from "@/utils/productivity-storage";

export function useProductivity(): UseProductivityResult {
  const [state, setState] = useState(() =>
    structuredClone(DEFAULT_PRODUCTIVITY_STATE),
  );
  const [ready, setReady] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  useEffect(() => {
    setState(loadProductivityState());
    setReady(true);
  }, []);

  const updateState = useCallback((updater: ProductivityUpdater) => {
    setState((currentState) => {
      const nextState = updater(currentState);
      saveProductivityState(nextState);
      return nextState;
    });
  }, []);

  const changeTimerDuration = useCallback(
    (durationMs: number) => {
      const safeDuration = Math.max(
        MIN_TIMER_DURATION_MS,
        Math.min(MAX_TIMER_DURATION_MS, durationMs),
      );
      setTimerFinished(false);
      updateState((currentState) => ({
        ...currentState,
        timer: {
          durationMs: safeDuration,
          endsAt: null,
          remainingMs: safeDuration,
          running: false,
        },
      }));
    },
    [updateState],
  );

  const startTimer = useCallback(() => {
    setTimerFinished(false);
    updateState((currentState) => {
      const remainingMs =
        currentState.timer.remainingMs > 0
          ? currentState.timer.remainingMs
          : currentState.timer.durationMs;

      return {
        ...currentState,
        timer: {
          ...currentState.timer,
          endsAt: new Date(Date.now() + remainingMs).toISOString(),
          remainingMs,
          running: true,
        },
      };
    });
  }, [updateState]);

  const pauseTimer = useCallback(() => {
    updateState((currentState) => ({
      ...currentState,
      timer: {
        ...currentState.timer,
        endsAt: null,
        remainingMs: currentState.timer.endsAt
          ? Math.max(0, Date.parse(currentState.timer.endsAt) - Date.now())
          : currentState.timer.remainingMs,
        running: false,
      },
    }));
  }, [updateState]);

  const resetTimer = useCallback(() => {
    setTimerFinished(false);
    updateState((currentState) => ({
      ...currentState,
      timer: {
        ...currentState.timer,
        endsAt: null,
        remainingMs: currentState.timer.durationMs,
        running: false,
      },
    }));
  }, [updateState]);

  const toggleStopwatch = useCallback(() => {
    updateState((currentState) => {
      if (!currentState.stopwatch.running) {
        return {
          ...currentState,
          stopwatch: {
            ...currentState.stopwatch,
            running: true,
            startedAt: new Date().toISOString(),
          },
        };
      }

      const elapsedSinceStart = currentState.stopwatch.startedAt
        ? Math.max(
            0,
            Date.now() - Date.parse(currentState.stopwatch.startedAt),
          )
        : 0;
      return {
        ...currentState,
        stopwatch: {
          elapsedMs: currentState.stopwatch.elapsedMs + elapsedSinceStart,
          running: false,
          startedAt: null,
        },
      };
    });
  }, [updateState]);

  const resetStopwatch = useCallback(() => {
    updateState((currentState) => ({
      ...currentState,
      stopwatch: {
        elapsedMs: 0,
        running: false,
        startedAt: null,
      },
    }));
  }, [updateState]);

  const dismissTimerFinished = useCallback(() => {
    setTimerFinished(false);
  }, []);

  useEffect(() => {
    if (!ready || !state.timer.running || !state.timer.endsAt) return;

    const endsAt = Date.parse(state.timer.endsAt);
    if (Number.isNaN(endsAt)) return;

    const completionTimer = window.setTimeout(
      () => {
        updateState((currentState) => ({
          ...currentState,
          timer: {
            ...currentState.timer,
            endsAt: null,
            remainingMs: 0,
            running: false,
          },
        }));
        setTimerFinished(true);
      },
      Math.max(0, endsAt - Date.now()),
    );

    return () => window.clearTimeout(completionTimer);
  }, [ready, state.timer.endsAt, state.timer.running, updateState]);

  return {
    changeTimerDuration,
    dismissTimerFinished,
    pauseTimer,
    ready,
    resetStopwatch,
    resetTimer,
    startTimer,
    state,
    timerFinished,
    toggleStopwatch,
  };
}
