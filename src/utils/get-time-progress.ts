import type { ProgressMetric } from "@/types/ambient";

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value * 100));
}

export function getTimeProgress(now: Date): ProgressMetric[] {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const nextDay = new Date(dayStart);
  nextDay.setDate(nextDay.getDate() + 1);

  const weekStart = new Date(dayStart);
  const dayFromMonday = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - dayFromMonday);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const nextYear = new Date(now.getFullYear() + 1, 0, 1);

  const progress = (start: Date, end: Date) =>
    clampPercent((now.getTime() - start.getTime()) / (end.getTime() - start.getTime()));

  return [
    { id: "day", percent: progress(dayStart, nextDay) },
    { id: "week", percent: progress(weekStart, nextWeek) },
    { id: "month", percent: progress(monthStart, nextMonth) },
    { id: "year", percent: progress(yearStart, nextYear) },
  ];
}
