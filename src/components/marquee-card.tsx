import { OverflowMarquee } from "@/components/overflow-marquee";
import { PixelatedImage } from "@/components/pixelated-image";
import type { MarqueeCardProps } from "@/types/marquee";

export function MarqueeCard({
  accent,
  icon,
  primary,
  secondary,
}: MarqueeCardProps) {
  return (
    <section className="relative flex h-dvh w-screen shrink-0 items-center justify-center gap-[clamp(24px,5vw,42px)] bg-display-bg p-[clamp(20px,4vw,36px)] max-[620px]:flex-col max-[620px]:gap-[clamp(18px,4vh,30px)] max-[620px]:p-5">
      <PixelatedImage
        alt=""
        className="size-[clamp(110px,min(18vw,31vh),260px)] shrink-0 object-contain max-[620px]:size-[clamp(108px,min(38vw,25vh),180px)]"
        src={icon}
      />
      <div className="flex min-w-0 max-w-[min(58vw,760px)] flex-auto flex-col items-center justify-center gap-3.5 overflow-hidden text-center max-[620px]:max-w-[88vw] max-[620px]:flex-[0_1_auto]">
        <OverflowMarquee
          className="block w-full text-center text-[clamp(34px,min(6vw,10vh),80px)] font-extrabold leading-none max-[620px]:text-[clamp(30px,9.5vw,48px)]"
        >
          {primary}
        </OverflowMarquee>
        {secondary && (
          <OverflowMarquee className="block w-full text-center text-[clamp(19px,min(3vw,5vh),40px)] font-semibold leading-[1.15] text-[#7d7d89]">
            {secondary}
          </OverflowMarquee>
        )}
      </div>
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-1.5 w-full opacity-80"
        style={{ backgroundColor: accent }}
      />
    </section>
  );
}
