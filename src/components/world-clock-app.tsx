import { PixelatedImage } from "@/components/pixelated-image";
import { AMBIENT_COPY, WORLD_CLOCK_ZONES } from "@/constants/ambient";
import type { AmbientAppProps } from "@/types/ambient";
import {
  formatWorldClockDay,
  formatWorldClockTime,
} from "@/utils/format-world-clock";

export function WorldClockApp({ language, now }: AmbientAppProps) {
  const copy = AMBIENT_COPY[language];

  return (
    <div className="grid h-[min(87vh,760px)] w-[min(92vw,1280px)] min-w-0 grid-rows-[clamp(44px,7vh,64px)_minmax(0,1fr)] gap-[clamp(10px,1.7vh,18px)] transition-transform duration-100 group-active:scale-[0.985]">
      <header className="flex items-center gap-3 text-blue-400">
        <PixelatedImage
          alt=""
          className="size-[clamp(38px,min(5vw,8vh),58px)]"
          src="/logos/world-pixel.svg"
        />
        <span className="text-[clamp(25px,min(3.5vw,5.7vh),42px)] font-extrabold tracking-[0.07em]">
          {copy.worldClock}
        </span>
      </header>
      <section className="grid min-h-0 grid-cols-3 grid-rows-2 gap-[clamp(8px,1.4vw,16px)] max-[620px]:gap-2">
        {WORLD_CLOCK_ZONES.map((zone) => (
          <article
            className="flex min-h-0 min-w-0 flex-col items-start justify-center overflow-hidden rounded-[clamp(11px,1.4vw,17px)] border border-[#25252e] bg-display-panel px-[clamp(10px,2vw,28px)] py-[clamp(8px,1.5vh,18px)] text-left"
            key={zone.timeZone}
          >
            <span
              className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(14px,min(1.9vw,3.2vh),23px)] font-bold tracking-[0.07em] max-[620px]:text-[clamp(11px,3.2vw,14px)]"
              style={{ color: zone.accent }}
            >
              {zone.label[language]}
            </span>
            <time className="mt-[clamp(5px,1.2vh,10px)] max-w-full whitespace-nowrap text-[clamp(31px,min(4.5vw,7.5vh),58px)] font-extrabold leading-none tracking-[-0.045em] text-display-text tabular-nums max-[620px]:text-[clamp(22px,6.5vw,31px)]">
              {formatWorldClockTime(now, language, zone.timeZone)}
            </time>
            <time className="mt-[clamp(6px,1.2vh,11px)] max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(12px,min(1.6vw,2.7vh),19px)] font-semibold tracking-[0.04em] text-[#696975] max-[620px]:text-[10px]">
              {formatWorldClockDay(now, language, zone.timeZone)}
            </time>
          </article>
        ))}
      </section>
    </div>
  );
}
