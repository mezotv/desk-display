import { Option } from "effect";

import { ALARMS_STORAGE_KEY } from "@/constants/alarm";
import { DISPLAY_NAVIGATION_STORAGE_KEY } from "@/constants/navigation";
import { DISPLAY_SETTINGS_STORAGE_KEY } from "@/constants/settings";
import { decodeAlarms } from "@/schemas/alarm";
import { decodePersistedNavigation } from "@/schemas/navigation";
import { decodeDisplaySettings } from "@/schemas/settings";
import type { Alarm } from "@/types/alarm";
import type { PersistedNavigation } from "@/types/navigation";
import type { DisplaySettings } from "@/types/settings";

function readJson(key: string): unknown | undefined {
  const storedValue = window.localStorage.getItem(key);
  if (!storedValue) return undefined;

  try {
    return JSON.parse(storedValue);
  } catch {
    window.localStorage.removeItem(key);
    return undefined;
  }
}

export function loadAlarms(): Alarm[] {
  const parsed = decodeAlarms(readJson(ALARMS_STORAGE_KEY));

  if (Option.isNone(parsed)) {
    window.localStorage.removeItem(ALARMS_STORAGE_KEY);
    return [];
  }

  return [...parsed.value];
}

export function loadDisplaySettings(
  defaults: DisplaySettings,
): DisplaySettings {
  const parsed = decodeDisplaySettings(
    readJson(DISPLAY_SETTINGS_STORAGE_KEY),
  );

  if (Option.isNone(parsed)) {
    window.localStorage.removeItem(DISPLAY_SETTINGS_STORAGE_KEY);
    return defaults;
  }

  return {
    ...defaults,
    ...parsed.value,
    nightModeEnabled:
      parsed.value.nightModeEnabled ?? defaults.nightModeEnabled,
    nightModeEnd: parsed.value.nightModeEnd ?? defaults.nightModeEnd,
    nightModeStart: parsed.value.nightModeStart ?? defaults.nightModeStart,
    oledProtection: parsed.value.oledProtection ?? defaults.oledProtection,
  };
}

export function loadNavigation(): PersistedNavigation | null {
  const parsed = decodePersistedNavigation(
    readJson(DISPLAY_NAVIGATION_STORAGE_KEY),
  );

  if (Option.isNone(parsed)) {
    window.localStorage.removeItem(DISPLAY_NAVIGATION_STORAGE_KEY);
    return null;
  }

  return parsed.value;
}

export function saveAlarms(alarms: Alarm[]) {
  window.localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
}

export function saveDisplaySettings(settings: DisplaySettings) {
  window.localStorage.setItem(
    DISPLAY_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings),
  );
}

export function saveNavigation(navigation: PersistedNavigation) {
  window.localStorage.setItem(
    DISPLAY_NAVIGATION_STORAGE_KEY,
    JSON.stringify(navigation),
  );
}
