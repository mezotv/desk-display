import { createServerFn } from "@tanstack/react-start";

import { getAgentUsageSnapshot } from "@/utils/get-agent-usage.server";

export const getAgentUsage = createServerFn({ method: "GET" }).handler(() =>
  getAgentUsageSnapshot(),
);
