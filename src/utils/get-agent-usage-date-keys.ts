import { AGENT_USAGE_DAY_COUNT } from "@/constants/agent-usage";

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getAgentUsageDateKeys(now = new Date()) {
  return Array.from({ length: AGENT_USAGE_DAY_COUNT }, (_, index) => {
    const date = new Date(now);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (AGENT_USAGE_DAY_COUNT - 1 - index));
    return toLocalDateKey(date);
  });
}

export function getAgentUsageDateKey(timestamp: string) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : toLocalDateKey(date);
}
