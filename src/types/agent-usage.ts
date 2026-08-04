import type { DisplayLanguage } from "@/types/settings";

export type AgentUsageProvider = "claude" | "codex";

export type AgentUsageWindow = {
  id: string;
  label: string;
  resetsAt: string | null;
  usedPercent: number;
  windowDurationMinutes: number | null;
};

export type AgentDailyTokenUsage = {
  date: string;
  tokens: number;
};

export type AgentProviderUsage = {
  available: boolean;
  dailyTokens: readonly AgentDailyTokenUsage[];
  error: string | null;
  updatedAt: string;
  windows: readonly AgentUsageWindow[];
};

export type AgentUsageBridgeResponse = {
  claude: AgentProviderUsage;
  codex: AgentProviderUsage;
  updatedAt: string;
};

export type AgentUsageSnapshot = AgentUsageBridgeResponse & {
  configured: boolean;
  online: boolean;
};

export type AgentUsageSlide =
  | {
      id: string;
      kind: "limit";
      provider: AgentUsageProvider;
      window: AgentUsageWindow;
    }
  | {
      dailyTokens: readonly AgentDailyTokenUsage[];
      id: string;
      kind: "chart";
      provider: AgentUsageProvider;
    };

export type AgentUsageAppProps = {
  language: DisplayLanguage;
  now: Date;
  provider: AgentUsageProvider;
  slideIndex: number;
  snapshot: AgentUsageSnapshot;
};

export type AgentUsageChartProps = {
  dailyTokens: readonly AgentDailyTokenUsage[];
  language: DisplayLanguage;
  provider: AgentUsageProvider;
};
