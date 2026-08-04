import type { DisplayLanguage } from "@/types/settings";

function getLocale(language: DisplayLanguage) {
  return language === "de" ? "de-DE" : "en-GB";
}

const dateFormatters = {
  de: new Intl.DateTimeFormat(getLocale("de"), {
    day: "2-digit",
    month: "long",
    weekday: "long",
    year: "numeric",
  }),
  en: new Intl.DateTimeFormat(getLocale("en"), {
    day: "2-digit",
    month: "long",
    weekday: "long",
    year: "numeric",
  }),
};

const timeFormatters = {
  de: {
    minute: new Intl.DateTimeFormat(getLocale("de"), {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
    }),
    second: new Intl.DateTimeFormat(getLocale("de"), {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      second: "2-digit",
    }),
  },
  en: {
    minute: new Intl.DateTimeFormat(getLocale("en"), {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
    }),
    second: new Intl.DateTimeFormat(getLocale("en"), {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      second: "2-digit",
    }),
  },
};

export function formatClockTime(
  date: Date,
  language: DisplayLanguage,
  includeSeconds = false,
) {
  return timeFormatters[language][includeSeconds ? "second" : "minute"].format(
    date,
  );
}

export function formatClockDate(date: Date, language: DisplayLanguage) {
  return dateFormatters[language].format(date);
}
