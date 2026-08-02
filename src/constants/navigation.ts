import type { AppId } from "@/types/apps";

export const APP_IDS = [
  "stripe",
  "spotify",
  "weather",
  "clock",
  "alarm",
  "calendar",
  "twitter",
  "timer",
  "stopwatch",
  "world",
  "daylight",
  "moon",
  "progress",
  "marquee",
  "system",
  "settings",
] as const satisfies readonly AppId[];

export const DISPLAY_NAVIGATION_STORAGE_KEY = "desk-display-navigation-v1";
