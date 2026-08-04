import type {
  AgentUsageProvider,
  AgentUsageSlide,
  AgentUsageSnapshot,
} from "@/types/agent-usage";

export function getAgentUsageSlides(
  snapshot: AgentUsageSnapshot,
  selectedProvider?: AgentUsageProvider,
): AgentUsageSlide[] {
  const slides: AgentUsageSlide[] = [];

  for (const provider of ["codex", "claude"] as const) {
    if (selectedProvider && provider !== selectedProvider) continue;
    const usage = snapshot[provider];
    if (!usage.available) continue;

    slides.push(
      ...usage.windows.map(
        (window): AgentUsageSlide => ({
          id: `${provider}-${window.id}`,
          kind: "limit",
          provider,
          window,
        }),
      ),
    );

    if (usage.dailyTokens.length > 0) {
      slides.push({
        dailyTokens: usage.dailyTokens,
        id: `${provider}-daily-tokens`,
        kind: "chart",
        provider,
      });
    }
  }

  return slides;
}
