import type { ReactNode } from 'react'

export type DisplayLanguage = 'de' | 'en'

export type DisplaySettings = {
  language: DisplayLanguage
  name: string
  nightModeEnabled: boolean
  nightModeEnd: string
  nightModeStart: string
  oledProtection: boolean
}

export type TouchKeyboardProps = {
  language: DisplayLanguage
  onCancel: () => void
  onSave: (value: string) => void
  value: string
}

export type SettingsAppProps = {
  onChange: (settings: DisplaySettings) => void
  onHome: () => void
  settings: DisplaySettings
}

export type NightTimeControlProps = {
  label: string
  onChange: (value: string) => void
  value: string
}

export type ScreenProtectionProps = {
  children: ReactNode
  enabled: boolean
  nightModeActive: boolean
}
