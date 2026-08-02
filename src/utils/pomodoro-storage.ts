import { Option } from "effect";

import {
  DEFAULT_POMODORO_STATE,
  POMODORO_STORAGE_KEY,
} from "@/constants/pomodoro";
import { decodePomodoroState } from "@/schemas/pomodoro";
import type { PomodoroState } from "@/types/pomodoro";

export function loadPomodoroState(): PomodoroState {
  const storedValue = window.localStorage.getItem(POMODORO_STORAGE_KEY);
  if (!storedValue) return structuredClone(DEFAULT_POMODORO_STATE);

  try {
    const decoded = decodePomodoroState(JSON.parse(storedValue));
    if (Option.isSome(decoded)) return decoded.value;
  } catch {
    // Invalid persisted state is replaced with safe defaults below.
  }

  window.localStorage.removeItem(POMODORO_STORAGE_KEY);
  return structuredClone(DEFAULT_POMODORO_STATE);
}

export function savePomodoroState(state: PomodoroState) {
  window.localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(state));
}
