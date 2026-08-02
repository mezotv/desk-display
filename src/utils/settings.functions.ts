import { createServerFn } from '@tanstack/react-start'

import { getInitialDisplaySettings } from '@/utils/get-display-settings.server'

export const getDisplaySettings = createServerFn({ method: 'GET' }).handler(
  () => getInitialDisplaySettings(),
)

