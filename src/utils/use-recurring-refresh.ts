import { useEffect } from "react";

export function useRecurringRefresh(
  refresh: () => Promise<void>,
  intervalMs: number,
  refreshImmediately: boolean,
) {
  useEffect(() => {
    let cancelled = false;
    let refreshTimer: number;

    const refreshAndSchedule = async () => {
      await refresh();

      if (!cancelled) {
        refreshTimer = window.setTimeout(refreshAndSchedule, intervalMs);
      }
    };

    refreshTimer = window.setTimeout(
      refreshAndSchedule,
      refreshImmediately ? 0 : intervalMs,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(refreshTimer);
    };
  }, [intervalMs, refresh, refreshImmediately]);
}
