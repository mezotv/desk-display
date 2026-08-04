import type { DisplayLanguage } from "@/types/settings";

export function formatAgentUsageCountdown(
  resetsAt: string | null,
  now: Date,
  language: DisplayLanguage,
) {
  if (!resetsAt) return "--:--:--";

  const remainingSeconds = Math.max(
    0,
    Math.floor((Date.parse(resetsAt) - now.getTime()) / 1_000),
  );
  if (!Number.isFinite(remainingSeconds)) return "--:--:--";

  const days = Math.floor(remainingSeconds / 86_400);
  const hours = Math.floor((remainingSeconds % 86_400) / 3_600);
  const minutes = Math.floor((remainingSeconds % 3_600) / 60);
  const seconds = remainingSeconds % 60;

  if (days > 0) {
    return language === "de"
      ? `${days}T ${hours}STD`
      : `${days}D ${hours}H`;
  }

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}
