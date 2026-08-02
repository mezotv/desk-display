import type { PomodoroState } from "@/types/pomodoro";

export function getPomodoroElapsedMs(
  pomodoro: PomodoroState,
  nowTimestamp: number,
) {
  const startedAtTimestamp = pomodoro.startedAt
    ? Date.parse(pomodoro.startedAt)
    : Number.NaN;
  const runningElapsedMs =
    pomodoro.running && Number.isFinite(startedAtTimestamp)
      ? Math.max(0, nowTimestamp - startedAtTimestamp)
      : 0;

  return Math.min(
    pomodoro.planDurationMs,
    pomodoro.elapsedMs + runningElapsedMs,
  );
}
