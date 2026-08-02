import type { AlarmCopy } from "@/types/alarm";
import type { DisplayLanguage } from "@/types/settings";

export const ALARMS_STORAGE_KEY = "desk-display-alarms-v1";
export const ALARM_DEFAULT_OFFSET_MS = 5 * 60_000;
export const ALARM_TRIGGER_GRACE_MS = 5 * 60_000;
export const ALARM_MIN_YEAR = 2020;
export const ALARM_MAX_YEAR = 2099;
export const ALARM_MINUTE_STEP = 5;
export const MAX_ALARMS = 64;

export const ALARM_COPY = {
  de: {
    add: "+ NEU",
    alarm: "WECKER",
    alarms: "WECKER",
    allSet: "WECKER GESTELLT",
    back: "ZURÜCK",
    cancel: "ABBRECHEN",
    day: "TAG",
    delete: "WECKER LÖSCHEN",
    disabled: "AUS",
    dismiss: "AUSSCHALTEN",
    empty: "NOCH KEINE WECKER",
    enabled: "AN",
    futureTime: "ZEIT MUSS IN DER ZUKUNFT LIEGEN",
    hour: "STUNDE",
    minute: "MINUTE",
    month: "MONAT",
    newAlarm: "NEUER WECKER",
    ringing: "ZEIT IST UM",
    save: "SPEICHERN",
    year: "JAHR",
  },
  en: {
    add: "+ NEW",
    alarm: "ALARM",
    alarms: "ALARMS",
    allSet: "ALARM SET",
    back: "BACK",
    cancel: "CANCEL",
    day: "DAY",
    delete: "DELETE ALARM",
    disabled: "OFF",
    dismiss: "DISMISS",
    empty: "NO ALARMS YET",
    enabled: "ON",
    futureTime: "CHOOSE A FUTURE TIME",
    hour: "HOUR",
    minute: "MINUTE",
    month: "MONTH",
    newAlarm: "NEW ALARM",
    ringing: "TIME IS UP",
    save: "SAVE",
    year: "YEAR",
  },
} satisfies Record<DisplayLanguage, AlarmCopy>;
