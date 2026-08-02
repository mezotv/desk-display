import { createServerFn } from "@tanstack/react-start";

import { getTwitterSnapshot } from "@/utils/get-twitter.server";

export const getTwitter = createServerFn({ method: "GET" }).handler(() =>
  getTwitterSnapshot(),
);
