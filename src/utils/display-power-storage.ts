import { Option } from "effect";

import {
  DEFAULT_DISPLAY_SLEEP_STATE,
  DISPLAY_SLEEP_STORAGE_KEY,
} from "@/constants/display-power";
import { decodeDisplaySleepState } from "@/schemas/display-power";
import type { DisplaySleepState } from "@/types/display-power";

export function loadDisplaySleepState(): DisplaySleepState {
  const storedValue = window.localStorage.getItem(DISPLAY_SLEEP_STORAGE_KEY);
  if (!storedValue) return DEFAULT_DISPLAY_SLEEP_STATE;

  try {
    const decoded = decodeDisplaySleepState(JSON.parse(storedValue));
    if (Option.isSome(decoded)) return decoded.value;
  } catch {
    // Invalid persisted state is replaced with the safe awake state below.
  }

  window.localStorage.removeItem(DISPLAY_SLEEP_STORAGE_KEY);
  return DEFAULT_DISPLAY_SLEEP_STATE;
}

export function saveDisplaySleepState(state: DisplaySleepState) {
  window.localStorage.setItem(
    DISPLAY_SLEEP_STORAGE_KEY,
    JSON.stringify(state),
  );
}
