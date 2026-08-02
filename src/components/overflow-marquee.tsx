import { useLayoutEffect, useRef, useState } from "react";

import type { OverflowMarqueeProps } from "@/types/marquee";

export function OverflowMarquee({
  children,
  className = "",
}: OverflowMarqueeProps) {
  const viewportRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const text = textRef.current;
    if (!viewport || !text) return;

    const measure = () => {
      setIsOverflowing(text.scrollWidth > viewport.clientWidth + 1);
    };
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(viewport);
    observer.observe(text);

    return () => observer.disconnect();
  }, [children]);

  const durationSeconds = Math.max(8, children.length / 5);

  return (
    <span
      className={`overflow-hidden whitespace-nowrap text-center ${isOverflowing ? "text-left" : ""} ${className}`.trim()}
      ref={viewportRef}
    >
      <span
        className={`inline-flex w-max items-center will-change-transform ${
          isOverflowing
            ? "animate-[spotify-text-scroll_linear_infinite] [animation-delay:800ms]"
            : ""
        }`}
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        <span ref={textRef}>
          {children}
        </span>
        {isOverflowing && (
          <>
            <span
              className="inline-flex w-11 shrink-0 justify-center text-[#484852]"
              aria-hidden="true"
            >
              •
            </span>
            <span aria-hidden="true">
              {children}
            </span>
          </>
        )}
      </span>
    </span>
  );
}
