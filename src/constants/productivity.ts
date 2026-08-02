import type { ProductivityCopy, ProductivityState } from "@/types/productivity";
import type { DisplayLanguage } from "@/types/settings";

export const DEFAULT_TIMER_DURATION_MS = 25 * 60_000;
export const MAX_TIMER_DURATION_MS = 4 * 60 * 60_000;
export const MIN_TIMER_DURATION_MS = 60_000;
export const TIMER_STEP_MS = 5 * 60_000;
export const TIMER_PRESETS_MINUTES = [5, 15, 25, 45, 60] as const;
export const PRODUCTIVITY_STORAGE_KEY = "desk-display-productivity-v1";

export const DEFAULT_PRODUCTIVITY_STATE: ProductivityState = {
  stopwatch: {
    elapsedMs: 0,
    running: false,
    startedAt: null,
  },
  timer: {
    durationMs: DEFAULT_TIMER_DURATION_MS,
    endsAt: null,
    remainingMs: DEFAULT_TIMER_DURATION_MS,
    running: false,
  },
};

export const PRODUCTIVITY_COPY: Record<DisplayLanguage, ProductivityCopy> = {
  de: {
    dismiss: "AUSSCHALTEN",
    finished: "ZEIT IST UM",
    minutes: "MIN",
    pause: "PAUSE",
    reset: "RESET",
    resume: "WEITER",
    start: "START",
    stopwatch: "STOPPUHR",
    timer: "TIMER",
  },
  en: {
    dismiss: "DISMISS",
    finished: "TIME IS UP",
    minutes: "MIN",
    pause: "PAUSE",
    reset: "RESET",
    resume: "RESUME",
    start: "START",
    stopwatch: "STOPWATCH",
    timer: "TIMER",
  },
};
