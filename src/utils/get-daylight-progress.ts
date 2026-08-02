export function getDaylightProgress(
  now: Date,
  sunrise: string | null,
  sunset: string | null,
) {
  if (!sunrise || !sunset) return null;

  const sunriseAt = new Date(sunrise);
  const sunsetAt = new Date(sunset);
  const daylightMs = sunsetAt.getTime() - sunriseAt.getTime();
  if (!Number.isFinite(daylightMs) || daylightMs <= 0) return null;

  const elapsedMs = now.getTime() - sunriseAt.getTime();
  return {
    daylightHours: daylightMs / 3_600_000,
    percent: Math.max(0, Math.min(100, (elapsedMs / daylightMs) * 100)),
    sunriseAt,
    sunsetAt,
  };
}
