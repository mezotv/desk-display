import type { DisplayLanguage } from "@/types/settings";

export type DisplayPowerMethod =
  | "backlight"
  | "helper"
  | "wlopm"
  | "wlr-randr";

export type DisplayPowerResult = {
  error: string | null;
  method: DisplayPowerMethod | null;
  powered: boolean;
  success: boolean;
};

export type DisplaySleepState = {
  method: DisplayPowerMethod | null;
  sleeping: boolean;
};

export type DisplayPowerCopy = {
  error: string;
  hint: string;
  keepRunning: string;
  sleeping: string;
  title: string;
  turnOff: string;
  turningOff: string;
  wakeHint: string;
};

export type DisplayPowerAppProps = {
  changing: boolean;
  error: string | null;
  language: DisplayLanguage;
  onHome: () => void;
  onSleep: () => void;
};

export type DisplaySleepOverlayProps = {
  language: DisplayLanguage;
  onWake: () => void;
  waking: boolean;
};

export type UseDisplayPowerResult = {
  changing: boolean;
  error: string | null;
  ready: boolean;
  sleep: () => Promise<void>;
  sleeping: boolean;
  wake: () => Promise<void>;
};
