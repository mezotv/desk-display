import type { AppId } from "@/types/apps";

export const APP_IDS = [
  "stripe",
  "spotify",
  "weather",
  "clock",
  "alarm",
  "calendar",
  "twitter",
  "codex-usage",
  "claude-usage",
  "timer",
  "pomodoro",
  "stopwatch",
  "tic-tac-toe",
  "pong",
  "brick-breaker",
  "world",
  "daylight",
  "moon",
  "progress",
  "marquee",
  "system",
  "display-power",
  "settings",
] as const satisfies readonly AppId[];

export const DISPLAY_NAVIGATION_STORAGE_KEY = "desk-display-navigation-v1";
