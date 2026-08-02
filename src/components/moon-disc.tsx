import { memo } from "react";

import type { MoonDiscProps } from "@/types/ambient";

const MOON_GRID_SIZE = 18;

export const MoonDisc = memo(function MoonDisc({
  className,
  phase,
}: MoonDiscProps) {
  const cells = Array.from(
    { length: MOON_GRID_SIZE * MOON_GRID_SIZE },
    (_, index) => {
      const column = index % MOON_GRID_SIZE;
      const row = Math.floor(index / MOON_GRID_SIZE);
      const x = (column + 0.5 - MOON_GRID_SIZE / 2) / (MOON_GRID_SIZE / 2);
      const y = (row + 0.5 - MOON_GRID_SIZE / 2) / (MOON_GRID_SIZE / 2);
      const radiusSquared = x * x + y * y;
      if (radiusSquared > 0.88) return null;

      const edgeAtY = Math.sqrt(Math.max(0, 0.88 - y * y));
      const phaseCosine = Math.cos(phase * Math.PI * 2);
      const terminator = phaseCosine * edgeAtY;
      const illuminated =
        phase <= 0.5 ? x >= terminator : x <= -terminator;
      const crater =
        (column === 6 && row === 6) ||
        (column === 11 && row === 10) ||
        (column === 7 && row === 13);

      return (
        <rect
          fill={illuminated ? (crater ? "#8b7faa" : "#c4b5fd") : "#111116"}
          height="1"
          key={index}
          width="1"
          x={column}
          y={row}
        />
      );
    },
  );

  return (
    <svg
      aria-hidden="true"
      className={className}
      shapeRendering="crispEdges"
      viewBox={`0 0 ${MOON_GRID_SIZE} ${MOON_GRID_SIZE}`}
    >
      {cells}
    </svg>
  );
});
