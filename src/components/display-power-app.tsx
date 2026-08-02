import { PixelatedImage } from "@/components/pixelated-image";
import { TouchAppShell } from "@/components/touch-app-shell";
import { DISPLAY_POWER_COPY } from "@/constants/display-power";
import type { DisplayPowerAppProps } from "@/types/display-power";

export function DisplayPowerApp({
  changing,
  error,
  language,
  onHome,
  onSleep,
}: DisplayPowerAppProps) {
  const copy = DISPLAY_POWER_COPY[language];

  return (
    <TouchAppShell
      accent="#a3e635"
      icon="/logos/display-power-pixel.svg"
      onHome={onHome}
      title={copy.title}
    >
      <div className="grid h-full min-h-0 place-items-center">
        <button
          className="grid h-[min(100%,350px)] w-[min(94vw,760px)] touch-manipulation grid-rows-[1fr_auto_auto] place-items-center rounded-[18px] border-0 bg-display-panel px-[clamp(20px,4vw,52px)] py-[clamp(16px,3vh,32px)] text-center outline-none active:scale-[0.985] active:bg-[#18181f] disabled:opacity-55"
          disabled={changing}
          onClick={onSleep}
          type="button"
        >
          <PixelatedImage
            alt=""
            className="size-[clamp(105px,min(17vw,28vh),210px)] self-end"
            src="/logos/display-power-pixel.svg"
          />
          <strong className="mt-2 rounded-[12px] bg-lime-400 px-[clamp(24px,5vw,54px)] py-[clamp(11px,2.2vh,19px)] text-[clamp(24px,min(3.6vw,6vh),42px)] font-extrabold tracking-[0.04em] text-display-bg">
            {changing ? copy.turningOff : copy.turnOff}
          </strong>
          <span className="mt-[clamp(10px,2vh,18px)] text-[clamp(14px,min(1.8vw,3vh),21px)] font-bold leading-snug tracking-[0.06em] text-[#757581]">
            {copy.hint}
            <small className="mt-1.5 block text-[0.82em] text-[#555560]">
              {copy.keepRunning}
            </small>
            {error ? (
              <small className="mt-2 block text-[0.82em] text-rose-400">
                {copy.error} · {error}
              </small>
            ) : null}
          </span>
        </button>
      </div>
    </TouchAppShell>
  );
}
