import type { DisplayLanguage } from "@/types/settings";

export type CountdownTimer = {
  durationMs: number;
  endsAt: string | null;
  remainingMs: number;
  running: boolean;
};

export type DisplayStopwatch = {
  elapsedMs: number;
  running: boolean;
  startedAt: string | null;
};

export type ProductivityState = {
  stopwatch: DisplayStopwatch;
  timer: CountdownTimer;
};

export type ProductivityUpdater = (
  state: ProductivityState,
) => ProductivityState;

export type UseProductivityResult = {
  changeTimerDuration: (durationMs: number) => void;
  dismissTimerFinished: () => void;
  pauseTimer: () => void;
  ready: boolean;
  resetStopwatch: () => void;
  resetTimer: () => void;
  startTimer: () => void;
  state: ProductivityState;
  timerFinished: boolean;
  toggleStopwatch: () => void;
};

export type ProductivityCopy = {
  dismiss: string;
  finished: string;
  minutes: string;
  pause: string;
  reset: string;
  resume: string;
  start: string;
  stopwatch: string;
  timer: string;
};

export type TimerAppProps = {
  language: DisplayLanguage;
  now: Date;
  onChangeDuration: (durationMs: number) => void;
  onHome: () => void;
  onPause: () => void;
  onReset: () => void;
  onStart: () => void;
  timer: CountdownTimer;
};

export type TimerFinishedProps = {
  language: DisplayLanguage;
  onDismiss: () => void;
};

export type StopwatchAppProps = {
  language: DisplayLanguage;
  now: Date;
  onHome: () => void;
  onReset: () => void;
  onToggle: () => void;
  stopwatch: DisplayStopwatch;
};
