import type { DisplayLanguage } from "@/types/settings";

export function formatSystemUptime(
  uptimeSeconds: number,
  language: DisplayLanguage,
) {
  const totalMinutes = Math.max(0, Math.floor(uptimeSeconds / 60));
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}D ${hours}H`;
  if (hours > 0) return `${hours}H ${minutes}M`;
  return language === "de" ? `${minutes} MIN` : `${minutes} MIN`;
}

export function formatMemorySize(bytes: number) {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
