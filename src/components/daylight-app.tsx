import { PixelatedImage } from "@/components/pixelated-image";
import { AMBIENT_COPY } from "@/constants/ambient";
import type { DaylightAppProps } from "@/types/ambient";
import { formatClockTime } from "@/utils/format-clock";
import { getDaylightProgress } from "@/utils/get-daylight-progress";

export function DaylightApp({ language, now, weather }: DaylightAppProps) {
  const copy = AMBIENT_COPY[language];
  const daylight = getDaylightProgress(now, weather.sunrise, weather.sunset);

  if (!daylight) {
    return (
      <div className="flex flex-col items-center justify-center transition-transform duration-100 group-active:scale-[0.985]">
        <PixelatedImage
          alt=""
          className="size-[clamp(150px,min(22vw,36vh),300px)]"
          src="/logos/daylight-pixel.svg"
        />
        <strong className="mt-4 text-center text-[clamp(27px,min(4vw,6.6vh),48px)] font-extrabold text-[#6f6f7a]">
          {copy.daylightUnavailable}
        </strong>
      </div>
    );
  }

  return (
    <div className="grid w-[min(90vw,1120px)] grid-cols-[clamp(160px,25vw,320px)_minmax(0,1fr)] items-center gap-[clamp(26px,5vw,72px)] transition-transform duration-100 group-active:scale-[0.985] max-[620px]:w-[88vw] max-[620px]:grid-cols-1 max-[620px]:gap-4">
      <PixelatedImage
        alt=""
        className="size-[clamp(160px,min(25vw,42vh),320px)] max-[620px]:size-[clamp(110px,min(35vw,25vh),170px)]"
        src="/logos/daylight-pixel.svg"
      />
      <section className="flex min-w-0 flex-col text-left max-[620px]:items-center max-[620px]:text-center">
        <span className="text-[clamp(22px,min(3vw,5vh),38px)] font-extrabold tracking-[0.08em] text-orange-400">
          {copy.daylight}
        </span>
        <strong className="mt-2 whitespace-nowrap text-[clamp(54px,min(8vw,13vh),100px)] font-extrabold leading-none tracking-[-0.05em] text-display-text">
          {daylight.daylightHours.toFixed(1)}H
        </strong>
        <span className="mt-1 text-[clamp(16px,min(2vw,3.3vh),24px)] font-bold tracking-[0.05em] text-[#73737f]">
          {copy.hoursOfLight}
        </span>
        <div className="mt-[clamp(14px,3vh,26px)] h-[clamp(12px,2.2vh,18px)] w-full min-w-[260px] overflow-hidden bg-[#292932] max-[620px]:min-w-0">
          <span
            className="block h-full bg-orange-400"
            style={{ width: `${daylight.percent}%` }}
          />
        </div>
        <div className="mt-[clamp(12px,2.5vh,20px)] grid w-full grid-cols-2 gap-3">
          <div>
            <span className="block text-[clamp(13px,min(1.7vw,2.8vh),20px)] font-bold tracking-[0.05em] text-[#686874]">
              {copy.sunrise}
            </span>
            <time className="text-[clamp(24px,min(3.2vw,5.3vh),40px)] font-extrabold text-orange-300">
              {formatClockTime(daylight.sunriseAt, language)}
            </time>
          </div>
          <div>
            <span className="block text-[clamp(13px,min(1.7vw,2.8vh),20px)] font-bold tracking-[0.05em] text-[#686874]">
              {copy.sunset}
            </span>
            <time className="text-[clamp(24px,min(3.2vw,5.3vh),40px)] font-extrabold text-violet-300">
              {formatClockTime(daylight.sunsetAt, language)}
            </time>
          </div>
        </div>
      </section>
    </div>
  );
}
