import "@tanstack/react-start/server-only";

import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";

import { Effect, Option, Schema } from "effect";

import {
  AGENT_USAGE_COMMAND_TIMEOUT_MS,
  AGENT_USAGE_DAY_COUNT,
} from "@/constants/agent-usage";
import {
  AgentUsageBridgeError,
  claudeSessionUsageSchema,
  claudeUsageCommandResponseSchema,
} from "@/schemas/agent-usage";
import type {
  AgentDailyTokenUsage,
  AgentModelTokenUsage,
  AgentProviderUsage,
  AgentTokenBreakdown,
  AgentUsageWindow,
} from "@/types/agent-usage";
import {
  addAgentModelTokenUsage,
  toAgentModelTokenUsage,
} from "@/utils/add-agent-model-token-usage";
import {
  getAgentUsageDateKey,
  getAgentUsageDateKeys,
} from "@/utils/get-agent-usage-date-keys";

function runClaudeUsageCommand(): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "claude",
      [
        "-p",
        "/usage",
        "--output-format",
        "json",
        "--tools",
        "",
        "--no-session-persistence",
        "--max-budget-usd",
        "0.000001",
      ],
      { env: process.env, stdio: ["ignore", "pipe", "ignore"] },
    );
    let output = "";
    let settled = false;
    const finish = (result?: string, error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      child.kill("SIGTERM");
      if (error) reject(error);
      else resolve(result ?? "");
    };
    const timeout = setTimeout(
      () => finish(undefined, new Error("Claude usage request timed out")),
      AGENT_USAGE_COMMAND_TIMEOUT_MS,
    );

    child.once("error", (cause) => finish(undefined, cause));
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      output += chunk;
    });
    child.once("exit", (code) => {
      if (code === 0) finish(output);
      else finish(undefined, new Error(`Claude usage command failed (${code})`));
    });
  });
}

const MONTHS = new Map(
  [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].map((month, index) => [month, index]),
);

function parseClaudeReset(resetLabel: string, now = new Date()) {
  const match = resetLabel.match(
    /^([A-Za-z]{3})\s+(\d{1,2})\s+at\s+(\d{1,2}):(\d{2})(am|pm)$/i,
  );
  if (!match) return null;

  const month = MONTHS.get(match[1].toLowerCase());
  if (month === undefined) return null;
  const day = Number(match[2]);
  const minute = Number(match[4]);
  const meridiem = match[5].toLowerCase();
  const twelveHour = Number(match[3]) % 12;
  const hour = twelveHour + (meridiem === "pm" ? 12 : 0);
  let reset = new Date(now.getFullYear(), month, day, hour, minute);

  if (reset.getTime() < now.getTime() - 86_400_000) {
    reset = new Date(now.getFullYear() + 1, month, day, hour, minute);
  }

  return Number.isNaN(reset.getTime()) ? null : reset.toISOString();
}

function getClaudeWindowDuration(label: string) {
  if (/session/i.test(label)) return 300;
  if (/week/i.test(label)) return 10_080;
  if (/month/i.test(label)) return 43_200;
  return null;
}

function parseClaudeUsageWindows(result: string): AgentUsageWindow[] {
  return result.split("\n").flatMap((line, index) => {
    const match = line
      .trim()
      .match(
        /^(.+?):\s*(\d+(?:\.\d+)?)% used\s*·\s*resets\s+(.+?)\s+\([^)]+\)$/i,
      );
    if (!match) return [];

    const label = match[1].trim();
    return [
      {
        id: `claude-${index}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        label: label.replace(/^current\s+/i, "").toUpperCase(),
        resetsAt: parseClaudeReset(match[3].trim()),
        usedPercent: Math.min(100, Math.max(0, Number(match[2]))),
        windowDurationMinutes: getClaudeWindowDuration(label),
      },
    ];
  });
}

async function findRecentClaudeSessionFiles(
  directory: string,
  cutoffTimestamp: number,
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    () => [],
  );
  const nestedFiles = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return findRecentClaudeSessionFiles(path, cutoffTimestamp);
      }
      if (!entry.isFile() || !entry.name.endsWith(".jsonl")) return [];

      const metadata = await stat(path).catch(() => null);
      return metadata && metadata.mtimeMs >= cutoffTimestamp ? [path] : [];
    }),
  );
  return nestedFiles.flat();
}

async function readClaudeLocalTokens(): Promise<{
  dailyTokens: AgentDailyTokenUsage[];
  modelTokens: AgentModelTokenUsage[];
}> {
  const dateKeys = getAgentUsageDateKeys();
  const tokenTotals = new Map(dateKeys.map((date) => [date, 0]));
  const modelTotals = new Map<string, AgentTokenBreakdown>();
  const seenMessageIds = new Set<string>();
  const cutoffTimestamp =
    Date.now() - (AGENT_USAGE_DAY_COUNT + 1) * 24 * 60 * 60_000;
  const files = await findRecentClaudeSessionFiles(
    join(homedir(), ".claude", "projects"),
    cutoffTimestamp,
  );

  for (const file of files) {
    const lines = createInterface({
      crlfDelay: Number.POSITIVE_INFINITY,
      input: createReadStream(file, { encoding: "utf8" }),
    });

    for await (const line of lines) {
      let decoded: Option.Option<Schema.Schema.Type<typeof claudeSessionUsageSchema>>;
      try {
        decoded = Schema.decodeUnknownOption(claudeSessionUsageSchema)(
          JSON.parse(line) as unknown,
        );
      } catch {
        continue;
      }
      if (Option.isNone(decoded)) continue;

      const session = decoded.value;
      if (seenMessageIds.has(session.message.id)) continue;
      const dateKey = getAgentUsageDateKey(session.timestamp);
      if (!dateKey || !tokenTotals.has(dateKey)) continue;

      seenMessageIds.add(session.message.id);
      const usage = session.message.usage;
      const cacheWriteLongTokens = Math.max(
        0,
        usage.cache_creation?.ephemeral_1h_input_tokens ?? 0,
      );
      const cacheWriteTokens = Math.max(
        0,
        usage.cache_creation?.ephemeral_5m_input_tokens ??
          Math.max(
            0,
            (usage.cache_creation_input_tokens ?? 0) -
              cacheWriteLongTokens,
          ),
      );
      const tokens =
        (usage.input_tokens ?? 0) +
        (usage.cache_creation_input_tokens ?? 0) +
        (usage.cache_read_input_tokens ?? 0) +
        (usage.output_tokens ?? 0);
      tokenTotals.set(dateKey, (tokenTotals.get(dateKey) ?? 0) + tokens);
      if (session.message.model !== "<synthetic>") {
        addAgentModelTokenUsage(modelTotals, session.message.model, {
          cacheReadTokens: Math.max(
            0,
            usage.cache_read_input_tokens ?? 0,
          ),
          cacheWriteLongTokens,
          cacheWriteTokens,
          inputTokens: Math.max(0, usage.input_tokens ?? 0),
          outputTokens: Math.max(0, usage.output_tokens ?? 0),
        });
      }
    }
  }

  return {
    dailyTokens: dateKeys.map((date) => ({
      date,
      tokens: tokenTotals.get(date) ?? 0,
    })),
    modelTokens: toAgentModelTokenUsage(modelTotals),
  };
}

export const readClaudeAgentUsage = Effect.fn("AgentUsage.readClaude")(
  function*(): Effect.fn.Return<
    AgentProviderUsage,
    AgentUsageBridgeError
  > {
    const [commandOutput, localTokens] = yield* Effect.all(
      [
        Effect.tryPromise({
          try: runClaudeUsageCommand,
          catch: (cause) =>
            new AgentUsageBridgeError({
              cause,
              message: "Unable to read Claude limits",
              provider: "claude",
            }),
        }),
        Effect.tryPromise({
          try: readClaudeLocalTokens,
          catch: (cause) =>
            new AgentUsageBridgeError({
              cause,
              message: "Unable to read local Claude usage",
              provider: "claude",
            }),
        }),
      ],
      { concurrency: "unbounded" },
    );
    const commandResponse = yield* Schema.decodeUnknownEffect(
      claudeUsageCommandResponseSchema,
    )(JSON.parse(commandOutput) as unknown).pipe(
      Effect.mapError(
        (cause) =>
          new AgentUsageBridgeError({
            cause,
            message: "Claude returned invalid usage data",
            provider: "claude",
          }),
      ),
    );

    return {
      available: true,
      dailyTokens: localTokens.dailyTokens,
      error: null,
      modelTokens: localTokens.modelTokens,
      stale: false,
      updatedAt: new Date().toISOString(),
      windows: parseClaudeUsageWindows(commandResponse.result),
    };
  },
);
