import { TouchAppShell } from "@/components/touch-app-shell";
import {
  MAX_POMODORO_PLAN_MS,
  MIN_POMODORO_PLAN_MS,
  POMODORO_ACCENT,
  POMODORO_COPY,
  POMODORO_MODE_IDS,
  POMODORO_MODES,
  POMODORO_PHASE_COLORS,
  POMODORO_PLAN_PRESETS_MINUTES,
  POMODORO_PLAN_STEP_MS,
} from "@/constants/pomodoro";
import type { PomodoroAppProps } from "@/types/pomodoro";
import { formatDuration } from "@/utils/format-duration";
import { getPomodoroSnapshot } from "@/utils/get-pomodoro-snapshot";

export function PomodoroApp({
  language,
  now,
  onChangeMode,
  onChangePlanDuration,
  onHome,
  onReset,
  onToggle,
  pomodoro,
}: PomodoroAppProps) {
  const copy = POMODORO_COPY[language];
  const mode = POMODORO_MODES[pomodoro.mode];
  const snapshot = getPomodoroSnapshot(pomodoro, now.getTime());
  const phaseColor = POMODORO_PHASE_COLORS[snapshot.phase];
  const phaseLabel =
    snapshot.phase === "focus"
      ? copy.focus
      : snapshot.phase === "short-break"
        ? copy.shortBreak
        : snapshot.phase === "long-break"
          ? copy.longBreak
          : copy.complete;
  const focusMinutes = Math.round(mode.focusDurationMs / 60_000);
  const shortBreakMinutes = Math.round(mode.shortBreakDurationMs / 60_000);
  const planHours = pomodoro.planDurationMs / (60 * 60_000);
  const focusPlanMinutes = Math.round(snapshot.plannedFocusMs / 60_000);
  const breakPlanMinutes = Math.round(snapshot.plannedBreakMs / 60_000);
  const hasProgress = snapshot.elapsedMs > 0;

  return (
    <TouchAppShell
      accent={POMODORO_ACCENT}
      icon="/logos/pomodoro-pixel.svg"
      onHome={onHome}
      title={copy.title}
    >
      <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto_auto] gap-[clamp(8px,1.5vh,13px)]">
        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(210px,30%)] gap-[clamp(10px,1.7vw,20px)] max-[620px]:grid-cols-1">
          <div className="flex min-h-0 flex-col items-center justify-center rounded-[14px] bg-display-panel px-3 py-2 text-center">
            <span
              className="text-[clamp(18px,min(2.3vw,3.8vh),28px)] font-extrabold tracking-[0.12em]"
              style={{ color: phaseColor }}
            >
              {phaseLabel}
            </span>
            <time
              className="mt-1 whitespace-nowrap text-[clamp(68px,min(12vw,20vh),152px)] font-extrabold leading-[0.85] tracking-[-0.065em] tabular-nums"
              style={{ color: phaseColor }}
            >
              {formatDuration(snapshot.phaseRemainingMs)}
            </time>
            <span className="mt-3 text-[clamp(14px,min(1.7vw,2.8vh),20px)] font-bold tracking-[0.08em] text-[#70707c]">
              {copy.round} {snapshot.focusRound} / {snapshot.totalFocusRounds}
            </span>
          </div>

          <aside className="grid min-h-0 grid-rows-[auto_auto_1fr] rounded-[14px] bg-display-panel px-[clamp(12px,1.6vw,20px)] py-[clamp(10px,1.7vh,18px)]">
            <div className="flex items-end justify-between gap-2">
              <span className="text-[clamp(14px,min(1.6vw,2.6vh),19px)] font-bold tracking-[0.08em] text-[#73737f]">
                {copy.plan}
              </span>
              <strong className="text-[clamp(21px,min(2.6vw,4.4vh),32px)] text-display-text">
                {planHours}H
              </strong>
            </div>
            <div className="my-[clamp(8px,1.5vh,14px)] h-[clamp(9px,1.6vh,14px)] overflow-hidden rounded-full bg-[#24242d]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  backgroundColor: phaseColor,
                  width: `${snapshot.progress * 100}%`,
                }}
              />
            </div>
            <div className="grid content-center gap-[clamp(5px,1vh,9px)] text-[clamp(13px,min(1.5vw,2.5vh),18px)] font-bold tracking-[0.05em] text-[#686874]">
              <p className="m-0 flex justify-between gap-2">
                <span>{copy.remaining}</span>
                <strong className="text-display-text">
                  {formatDuration(snapshot.planRemainingMs)}
                </strong>
              </p>
              <p className="m-0 flex justify-between gap-2">
                <span>{copy.focusMinutes}</span>
                <strong className="text-rose-400">{focusPlanMinutes} MIN</strong>
              </p>
              <p className="m-0 flex justify-between gap-2">
                <span>{copy.breakMinutes}</span>
                <strong className="text-cyan-400">{breakPlanMinutes} MIN</strong>
              </p>
            </div>
          </aside>
        </div>

        <div className="no-scrollbar flex max-w-full items-stretch gap-2 overflow-x-auto pb-0.5">
          {POMODORO_PLAN_PRESETS_MINUTES.map((minutes) => (
            <button
              className={`min-h-[clamp(42px,7vh,56px)] min-w-[clamp(62px,8vw,84px)] shrink-0 touch-manipulation rounded-[10px] border-0 text-[clamp(16px,min(2vw,3.4vh),23px)] font-extrabold outline-none active:scale-[0.96] ${
                pomodoro.planDurationMs === minutes * 60_000
                  ? "bg-rose-400 text-display-bg"
                  : "bg-[#17171d] text-[#9898a4]"
              } disabled:opacity-35`}
              disabled={pomodoro.running}
              key={minutes}
              onClick={() => onChangePlanDuration(minutes * 60_000)}
              type="button"
            >
              {minutes / 60}H
            </button>
          ))}
          {POMODORO_MODE_IDS.map((modeId) => {
            const modeOption = POMODORO_MODES[modeId];
            return (
              <button
                className={`min-h-[clamp(42px,7vh,56px)] min-w-[clamp(126px,17vw,174px)] shrink-0 touch-manipulation rounded-[10px] border-0 px-3 text-[clamp(14px,min(1.7vw,2.8vh),20px)] font-extrabold outline-none active:scale-[0.96] ${
                  pomodoro.mode === modeId
                    ? "bg-cyan-400 text-display-bg"
                    : "bg-[#17171d] text-[#9898a4]"
                } disabled:opacity-35`}
                disabled={pomodoro.running}
                key={modeId}
                onClick={() => onChangeMode(modeId)}
                type="button"
              >
                {copy[modeId]} {modeOption.focusDurationMs / 60_000}/
                {modeOption.shortBreakDurationMs / 60_000}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-[0.75fr_1fr_1.5fr_0.75fr] gap-[clamp(6px,1vw,11px)]">
          <button
            className="min-h-[clamp(48px,8.5vh,68px)] touch-manipulation rounded-[11px] border-0 bg-[#17171d] text-[clamp(18px,min(2.5vw,4.2vh),29px)] font-extrabold text-[#a0a0ac] outline-none active:scale-[0.97] active:bg-[#282833] disabled:opacity-30"
            disabled={
              pomodoro.running ||
              pomodoro.planDurationMs <= MIN_POMODORO_PLAN_MS
            }
            onClick={() =>
              onChangePlanDuration(
                Math.max(
                  MIN_POMODORO_PLAN_MS,
                  pomodoro.planDurationMs - POMODORO_PLAN_STEP_MS,
                ),
              )
            }
            type="button"
          >
            −30
          </button>
          <button
            className="min-h-[clamp(48px,8.5vh,68px)] touch-manipulation rounded-[11px] border-0 bg-[#17171d] text-[clamp(15px,min(2vw,3.4vh),23px)] font-bold text-[#898995] outline-none active:scale-[0.97] active:bg-[#282833]"
            onClick={onReset}
            type="button"
          >
            {copy.reset}
          </button>
          <button
            className="min-h-[clamp(48px,8.5vh,68px)] touch-manipulation rounded-[11px] border-0 bg-rose-400 text-[clamp(18px,min(2.5vw,4.2vh),29px)] font-extrabold text-display-bg outline-none active:scale-[0.97] active:bg-rose-300"
            onClick={onToggle}
            type="button"
          >
            {pomodoro.running
              ? copy.pause
              : snapshot.phase === "complete"
                ? copy.startAgain
                : hasProgress
                  ? copy.resume
                  : copy.start}
          </button>
          <button
            className="min-h-[clamp(48px,8.5vh,68px)] touch-manipulation rounded-[11px] border-0 bg-[#17171d] text-[clamp(18px,min(2.5vw,4.2vh),29px)] font-extrabold text-[#a0a0ac] outline-none active:scale-[0.97] active:bg-[#282833] disabled:opacity-30"
            disabled={
              pomodoro.running ||
              pomodoro.planDurationMs >= MAX_POMODORO_PLAN_MS
            }
            onClick={() =>
              onChangePlanDuration(
                Math.min(
                  MAX_POMODORO_PLAN_MS,
                  pomodoro.planDurationMs + POMODORO_PLAN_STEP_MS,
                ),
              )
            }
            type="button"
          >
            +30
          </button>
        </div>
      </div>
    </TouchAppShell>
  );
}
