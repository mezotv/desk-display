import type { DisplayLanguage } from '@/types/settings'

function getLocale(language: DisplayLanguage) {
  return language === 'de' ? 'de-DE' : 'en-GB'
}

export function formatClockTime(
  date: Date,
  language: DisplayLanguage,
  includeSeconds = false,
) {
  return new Intl.DateTimeFormat(getLocale(language), {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
  }).format(date)
}

export function formatClockDate(date: Date, language: DisplayLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    day: '2-digit',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }).format(date)
}

