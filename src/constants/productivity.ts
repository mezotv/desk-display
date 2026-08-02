import type { ProductivityCopy, ProductivityState } from "@/types/productivity";
import type { DisplayLanguage } from "@/types/settings";

export const DEFAULT_TIMER_DURATION_MS = 25 * 60_000;
export const MAX_TIMER_DURATION_MS = 4 * 60 * 60_000;
export const MIN_TIMER_DURATION_MS = 60_000;
export const TIMER_STEP_MS = 5 * 60_000;
export const TIMER_PRESETS_MINUTES = [5, 15, 25, 45, 60] as const;
export const MAX_DISPLAY_TASKS = 12;
export const MAX_TASK_LENGTH = 32;
export const MAX_NOTE_LENGTH = 96;
export const PRODUCTIVITY_STORAGE_KEY = "desk-display-productivity-v1";

export const DEFAULT_PRODUCTIVITY_STATE: ProductivityState = {
  note: "",
  stopwatch: {
    elapsedMs: 0,
    running: false,
    startedAt: null,
  },
  tasks: [],
  timer: {
    durationMs: DEFAULT_TIMER_DURATION_MS,
    endsAt: null,
    remainingMs: DEFAULT_TIMER_DURATION_MS,
    running: false,
  },
};

export const PRODUCTIVITY_COPY: Record<DisplayLanguage, ProductivityCopy> = {
  de: {
    addTask: "+ AUFGABE",
    back: "ZURÜCK",
    clearDone: "ERLEDIGTE LÖSCHEN",
    completed: "ERLEDIGT",
    dismiss: "AUSSCHALTEN",
    edit: "BEARBEITEN",
    emptyNote: "TIPPE, UM EINE NOTIZ ANZUPINNEN",
    emptyTasks: "ALLES ERLEDIGT",
    finished: "ZEIT IST UM",
    minutes: "MIN",
    note: "NOTIZ",
    pause: "PAUSE",
    reset: "RESET",
    resume: "WEITER",
    save: "SPEICHERN",
    start: "START",
    stopwatch: "STOPPUHR",
    tasks: "AUFGABEN",
    timer: "TIMER",
  },
  en: {
    addTask: "+ TASK",
    back: "BACK",
    clearDone: "CLEAR DONE",
    completed: "DONE",
    dismiss: "DISMISS",
    edit: "EDIT",
    emptyNote: "TAP TO PIN A NOTE",
    emptyTasks: "ALL CLEAR",
    finished: "TIME IS UP",
    minutes: "MIN",
    note: "NOTE",
    pause: "PAUSE",
    reset: "RESET",
    resume: "RESUME",
    save: "SAVE",
    start: "START",
    stopwatch: "STOPWATCH",
    tasks: "TASKS",
    timer: "TIMER",
  },
};
