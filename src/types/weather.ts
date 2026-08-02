export type WeatherSnapshot = {
  description: string
  error: string | null
  isDay: boolean | null
  location: string
  sunrise: string | null
  sunset: string | null
  temperatureCelsius: number | null
  updatedAt: string
  weatherCode: number | null
}
