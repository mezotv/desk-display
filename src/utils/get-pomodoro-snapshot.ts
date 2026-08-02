import type {
  PomodoroSnapshot,
  PomodoroState,
} from "@/types/pomodoro";
import { getPomodoroElapsedMs } from "@/utils/get-pomodoro-elapsed";
import { getPomodoroSchedule } from "@/utils/get-pomodoro-schedule";

export function getPomodoroSnapshot(
  pomodoro: PomodoroState,
  nowTimestamp: number,
): PomodoroSnapshot {
  const schedule = getPomodoroSchedule(
    pomodoro.planDurationMs,
    pomodoro.mode,
  );
  const elapsedMs = getPomodoroElapsedMs(pomodoro, nowTimestamp);
  const plannedFocusMs = schedule.reduce(
    (total, phase) => total + (phase.kind === "focus" ? phase.durationMs : 0),
    0,
  );
  const totalFocusRounds = schedule.filter(
    (phase) => phase.kind === "focus",
  ).length;

  let scheduledBeforePhaseMs = 0;
  let completedFocusRounds = 0;

  for (const phase of schedule) {
    const phaseEndsAt = scheduledBeforePhaseMs + phase.durationMs;
    if (elapsedMs < phaseEndsAt) {
      return {
        completedFocusRounds,
        elapsedMs,
        focusRound: phase.focusRound,
        phase: phase.kind,
        phaseRemainingMs: phaseEndsAt - elapsedMs,
        planRemainingMs: pomodoro.planDurationMs - elapsedMs,
        plannedBreakMs: pomodoro.planDurationMs - plannedFocusMs,
        plannedFocusMs,
        progress: elapsedMs / pomodoro.planDurationMs,
        totalFocusRounds,
      };
    }

    scheduledBeforePhaseMs = phaseEndsAt;
    if (phase.kind === "focus") completedFocusRounds += 1;
  }

  return {
    completedFocusRounds,
    elapsedMs,
    focusRound: totalFocusRounds,
    phase: "complete",
    phaseRemainingMs: 0,
    planRemainingMs: 0,
    plannedBreakMs: pomodoro.planDurationMs - plannedFocusMs,
    plannedFocusMs,
    progress: 1,
    totalFocusRounds,
  };
}
