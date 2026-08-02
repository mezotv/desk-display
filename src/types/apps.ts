import type { ReactNode } from "react";

import type { CalendarSnapshot } from "@/types/calendar";
import type { MrrSnapshot } from "@/types/mrr";
import type { ProductivityState } from "@/types/productivity";
import type { SpotifySnapshot } from "@/types/spotify";
import type { DisplayLanguage, DisplaySettings } from "@/types/settings";
import type { SystemSnapshot } from "@/types/system";
import type { TwitterSnapshot } from "@/types/twitter";
import type { WeatherSnapshot } from "@/types/weather";

export type AppId =
  | "stripe"
  | "spotify"
  | "weather"
  | "clock"
  | "alarm"
  | "calendar"
  | "twitter"
  | "timer"
  | "stopwatch"
  | "tic-tac-toe"
  | "world"
  | "daylight"
  | "moon"
  | "progress"
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
  productivity: ProductivityState;
  spotify: SpotifySnapshot;
  system: SystemSnapshot;
  twitter: TwitterSnapshot;
  twitterSlideIndex: number;
  weather: WeatherSnapshot;
  weatherIcon: string;
};

export type DeskDisplayProps = {
  initialCalendar: CalendarSnapshot;
  initialMrr: MrrSnapshot;
  initialSettings: DisplaySettings;
  initialSpotify: SpotifySnapshot;
  initialSystem: SystemSnapshot;
  initialTwitter: TwitterSnapshot;
  initialWeather: WeatherSnapshot;
};

export type AppLauncherProps = {
  language: DisplayLanguage;
  name: string;
  now: Date;
  onLaunch: (appId: AppId) => void;
  twitterConfigured: boolean;
  weatherIcon: string;
};

export type TouchAppShellProps = {
  accent: string;
  children: ReactNode;
  icon: string;
  onHome: () => void;
  title: string;
};
