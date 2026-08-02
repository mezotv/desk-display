import { TouchAppShell } from "@/components/touch-app-shell";
import { PRODUCTIVITY_COPY } from "@/constants/productivity";
import type { StopwatchAppProps } from "@/types/productivity";
import { formatDuration } from "@/utils/format-duration";

export function StopwatchApp({
  language,
  now,
  onHome,
  onReset,
  onToggle,
  stopwatch,
}: StopwatchAppProps) {
  const copy = PRODUCTIVITY_COPY[language];
  const runningElapsed =
    stopwatch.running && stopwatch.startedAt
      ? Math.max(0, now.getTime() - Date.parse(stopwatch.startedAt))
      : 0;
  const elapsedMs = stopwatch.elapsedMs + runningElapsed;

  return (
    <TouchAppShell
      accent="#22d3ee"
      icon="/logos/stopwatch-pixel.svg"
      onHome={onHome}
      title={copy.stopwatch}
    >
      <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] place-items-center gap-4">
        <time className="whitespace-nowrap text-[clamp(72px,min(14.5vw,24vh),190px)] font-extrabold leading-none tracking-[-0.07em] text-cyan-400 tabular-nums max-[620px]:text-[clamp(52px,16vw,82px)]">
          {formatDuration(elapsedMs, true)}
        </time>
        <div className="grid w-[min(90vw,720px)] grid-cols-2 gap-[clamp(8px,1.5vw,16px)]">
          <button
            className="min-h-[clamp(58px,11vh,86px)] touch-manipulation rounded-[12px] border-0 bg-[#17171d] text-[clamp(20px,min(2.8vw,4.7vh),32px)] font-bold text-[#8f8f9a] outline-none active:scale-[0.97] active:bg-[#282833]"
            onClick={onReset}
            type="button"
          >
            {copy.reset}
          </button>
          <button
            className="min-h-[clamp(58px,11vh,86px)] touch-manipulation rounded-[12px] border-0 bg-cyan-400 text-[clamp(24px,min(3.3vw,5.5vh),38px)] font-extrabold text-display-bg outline-none active:scale-[0.97] active:bg-cyan-300"
            onClick={onToggle}
            type="button"
          >
            {stopwatch.running ? copy.pause : elapsedMs > 0 ? copy.resume : copy.start}
          </button>
        </div>
      </div>
    </TouchAppShell>
  );
}
