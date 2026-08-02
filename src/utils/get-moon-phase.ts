import type { MoonPhaseName, MoonPhaseSnapshot } from "@/types/ambient";

const SYNODIC_MONTH_DAYS = 29.53058867;
const KNOWN_NEW_MOON_AT = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86_400_000;

function getPhaseName(phase: number): MoonPhaseName {
  if (phase < 0.0625 || phase >= 0.9375) return "newMoon";
  if (phase < 0.1875) return "waxingCrescent";
  if (phase < 0.3125) return "firstQuarter";
  if (phase < 0.4375) return "waxingGibbous";
  if (phase < 0.5625) return "fullMoon";
  if (phase < 0.6875) return "waningGibbous";
  if (phase < 0.8125) return "lastQuarter";
  return "waningCrescent";
}

export function getMoonPhase(date: Date): MoonPhaseSnapshot {
  const elapsedDays = (date.getTime() - KNOWN_NEW_MOON_AT) / DAY_MS;
  const phase =
    ((elapsedDays % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) %
    SYNODIC_MONTH_DAYS / SYNODIC_MONTH_DAYS;

  return {
    ageDays: phase * SYNODIC_MONTH_DAYS,
    illuminationPercent: Math.round(
      ((1 - Math.cos(phase * Math.PI * 2)) / 2) * 100,
    ),
    name: getPhaseName(phase),
    phase,
  };
}
