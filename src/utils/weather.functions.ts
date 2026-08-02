import { createServerFn } from '@tanstack/react-start'

import { getCurrentWeather } from '@/utils/get-weather.server'

export const getWeather = createServerFn({ method: 'GET' }).handler(() =>
  getCurrentWeather(),
)

