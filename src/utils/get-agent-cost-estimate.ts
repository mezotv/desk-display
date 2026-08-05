import { AGENT_MODEL_PRICES } from "@/constants/agent-cost";
import type {
  AgentCostEstimate,
  AgentModelCostEstimate,
  AgentTokenBreakdown,
  AgentUsageProvider,
  AgentUsageSnapshot,
} from "@/types/agent-usage";

function getTokenTotal(tokens: AgentTokenBreakdown) {
  return (
    tokens.inputTokens +
    tokens.outputTokens +
    tokens.cacheReadTokens +
    tokens.cacheWriteTokens +
    tokens.cacheWriteLongTokens
  );
}

function estimateModelCost(
  provider: AgentUsageProvider,
  modelTokens: AgentUsageSnapshot[AgentUsageProvider]["modelTokens"][number],
): AgentModelCostEstimate {
  const price = AGENT_MODEL_PRICES.find(({ modelPattern }) =>
    modelPattern.test(modelTokens.model),
  );
  const estimatedUsd = price
    ? (modelTokens.inputTokens * price.input +
        modelTokens.outputTokens * price.output +
        modelTokens.cacheReadTokens * price.cacheRead +
        modelTokens.cacheWriteTokens * price.cacheWrite +
        modelTokens.cacheWriteLongTokens * price.cacheWriteLong) /
      1_000_000
    : null;

  return { ...modelTokens, estimatedUsd, provider };
}

export function getAgentCostEstimate(
  snapshot: AgentUsageSnapshot,
): AgentCostEstimate {
  const models = (["codex", "claude"] as const)
    .flatMap((provider) =>
      snapshot[provider].modelTokens.map((tokens) =>
        estimateModelCost(provider, tokens),
      ),
    )
    .sort((left, right) => {
      if (left.estimatedUsd === null) return 1;
      if (right.estimatedUsd === null) return -1;
      return right.estimatedUsd - left.estimatedUsd;
    });
  const tokens = models.reduce<AgentTokenBreakdown>(
    (total, model) => ({
      cacheReadTokens: total.cacheReadTokens + model.cacheReadTokens,
      cacheWriteLongTokens:
        total.cacheWriteLongTokens + model.cacheWriteLongTokens,
      cacheWriteTokens: total.cacheWriteTokens + model.cacheWriteTokens,
      inputTokens: total.inputTokens + model.inputTokens,
      outputTokens: total.outputTokens + model.outputTokens,
    }),
    {
      cacheReadTokens: 0,
      cacheWriteLongTokens: 0,
      cacheWriteTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
    },
  );

  return {
    estimatedUsd: models.reduce(
      (total, model) => total + (model.estimatedUsd ?? 0),
      0,
    ),
    models,
    pricedTokens: models.reduce(
      (total, model) =>
        total + (model.estimatedUsd === null ? 0 : getTokenTotal(model)),
      0,
    ),
    tokens,
    unpricedTokens: models.reduce(
      (total, model) =>
        total + (model.estimatedUsd === null ? getTokenTotal(model) : 0),
      0,
    ),
  };
}
