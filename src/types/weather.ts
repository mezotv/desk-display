export type WeatherSnapshot = {
  description: string
  error: string | null
  isDay: boolean | null
  location: string
  temperatureCelsius: number | null
  updatedAt: string
  weatherCode: number | null
}
