import { MoonDisc } from "@/components/moon-disc";
import { AMBIENT_COPY } from "@/constants/ambient";
import type { AmbientAppProps } from "@/types/ambient";
import { getMoonPhase } from "@/utils/get-moon-phase";

export function MoonApp({ language, now }: AmbientAppProps) {
  const copy = AMBIENT_COPY[language];
  const moon = getMoonPhase(now);

  return (
    <div className="grid w-[min(88vw,1050px)] grid-cols-[clamp(180px,28vw,360px)_minmax(0,1fr)] items-center gap-[clamp(30px,6vw,86px)] transition-transform duration-100 group-active:scale-[0.985] max-[620px]:grid-cols-1 max-[620px]:gap-4">
      <div className="relative grid place-items-center">
        <div
          className="absolute size-[clamp(180px,min(28vw,46vh),360px)] rounded-full opacity-35 blur-2xl"
          style={{
            background: `radial-gradient(circle, rgba(196,181,253,${0.25 + moon.illuminationPercent / 160}), transparent 68%)`,
          }}
        />
        <MoonDisc
          className="relative size-[clamp(180px,min(28vw,46vh),360px)] max-[620px]:size-[clamp(130px,min(40vw,28vh),190px)]"
          phase={Math.round(moon.phase * 64) / 64}
        />
      </div>
      <section className="min-w-0 text-left max-[620px]:text-center">
        <span className="text-[clamp(20px,min(2.8vw,4.6vh),34px)] font-extrabold tracking-[0.08em] text-violet-300">
          {copy.moon}
        </span>
        <strong className="mt-2 block text-[clamp(42px,min(6vw,10vh),78px)] font-extrabold leading-[1.05] text-display-text">
          {copy.moonPhases[moon.name]}
        </strong>
        <span className="mt-[clamp(12px,2.5vh,22px)] block text-[clamp(54px,min(8vw,13vh),104px)] font-extrabold leading-none tracking-[-0.05em] text-violet-300 tabular-nums">
          {moon.illuminationPercent}%
        </span>
        <span className="mt-2 block text-[clamp(15px,min(2vw,3.3vh),24px)] font-semibold tracking-[0.05em] text-[#6f6f7b]">
          {moon.ageDays.toFixed(1)} / 29.5 DAYS
        </span>
      </section>
    </div>
  );
}
