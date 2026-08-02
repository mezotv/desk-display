import { createServerFn } from "@tanstack/react-start";

import { getSystemSnapshot } from "@/utils/get-system-snapshot.server";

export const getSystem = createServerFn({ method: "GET" }).handler(() =>
  getSystemSnapshot(),
);
