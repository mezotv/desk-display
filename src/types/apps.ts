import type { CalendarSnapshot } from "@/types/calendar";
import type { MrrSnapshot } from "@/types/mrr";
import type { SpotifySnapshot } from "@/types/spotify";
import type { DisplayLanguage, DisplaySettings } from "@/types/settings";
import type { SystemSnapshot } from "@/types/system";
import type { WeatherSnapshot } from "@/types/weather";

export type AppId =
  | "stripe"
  | "spotify"
  | "weather"
  | "clock"
  | "alarm"
  | "calendar"
  | "twitter"
  | "marquee"
  | "system"
  | "settings";

export type AppDefinition = {
  accent: string;
  icon: string;
  id: AppId;
  label: Record<DisplayLanguage, string>;
};

export type ActiveAppProps = {
  activeApp: AppId;
  calendar: CalendarSnapshot;
  isAnnual: boolean;
  language: DisplayLanguage;
  mrr: MrrSnapshot;
  now: Date;
  onTap: () => void;
  spotify: SpotifySnapshot;
  system: SystemSnapshot;
  weather: WeatherSnapshot;
  weatherIcon: string;
};

export type DeskDisplayProps = {
  initialCalendar: CalendarSnapshot;
  initialMrr: MrrSnapshot;
  initialSettings: DisplaySettings;
  initialSpotify: SpotifySnapshot;
  initialSystem: SystemSnapshot;
  initialWeather: WeatherSnapshot;
};

export type AppLauncherProps = {
  language: DisplayLanguage;
  name: string;
  now: Date;
  onLaunch: (appId: AppId) => void;
  weatherIcon: string;
};
