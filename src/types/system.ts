import type { DisplayLanguage } from "@/types/settings";

export type NetworkConnectionType = "ethernet" | "offline" | "other" | "wifi";

export type SystemSnapshot = {
  cpuLoadPercent: number;
  cpuTemperatureCelsius: number | null;
  freeMemoryBytes: number;
  hostname: string;
  ipAddress: string | null;
  networkInterface: string | null;
  networkType: NetworkConnectionType;
  totalMemoryBytes: number;
  updatedAt: string;
  uptimeSeconds: number;
};

export type SystemAppProps = {
  language: DisplayLanguage;
  system: SystemSnapshot;
};
