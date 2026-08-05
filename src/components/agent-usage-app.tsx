import { AgentUsageChart } from "@/components/agent-usage-chart";
import { PixelatedImage } from "@/components/pixelated-image";
import { AGENT_USAGE_COPY } from "@/constants/agent-usage";
import type { AgentUsageAppProps } from "@/types/agent-usage";
import { formatAgentUsageCountdown } from "@/utils/format-agent-usage-countdown";
import { getAgentUsageSlides } from "@/utils/get-agent-usage-slides";

const PROVIDER_STYLES = {
  claude: {
    accent: "#d97757",
    gradient: "linear-gradient(180deg, #e49a7f 0%, #d97757 100%)",
    logo: "/logos/claude-ai.svg",
  },
  codex: {
    accent: "#8290ff",
    gradient:
      "linear-gradient(180deg, #a99cf9 0%, #7894f5 50%, #3344ff 100%)",
    logo: "/logos/codex.svg",
  },
} as const;

export function AgentUsageApp({
  language,
  now,
  provider,
  slideIndex,
  snapshot,
}: AgentUsageAppProps) {
  const copy = AGENT_USAGE_COPY[language];
  const slides = getAgentUsageSlides(snapshot, provider);
  const requestedProviderStyle = PROVIDER_STYLES[provider];

  if (!snapshot.configured || slides.length === 0) {
    const message = !snapshot.configured
      ? copy.addBridge
      : !snapshot.online
        ? copy.macOffline
        : copy.noData;

    return (
      <div className="flex flex-col items-center justify-center gap-[clamp(24px,5vh,46px)] text-center">
        <div className="flex items-center">
          <PixelatedImage
            alt={copy[provider]}
            className="size-[clamp(132px,min(20vw,33vh),280px)] object-contain"
            src={requestedProviderStyle.logo}
          />
        </div>
        <strong
          className="text-[clamp(28px,min(4vw,6.5vh),54px)]"
          style={{ color: requestedProviderStyle.accent }}
        >
          {message}
        </strong>
      </div>
    );
  }

  const activeSlideIndex = slideIndex % slides.length;
  const slide = slides[activeSlideIndex];
  const providerStyle = PROVIDER_STYLES[slide.provider];
  const providerName = copy[slide.provider];
  const showingCachedData =
    !snapshot.online || snapshot[slide.provider].stale;

  return (
    <div className="flex w-[min(90vw,1320px)] flex-col items-center justify-center gap-[clamp(16px,3.25vh,34px)] text-center transition-transform duration-100 group-active:scale-[0.985]">
      <header className="flex w-full items-center justify-center gap-[clamp(12px,2vw,24px)]">
        <PixelatedImage
          alt=""
          className="size-[clamp(56px,min(7.5vw,12vh),100px)] shrink-0 object-contain"
          src={providerStyle.logo}
        />
        <div className="min-w-0 text-left">
          <strong
            className="block text-[clamp(24px,min(3vw,5vh),42px)] leading-none"
            style={{ color: providerStyle.accent }}
          >
            {providerName}
          </strong>
          <span className="mt-2 block text-[clamp(13px,min(1.6vw,2.6vh),21px)] font-bold tracking-[0.12em] text-[#555561]">
            {activeSlideIndex + 1} / {slides.length}
            {showingCachedData ? ` · ${copy.cached}` : ""}
          </span>
        </div>
      </header>

      {slide.kind === "limit" ? (
        <section className="flex w-full flex-col items-center">
          <span
            className="text-[clamp(17px,min(2.3vw,3.8vh),31px)] font-bold tracking-[0.1em]"
            style={{ color: providerStyle.accent }}
          >
            {slide.window.label}
          </span>
          <div className="mt-[clamp(8px,1.5vh,16px)] flex items-end justify-center gap-[clamp(12px,2vw,24px)]">
            <strong
              className="text-[clamp(92px,min(18vw,30vh),250px)] font-extrabold leading-[0.78] tracking-[-0.08em] text-slate-50 tabular-nums"
              style={
                slide.provider === "codex"
                  ? {
                      WebkitBackgroundClip: "text",
                      backgroundImage: providerStyle.gradient,
                      color: "transparent",
                    }
                  : undefined
              }
            >
              {Math.round(100 - slide.window.usedPercent)}%
            </strong>
            <span className="mb-[clamp(6px,1.5vh,18px)] text-[clamp(18px,min(2.3vw,3.8vh),31px)] font-bold tracking-[0.08em] text-[#777782]">
              {copy.left}
            </span>
          </div>
          <span className="mt-[clamp(14px,2.5vh,26px)] block h-[clamp(7px,1.2vh,12px)] w-[min(72vw,920px)] overflow-hidden rounded-full bg-[#24242c]">
            <span
              className="block h-full rounded-[inherit] transition-[width] duration-500"
              style={{
                backgroundImage: providerStyle.gradient,
                width: `${100 - slide.window.usedPercent}%`,
              }}
            />
          </span>
          <div className="mt-[clamp(16px,3.25vh,32px)] flex items-baseline gap-[clamp(10px,1.5vw,20px)]">
            <span className="text-[clamp(14px,min(1.8vw,3vh),24px)] font-bold tracking-[0.08em] text-[#666672]">
              {copy.resetsIn}
            </span>
            <strong
              className="text-[clamp(30px,min(4.5vw,7.5vh),62px)] leading-none tabular-nums"
              style={{ color: providerStyle.accent }}
            >
              {formatAgentUsageCountdown(
                slide.window.resetsAt,
                now,
                language,
              )}
            </strong>
          </div>
        </section>
      ) : (
        <AgentUsageChart
          dailyTokens={slide.dailyTokens}
          language={language}
          provider={slide.provider}
        />
      )}
    </div>
  );
}
