import type { DisplayLanguage } from "@/types/settings";
import type { WeatherSnapshot } from "@/types/weather";

export type LocalizedLabel = Record<DisplayLanguage, string>;

export type WorldClockZone = {
  accent: string;
  label: LocalizedLabel;
  timeZone: string;
};

export type AmbientAppProps = {
  language: DisplayLanguage;
  now: Date;
};

export type DaylightAppProps = AmbientAppProps & {
  weather: WeatherSnapshot;
};

export type MoonPhaseName =
  | "newMoon"
  | "waxingCrescent"
  | "firstQuarter"
  | "waxingGibbous"
  | "fullMoon"
  | "waningGibbous"
  | "lastQuarter"
  | "waningCrescent";

export type MoonPhaseSnapshot = {
  ageDays: number;
  illuminationPercent: number;
  name: MoonPhaseName;
  phase: number;
};

export type MoonDiscProps = {
  className?: string;
  phase: number;
};

export type ProgressMetric = {
  id: "day" | "week" | "month" | "year";
  percent: number;
};
