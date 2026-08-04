import { Schema } from "effect";

export const agentUsageWindowSchema = Schema.Struct({
  id: Schema.String,
  label: Schema.String,
  resetsAt: Schema.NullOr(Schema.String),
  usedPercent: Schema.Number.check(
    Schema.isGreaterThanOrEqualTo(0),
    Schema.isLessThanOrEqualTo(100),
  ),
  windowDurationMinutes: Schema.NullOr(Schema.Number),
});

export const agentDailyTokenUsageSchema = Schema.Struct({
  date: Schema.String,
  tokens: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
});

export const agentProviderUsageSchema = Schema.Struct({
  available: Schema.Boolean,
  dailyTokens: Schema.Array(agentDailyTokenUsageSchema),
  error: Schema.NullOr(Schema.String),
  updatedAt: Schema.String,
  windows: Schema.Array(agentUsageWindowSchema),
});

export const agentUsageBridgeResponseSchema = Schema.Struct({
  claude: agentProviderUsageSchema,
  codex: agentProviderUsageSchema,
  updatedAt: Schema.String,
});

export const codexRateLimitWindowSchema = Schema.Struct({
  resetsAt: Schema.NullOr(Schema.Number),
  usedPercent: Schema.Number,
  windowDurationMins: Schema.NullOr(Schema.Number),
});

export const codexRateLimitSnapshotSchema = Schema.Struct({
  limitId: Schema.NullOr(Schema.String),
  limitName: Schema.NullOr(Schema.String),
  primary: Schema.NullOr(codexRateLimitWindowSchema),
  secondary: Schema.NullOr(codexRateLimitWindowSchema),
});

export const codexRateLimitsResponseSchema = Schema.Struct({
  rateLimits: codexRateLimitSnapshotSchema,
  rateLimitsByLimitId: Schema.NullOr(
    Schema.Record(Schema.String, codexRateLimitSnapshotSchema),
  ),
});

const tokenCountSchema = Schema.Union([
  Schema.Number,
  Schema.NumberFromString,
]);

export const codexUsageResponseSchema = Schema.Struct({
  dailyUsageBuckets: Schema.NullOr(
    Schema.Array(
      Schema.Struct({
        startDate: Schema.String,
        tokens: tokenCountSchema,
      }),
    ),
  ),
});

export const claudeUsageCommandResponseSchema = Schema.Struct({
  result: Schema.String,
});

export const claudeSessionUsageSchema = Schema.Struct({
  message: Schema.Struct({
    id: Schema.String,
    usage: Schema.Struct({
      cache_creation_input_tokens: Schema.optionalKey(Schema.Number),
      cache_read_input_tokens: Schema.optionalKey(Schema.Number),
      input_tokens: Schema.optionalKey(Schema.Number),
      output_tokens: Schema.optionalKey(Schema.Number),
    }),
  }),
  timestamp: Schema.String,
  type: Schema.Literals(["assistant"]),
});

export class AgentUsageBridgeError extends Schema.TaggedErrorClass<AgentUsageBridgeError>()(
  "AgentUsageBridgeError",
  {
    cause: Schema.Defect(),
    message: Schema.String,
    provider: Schema.String,
  },
) {}
