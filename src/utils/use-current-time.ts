import { useEffect, useState } from "react";

import {
  CLOCK_REFRESH_INTERVAL_MS,
  MAX_BROWSER_TIMEOUT_MS,
} from "@/constants/ambient";
import type { UseCurrentTimeOptions } from "@/types/ambient";

export function useCurrentTime({
  paused,
  precision,
  wakeAt,
}: UseCurrentTimeOptions) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (paused) return;

    const intervalMs = CLOCK_REFRESH_INTERVAL_MS[precision];
    let refreshTimer = 0;

    const refreshAtBoundary = () => {
      setNow(new Date());
      const delayMs = intervalMs - (Date.now() % intervalMs);
      refreshTimer = window.setTimeout(refreshAtBoundary, delayMs);
    };

    refreshAtBoundary();
    return () => window.clearTimeout(refreshTimer);
  }, [paused, precision]);

  useEffect(() => {
    if (!wakeAt) return;

    const wakeTimestamp = Date.parse(wakeAt);
    if (Number.isNaN(wakeTimestamp)) return;

    let wakeTimer = 0;
    const scheduleWake = () => {
      const remainingMs = wakeTimestamp - Date.now();
      if (remainingMs <= 0) {
        setNow(new Date());
        return;
      }

      wakeTimer = window.setTimeout(
        scheduleWake,
        Math.min(remainingMs, MAX_BROWSER_TIMEOUT_MS),
      );
    };

    scheduleWake();
    return () => window.clearTimeout(wakeTimer);
  }, [wakeAt]);

  return now;
}
