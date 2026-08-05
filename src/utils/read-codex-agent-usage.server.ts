import "@tanstack/react-start/server-only";

import { spawn } from "node:child_process";

import { Effect, Schema } from "effect";

import { AGENT_USAGE_COMMAND_TIMEOUT_MS } from "@/constants/agent-usage";
import {
  AgentUsageBridgeError,
  codexRateLimitsResponseSchema,
  codexUsageResponseSchema,
} from "@/schemas/agent-usage";
import type {
  AgentDailyTokenUsage,
  AgentProviderUsage,
  AgentUsageWindow,
} from "@/types/agent-usage";
import { getAgentUsageDateKeys } from "@/utils/get-agent-usage-date-keys";
import { readCodexModelTokens } from "@/utils/read-codex-model-tokens.server";

type CodexRpcResults = {
  rateLimits: unknown;
  usage: unknown;
};

function readCodexRpcResults(): Promise<CodexRpcResults> {
  return new Promise((resolve, reject) => {
    const child = spawn("codex", ["app-server"], {
      env: process.env,
      stdio: ["pipe", "pipe", "ignore"],
    });
    let stdoutBuffer = "";
    let rateLimits: unknown;
    let usage: unknown;
    let initialized = false;
    let settled = false;

    const finish = (
      result?: CodexRpcResults,
      error?: Error,
    ) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      child.kill("SIGTERM");

      if (error) reject(error);
      else if (result) resolve(result);
      else reject(new Error("Codex app server returned no result"));
    };

    const write = (message: unknown) => {
      child.stdin.write(`${JSON.stringify(message)}\n`);
    };

    const timeout = setTimeout(
      () => finish(undefined, new Error("Codex usage request timed out")),
      AGENT_USAGE_COMMAND_TIMEOUT_MS,
    );

    child.once("error", (cause) => finish(undefined, cause));
    child.once("exit", (code) => {
      if (!settled) {
        finish(
          undefined,
          new Error(`Codex app server exited before responding (${code})`),
        );
      }
    });
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdoutBuffer += chunk;
      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;

        let message: { id?: number; result?: unknown };
        try {
          message = JSON.parse(line) as { id?: number; result?: unknown };
        } catch {
          continue;
        }

        if (message.id === 1 && !initialized) {
          initialized = true;
          write({ method: "initialized" });
          write({ id: 2, method: "account/rateLimits/read" });
          write({ id: 3, method: "account/usage/read" });
          continue;
        }

        if (message.id === 2) rateLimits = message.result;
        if (message.id === 3) usage = message.result;

        if (rateLimits !== undefined && usage !== undefined) {
          finish({ rateLimits, usage });
        }
      }
    });

    write({
      id: 1,
      method: "initialize",
      params: {
        capabilities: null,
        clientInfo: {
          name: "desk-display-agent-usage-bridge",
          title: "Desk Display Agent Usage Bridge",
          version: "0.1.0",
        },
      },
    });
  });
}

function getWindowLabel(
  durationMinutes: number | null,
  bucketLabel: string | null,
) {
  const durationLabel =
    durationMinutes === 300
      ? "5 HOUR"
      : durationMinutes === 10_080
        ? "WEEKLY"
        : durationMinutes !== null && durationMinutes >= 40_000
          ? "MONTHLY"
          : durationMinutes
            ? `${Math.round(durationMinutes / 60)} HOUR`
            : "LIMIT";

  return bucketLabel && !/^codex$/i.test(bucketLabel)
    ? `${durationLabel} · ${bucketLabel.toUpperCase()}`
    : durationLabel;
}

function toUsageWindow(
  id: string,
  bucketLabel: string | null,
  window: {
    readonly resetsAt: number | null;
    readonly usedPercent: number;
    readonly windowDurationMins: number | null;
  },
): AgentUsageWindow {
  return {
    id,
    label: getWindowLabel(window.windowDurationMins, bucketLabel),
    resetsAt:
      window.resetsAt === null
        ? null
        : new Date(window.resetsAt * 1_000).toISOString(),
    usedPercent: Math.min(100, Math.max(0, window.usedPercent)),
    windowDurationMinutes: window.windowDurationMins,
  };
}

export const readCodexAgentUsage = Effect.fn("AgentUsage.readCodex")(
  function*(): Effect.fn.Return<
    AgentProviderUsage,
    AgentUsageBridgeError
  > {
    const [rpcResults, modelTokens] = yield* Effect.all(
      [
        Effect.tryPromise({
          try: readCodexRpcResults,
          catch: (cause) =>
            new AgentUsageBridgeError({
              cause,
              message: "Unable to read Codex usage",
              provider: "codex",
            }),
        }),
        Effect.tryPromise({
          try: readCodexModelTokens,
          catch: (cause) => cause,
        }).pipe(Effect.catch(() => Effect.succeed([]))),
      ],
      { concurrency: "unbounded" },
    );
    const rateLimitResponse = yield* Schema.decodeUnknownEffect(
      codexRateLimitsResponseSchema,
    )(rpcResults.rateLimits).pipe(
      Effect.mapError(
        (cause) =>
          new AgentUsageBridgeError({
            cause,
            message: "Codex returned invalid rate-limit data",
            provider: "codex",
          }),
      ),
    );
    const usageResponse = yield* Schema.decodeUnknownEffect(
      codexUsageResponseSchema,
    )(rpcResults.usage).pipe(
      Effect.mapError(
        (cause) =>
          new AgentUsageBridgeError({
            cause,
            message: "Codex returned invalid token-usage data",
            provider: "codex",
          }),
      ),
    );
    const buckets = (
      rateLimitResponse.rateLimitsByLimitId
        ? Object.values(rateLimitResponse.rateLimitsByLimitId)
        : [rateLimitResponse.rateLimits]
    ).sort((left, right) => {
      if (left.limitId === "codex") return -1;
      if (right.limitId === "codex") return 1;
      return (left.limitName ?? "").localeCompare(right.limitName ?? "");
    });
    const windows = buckets.flatMap((bucket, bucketIndex) => {
      const bucketId = bucket.limitId ?? `bucket-${bucketIndex + 1}`;
      const bucketLabel = bucket.limitName ?? bucket.limitId;
      return [
        ...(bucket.primary
          ? [toUsageWindow(`${bucketId}-primary`, bucketLabel, bucket.primary)]
          : []),
        ...(bucket.secondary
          ? [
              toUsageWindow(
                `${bucketId}-secondary`,
                bucketLabel,
                bucket.secondary,
              ),
            ]
          : []),
      ];
    });
    const usageByDate = new Map(
      (usageResponse.dailyUsageBuckets ?? []).map((bucket) => [
        bucket.startDate,
        bucket.tokens,
      ]),
    );
    const dailyTokens: AgentDailyTokenUsage[] = getAgentUsageDateKeys().map(
      (date) => ({ date, tokens: usageByDate.get(date) ?? 0 }),
    );

    return {
      available: true,
      dailyTokens,
      error: null,
      modelTokens,
      stale: false,
      updatedAt: new Date().toISOString(),
      windows,
    };
  },
);
