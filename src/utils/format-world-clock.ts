import type { DisplayLanguage } from "@/types/settings";

export function formatWorldClockTime(
  date: Date,
  language: DisplayLanguage,
  timeZone: string,
) {
  return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-US", {
    hour: "2-digit",
    hour12: language === "en",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

export function formatWorldClockDay(
  date: Date,
  language: DisplayLanguage,
  timeZone: string,
) {
  return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-US", {
    day: "2-digit",
    month: "short",
    timeZone,
    weekday: "short",
  })
    .format(date)
    .toLocaleUpperCase(language);
}
