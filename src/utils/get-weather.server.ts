import '@tanstack/react-start/server-only'

import { DateTime, Effect, Option, Schema } from 'effect'
import { HttpClientRequest } from 'effect/unstable/http'

import {
  DEFAULT_WEATHER_LATITUDE,
  DEFAULT_WEATHER_LOCATION,
  DEFAULT_WEATHER_LONGITUDE,
} from '@/constants/weather'
import { openMeteoResponseSchema } from '@/schemas/external-api'
import { decodeWeatherEnvironment } from '@/schemas/environment'
import { ExternalServiceError } from '@/schemas/service-error'
import type { WeatherSnapshot } from '@/types/weather'
import { serverRuntime } from '@/runtime/server-runtime'
import { requestExternalJson } from '@/utils/request-external-api.server'

function describeWeather(code: number) {
  if (code === 0) return 'CLEAR'
  if (code <= 3) return 'CLOUDY'
  if (code === 45 || code === 48) return 'FOG'
  if (code <= 67 || (code >= 80 && code <= 82)) return 'RAIN'
  if (code <= 77 || code === 85 || code === 86) return 'SNOW'
  if (code >= 95) return 'STORM'
  return 'WEATHER'
}

function getWeatherConfiguration() {
  const decodedEnvironment = decodeWeatherEnvironment({
    WEATHER_LATITUDE: process.env.WEATHER_LATITUDE || undefined,
    WEATHER_LOCATION_LABEL: process.env.WEATHER_LOCATION_LABEL || undefined,
    WEATHER_LONGITUDE: process.env.WEATHER_LONGITUDE || undefined,
  })
  const environment = Option.isSome(decodedEnvironment)
    ? decodedEnvironment.value
    : undefined
  const latitude = environment?.WEATHER_LATITUDE ?? DEFAULT_WEATHER_LATITUDE
  const longitude = environment?.WEATHER_LONGITUDE ?? DEFAULT_WEATHER_LONGITUDE
  const location = (
    environment?.WEATHER_LOCATION_LABEL ?? DEFAULT_WEATHER_LOCATION
  ).toUpperCase()

  return { latitude, location, longitude }
}

const getCurrentWeatherEffect = Effect.fn('Weather.getCurrent')(function*() {
  const { latitude, location, longitude } = getWeatherConfiguration()

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('current', 'temperature_2m,weather_code,is_day')
  url.searchParams.set('daily', 'sunrise,sunset')
  url.searchParams.set('forecast_days', '1')
  url.searchParams.set('timezone', 'auto')

  const request = HttpClientRequest.get(url).pipe(
    HttpClientRequest.acceptJson,
  )
  const payload = yield* requestExternalJson(
    'Open-Meteo',
    'current weather',
    request,
  ).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(openMeteoResponseSchema)),
    Effect.mapError(
      (cause) =>
        cause instanceof ExternalServiceError
          ? cause
          : new ExternalServiceError({
              cause,
              message: 'Open-Meteo returned invalid current weather',
              operation: 'decode current weather',
              service: 'Open-Meteo',
            }),
    ),
  )
  const isDay = payload.current?.is_day
  const temperature = payload.current?.temperature_2m
  const weatherCode = payload.current?.weather_code
  const sunrise = payload.daily?.sunrise?.[0] ?? null
  const sunset = payload.daily?.sunset?.[0] ?? null

  if (
    typeof isDay !== 'number' ||
    typeof temperature !== 'number' ||
    typeof weatherCode !== 'number'
  ) {
    return yield* new ExternalServiceError({
      cause: new Error('Response did not contain current weather'),
      message: 'Open-Meteo response did not contain current weather',
      operation: 'decode current weather',
      service: 'Open-Meteo',
    })
  }

  return {
    description: describeWeather(weatherCode),
    error: null,
    isDay: isDay === 1,
    location,
    sunrise,
    sunset,
    temperatureCelsius: temperature,
    updatedAt: DateTime.formatIso(yield* DateTime.now),
    weatherCode,
  } satisfies WeatherSnapshot
})

export function getCurrentWeather(): Promise<WeatherSnapshot> {
  const { location } = getWeatherConfiguration()

  return serverRuntime.runPromise(
    getCurrentWeatherEffect().pipe(
      Effect.tapError(Effect.logError),
      Effect.catch(() =>
        Effect.gen(function*() {
          return {
            description: 'OFFLINE',
            error: 'Unable to update weather',
            isDay: null,
            location,
            sunrise: null,
            sunset: null,
            temperatureCelsius: null,
            updatedAt: DateTime.formatIso(yield* DateTime.now),
            weatherCode: null,
          } satisfies WeatherSnapshot
        }),
      ),
    ),
  )
}
