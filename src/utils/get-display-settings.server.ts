import '@tanstack/react-start/server-only'

import {
  DEFAULT_DISPLAY_LANGUAGE,
  DEFAULT_DISPLAY_NAME,
  DEFAULT_NIGHT_MODE_ENABLED,
  DEFAULT_NIGHT_MODE_END,
  DEFAULT_NIGHT_MODE_START,
  DEFAULT_OLED_PROTECTION,
} from '@/constants/settings'
import { Option } from 'effect'

import { decodeDisplayEnvironment } from '@/schemas/environment'
import type { DisplaySettings } from '@/types/settings'

export function getInitialDisplaySettings(): DisplaySettings {
  const environment = decodeDisplayEnvironment({
    DISPLAY_LANGUAGE: process.env.DISPLAY_LANGUAGE,
    DISPLAY_NAME: process.env.DISPLAY_NAME,
  })

  if (Option.isNone(environment)) {
    return {
      language: DEFAULT_DISPLAY_LANGUAGE,
      name: DEFAULT_DISPLAY_NAME,
      nightModeEnabled: DEFAULT_NIGHT_MODE_ENABLED,
      nightModeEnd: DEFAULT_NIGHT_MODE_END,
      nightModeStart: DEFAULT_NIGHT_MODE_START,
      oledProtection: DEFAULT_OLED_PROTECTION,
    }
  }

  return {
    language:
      environment.value.DISPLAY_LANGUAGE ?? DEFAULT_DISPLAY_LANGUAGE,
    name: environment.value.DISPLAY_NAME?.trim() ?? DEFAULT_DISPLAY_NAME,
    nightModeEnabled: DEFAULT_NIGHT_MODE_ENABLED,
    nightModeEnd: DEFAULT_NIGHT_MODE_END,
    nightModeStart: DEFAULT_NIGHT_MODE_START,
    oledProtection: DEFAULT_OLED_PROTECTION,
  }
}
