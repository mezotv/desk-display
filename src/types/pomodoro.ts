import type { DisplayLanguage } from "@/types/settings";

export type PomodoroModeId = "classic" | "deep";

export type PomodoroPhaseKind =
  | "complete"
  | "focus"
  | "long-break"
  | "short-break";

export type PomodoroState = {
  elapsedMs: number;
  mode: PomodoroModeId;
  planDurationMs: number;
  running: boolean;
  startedAt: string | null;
};

export type PomodoroUpdater = (state: PomodoroState) => PomodoroState;

export type PomodoroModeConfig = {
  focusDurationMs: number;
  longBreakDurationMs: number;
  longBreakEvery: number;
  shortBreakDurationMs: number;
};

export type PomodoroSchedulePhase = {
  durationMs: number;
  focusRound: number;
  kind: Exclude<PomodoroPhaseKind, "complete">;
};

export type PomodoroSnapshot = {
  completedFocusRounds: number;
  elapsedMs: number;
  focusRound: number;
  phase: PomodoroPhaseKind;
  phaseRemainingMs: number;
  planRemainingMs: number;
  plannedBreakMs: number;
  plannedFocusMs: number;
  progress: number;
  totalFocusRounds: number;
};

export type PomodoroCopy = {
  breakMinutes: string;
  classic: string;
  complete: string;
  deep: string;
  focus: string;
  focusMinutes: string;
  longBreak: string;
  minutes: string;
  pause: string;
  plan: string;
  remaining: string;
  reset: string;
  resume: string;
  round: string;
  shortBreak: string;
  start: string;
  startAgain: string;
  title: string;
};

export type PomodoroAppProps = {
  language: DisplayLanguage;
  now: Date;
  onChangeMode: (mode: PomodoroModeId) => void;
  onChangePlanDuration: (durationMs: number) => void;
  onHome: () => void;
  onReset: () => void;
  onToggle: () => void;
  pomodoro: PomodoroState;
};

export type UsePomodoroResult = {
  changeMode: (mode: PomodoroModeId) => void;
  changePlanDuration: (durationMs: number) => void;
  ready: boolean;
  reset: () => void;
  state: PomodoroState;
  toggle: () => void;
};
