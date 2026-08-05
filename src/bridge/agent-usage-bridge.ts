import { createServer, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";

import { Effect, Option } from "effect";

import {
  AGENT_USAGE_BRIDGE_CACHE_TTL_MS,
  AGENT_USAGE_BRIDGE_DEFAULT_PORT,
} from "@/constants/agent-usage";
import { agentUsageBridgeRuntime } from "@/runtime/agent-usage-bridge-runtime";
import { decodeAgentUsageBridgeEnvironment } from "@/schemas/environment";
import type {
  AgentProviderUsage,
  AgentUsageBridgeResponse,
} from "@/types/agent-usage";
import { readClaudeAgentUsage } from "@/utils/read-claude-agent-usage.server";
import { readCodexAgentUsage } from "@/utils/read-codex-agent-usage.server";

const environment = decodeAgentUsageBridgeEnvironment({
  DESK_DISPLAY_BRIDGE_HOST: process.env.DESK_DISPLAY_BRIDGE_HOST,
  DESK_DISPLAY_BRIDGE_PORT: process.env.DESK_DISPLAY_BRIDGE_PORT,
  DESK_DISPLAY_BRIDGE_TOKEN: process.env.DESK_DISPLAY_BRIDGE_TOKEN,
  DESK_DISPLAY_BRIDGE_TOKEN_FILE:
    process.env.DESK_DISPLAY_BRIDGE_TOKEN_FILE,
});

if (Option.isNone(environment)) {
  throw new Error("Agent usage bridge configuration is invalid");
}

const host = environment.value.DESK_DISPLAY_BRIDGE_HOST ?? "0.0.0.0";
const port =
  environment.value.DESK_DISPLAY_BRIDGE_PORT ??
  AGENT_USAGE_BRIDGE_DEFAULT_PORT;
const bearerToken =
  environment.value.DESK_DISPLAY_BRIDGE_TOKEN ??
  (environment.value.DESK_DISPLAY_BRIDGE_TOKEN_FILE
    ? readFileSync(
        environment.value.DESK_DISPLAY_BRIDGE_TOKEN_FILE,
        "utf8",
      ).trim()
    : "");

if (!bearerToken) {
  throw new Error(
    "DESK_DISPLAY_BRIDGE_TOKEN or DESK_DISPLAY_BRIDGE_TOKEN_FILE must be configured",
  );
}
let cache: { expiresAt: number; response: AgentUsageBridgeResponse } | null =
  null;
let inFlight: Promise<AgentUsageBridgeResponse> | null = null;
const lastGoodProvider = new Map<"claude" | "codex", AgentProviderUsage>();

function unavailableProvider(provider: "claude" | "codex"): AgentProviderUsage {
  return {
    available: false,
    dailyTokens: [],
    error: `${provider === "codex" ? "Codex" : "Claude"} usage is unavailable`,
    modelTokens: [],
    stale: false,
    updatedAt: new Date().toISOString(),
    windows: [],
  };
}

function recoverProvider(provider: "claude" | "codex") {
  return (error: { readonly message: string }) =>
    Effect.sync(() => {
      console.error(`${provider} usage unavailable: ${error.message}`);
      const previous = lastGoodProvider.get(provider);
      return previous
        ? { ...previous, error: error.message, stale: true }
        : unavailableProvider(provider);
    });
}

const readUsage = Effect.fn("AgentUsageBridge.readUsage")(function*() {
  const [codex, claude] = yield* Effect.all(
    [
      readCodexAgentUsage().pipe(
        Effect.catch(recoverProvider("codex")),
      ),
      readClaudeAgentUsage().pipe(
        Effect.catch(recoverProvider("claude")),
      ),
    ],
    { concurrency: "unbounded" },
  );

  if (codex.available && !codex.stale) lastGoodProvider.set("codex", codex);
  if (claude.available && !claude.stale) {
    lastGoodProvider.set("claude", claude);
  }

  return {
    claude,
    codex,
    updatedAt: new Date().toISOString(),
  } satisfies AgentUsageBridgeResponse;
});

async function getUsage() {
  if (cache && Date.now() < cache.expiresAt) return cache.response;
  if (inFlight) return inFlight;

  inFlight = agentUsageBridgeRuntime.runPromise(readUsage()).then((response) => {
    cache = {
      expiresAt: Date.now() + AGENT_USAGE_BRIDGE_CACHE_TTL_MS,
      response,
    };
    return response;
  });

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
) {
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/healthz") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method !== "GET" || request.url !== "/v1/usage") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  if (request.headers.authorization !== `Bearer ${bearerToken}`) {
    sendJson(response, 401, { error: "Unauthorized" });
    return;
  }

  try {
    sendJson(response, 200, await getUsage());
  } catch {
    sendJson(response, 503, { error: "Usage bridge unavailable" });
  }
});

server.listen(port, host, () => {
  console.log(`Desk Display agent usage bridge listening on ${host}:${port}`);
});

const stopServer = () => server.close();
process.once("SIGINT", stopServer);
process.once("SIGTERM", stopServer);
