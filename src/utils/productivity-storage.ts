import { Option } from "effect";

import {
  DEFAULT_PRODUCTIVITY_STATE,
  PRODUCTIVITY_STORAGE_KEY,
} from "@/constants/productivity";
import { decodeProductivityState } from "@/schemas/productivity";
import type { ProductivityState } from "@/types/productivity";

export function loadProductivityState(): ProductivityState {
  const storedValue = window.localStorage.getItem(PRODUCTIVITY_STORAGE_KEY);
  if (!storedValue) return structuredClone(DEFAULT_PRODUCTIVITY_STATE);

  try {
    const decoded = decodeProductivityState(JSON.parse(storedValue));
    if (Option.isSome(decoded)) {
      return {
        ...decoded.value,
        tasks: [...decoded.value.tasks],
      };
    }
  } catch {
    // Invalid persisted state is replaced with safe defaults below.
  }

  window.localStorage.removeItem(PRODUCTIVITY_STORAGE_KEY);
  return structuredClone(DEFAULT_PRODUCTIVITY_STATE);
}

export function saveProductivityState(state: ProductivityState) {
  window.localStorage.setItem(PRODUCTIVITY_STORAGE_KEY, JSON.stringify(state));
}
