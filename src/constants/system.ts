import type { DisplayLanguage } from "@/types/settings";
import type { NetworkConnectionType } from "@/types/system";

type SystemCopy = {
  connection: string;
  cpu: string;
  memory: string;
  networkTypes: Record<NetworkConnectionType, string>;
  system: string;
  temperature: string;
  uptime: string;
};

export const SYSTEM_COPY: Record<DisplayLanguage, SystemCopy> = {
  de: {
    connection: "VERBINDUNG",
    cpu: "CPU",
    memory: "RAM",
    networkTypes: {
      ethernet: "ETHERNET",
      offline: "OFFLINE",
      other: "NETZWERK",
      wifi: "WLAN",
    },
    system: "SYSTEM",
    temperature: "TEMPERATUR",
    uptime: "LAUFZEIT",
  },
  en: {
    connection: "CONNECTION",
    cpu: "CPU",
    memory: "MEMORY",
    networkTypes: {
      ethernet: "ETHERNET",
      offline: "OFFLINE",
      other: "NETWORK",
      wifi: "WI-FI",
    },
    system: "SYSTEM",
    temperature: "TEMPERATURE",
    uptime: "UPTIME",
  },
};

export const SYSTEM_ACTIVE_REFRESH_INTERVAL_MS = 5_000;
export const SYSTEM_BACKGROUND_REFRESH_INTERVAL_MS = 60_000;
