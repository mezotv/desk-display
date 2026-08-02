import { POMODORO_MODES } from "@/constants/pomodoro";
import type {
  PomodoroModeId,
  PomodoroSchedulePhase,
} from "@/types/pomodoro";

export function getPomodoroSchedule(
  planDurationMs: number,
  mode: PomodoroModeId,
): PomodoroSchedulePhase[] {
  const config = POMODORO_MODES[mode];
  const schedule: PomodoroSchedulePhase[] = [];
  let scheduledMs = 0;
  let focusRound = 0;

  while (scheduledMs < planDurationMs) {
    focusRound += 1;
    const focusDurationMs = Math.min(
      config.focusDurationMs,
      planDurationMs - scheduledMs,
    );
    schedule.push({
      durationMs: focusDurationMs,
      focusRound,
      kind: "focus",
    });
    scheduledMs += focusDurationMs;

    if (scheduledMs >= planDurationMs) break;

    const isLongBreak = focusRound % config.longBreakEvery === 0;
    const breakDurationMs = Math.min(
      isLongBreak
        ? config.longBreakDurationMs
        : config.shortBreakDurationMs,
      planDurationMs - scheduledMs,
    );
    schedule.push({
      durationMs: breakDurationMs,
      focusRound,
      kind: isLongBreak ? "long-break" : "short-break",
    });
    scheduledMs += breakDurationMs;
  }

  return schedule;
}
