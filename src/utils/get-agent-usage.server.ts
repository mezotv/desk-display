import "@tanstack/react-start/server-only";

import { Clock, Effect, Option, Schema } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import { AGENT_USAGE_BRIDGE_CACHE_TTL_MS } from "@/constants/agent-usage";
import { serverRuntime } from "@/runtime/server-runtime";
import { agentUsageBridgeResponseSchema } from "@/schemas/agent-usage";
import { decodeAgentUsageEnvironment } from "@/schemas/environment";
import { ExternalServiceError } from "@/schemas/service-error";
import type {
  AgentProviderUsage,
  AgentUsageSnapshot,
} from "@/types/agent-usage";
import { requestExternalJson } from "@/utils/request-external-api.server";

let agentUsageCache: {
  expiresAt: number;
  snapshot: AgentUsageSnapshot;
} | null = null;

function unavailableProvider(): AgentProviderUsage {
  return {
    available: false,
    dailyTokens: [],
    error: null,
    updatedAt: new Date().toISOString(),
    windows: [],
  };
}

function emptySnapshot(
  configured: boolean,
  online: boolean,
): AgentUsageSnapshot {
  return {
    claude: unavailableProvider(),
    codex: unavailableProvider(),
    configured,
    online,
    updatedAt: new Date().toISOString(),
  };
}

function getAgentUsageEnvironment() {
  return decodeAgentUsageEnvironment({
    AGENT_USAGE_BRIDGE_TOKEN: process.env.AGENT_USAGE_BRIDGE_TOKEN,
    AGENT_USAGE_BRIDGE_URL: process.env.AGENT_USAGE_BRIDGE_URL,
  });
}

const getAgentUsageSnapshotEffect = Effect.fn("AgentUsage.getSnapshot")(
  function*() {
    const environment = getAgentUsageEnvironment();
    if (Option.isNone(environment)) return emptySnapshot(false, false);

    const now = yield* Clock.currentTimeMillis;
    if (agentUsageCache && now < agentUsageCache.expiresAt) {
      return agentUsageCache.snapshot;
    }

    const url = yield* Effect.try({
      try: () =>
        new URL(
          "/v1/usage",
          environment.value.AGENT_USAGE_BRIDGE_URL,
        ),
      catch: (cause) =>
        new ExternalServiceError({
          cause,
          message: "Agent usage bridge URL is invalid",
          operation: "build URL",
          service: "Agent usage bridge",
        }),
    });
    const request = HttpClientRequest.get(url).pipe(
      HttpClientRequest.setHeader(
        "authorization",
        `Bearer ${environment.value.AGENT_USAGE_BRIDGE_TOKEN}`,
      ),
      HttpClientRequest.acceptJson,
    );
    const payload = yield* requestExternalJson(
      "Agent usage bridge",
      "usage refresh",
      request,
      "20 seconds",
    ).pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(agentUsageBridgeResponseSchema)),
      Effect.mapError((cause) =>
        cause instanceof ExternalServiceError
          ? cause
          : new ExternalServiceError({
              cause,
              message: "Agent usage bridge returned invalid data",
              operation: "decode response",
              service: "Agent usage bridge",
            }),
      ),
    );
    const snapshot = {
      ...payload,
      configured: true,
      online: true,
    } satisfies AgentUsageSnapshot;

    agentUsageCache = {
      expiresAt: now + AGENT_USAGE_BRIDGE_CACHE_TTL_MS,
      snapshot,
    };
    return snapshot;
  },
);

export function getAgentUsageSnapshot(): Promise<AgentUsageSnapshot> {
  const configured = Option.isSome(getAgentUsageEnvironment());

  return serverRuntime.runPromise(
    getAgentUsageSnapshotEffect().pipe(
      Effect.catch(() => {
        const snapshot = agentUsageCache
          ? { ...agentUsageCache.snapshot, online: false }
          : emptySnapshot(configured, false);
        agentUsageCache = {
          expiresAt: Date.now() + AGENT_USAGE_BRIDGE_CACHE_TTL_MS,
          snapshot,
        };
        return Effect.succeed(snapshot);
      }),
    ),
  );
}
