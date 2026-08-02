import type { ArcadePoint } from "@/types/arcade";

export function getCanvasPointerPosition(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): ArcadePoint {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: ((clientX - bounds.left) / bounds.width) * canvas.width,
    y: ((clientY - bounds.top) / bounds.height) * canvas.height,
  };
}
