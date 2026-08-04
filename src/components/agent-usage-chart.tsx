import { AGENT_USAGE_COPY } from "@/constants/agent-usage";
import type { AgentUsageChartProps } from "@/types/agent-usage";
import { formatCompactNumber } from "@/utils/format-compact-number";

export function AgentUsageChart({
  dailyTokens,
  language,
  provider,
}: AgentUsageChartProps) {
  const copy = AGENT_USAGE_COPY[language];
  const accent = provider === "codex" ? "#8290ff" : "#d97757";
  const gradient =
    provider === "codex"
      ? "linear-gradient(180deg, #a99cf9 0%, #7894f5 50%, #3344ff 100%)"
      : "linear-gradient(180deg, #e49a7f 0%, #d97757 100%)";
  const maximum = Math.max(1, ...dailyTokens.map(({ tokens }) => tokens));
  const total = dailyTokens.reduce((sum, { tokens }) => sum + tokens, 0);
  const locale = language === "de" ? "de-DE" : "en-US";
  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });

  return (
    <section className="w-full max-w-[1180px]">
      <div className="mb-[clamp(12px,2.5vh,24px)] flex items-end justify-between gap-5 text-left">
        <div>
          <strong
            className="block text-[clamp(42px,min(6vw,10vh),82px)] leading-none text-slate-50"
            style={
              provider === "codex"
                ? {
                    WebkitBackgroundClip: "text",
                    backgroundImage: gradient,
                    color: "transparent",
                  }
                : undefined
            }
          >
            {formatCompactNumber(total)}
          </strong>
          <span
            className="mt-2 block text-[clamp(13px,min(1.7vw,2.8vh),22px)] font-bold tracking-[0.08em]"
            style={{ color: accent }}
          >
            {copy.chartTitle}
          </span>
        </div>
        {provider === "claude" && (
          <span className="text-right text-[clamp(11px,min(1.35vw,2.2vh),18px)] font-bold tracking-[0.08em] text-[#666672]">
            {copy.chartLocal}
          </span>
        )}
      </div>
      <div className="grid h-[clamp(150px,29vh,270px)] grid-cols-7 items-end gap-[clamp(8px,1.7vw,24px)]">
        {dailyTokens.map(({ date, tokens }) => {
          const height = tokens === 0 ? 3 : Math.max(8, (tokens / maximum) * 100);
          return (
            <div className="flex h-full min-w-0 flex-col justify-end" key={date}>
              <span className="mb-2 overflow-hidden text-center text-[clamp(10px,min(1.2vw,2vh),16px)] font-bold text-ellipsis whitespace-nowrap text-[#777782]">
                {tokens > 0 ? formatCompactNumber(tokens) : "·"}
              </span>
              <span
                className="block min-h-[4px] w-full rounded-t-[clamp(3px,0.5vw,7px)] opacity-90"
                style={{ backgroundImage: gradient, height: `${height}%` }}
              />
              <span className="mt-2 overflow-hidden text-center text-[clamp(11px,min(1.4vw,2.3vh),18px)] font-bold tracking-[0.04em] text-ellipsis whitespace-nowrap text-[#555561] uppercase">
                {dayFormatter.format(new Date(`${date}T12:00:00`))}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
