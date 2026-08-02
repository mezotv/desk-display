declare const __DESK_DISPLAY_VERSION__: string;

declare namespace NodeJS {
  interface ProcessEnv {
    readonly DESK_DISPLAY_ROOT?: string;
    readonly DISPLAY_CURRENCY?: string;
    readonly DISPLAY_LANGUAGE?: "de" | "en";
    readonly DISPLAY_NAME?: string;
    readonly GOOGLE_CALENDAR_CLIENT_ID?: string;
    readonly GOOGLE_CALENDAR_ENV_FILE?: string;
    readonly GOOGLE_CALENDAR_CLIENT_SECRET?: string;
    readonly GOOGLE_CALENDAR_REFRESH_TOKEN?: string;
    readonly SPOTIFY_CLIENT_ID?: string;
    readonly SPOTIFY_CLIENT_SECRET?: string;
    readonly SPOTIFY_REFRESH_TOKEN?: string;
    readonly STRIPE_SECRET_KEY?: string;
    readonly WEATHER_LATITUDE?: string;
    readonly WEATHER_LOCATION_LABEL?: string;
    readonly WEATHER_LONGITUDE?: string;
    readonly X_BEARER_TOKEN?: string;
    readonly X_USERNAME?: string;
  }
}
