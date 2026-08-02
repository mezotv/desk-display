import { TouchAppShell } from "@/components/touch-app-shell";
import {
  MAX_TIMER_DURATION_MS,
  MIN_TIMER_DURATION_MS,
  PRODUCTIVITY_COPY,
  TIMER_STEP_MS,
  TIMER_PRESETS_MINUTES,
} from "@/constants/productivity";
import type { TimerAppProps } from "@/types/productivity";
import { formatDuration } from "@/utils/format-duration";

export function TimerApp({
  language,
  now,
  onChangeDuration,
  onHome,
  onPause,
  onReset,
  onStart,
  timer,
}: TimerAppProps) {
  const copy = PRODUCTIVITY_COPY[language];
  const remainingMs =
    timer.running && timer.endsAt
      ? Math.max(0, Date.parse(timer.endsAt) - now.getTime())
      : timer.remainingMs;

  return (
    <TouchAppShell
      accent="#f97316"
      icon="/logos/timer-pixel.svg"
      onHome={onHome}
      title={copy.timer}
    >
      <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto_auto] place-items-center gap-[clamp(8px,1.7vh,16px)]">
        <div className="flex min-h-0 flex-col items-center justify-center">
          <time className="whitespace-nowrap text-[clamp(78px,min(16vw,27vh),210px)] font-extrabold leading-[0.8] tracking-[-0.075em] text-orange-400 tabular-nums max-[620px]:text-[clamp(64px,20vw,96px)]">
            {formatDuration(remainingMs)}
          </time>
          <span className="mt-[clamp(14px,3.5vh,28px)] text-[clamp(16px,min(2.2vw,3.6vh),26px)] font-bold tracking-[0.08em] text-[#6f6f7b]">
            {Math.round(timer.durationMs / 60_000)} {copy.minutes}
          </span>
        </div>

        <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto pb-0.5">
          {TIMER_PRESETS_MINUTES.map((minutes) => (
            <button
              className={`min-h-[clamp(42px,7vh,58px)] min-w-[clamp(66px,9vw,92px)] shrink-0 touch-manipulation rounded-[10px] border-0 text-[clamp(17px,min(2.2vw,3.7vh),25px)] font-extrabold outline-none active:scale-[0.96] ${
                timer.durationMs === minutes * 60_000
                  ? "bg-orange-500 text-display-bg"
                  : "bg-[#17171d] text-[#a4a4af]"
              } disabled:opacity-35`}
              disabled={timer.running}
              key={minutes}
              onClick={() => onChangeDuration(minutes * 60_000)}
              type="button"
            >
              {minutes}
            </button>
          ))}
        </div>

        <div className="grid w-[min(94vw,820px)] grid-cols-[0.8fr_1fr_1.45fr_0.8fr] gap-[clamp(6px,1vw,12px)]">
          <button
            className="min-h-[clamp(50px,9vh,72px)] touch-manipulation rounded-[11px] border-0 bg-[#17171d] text-[clamp(21px,min(3vw,5vh),34px)] font-extrabold text-[#a4a4af] outline-none active:scale-[0.97] active:bg-[#282833] disabled:opacity-35"
            disabled={timer.running || timer.durationMs <= MIN_TIMER_DURATION_MS}
            onClick={() =>
              onChangeDuration(
                Math.max(MIN_TIMER_DURATION_MS, timer.durationMs - TIMER_STEP_MS),
              )
            }
            type="button"
          >
            −5
          </button>
          <button
            className="min-h-[clamp(50px,9vh,72px)] touch-manipulation rounded-[11px] border-0 bg-[#17171d] text-[clamp(17px,min(2.25vw,3.8vh),26px)] font-bold text-[#8c8c98] outline-none active:scale-[0.97] active:bg-[#282833]"
            onClick={onReset}
            type="button"
          >
            {copy.reset}
          </button>
          <button
            className="min-h-[clamp(50px,9vh,72px)] touch-manipulation rounded-[11px] border-0 bg-orange-500 text-[clamp(20px,min(2.8vw,4.6vh),32px)] font-extrabold text-display-bg outline-none active:scale-[0.97] active:bg-orange-400"
            onClick={timer.running ? onPause : onStart}
            type="button"
          >
            {timer.running ? copy.pause : remainingMs < timer.durationMs ? copy.resume : copy.start}
          </button>
          <button
            className="min-h-[clamp(50px,9vh,72px)] touch-manipulation rounded-[11px] border-0 bg-[#17171d] text-[clamp(21px,min(3vw,5vh),34px)] font-extrabold text-[#a4a4af] outline-none active:scale-[0.97] active:bg-[#282833] disabled:opacity-35"
            disabled={timer.running || timer.durationMs >= MAX_TIMER_DURATION_MS}
            onClick={() =>
              onChangeDuration(
                Math.min(MAX_TIMER_DURATION_MS, timer.durationMs + TIMER_STEP_MS),
              )
            }
            type="button"
          >
            +5
          </button>
        </div>
      </div>
    </TouchAppShell>
  );
}
