import "@tanstack/react-start/server-only";

import { DESK_DISPLAY_UPDATE_RESTART_DELAY_MS } from "@/constants/update";

export function restartAfterUpdate() {
  const restartTimer = setTimeout(
    () => process.exit(0),
    DESK_DISPLAY_UPDATE_RESTART_DELAY_MS,
  );
  restartTimer.unref();
}
