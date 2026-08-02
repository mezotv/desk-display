import type { DisplayLanguage } from '@/types/settings'

export const DEFAULT_DISPLAY_LANGUAGE: DisplayLanguage = 'en'
export const DEFAULT_DISPLAY_NAME = ''
export const DEFAULT_NIGHT_MODE_ENABLED = true
export const DEFAULT_NIGHT_MODE_END = '08:00'
export const DEFAULT_NIGHT_MODE_START = '21:00'
export const DEFAULT_OLED_PROTECTION = true
export const DISPLAY_SETTINGS_STORAGE_KEY = 'desk-display-settings-v1'
export const MAX_DISPLAY_NAME_LENGTH = 18
export const NIGHT_MODE_TIME_STEP_MINUTES = 15

export const KEYBOARD_ROWS: Record<DisplayLanguage, string[][]> = {
  de: [
    [...'1234567890'],
    [...'QWERTZUIOPÜ'],
    [...'ASDFGHJKLÖÄ'],
    [...'YXCVBNM'],
  ],
  en: [
    [...'1234567890'],
    [...'QWERTYUIOP'],
    [...'ASDFGHJKL'],
    [...'ZXCVBNM'],
  ],
}

export const LOCALIZED_COPY = {
  de: {
    back: 'ZURÜCK',
    cancel: 'ABBRECHEN',
    done: 'FERTIG',
    greeting: {
      afternoon: 'Guten Tag',
      evening: 'Guten Abend',
      morning: 'Guten Morgen',
      night: 'Gute Nacht',
    },
    homeHint: 'APP DOPPELT ANTIPPEN FÜR HOME',
    language: 'SPRACHE',
    name: 'NAME',
    nightMode: 'NACHTMODUS',
    nightModeHint: 'DIMMT DAS DISPLAY · LOKALE ZEIT',
    nightModeFrom: 'VON',
    nightModeTo: 'BIS',
    oledProtection: 'OLED-SCHUTZ',
    oledProtectionHint: 'VERSCHIEBT DAS BILD SANFT',
    off: 'AUS',
    on: 'AN',
    save: 'SPEICHERN',
    settings: 'EINSTELLUNGEN',
    space: 'LEERZEICHEN',
  },
  en: {
    back: 'BACK',
    cancel: 'CANCEL',
    done: 'DONE',
    greeting: {
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      morning: 'Good morning',
      night: 'Good night',
    },
    homeHint: 'DOUBLE TAP ANY APP FOR HOME',
    language: 'LANGUAGE',
    name: 'NAME',
    nightMode: 'NIGHT MODE',
    nightModeHint: 'DIMS THE DISPLAY · LOCAL TIME',
    nightModeFrom: 'FROM',
    nightModeTo: 'TO',
    oledProtection: 'OLED PROTECTION',
    oledProtectionHint: 'GENTLY SHIFTS THE IMAGE',
    off: 'OFF',
    on: 'ON',
    save: 'SAVE',
    settings: 'SETTINGS',
    space: 'SPACE',
  },
} as const
