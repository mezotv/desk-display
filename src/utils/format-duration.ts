export function formatDuration(durationMs: number, includeTenths = false) {
  const safeDuration = Math.max(0, durationMs);
  const totalSeconds = Math.floor(safeDuration / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const base = hours
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (!includeTenths) return base;
  return `${base}.${Math.floor((safeDuration % 1_000) / 100)}`;
}
