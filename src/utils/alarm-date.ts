import {
  ALARM_DEFAULT_OFFSET_MS,
  ALARM_MAX_YEAR,
  ALARM_MINUTE_STEP,
  ALARM_MIN_YEAR,
} from "@/constants/alarm";
import type { AlarmDraft, AlarmDraftField } from "@/types/alarm";
import type { DisplayLanguage } from "@/types/settings";

function dateToAlarmDraft(date: Date): AlarmDraft {
  return {
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    month: date.getMonth(),
    year: date.getFullYear(),
  };
}

export function alarmDraftToDate(draft: AlarmDraft) {
  return new Date(
    draft.year,
    draft.month,
    draft.day,
    draft.hour,
    draft.minute,
    0,
    0,
  );
}

export function createAlarmDraft(now: Date) {
  const date = new Date(now.getTime() + ALARM_DEFAULT_OFFSET_MS);
  date.setSeconds(0, 0);
  const minuteRemainder = date.getMinutes() % ALARM_MINUTE_STEP;

  if (minuteRemainder) {
    date.setMinutes(date.getMinutes() + ALARM_MINUTE_STEP - minuteRemainder);
  }

  return dateToAlarmDraft(date);
}

export function adjustAlarmDraft(
  draft: AlarmDraft,
  field: AlarmDraftField,
  direction: -1 | 1,
) {
  const date = alarmDraftToDate(draft);

  if (field === "day") date.setDate(date.getDate() + direction);
  if (field === "hour") date.setHours(date.getHours() + direction);
  if (field === "minute") {
    date.setMinutes(date.getMinutes() + direction * ALARM_MINUTE_STEP);
  }

  if (field === "month") {
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + direction);
    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();
    date.setDate(Math.min(day, lastDay));
  }

  if (field === "year") {
    const nextYear = Math.min(
      ALARM_MAX_YEAR,
      Math.max(ALARM_MIN_YEAR, date.getFullYear() + direction),
    );
    const month = date.getMonth();
    const day = date.getDate();
    date.setDate(1);
    date.setFullYear(nextYear);
    date.setMonth(month);
    const lastDay = new Date(nextYear, month + 1, 0).getDate();
    date.setDate(Math.min(day, lastDay));
  }

  return dateToAlarmDraft(date);
}

export function formatAlarmDate(
  date: Date,
  now: Date,
  language: DisplayLanguage,
) {
  const locale = language === "de" ? "de-DE" : "en-GB";
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const alarmDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDifference = Math.round(
    (alarmDay.getTime() - today.getTime()) / 86_400_000,
  );

  if (dayDifference === 0) return language === "de" ? "HEUTE" : "TODAY";
  if (dayDifference === 1) return language === "de" ? "MORGEN" : "TOMORROW";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    weekday: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

export function formatAlarmDraftValue(
  draft: AlarmDraft,
  field: AlarmDraftField,
  language: DisplayLanguage,
) {
  if (field === "month") {
    return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-GB", {
      month: "short",
    })
      .format(alarmDraftToDate(draft))
      .replace(".", "")
      .toUpperCase();
  }

  if (field === "year") return String(draft.year);
  return String(draft[field]).padStart(2, "0");
}
