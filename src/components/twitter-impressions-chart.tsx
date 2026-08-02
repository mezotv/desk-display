import type { TwitterImpressionsChartProps } from "@/types/twitter";

export function TwitterImpressionsChart({
  dailyImpressions,
}: TwitterImpressionsChartProps) {
  const maximum = Math.max(
    1,
    ...dailyImpressions.map((day) => day.impressionCount),
  );

  return (
    <div
      aria-label="Thirty-day post impressions chart"
      className="grid h-[clamp(150px,min(34vw,40vh),310px)] w-full grid-cols-[repeat(30,minmax(2px,1fr))] items-end gap-[clamp(2px,0.42vw,7px)]"
      role="img"
    >
      {dailyImpressions.map((day) => (
        <span
          className="min-h-[3px] bg-[#55acee] shadow-[0_0_18px_rgba(85,172,238,0.18)]"
          key={day.date}
          style={{
            height: `${Math.max(2, (day.impressionCount / maximum) * 100)}%`,
          }}
          title={`${day.date}: ${day.impressionCount}`}
        />
      ))}
    </div>
  );
}
