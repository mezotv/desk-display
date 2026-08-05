import type {
  AgentModelTokenUsage,
  AgentTokenBreakdown,
} from "@/types/agent-usage";

export function addAgentModelTokenUsage(
  totals: Map<string, AgentTokenBreakdown>,
  model: string,
  usage: AgentTokenBreakdown,
) {
  const previous = totals.get(model) ?? {
    cacheReadTokens: 0,
    cacheWriteLongTokens: 0,
    cacheWriteTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
  };

  totals.set(model, {
    cacheReadTokens: previous.cacheReadTokens + usage.cacheReadTokens,
    cacheWriteLongTokens:
      previous.cacheWriteLongTokens + usage.cacheWriteLongTokens,
    cacheWriteTokens: previous.cacheWriteTokens + usage.cacheWriteTokens,
    inputTokens: previous.inputTokens + usage.inputTokens,
    outputTokens: previous.outputTokens + usage.outputTokens,
  });
}

export function toAgentModelTokenUsage(
  totals: Map<string, AgentTokenBreakdown>,
): AgentModelTokenUsage[] {
  return [...totals.entries()]
    .map(([model, usage]) => ({ model, ...usage }))
    .sort((left, right) => {
      const leftTokens =
        left.inputTokens +
        left.outputTokens +
        left.cacheReadTokens +
        left.cacheWriteTokens +
        left.cacheWriteLongTokens;
      const rightTokens =
        right.inputTokens +
        right.outputTokens +
        right.cacheReadTokens +
        right.cacheWriteTokens +
        right.cacheWriteLongTokens;
      return rightTokens - leftTokens;
    });
}
