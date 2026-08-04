import type { DisplayLanguage } from "@/types/settings";

const worldClockDayFormatters = new Map<string, Intl.DateTimeFormat>();
const worldClockTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function getWorldClockFormatter(
  cache: Map<string, Intl.DateTimeFormat>,
  language: DisplayLanguage,
  timeZone: string,
  kind: "day" | "time",
) {
  const key = `${language}:${timeZone}`;
  const cachedFormatter = cache.get(key);
  if (cachedFormatter) return cachedFormatter;

  const formatter = new Intl.DateTimeFormat(
    language === "de" ? "de-DE" : "en-US",
    kind === "time"
      ? {
          hour: "2-digit",
          hour12: language === "en",
          minute: "2-digit",
          timeZone,
        }
      : {
          day: "2-digit",
          month: "short",
          timeZone,
          weekday: "short",
        },
  );
  cache.set(key, formatter);
  return formatter;
}

export function formatWorldClockTime(
  date: Date,
  language: DisplayLanguage,
  timeZone: string,
) {
  return getWorldClockFormatter(
    worldClockTimeFormatters,
    language,
    timeZone,
    "time",
  ).format(date);
}

export function formatWorldClockDay(
  date: Date,
  language: DisplayLanguage,
  timeZone: string,
) {
  return getWorldClockFormatter(
    worldClockDayFormatters,
    language,
    timeZone,
    "day",
  )
    .format(date)
    .toLocaleUpperCase(language);
}
