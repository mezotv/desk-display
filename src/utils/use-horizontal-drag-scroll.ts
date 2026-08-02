import { useRef } from "react";

export function useHorizontalDragScroll(itemSelector: string) {
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

  const finishDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    cancelled = false,
  ) => {
    if (dragState.current.pointerId !== event.pointerId) return;

    const scroller = event.currentTarget;

    if (dragState.current.frameId) {
      window.cancelAnimationFrame(dragState.current.frameId);
      scroller.scrollLeft = dragState.current.nextScrollLeft;
      dragState.current.frameId = 0;
    }

    if (dragState.current.moved && !cancelled) {
      const firstItem = scroller.querySelector<HTMLElement>(itemSelector);
      const columnGap = Number.parseFloat(
        window.getComputedStyle(scroller).columnGap,
      );
      const columnWidth =
        (firstItem?.offsetWidth ?? 0) +
        (Number.isFinite(columnGap) ? columnGap : 0);
      const projectedLeft =
        scroller.scrollLeft - dragState.current.velocity * 180;
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      const targetLeft = columnWidth
        ? Math.round(projectedLeft / columnWidth) * columnWidth
        : projectedLeft;

      scroller.scrollTo({
        behavior: "smooth",
        left: Math.max(0, Math.min(maxScrollLeft, targetLeft)),
      });
    }

    if (scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }

    delete scroller.dataset.dragging;
    dragState.current.pointerId = -1;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  return {
    onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => {
      if (!suppressClick.current) return;

      event.preventDefault();
      event.stopPropagation();
      suppressClick.current = false;
    },
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) =>
      finishDrag(event, true),
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
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
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      if (dragState.current.pointerId !== event.pointerId) return;

      const distance = event.clientX - dragState.current.startX;
      if (!dragState.current.moved && Math.abs(distance) < 6) return;

      const scroller = event.currentTarget;

      if (!dragState.current.moved) {
        scroller.setPointerCapture(event.pointerId);
        scroller.dataset.dragging = "true";
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
          scroller.scrollLeft = dragState.current.nextScrollLeft;
          dragState.current.frameId = 0;
        });
      }
    },
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) =>
      finishDrag(event),
    onWheel: (event: React.WheelEvent<HTMLDivElement>) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.currentTarget.scrollLeft += event.deltaY;
    },
  };
}
