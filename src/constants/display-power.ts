import type {
  DisplayPowerCopy,
  DisplayPowerMethod,
  DisplaySleepState,
} from "@/types/display-power";
import type { DisplayLanguage } from "@/types/settings";

export const DISPLAY_POWER_METHODS = [
  "backlight",
  "dpms",
  "helper",
] satisfies readonly DisplayPowerMethod[];

export const DISPLAY_SLEEP_STORAGE_KEY = "desk-display-screen-sleep-v1";
export const DEFAULT_DISPLAY_SLEEP_STATE: DisplaySleepState = {
  method: null,
  sleeping: false,
};
export const BACKLIGHT_ROOT_DIRECTORY = "/sys/class/backlight";
export const DEFAULT_BACKLIGHT_DIRECTORY =
  "/sys/class/backlight/10-0045";
export const DISPLAY_BACKLIGHT_HELPER =
  "/usr/local/sbin/desk-display-backlight";
export const SUDO_EXECUTABLE = "/usr/bin/sudo";
export const XSET_EXECUTABLE = "/usr/bin/xset";

export const DISPLAY_POWER_COPY: Record<
  DisplayLanguage,
  DisplayPowerCopy
> = {
  de: {
    error: "DISPLAY KONNTE NICHT AUSGESCHALTET WERDEN",
    hint: "SCHALTET DAS ECHTE DISPLAY AUS · NICHT DEN PI",
    keepRunning: "APPS, TIMER UND NETZWERK LAUFEN WEITER",
    sleeping: "DISPLAY IST AUS",
    title: "DISPLAY",
    turnOff: "DISPLAY AUS",
    turningOff: "WIRD AUSGESCHALTET…",
    wakeHint: "EINMAL TIPPEN ZUM EINSCHALTEN",
  },
  en: {
    error: "COULD NOT TURN OFF THE DISPLAY",
    hint: "POWERS OFF THE REAL DISPLAY · NOT THE PI",
    keepRunning: "APPS, TIMERS, AND NETWORK KEEP RUNNING",
    sleeping: "DISPLAY IS OFF",
    title: "DISPLAY",
    turnOff: "TURN DISPLAY OFF",
    turningOff: "TURNING OFF…",
    wakeHint: "TAP ONCE TO TURN IT BACK ON",
  },
};
