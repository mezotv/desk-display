import type { DisplayLanguage } from "@/types/settings";
import { formatClockTime } from "@/utils/format-clock";

function getLocale(language: DisplayLanguage) {
  return language === "de" ? "de-DE" : "en-GB";
}

const calendarDateFormatters = {
  de: new Intl.DateTimeFormat(getLocale("de"), {
    day: "2-digit",
    month: "short",
  }),
  en: new Intl.DateTimeFormat(getLocale("en"), {
    day: "2-digit",
    month: "short",
  }),
};

export function formatCalendarEventStart(
  start: string,
  now: Date,
  language: DisplayLanguage,
  allDay = false,
) {
  const startDate = new Date(start);
  const isToday =
    startDate.getFullYear() === now.getFullYear() &&
    startDate.getMonth() === now.getMonth() &&
    startDate.getDate() === now.getDate();

  if (allDay && isToday) return language === "de" ? "HEUTE" : "TODAY";
  if (isToday) return formatClockTime(startDate, language);

  const date = calendarDateFormatters[language].format(startDate);
  return allDay ? date : `${date} · ${formatClockTime(startDate, language)}`;
}

export function formatCalendarCountdown(
  start: string,
  end: string,
  now: Date,
  language: DisplayLanguage,
) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const nowTime = now.getTime();

  if (startTime <= nowTime && endTime > nowTime) return null;

  const totalMinutes = Math.max(1, Math.ceil((startTime - nowTime) / 60_000));
  if (totalMinutes < 60) return `${totalMinutes} MIN`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 24) {
    const hourUnit = language === "de" ? "STD" : "HR";
    return `${hours} ${hourUnit}${minutes ? ` ${minutes} MIN` : ""}`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const dayUnit = language === "de" ? "T" : "D";
  return `${days}${dayUnit}${remainingHours ? ` ${remainingHours}H` : ""}`;
}
