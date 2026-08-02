import type { CalendarCopy } from "@/types/calendar";
import type { DisplayLanguage } from "@/types/settings";

export const GOOGLE_AUTHORIZATION_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_CALENDAR_API_URL = "https://www.googleapis.com/calendar/v3";
export const GOOGLE_CALENDAR_REDIRECT_URI =
  "http://127.0.0.1:3000/api/google-calendar/callback";
export const GOOGLE_CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar.events.readonly";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const CALENDAR_ACTIVE_REFRESH_INTERVAL_MS = 60_000;
export const CALENDAR_BACKGROUND_REFRESH_INTERVAL_MS = 5 * 60_000;

export const CALENDAR_COPY = {
  de: {
    addKeys: "GOOGLE-KEYS HINZUFÜGEN",
    allDay: "GANZTÄGIG",
    connect: "KALENDER VERBINDEN",
    connecting: "ZUM VERBINDEN TIPPEN",
    googleMeet: "GOOGLE MEET",
    inProgress: "LÄUFT GERADE",
    locationUnknown: "KEIN ORT",
    next: "NÄCHSTE TERMINE",
    noMeetings: "KEINE TERMINE",
    startsIn: "IN",
    untitled: "OHNE TITEL",
  },
  en: {
    addKeys: "ADD GOOGLE KEYS",
    allDay: "ALL DAY",
    connect: "CONNECT CALENDAR",
    connecting: "TAP TO CONNECT",
    googleMeet: "GOOGLE MEET",
    inProgress: "IN PROGRESS",
    locationUnknown: "NO LOCATION",
    next: "UP NEXT",
    noMeetings: "NO MEETINGS",
    startsIn: "IN",
    untitled: "UNTITLED",
  },
} satisfies Record<DisplayLanguage, CalendarCopy>;
