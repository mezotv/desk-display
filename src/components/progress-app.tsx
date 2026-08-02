import { PixelatedImage } from "@/components/pixelated-image";
import { AMBIENT_COPY } from "@/constants/ambient";
import type { AmbientAppProps } from "@/types/ambient";
import { getTimeProgress } from "@/utils/get-time-progress";

export function ProgressApp({ language, now }: AmbientAppProps) {
  const copy = AMBIENT_COPY[language];
  const metrics = getTimeProgress(now);

  return (
    <div className="grid h-[min(85vh,700px)] w-[min(90vw,1100px)] grid-rows-[clamp(46px,7vh,64px)_minmax(0,1fr)] gap-[clamp(12px,2vh,20px)] transition-transform duration-100 group-active:scale-[0.985]">
      <header className="flex items-center gap-3 text-lime-400">
        <PixelatedImage
          alt=""
          className="size-[clamp(38px,min(5vw,8vh),58px)]"
          src="/logos/progress-pixel.svg"
        />
        <span className="text-[clamp(25px,min(3.5vw,5.7vh),42px)] font-extrabold tracking-[0.07em]">
          {copy.progress}
        </span>
      </header>
      <section className="grid min-h-0 grid-rows-4 gap-[clamp(7px,1.3vh,13px)]">
        {metrics.map((metric) => (
          <article
            className="grid min-h-0 grid-cols-[clamp(86px,12vw,150px)_minmax(0,1fr)_clamp(72px,9vw,112px)] items-center gap-[clamp(10px,2vw,24px)] rounded-[clamp(10px,1.2vw,16px)] border border-[#25252e] bg-display-panel px-[clamp(12px,2vw,26px)]"
            key={metric.id}
          >
            <span className="text-[clamp(16px,min(2.2vw,3.6vh),27px)] font-bold tracking-[0.08em] text-[#83838f]">
              {copy.progressLabels[metric.id]}
            </span>
            <i className="block h-[clamp(10px,2vh,16px)] overflow-hidden bg-[#292932]" aria-hidden="true">
              <b
                className="block h-full bg-lime-400"
                style={{ width: `${metric.percent}%` }}
              />
            </i>
            <strong className="text-right text-[clamp(23px,min(3.2vw,5.3vh),40px)] font-extrabold text-lime-300 tabular-nums">
              {metric.percent.toFixed(metric.id === "day" ? 0 : 1)}%
            </strong>
          </article>
        ))}
      </section>
    </div>
  );
}
