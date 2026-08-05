import { PixelatedImage } from "@/components/pixelated-image";
import { AGENT_COST_COPY } from "@/constants/agent-cost";
import type {
  AgentCostAppProps,
  AgentTokenBreakdown,
} from "@/types/agent-usage";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { getAgentCostEstimate } from "@/utils/get-agent-cost-estimate";

function formatEstimatedCost(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: amount >= 100 ? 0 : amount >= 10 ? 1 : 2,
    minimumFractionDigits: amount < 10 ? 2 : 0,
    style: "currency",
  }).format(amount);
}

function getTokenTotal(tokens: AgentTokenBreakdown) {
  return (
    tokens.inputTokens +
    tokens.outputTokens +
    tokens.cacheReadTokens +
    tokens.cacheWriteTokens +
    tokens.cacheWriteLongTokens
  );
}

export function AgentCostApp({
  language,
  slideIndex,
  snapshot,
}: AgentCostAppProps) {
  const copy = AGENT_COST_COPY[language];
  const estimate = getAgentCostEstimate(snapshot);
  const activeSlide = slideIndex % 3;
  const totalTokens = getTokenTotal(estimate.tokens);
  const stale =
    !snapshot.online || snapshot.claude.stale || snapshot.codex.stale;

  if (estimate.models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-[clamp(24px,5vh,46px)] text-center">
        <PixelatedImage
          alt=""
          className="size-[clamp(132px,min(20vw,33vh),280px)] object-contain"
          src="/logos/agent-cost-pixel.svg"
        />
        <strong className="text-[clamp(26px,min(3.8vw,6vh),50px)] text-emerald-400">
          {copy.noData}
        </strong>
      </div>
    );
  }

  return (
    <div className="flex w-[min(91vw,1320px)] flex-col items-center justify-center gap-[clamp(16px,3vh,30px)] text-center transition-transform duration-100 group-active:scale-[0.985]">
      <header className="flex w-full items-center justify-center gap-[clamp(12px,2vw,24px)]">
        <PixelatedImage
          alt=""
          className="size-[clamp(58px,min(7.5vw,12vh),100px)] object-contain"
          src="/logos/agent-cost-pixel.svg"
        />
        <div className="text-left">
          <strong className="block text-[clamp(25px,min(3.2vw,5.2vh),44px)] leading-none text-emerald-400">
            {copy.title}
          </strong>
          <span className="mt-2 block text-[clamp(13px,min(1.6vw,2.6vh),21px)] font-bold tracking-[0.12em] text-[#666672]">
            {activeSlide + 1} / 3{stale ? " · CACHED" : ""}
          </span>
        </div>
      </header>

      {activeSlide === 0 && (
        <section className="flex flex-col items-center">
          <span className="text-[clamp(17px,min(2.3vw,3.8vh),31px)] font-bold tracking-[0.1em] text-emerald-400">
            {copy.apiEquivalent}
          </span>
          <strong className="mt-[clamp(10px,2vh,20px)] text-[clamp(92px,min(18vw,30vh),250px)] font-extrabold leading-[0.78] tracking-[-0.08em] text-slate-50 tabular-nums">
            {formatEstimatedCost(estimate.estimatedUsd)}
          </strong>
          <div className="mt-[clamp(22px,4vh,38px)] flex items-baseline gap-3">
            <strong className="text-[clamp(28px,min(4vw,6.5vh),56px)] text-[#a8a8b3] tabular-nums">
              {formatCompactNumber(totalTokens)}
            </strong>
            <span className="text-[clamp(14px,min(1.8vw,3vh),24px)] font-bold tracking-[0.08em] text-[#666672]">
              {copy.totalTokens}
            </span>
          </div>
          <span className="mt-[clamp(14px,2.5vh,24px)] text-[clamp(13px,min(1.55vw,2.6vh),21px)] font-bold tracking-[0.08em] text-[#666672]">
            {copy.notBill}
          </span>
          {estimate.unpricedTokens > 0 && (
            <span className="mt-2 text-[clamp(12px,min(1.35vw,2.2vh),18px)] font-bold tracking-[0.06em] text-amber-400">
              {copy.partiallyPriced}
            </span>
          )}
        </section>
      )}

      {activeSlide === 1 && (
        <section className="w-full">
          <h2 className="text-[clamp(17px,min(2.3vw,3.8vh),31px)] font-bold tracking-[0.1em] text-emerald-400">
            {copy.tokens}
          </h2>
          <div className="mt-[clamp(16px,3vh,30px)] grid grid-cols-4 gap-[clamp(10px,1.6vw,22px)] max-[720px]:grid-cols-2">
            {[
              [copy.input, estimate.tokens.inputTokens, "#8290ff"],
              [copy.output, estimate.tokens.outputTokens, "#f8fafc"],
              [copy.cacheRead, estimate.tokens.cacheReadTokens, "#34d399"],
              [
                copy.cacheWrite,
                estimate.tokens.cacheWriteTokens +
                  estimate.tokens.cacheWriteLongTokens,
                "#fbbf24",
              ],
            ].map(([label, tokens, color]) => (
              <article
                className="flex min-w-0 flex-col items-center rounded-[clamp(12px,2vw,24px)] bg-[#17171e] px-3 py-[clamp(18px,4vh,38px)]"
                key={String(label)}
              >
                <strong
                  className="text-[clamp(30px,min(4.4vw,7vh),62px)] leading-none tabular-nums"
                  style={{ color: String(color) }}
                >
                  {formatCompactNumber(Number(tokens))}
                </strong>
                <span className="mt-[clamp(10px,2vh,18px)] text-[clamp(12px,min(1.45vw,2.4vh),19px)] font-bold tracking-[0.07em] text-[#777782]">
                  {label}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeSlide === 2 && (
        <section className="w-full">
          <h2 className="text-[clamp(17px,min(2.3vw,3.8vh),31px)] font-bold tracking-[0.1em] text-emerald-400">
            {copy.models}
          </h2>
          <div className="mt-[clamp(14px,2.5vh,26px)] grid gap-[clamp(8px,1.5vh,14px)]">
            {estimate.models.slice(0, 4).map((model) => (
              <article
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[clamp(12px,2vw,28px)] rounded-[clamp(10px,1.5vw,18px)] bg-[#17171e] px-[clamp(14px,2.4vw,30px)] py-[clamp(12px,2.2vh,22px)] text-left"
                key={`${model.provider}-${model.model}`}
              >
                <div className="min-w-0">
                  <strong className="block overflow-hidden text-[clamp(18px,min(2.6vw,4.2vh),34px)] text-ellipsis whitespace-nowrap text-slate-50">
                    {model.model.toUpperCase()}
                  </strong>
                  <span
                    className="mt-1 block text-[clamp(11px,min(1.3vw,2.1vh),17px)] font-bold tracking-[0.1em]"
                    style={{
                      color: model.provider === "codex" ? "#8290ff" : "#d97757",
                    }}
                  >
                    {model.provider.toUpperCase()}
                  </span>
                </div>
                <span className="text-[clamp(15px,min(2vw,3.2vh),26px)] font-bold text-[#777782] tabular-nums">
                  {formatCompactNumber(getTokenTotal(model))}
                </span>
                <strong className="min-w-[4.5ch] text-right text-[clamp(24px,min(3.8vw,6vh),50px)] text-emerald-400 tabular-nums">
                  {model.estimatedUsd === null
                    ? "—"
                    : formatEstimatedCost(model.estimatedUsd)}
                </strong>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
