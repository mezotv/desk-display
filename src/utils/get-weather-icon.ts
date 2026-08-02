import { WEATHER_ICON_PATHS } from '@/constants/weather'

export function getWeatherIcon(
  weatherCode: number | null,
  isDay: boolean | null,
) {
  if (weatherCode === null) return WEATHER_ICON_PATHS.cloudy
  if (weatherCode === 0) {
    return isDay === false
      ? WEATHER_ICON_PATHS.clearNight
      : WEATHER_ICON_PATHS.clearDay
  }
  if (weatherCode <= 2) {
    return isDay === false
      ? WEATHER_ICON_PATHS.partlyNight
      : WEATHER_ICON_PATHS.partlyDay
  }
  if (weatherCode === 3) return WEATHER_ICON_PATHS.cloudy
  if (weatherCode === 45 || weatherCode === 48) {
    return WEATHER_ICON_PATHS.fog
  }
  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    return WEATHER_ICON_PATHS.rain
  }
  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    weatherCode === 85 ||
    weatherCode === 86
  ) {
    return WEATHER_ICON_PATHS.snow
  }
  if (weatherCode >= 95) return WEATHER_ICON_PATHS.storm

  return isDay === false
    ? WEATHER_ICON_PATHS.partlyNight
    : WEATHER_ICON_PATHS.partlyDay
}
