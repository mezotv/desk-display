import { LOCALIZED_COPY } from '@/constants/settings'
import type { DisplayLanguage } from '@/types/settings'

export function getGreeting(date: Date, language: DisplayLanguage) {
  const hour = date.getHours()
  const greetings = LOCALIZED_COPY[language].greeting

  if (hour >= 5 && hour < 12) return greetings.morning
  if (hour >= 12 && hour < 18) return greetings.afternoon
  if (hour >= 18 && hour < 23) return greetings.evening
  return greetings.night
}

