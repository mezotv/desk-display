import { PixelatedImage } from "@/components/pixelated-image";
import { APP_DEFINITIONS } from "@/constants/apps";
import { LOCALIZED_COPY } from "@/constants/settings";
import type { AppLauncherProps } from "@/types/apps";
import { formatClockTime } from "@/utils/format-clock";
import { getGreeting } from "@/utils/get-greeting";
import { useRef } from "react";

export function AppLauncher({
  language,
  name,
  now,
  onLaunch,
  weatherIcon,
}: AppLauncherProps) {
  const dragState = useRef({
    frameId: 0,
    lastAt: 0,
    lastX: 0,
    moved: false,
    nextScrollLeft: 0,
    pointerId: -1,
    scrollLeft: 0,
    startX: 0,
    velocity: 0,
  });
  const suppressClick = useRef(false);
  const greeting = getGreeting(now, language);
  const homeGreeting = name ? `${greeting}, ${name}` : greeting;

  const finishDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    cancelled = false,
  ) => {
    if (dragState.current.pointerId !== event.pointerId) return;

    const grid = event.currentTarget;

    if (dragState.current.frameId) {
      window.cancelAnimationFrame(dragState.current.frameId);
      grid.scrollLeft = dragState.current.nextScrollLeft;
      dragState.current.frameId = 0;
    }

    if (dragState.current.moved && !cancelled) {
      const firstApp = grid.querySelector<HTMLElement>("[data-launcher-app]");
      const columnWidth = (firstApp?.offsetWidth ?? 0) + 14;
      const projectedLeft =
        grid.scrollLeft - dragState.current.velocity * 180;
      const maxScrollLeft = grid.scrollWidth - grid.clientWidth;
      const targetLeft = columnWidth
        ? Math.round(projectedLeft / columnWidth) * columnWidth
        : projectedLeft;

      grid.scrollTo({
        behavior: "smooth",
        left: Math.max(0, Math.min(maxScrollLeft, targetLeft)),
      });
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    delete grid.dataset.dragging;
    dragState.current.pointerId = -1;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  return (
    <main className="relative grid h-dvh min-h-0 w-full grid-rows-[clamp(42px,6.5vh,72px)_minmax(0,1fr)_clamp(18px,3vh,28px)] gap-[clamp(6px,1.25vh,14px)] overflow-hidden bg-display-bg px-[clamp(18px,4.5vw,72px)] pt-[clamp(12px,2.5vh,28px)] pb-[clamp(8px,1.7vh,20px)] max-[620px]:px-3">
      <header className="flex min-w-0 items-center justify-between gap-5 text-[clamp(25px,min(3.1vw,4.3vh),40px)] font-bold leading-none tracking-[0.025em] text-display-text max-[620px]:gap-2.5 max-[620px]:text-[clamp(19px,6.2vw,25px)]">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {homeGreeting}
        </span>
        <time className="shrink-0 text-brand-purple">
          {formatClockTime(now, language)}
        </time>
      </header>
      <div
        className="no-scrollbar grid min-h-0 w-full cursor-grab touch-none grid-flow-col grid-rows-2 gap-x-[var(--launcher-column-gap)] gap-y-[clamp(10px,2vh,20px)] overflow-x-auto overflow-y-hidden scroll-smooth pb-0.5 [--launcher-column-gap:clamp(14px,1.75vw,28px)] [grid-auto-columns:calc((100%_-_(3_*_var(--launcher-column-gap)))_/_4)] [overscroll-behavior-x:contain] [-webkit-overflow-scrolling:touch] data-[dragging=true]:cursor-grabbing data-[dragging=true]:scroll-auto [@media(min-width:1100px)_and_(min-height:650px)]:[grid-auto-columns:calc((100%_-_(4_*_var(--launcher-column-gap)))_/_5)] max-[620px]:[--launcher-column-gap:10px] max-[620px]:[grid-auto-columns:calc((100%_-_var(--launcher-column-gap))_/_2)] [@media(max-width:620px)_and_(orientation:landscape)]:[grid-auto-columns:calc((100%_-_(2_*_var(--launcher-column-gap)))_/_3)]"
        onClickCapture={(event) => {
          if (!suppressClick.current) return;

          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }}
        onPointerCancel={(event) => finishDrag(event, true)}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;

          dragState.current = {
            frameId: 0,
            lastAt: event.timeStamp,
            lastX: event.clientX,
            moved: false,
            nextScrollLeft: event.currentTarget.scrollLeft,
            pointerId: event.pointerId,
            scrollLeft: event.currentTarget.scrollLeft,
            startX: event.clientX,
            velocity: 0,
          };
        }}
        onPointerMove={(event) => {
          if (dragState.current.pointerId !== event.pointerId) return;

          const distance = event.clientX - dragState.current.startX;
          if (!dragState.current.moved && Math.abs(distance) < 6) return;

          const grid = event.currentTarget;

          if (!dragState.current.moved) {
            grid.setPointerCapture(event.pointerId);
            grid.dataset.dragging = "true";
          }

          event.preventDefault();
          dragState.current.moved = true;
          suppressClick.current = true;
          dragState.current.nextScrollLeft =
            dragState.current.scrollLeft - distance;

          const elapsed = event.timeStamp - dragState.current.lastAt;
          if (elapsed > 0) {
            dragState.current.velocity =
              (event.clientX - dragState.current.lastX) / elapsed;
          }

          dragState.current.lastAt = event.timeStamp;
          dragState.current.lastX = event.clientX;

          if (!dragState.current.frameId) {
            dragState.current.frameId = window.requestAnimationFrame(() => {
              grid.scrollLeft = dragState.current.nextScrollLeft;
              dragState.current.frameId = 0;
            });
          }
        }}
        onPointerUp={finishDrag}
        onWheel={(event) => {
          if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

          event.currentTarget.scrollLeft += event.deltaY;
        }}
      >
        {APP_DEFINITIONS.map((app) => (
          <button
            className="grid min-w-0 touch-none cursor-pointer place-items-center rounded-[clamp(12px,1.5vw,18px)] border-0 bg-display-panel px-[clamp(8px,1vw,16px)] py-[clamp(6px,1.2vh,12px)] text-display-text outline-none [-webkit-tap-highlight-color:transparent] active:bg-[#18181f] focus-visible:shadow-[inset_0_0_0_3px_rgba(175,92,246,0.82)]"
            data-launcher-app
            key={app.id}
            onClick={() => onLaunch(app.id)}
            type="button"
          >
            <span className="grid size-[clamp(70px,min(10.25vw,17vh),150px)] place-items-center overflow-hidden [@media(max-height:410px)]:size-[clamp(58px,16vh,70px)] max-[620px]:size-[clamp(62px,min(23vw,15vh),96px)]">
              <PixelatedImage
                alt=""
                className="size-[clamp(70px,min(10.25vw,17vh),150px)] object-contain [@media(max-height:410px)]:size-[clamp(58px,16vh,70px)] max-[620px]:size-[clamp(62px,min(23vw,15vh),96px)]"
                src={app.id === "weather" ? weatherIcon : app.icon}
              />
            </span>
            <span
              className="mt-0.5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(17px,min(2.1vw,3.5vh),27px)] font-bold leading-none tracking-[0.04em] [@media(max-height:410px)]:text-[15px]"
              style={{ color: app.accent }}
            >
              {app.label[language]}
            </span>
          </button>
        ))}
      </div>
      <p className="m-0 text-center text-[clamp(15px,min(1.9vw,2.8vh),21px)] font-semibold text-[#5f5f6b]">
        {LOCALIZED_COPY[language].homeHint}
      </p>
    </main>
  );
}
