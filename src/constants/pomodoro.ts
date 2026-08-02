import type {
  PomodoroCopy,
  PomodoroModeConfig,
  PomodoroModeId,
  PomodoroPhaseKind,
  PomodoroState,
} from "@/types/pomodoro";
import type { DisplayLanguage } from "@/types/settings";

export const POMODORO_MODE_IDS = [
  "classic",
  "deep",
] satisfies readonly PomodoroModeId[];
export const POMODORO_STORAGE_KEY = "desk-display-pomodoro-v1";
export const POMODORO_PLAN_STEP_MS = 30 * 60_000;
export const MIN_POMODORO_PLAN_MS = 60 * 60_000;
export const MAX_POMODORO_PLAN_MS = 12 * 60 * 60_000;
export const POMODORO_PLAN_PRESETS_MINUTES = [60, 180, 300, 480];
export const POMODORO_ACCENT = "#fb7185";
export const POMODORO_PHASE_COLORS: Record<PomodoroPhaseKind, string> = {
  complete: "#a3e635",
  focus: POMODORO_ACCENT,
  "long-break": "#af5cf6",
  "short-break": "#22d3ee",
};

export const POMODORO_MODES: Record<PomodoroModeId, PomodoroModeConfig> = {
  classic: {
    focusDurationMs: 25 * 60_000,
    longBreakDurationMs: 15 * 60_000,
    longBreakEvery: 4,
    shortBreakDurationMs: 5 * 60_000,
  },
  deep: {
    focusDurationMs: 50 * 60_000,
    longBreakDurationMs: 20 * 60_000,
    longBreakEvery: 4,
    shortBreakDurationMs: 10 * 60_000,
  },
};

export const DEFAULT_POMODORO_STATE: PomodoroState = {
  elapsedMs: 0,
  mode: "classic",
  planDurationMs: 5 * 60 * 60_000,
  running: false,
  startedAt: null,
};

export const POMODORO_COPY: Record<DisplayLanguage, PomodoroCopy> = {
  de: {
    breakMinutes: "PAUSE",
    classic: "KLASSISCH",
    complete: "SESSION GESCHAFFT",
    deep: "DEEP WORK",
    focus: "FOKUS",
    focusMinutes: "FOKUS",
    longBreak: "LANGE PAUSE",
    minutes: "MIN",
    pause: "PAUSE",
    plan: "PLAN",
    remaining: "ÜBRIG",
    reset: "RESET",
    resume: "WEITER",
    round: "RUNDE",
    shortBreak: "KURZE PAUSE",
    start: "START",
    startAgain: "NEU STARTEN",
    title: "POMODORO",
  },
  en: {
    breakMinutes: "BREAK",
    classic: "CLASSIC",
    complete: "SESSION COMPLETE",
    deep: "DEEP WORK",
    focus: "FOCUS",
    focusMinutes: "FOCUS",
    longBreak: "LONG BREAK",
    minutes: "MIN",
    pause: "PAUSE",
    plan: "PLAN",
    remaining: "LEFT",
    reset: "RESET",
    resume: "RESUME",
    round: "ROUND",
    shortBreak: "SHORT BREAK",
    start: "START",
    startAgain: "START AGAIN",
    title: "POMODORO",
  },
};
