import type {
  ClockPrecision,
  MoonPhaseName,
  WorldClockZone,
} from "@/types/ambient";
import type { DisplayLanguage } from "@/types/settings";

export const CLOCK_REFRESH_INTERVAL_MS: Record<ClockPrecision, number> = {
  minute: 60_000,
  second: 1_000,
};

export const MAX_BROWSER_TIMEOUT_MS = 2_147_000_000;

export const WORLD_CLOCK_ZONES: WorldClockZone[] = [
  {
    accent: "#af5cf6",
    label: { de: "BERLIN", en: "BERLIN" },
    timeZone: "Europe/Berlin",
  },
  {
    accent: "#60a5fa",
    label: { de: "LONDON", en: "LONDON" },
    timeZone: "Europe/London",
  },
  {
    accent: "#fb7185",
    label: { de: "NEW YORK", en: "NEW YORK" },
    timeZone: "America/New_York",
  },
  {
    accent: "#f59e0b",
    label: { de: "SAN FRANCISCO", en: "SAN FRANCISCO" },
    timeZone: "America/Los_Angeles",
  },
  {
    accent: "#34d399",
    label: { de: "TOKIO", en: "TOKYO" },
    timeZone: "Asia/Tokyo",
  },
  {
    accent: "#22d3ee",
    label: { de: "SYDNEY", en: "SYDNEY" },
    timeZone: "Australia/Sydney",
  },
];

export const AMBIENT_COPY = {
  de: {
    daylight: "TAGESLICHT",
    daylightUnavailable: "SONNENZEITEN NICHT VERFÜGBAR",
    hoursOfLight: "STUNDEN LICHT",
    local: "LOKAL",
    moon: "MOND",
    moonPhases: {
      firstQuarter: "ERSTES VIERTEL",
      fullMoon: "VOLLMOND",
      lastQuarter: "LETZTES VIERTEL",
      newMoon: "NEUMOND",
      waningCrescent: "ABNEHMENDE SICHEL",
      waningGibbous: "ABNEHMENDER MOND",
      waxingCrescent: "ZUNEHMENDE SICHEL",
      waxingGibbous: "ZUNEHMENDER MOND",
    } satisfies Record<MoonPhaseName, string>,
    progress: "FORTSCHRITT",
    progressLabels: {
      day: "TAG",
      month: "MONAT",
      week: "WOCHE",
      year: "JAHR",
    },
    sunrise: "SONNENAUFGANG",
    sunset: "SONNENUNTERGANG",
    worldClock: "WELTZEIT",
  },
  en: {
    daylight: "DAYLIGHT",
    daylightUnavailable: "SUN TIMES UNAVAILABLE",
    hoursOfLight: "HOURS OF LIGHT",
    local: "LOCAL",
    moon: "MOON",
    moonPhases: {
      firstQuarter: "FIRST QUARTER",
      fullMoon: "FULL MOON",
      lastQuarter: "LAST QUARTER",
      newMoon: "NEW MOON",
      waningCrescent: "WANING CRESCENT",
      waningGibbous: "WANING GIBBOUS",
      waxingCrescent: "WAXING CRESCENT",
      waxingGibbous: "WAXING GIBBOUS",
    } satisfies Record<MoonPhaseName, string>,
    progress: "PROGRESS",
    progressLabels: {
      day: "DAY",
      month: "MONTH",
      week: "WEEK",
      year: "YEAR",
    },
    sunrise: "SUNRISE",
    sunset: "SUNSET",
    worldClock: "WORLD CLOCK",
  },
} satisfies Record<DisplayLanguage, {
  daylight: string;
  daylightUnavailable: string;
  hoursOfLight: string;
  local: string;
  moon: string;
  moonPhases: Record<MoonPhaseName, string>;
  progress: string;
  progressLabels: Record<"day" | "month" | "week" | "year", string>;
  sunrise: string;
  sunset: string;
  worldClock: string;
}>;
