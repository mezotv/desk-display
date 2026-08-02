import { PixelatedImage } from "@/components/pixelated-image";
import { PRODUCTIVITY_COPY } from "@/constants/productivity";
import type { TimerFinishedProps } from "@/types/productivity";

export function TimerFinished({ language, onDismiss }: TimerFinishedProps) {
  const copy = PRODUCTIVITY_COPY[language];

  return (
    <main className="grid h-dvh w-full animate-[alarm-background-pulse_1.2s_steps(2,end)_infinite] place-items-center overflow-hidden bg-display-bg p-4">
      <button
        className="flex h-full w-full touch-manipulation flex-col items-center justify-center border-0 bg-transparent text-orange-400 outline-none active:scale-[0.985]"
        onClick={onDismiss}
        type="button"
      >
        <PixelatedImage
          alt=""
          className="size-[clamp(120px,min(20vw,34vh),250px)]"
          src="/logos/timer-pixel.svg"
        />
        <strong className="mt-4 text-[clamp(46px,min(7vw,12vh),92px)] font-extrabold tracking-[0.04em]">
          {copy.finished}
        </strong>
        <span className="mt-4 rounded-[12px] bg-orange-500 px-[clamp(28px,5vw,56px)] py-[clamp(12px,2.5vh,22px)] text-[clamp(24px,min(3.5vw,5.8vh),42px)] font-extrabold text-display-bg">
          {copy.dismiss}
        </span>
      </button>
    </main>
  );
}
