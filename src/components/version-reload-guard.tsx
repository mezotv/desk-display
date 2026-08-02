import { useCallback } from "react";

import { DESK_DISPLAY_VERSION_CHECK_INTERVAL_MS } from "@/constants/update";
import { fetchInstalledVersion } from "@/utils/fetch-installed-version";
import { useRecurringRefresh } from "@/utils/use-recurring-refresh";

export function VersionReloadGuard() {
  const checkVersion = useCallback(async () => {
    try {
      const installedVersion = await fetchInstalledVersion();

      if (
        installedVersion &&
        installedVersion !== __DESK_DISPLAY_VERSION__
      ) {
        window.location.reload();
      }
    } catch {
      // The local server is expected to disappear briefly while restarting.
    }
  }, []);

  useRecurringRefresh(
    checkVersion,
    DESK_DISPLAY_VERSION_CHECK_INTERVAL_MS,
    false,
  );

  return null;
}
