import { PixelatedImage } from "@/components/pixelated-image";
import { PixelIcon } from "@/components/pixel-icon";
import type { TouchAppShellProps } from "@/types/apps";

export function TouchAppShell({
  accent,
  children,
  icon,
  onHome,
  title,
}: TouchAppShellProps) {
  return (
    <main className="grid h-dvh min-h-0 w-full grid-rows-[clamp(54px,9vh,76px)_minmax(0,1fr)] gap-[clamp(8px,1.5vh,14px)] overflow-hidden bg-display-bg px-[clamp(12px,3vw,42px)] py-[clamp(9px,2vh,22px)]">
      <header className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center">
        <button
          className="min-h-11 justify-self-start touch-manipulation rounded-[10px] border-0 bg-[#17171d] px-[clamp(10px,2vw,20px)] text-[clamp(16px,min(2.2vw,3.7vh),24px)] font-bold text-[#9999a5] outline-none active:scale-[0.97] active:bg-[#282833]"
          onClick={onHome}
          type="button"
        >
          <PixelIcon className="size-6" name="back" />
        </button>
        <div className="flex min-w-0 items-center justify-center gap-[clamp(8px,1.2vw,14px)]">
          <PixelatedImage
            alt=""
            className="size-[clamp(34px,min(4.5vw,7.5vh),56px)] shrink-0 object-contain"
            src={icon}
          />
          <h1
            className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(23px,min(3.2vw,5.3vh),40px)] font-extrabold tracking-[0.06em]"
            style={{ color: accent }}
          >
            {title}
          </h1>
        </div>
        <span aria-hidden="true" />
      </header>
      <section className="min-h-0 min-w-0 overflow-hidden">{children}</section>
    </main>
  );
}
