import { PixelatedImage } from "@/components/pixelated-image";
import { SYSTEM_COPY } from "@/constants/system";
import type { SystemAppProps } from "@/types/system";
import { formatMemorySize, formatSystemUptime } from "@/utils/format-system";

export function SystemApp({ language, system }: SystemAppProps) {
  const copy = SYSTEM_COPY[language];
  const usedMemoryBytes = system.totalMemoryBytes - system.freeMemoryBytes;
  const memoryPercent = system.totalMemoryBytes
    ? Math.round((usedMemoryBytes / system.totalMemoryBytes) * 100)
    : 0;
  const temperature =
    system.cpuTemperatureCelsius === null
      ? "--°"
      : `${Math.round(system.cpuTemperatureCelsius)}°`;

  return (
    <div className="grid h-[min(85.4vh,720px)] min-h-0 w-[min(91.25vw,1200px)] min-w-0 grid-rows-[clamp(46px,7vh,66px)_minmax(0,1fr)] gap-[clamp(12px,1.8vh,18px)] transition-transform duration-100 group-active:scale-[0.985] max-[620px]:h-[calc(100%_-_24px)] max-[620px]:w-[calc(100%_-_24px)] max-[620px]:grid-rows-[42px_minmax(0,1fr)] max-[620px]:gap-2">
      <header className="grid min-w-0 grid-cols-[clamp(42px,5.25vw,62px)_minmax(0,1fr)_auto] items-center gap-[clamp(12px,1.5vw,20px)] text-left text-cyan-400 max-[620px]:grid-cols-[38px_minmax(0,1fr)]">
        <PixelatedImage
          alt=""
          className="size-[clamp(42px,min(5.25vw,8.75vh),62px)] max-[620px]:size-[38px]"
          src="/logos/system-pixel.svg"
        />
        <span className="text-[clamp(27px,min(3.4vw,5.6vh),42px)] font-extrabold tracking-[0.08em] max-[620px]:text-[clamp(20px,6.2vw,27px)]">
          {copy.system}
        </span>
        <small className="max-w-[min(28vw,360px)] overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(16px,min(2vw,3.3vh),24px)] font-semibold text-[#6f6f7b] max-[620px]:hidden">
          {system.hostname}
        </small>
      </header>

      <section className="grid min-h-0 min-w-0 grid-cols-2 grid-rows-2 gap-[clamp(11px,1.4vw,18px)] max-[620px]:gap-2">
        <article className="flex min-h-0 min-w-0 flex-col items-start justify-center overflow-hidden rounded-[clamp(13px,1.2vw,18px)] border border-[#25252e] bg-display-panel px-[clamp(18px,2.25vw,32px)] py-[clamp(14px,2vh,24px)] text-left max-[620px]:p-2.5">
          <span className="text-[clamp(16px,min(2vw,3.3vh),24px)] font-bold tracking-[0.08em] text-[#73737f] max-[620px]:text-[clamp(11px,3.4vw,15px)]">
            {copy.temperature}
          </span>
          <strong className="mt-2 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(68px,min(8.5vw,14vh),108px)] font-extrabold leading-[0.95] tracking-[-0.035em] text-cyan-400 max-[620px]:text-[clamp(42px,13vw,60px)]">
            {temperature}
          </strong>
        </article>

        <article className="flex min-h-0 min-w-0 flex-col items-start justify-center overflow-hidden rounded-[clamp(13px,1.2vw,18px)] border border-[#25252e] bg-display-panel px-[clamp(18px,2.25vw,32px)] py-[clamp(14px,2vh,24px)] text-left max-[620px]:p-2.5">
          <span className="text-[clamp(16px,min(2vw,3.3vh),24px)] font-bold tracking-[0.08em] text-[#73737f] max-[620px]:text-[clamp(11px,3.4vw,15px)]">
            {copy.uptime}
          </span>
          <strong className="mt-2 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(47px,min(5.9vw,9.8vh),76px)] font-extrabold leading-[0.95] tracking-[-0.035em] text-display-text max-[620px]:text-[clamp(30px,9.5vw,44px)]">
            {formatSystemUptime(system.uptimeSeconds, language)}
          </strong>
        </article>

        <article className="flex min-h-0 min-w-0 flex-col items-start justify-center overflow-hidden rounded-[clamp(13px,1.2vw,18px)] border border-[#25252e] bg-display-panel px-[clamp(18px,2.25vw,32px)] py-[clamp(14px,2vh,24px)] text-left max-[620px]:p-2.5">
          <span className="text-[clamp(16px,min(2vw,3.3vh),24px)] font-bold tracking-[0.08em] text-[#73737f] max-[620px]:text-[clamp(11px,3.4vw,15px)]">
            {copy.connection}
          </span>
          <strong className="mt-2 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(38px,min(4.75vw,7.9vh),62px)] font-extrabold leading-[0.95] tracking-[0.02em] text-cyan-400 max-[620px]:text-[clamp(25px,7.5vw,34px)]">
            {copy.networkTypes[system.networkType]}
          </strong>
          <small className="mt-[9px] text-[clamp(16px,min(2vw,3.3vh),24px)] font-semibold tracking-[0.035em] text-[#777783] max-[620px]:text-[clamp(11px,3.4vw,15px)]">
            {system.ipAddress ?? "—"}
          </small>
        </article>

        <article className="flex min-h-0 min-w-0 flex-col items-start justify-center gap-[13px] overflow-hidden rounded-[clamp(13px,1.2vw,18px)] border border-[#25252e] bg-display-panel px-[clamp(18px,2.25vw,32px)] py-[clamp(14px,2vh,24px)] text-left max-[620px]:gap-2 max-[620px]:p-2.5">
          <div className="grid w-full grid-cols-[clamp(78px,9.75vw,118px)_clamp(56px,7vw,84px)_minmax(0,1fr)] items-center gap-2 max-[620px]:grid-cols-[55px_40px_minmax(0,1fr)] max-[620px]:gap-1">
            <span className="text-[clamp(16px,min(2vw,3.3vh),24px)] font-bold tracking-[0.08em] text-[#73737f] max-[620px]:text-[clamp(11px,3.4vw,15px)]">
              {copy.cpu}
            </span>
            <strong className="text-right text-[clamp(24px,min(3vw,5vh),36px)] font-extrabold text-display-text max-[620px]:text-[clamp(15px,4.5vw,21px)]">
              {Math.round(system.cpuLoadPercent)}%
            </strong>
            <i className="block h-3 overflow-hidden bg-[#292932]" aria-hidden="true">
              <b
                className="block h-full bg-cyan-400"
                style={{ width: `${system.cpuLoadPercent}%` }}
              />
            </i>
          </div>
          <div className="grid w-full grid-cols-[clamp(78px,9.75vw,118px)_clamp(56px,7vw,84px)_minmax(0,1fr)] items-center gap-2 max-[620px]:grid-cols-[55px_40px_minmax(0,1fr)] max-[620px]:gap-1">
            <span className="text-[clamp(16px,min(2vw,3.3vh),24px)] font-bold tracking-[0.08em] text-[#73737f] max-[620px]:text-[clamp(11px,3.4vw,15px)]">
              {copy.memory}
            </span>
            <strong className="text-right text-[clamp(24px,min(3vw,5vh),36px)] font-extrabold text-display-text max-[620px]:text-[clamp(15px,4.5vw,21px)]">
              {memoryPercent}%
            </strong>
            <i className="block h-3 overflow-hidden bg-[#292932]" aria-hidden="true">
              <b
                className="block h-full bg-cyan-400"
                style={{ width: `${memoryPercent}%` }}
              />
            </i>
          </div>
          <small className="mt-[9px] text-[clamp(16px,min(2vw,3.3vh),24px)] font-semibold tracking-[0.035em] text-[#777783] max-[620px]:text-[clamp(11px,3.4vw,15px)]">
            {formatMemorySize(usedMemoryBytes)} /{" "}
            {formatMemorySize(system.totalMemoryBytes)}
          </small>
        </article>
      </section>
    </div>
  );
}
