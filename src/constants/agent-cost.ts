import type { DisplayLanguage } from "@/types/settings";

export type AgentModelPrice = {
  cacheRead: number;
  cacheWrite: number;
  cacheWriteLong: number;
  input: number;
  modelPattern: RegExp;
  output: number;
};

// USD per one million tokens. Last reviewed 2026-08-05 against the official
// OpenAI and Anthropic pricing pages linked in the project README.
export const AGENT_MODEL_PRICES: readonly AgentModelPrice[] = [
  {
    cacheRead: 0.5,
    cacheWrite: 6.25,
    cacheWriteLong: 6.25,
    input: 5,
    modelPattern: /^gpt-5\.6-sol(?:-|$)/i,
    output: 30,
  },
  {
    cacheRead: 0.25,
    cacheWrite: 3.125,
    cacheWriteLong: 3.125,
    input: 2.5,
    modelPattern: /^gpt-5\.6-terra(?:-|$)/i,
    output: 15,
  },
  {
    cacheRead: 0.1,
    cacheWrite: 1.25,
    cacheWriteLong: 1.25,
    input: 1,
    modelPattern: /^gpt-5\.6-luna(?:-|$)/i,
    output: 6,
  },
  {
    cacheRead: 0.25,
    cacheWrite: 2.5,
    cacheWriteLong: 2.5,
    input: 2.5,
    modelPattern: /^gpt-5\.4(?:-|$)/i,
    output: 15,
  },
  {
    cacheRead: 0.175,
    cacheWrite: 1.75,
    cacheWriteLong: 1.75,
    input: 1.75,
    modelPattern: /^gpt-5\.2(?:-|$)/i,
    output: 14,
  },
  {
    cacheRead: 0.125,
    cacheWrite: 1.25,
    cacheWriteLong: 1.25,
    input: 1.25,
    modelPattern: /^gpt-5(?:-|$)/i,
    output: 10,
  },
  {
    cacheRead: 1,
    cacheWrite: 12.5,
    cacheWriteLong: 20,
    input: 10,
    modelPattern: /^claude-(?:fable|mythos)-5(?:-|$)/i,
    output: 50,
  },
  {
    cacheRead: 0.5,
    cacheWrite: 6.25,
    cacheWriteLong: 10,
    input: 5,
    modelPattern: /^claude-opus-(?:5|4[.-][5-8])(?:-|$)/i,
    output: 25,
  },
  {
    cacheRead: 0.3,
    cacheWrite: 3.75,
    cacheWriteLong: 6,
    input: 3,
    modelPattern: /^claude-sonnet-(?:5|4[.-]6)(?:-|$)/i,
    output: 15,
  },
  {
    cacheRead: 0.1,
    cacheWrite: 1.25,
    cacheWriteLong: 2,
    input: 1,
    modelPattern: /^claude-haiku-4[.-]5(?:-|$)/i,
    output: 5,
  },
];

export const AGENT_COST_COPY = {
  de: {
    apiEquivalent: "API-GEGENWERT · LETZTE 7 TAGE",
    cacheRead: "CACHE READ",
    cacheWrite: "CACHE WRITE",
    claude: "CLAUDE",
    codex: "CODEX",
    input: "INPUT",
    models: "KOSTEN NACH MODELL",
    noData: "NOCH KEINE LOKALEN TOKEN-DATEN",
    notBill: "SCHÄTZUNG · NICHT DEINE ABO-RECHNUNG",
    output: "OUTPUT",
    partiallyPriced: "UNBEKANNTE MODELLE NICHT EINGERECHNET",
    providers: "KOSTEN NACH ANBIETER",
    title: "AI COST",
    tokens: "TOKEN-AUFTEILUNG",
    totalTokens: "TOKEN GESAMT",
  },
  en: {
    apiEquivalent: "API EQUIVALENT · LAST 7 DAYS",
    cacheRead: "CACHE READ",
    cacheWrite: "CACHE WRITE",
    claude: "CLAUDE",
    codex: "CODEX",
    input: "INPUT",
    models: "COST BY MODEL",
    noData: "NO LOCAL TOKEN DATA YET",
    notBill: "ESTIMATE · NOT YOUR SUBSCRIPTION BILL",
    output: "OUTPUT",
    partiallyPriced: "UNKNOWN MODELS EXCLUDED FROM COST",
    providers: "COST BY PROVIDER",
    title: "AI COST",
    tokens: "TOKEN BREAKDOWN",
    totalTokens: "TOTAL TOKENS",
  },
} satisfies Record<DisplayLanguage, Record<string, string>>;

export const AGENT_COST_SLIDE_COUNT = 4;
