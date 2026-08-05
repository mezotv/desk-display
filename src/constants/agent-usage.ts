import type { DisplayLanguage } from "@/types/settings";

export const AGENT_USAGE_ACTIVE_REFRESH_INTERVAL_MS = 5 * 60_000;
export const AGENT_USAGE_BACKGROUND_REFRESH_INTERVAL_MS = 30 * 60_000;
export const AGENT_USAGE_BRIDGE_CACHE_TTL_MS = 4 * 60_000;
export const AGENT_USAGE_BRIDGE_DEFAULT_PORT = 4_747;
export const AGENT_USAGE_COMMAND_TIMEOUT_MS = 15_000;
export const AGENT_USAGE_DAY_COUNT = 7;

export const AGENT_USAGE_COPY = {
  de: {
    addBridge: "MAC-BRIDGE EINRICHTEN",
    chartLocal: "NUR AUF DIESEM MAC",
    chartTitle: "TOKEN · LETZTE 7 TAGE",
    cached: "LETZTE GUTE DATEN",
    claude: "CLAUDE",
    codex: "CODEX",
    left: "ÜBRIG",
    macOffline: "MAC IST OFFLINE",
    noData: "KEINE NUTZUNGSDATEN",
    resetsIn: "RESET IN",
    today: "HEUTE",
    updated: "AKTUALISIERT",
  },
  en: {
    addBridge: "SET UP MAC BRIDGE",
    chartLocal: "THIS MAC ONLY",
    chartTitle: "TOKENS · LAST 7 DAYS",
    cached: "LAST GOOD DATA",
    claude: "CLAUDE",
    codex: "CODEX",
    left: "LEFT",
    macOffline: "MAC IS OFFLINE",
    noData: "NO USAGE DATA",
    resetsIn: "RESETS IN",
    today: "TODAY",
    updated: "UPDATED",
  },
} satisfies Record<DisplayLanguage, Record<string, string>>;
