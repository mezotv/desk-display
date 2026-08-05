import "@tanstack/react-start/server-only";

import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";

import { Option, Schema } from "effect";

import { AGENT_USAGE_DAY_COUNT } from "@/constants/agent-usage";
import {
  codexSessionTokenUsageSchema,
  codexSessionTurnContextSchema,
} from "@/schemas/agent-usage";
import type {
  AgentModelTokenUsage,
  AgentTokenBreakdown,
} from "@/types/agent-usage";
import {
  addAgentModelTokenUsage,
  toAgentModelTokenUsage,
} from "@/utils/add-agent-model-token-usage";
import {
  getAgentUsageDateKey,
  getAgentUsageDateKeys,
} from "@/utils/get-agent-usage-date-keys";

async function findRecentCodexSessionFiles(
  directory: string,
  cutoffTimestamp: number,
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    () => [],
  );
  const files = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return findRecentCodexSessionFiles(path, cutoffTimestamp);
      }
      if (!entry.isFile() || !entry.name.endsWith(".jsonl")) return [];

      const metadata = await stat(path).catch(() => null);
      return metadata && metadata.mtimeMs >= cutoffTimestamp ? [path] : [];
    }),
  );
  return files.flat();
}

function normalizeCodexTokenUsage(usage: {
  readonly cache_write_input_tokens?: number | undefined;
  readonly cached_input_tokens?: number | undefined;
  readonly input_tokens?: number | undefined;
  readonly output_tokens?: number | undefined;
}): AgentTokenBreakdown {
  const cacheReadTokens = Math.max(0, usage.cached_input_tokens ?? 0);
  const cacheWriteTokens = Math.max(
    0,
    usage.cache_write_input_tokens ?? 0,
  );
  const recordedInputTokens = Math.max(0, usage.input_tokens ?? 0);

  return {
    cacheReadTokens,
    cacheWriteLongTokens: 0,
    cacheWriteTokens,
    inputTokens: Math.max(
      0,
      recordedInputTokens - cacheReadTokens - cacheWriteTokens,
    ),
    outputTokens: Math.max(0, usage.output_tokens ?? 0),
  };
}

export async function readCodexModelTokens(): Promise<AgentModelTokenUsage[]> {
  const cutoffTimestamp =
    Date.now() - (AGENT_USAGE_DAY_COUNT + 1) * 24 * 60 * 60_000;
  const files = await findRecentCodexSessionFiles(
    join(homedir(), ".codex", "sessions"),
    cutoffTimestamp,
  );
  const totals = new Map<string, AgentTokenBreakdown>();
  const includedDates = new Set(getAgentUsageDateKeys());

  for (const file of files) {
    const lines = createInterface({
      crlfDelay: Number.POSITIVE_INFINITY,
      input: createReadStream(file, { encoding: "utf8" }),
    });
    let activeModel = "unknown-codex-model";

    for await (const line of lines) {
      let payload: unknown;
      try {
        payload = JSON.parse(line) as unknown;
      } catch {
        continue;
      }

      const turnContext = Schema.decodeUnknownOption(
        codexSessionTurnContextSchema,
      )(payload);
      if (Option.isSome(turnContext)) {
        activeModel = turnContext.value.payload.model;
        continue;
      }

      const tokenEvent = Schema.decodeUnknownOption(
        codexSessionTokenUsageSchema,
      )(payload);
      if (Option.isNone(tokenEvent)) continue;
      const dateKey = getAgentUsageDateKey(tokenEvent.value.timestamp);
      if (!dateKey || !includedDates.has(dateKey)) continue;

      addAgentModelTokenUsage(
        totals,
        activeModel,
        normalizeCodexTokenUsage(
          tokenEvent.value.payload.info.last_token_usage,
        ),
      );
    }
  }

  return toAgentModelTokenUsage(totals);
}
