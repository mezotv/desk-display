import { Schema } from 'effect'

import { MAX_DISPLAY_NAME_LENGTH } from '@/constants/settings'

const displayTimeSchema = Schema.String.check(
  Schema.isPattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
)

export const displaySettingsSchema = Schema.Struct({
  language: Schema.Literals(['de', 'en']),
  name: Schema.String.check(Schema.isMaxLength(MAX_DISPLAY_NAME_LENGTH)),
  nightModeEnabled: Schema.optionalKey(Schema.Boolean),
  nightModeEnd: Schema.optionalKey(displayTimeSchema),
  nightModeStart: Schema.optionalKey(displayTimeSchema),
  oledProtection: Schema.optionalKey(Schema.Boolean),
})

export const decodeDisplaySettings = Schema.decodeUnknownOption(
  displaySettingsSchema,
)
