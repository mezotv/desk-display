import { DISPLAY_POWER_COPY } from "@/constants/display-power";
import type { DisplaySleepOverlayProps } from "@/types/display-power";

export function DisplaySleepOverlay({
  language,
  onWake,
  waking,
}: DisplaySleepOverlayProps) {
  const copy = DISPLAY_POWER_COPY[language];

  return (
    <button
      aria-label={copy.wakeHint}
      className="fixed inset-0 z-[100] cursor-none touch-manipulation border-0 bg-black p-0 outline-none"
      disabled={waking}
      onClick={onWake}
      type="button"
    >
      <span className="sr-only">
        {copy.sleeping}. {copy.wakeHint}
      </span>
    </button>
  );
}
