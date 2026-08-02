import { Schema } from 'effect'

import { APP_IDS } from '@/constants/navigation'

export const persistedNavigationSchema = Schema.Struct({
  activeApp: Schema.Literals(APP_IDS),
  launcherOpen: Schema.Boolean,
})

export const decodePersistedNavigation = Schema.decodeUnknownOption(
  persistedNavigationSchema,
)
