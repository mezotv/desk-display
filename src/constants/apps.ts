import type { AppDefinition } from "@/types/apps";

export const APP_DEFINITIONS: AppDefinition[] = [
  {
    accent: "#af5cf6",
    icon: "/logos/stripe-icon-logo.svg",
    id: "stripe",
    label: { de: "STRIPE", en: "STRIPE" },
  },
  {
    accent: "#1ed760",
    icon: "/logos/spotify.svg",
    id: "spotify",
    label: { de: "SPOTIFY", en: "SPOTIFY" },
  },
  {
    accent: "#60a5fa",
    icon: "/logos/weather-pixel.png",
    id: "weather",
    label: { de: "WETTER", en: "WEATHER" },
  },
  {
    accent: "#f8fafc",
    icon: "/logos/clock-pixel.svg",
    id: "clock",
    label: { de: "UHR", en: "CLOCK" },
  },
  {
    accent: "#ef4444",
    icon: "/logos/alarm-pixel.svg",
    id: "alarm",
    label: { de: "WECKER", en: "ALARM" },
  },
  {
    accent: "#4285f4",
    icon: "/logos/google-calendar.svg",
    id: "calendar",
    label: { de: "KALENDER", en: "CALENDAR" },
  },
  {
    accent: "#55acee",
    icon: "/logos/twitter.svg",
    id: "twitter",
    label: { de: "X", en: "X" },
  },
  {
    accent: "#f97316",
    icon: "/logos/timer-pixel.svg",
    id: "timer",
    label: { de: "TIMER", en: "TIMER" },
  },
  {
    accent: "#22d3ee",
    icon: "/logos/stopwatch-pixel.svg",
    id: "stopwatch",
    label: { de: "STOPPUHR", en: "STOPWATCH" },
  },
  {
    accent: "#af5cf6",
    icon: "/logos/tic-tac-toe-pixel.svg",
    id: "tic-tac-toe",
    label: { de: "TIC TAC TOE", en: "TIC TAC TOE" },
  },
  {
    accent: "#af5cf6",
    icon: "/logos/pong-pixel.svg",
    id: "pong",
    label: { de: "PONG", en: "PONG" },
  },
  {
    accent: "#f59e0b",
    icon: "/logos/brick-breaker-pixel.svg",
    id: "brick-breaker",
    label: { de: "BRICK BREAKER", en: "BRICK BREAKER" },
  },
  {
    accent: "#60a5fa",
    icon: "/logos/world-pixel.svg",
    id: "world",
    label: { de: "WELTZEIT", en: "WORLD" },
  },
  {
    accent: "#fb923c",
    icon: "/logos/daylight-pixel.svg",
    id: "daylight",
    label: { de: "SONNE", en: "DAYLIGHT" },
  },
  {
    accent: "#c4b5fd",
    icon: "/logos/moon-pixel.svg",
    id: "moon",
    label: { de: "MOND", en: "MOON" },
  },
  {
    accent: "#a3e635",
    icon: "/logos/progress-pixel.svg",
    id: "progress",
    label: { de: "FORTSCHRITT", en: "PROGRESS" },
  },
  {
    accent: "#af5cf6",
    icon: "/logos/marquee-pixel.png",
    id: "marquee",
    label: { de: "SLIDER", en: "SLIDER" },
  },
  {
    accent: "#22d3ee",
    icon: "/logos/system-pixel.svg",
    id: "system",
    label: { de: "SYSTEM", en: "SYSTEM" },
  },
  {
    accent: "#f59e0b",
    icon: "/logos/settings-pixel.svg",
    id: "settings",
    label: { de: "OPTIONEN", en: "SETTINGS" },
  },
];

export const SPOTIFY_ACTIVE_REFRESH_INTERVAL_MS = 3_000;
export const SPOTIFY_BACKGROUND_REFRESH_INTERVAL_MS = 30_000;
export const WEATHER_REFRESH_INTERVAL_MS = 10 * 60_000;
