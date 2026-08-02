import { createServerFn } from "@tanstack/react-start";

import { getUpdateStatus } from "@/utils/get-update-status.server";

export const checkForDeskDisplayUpdate = createServerFn({
  method: "GET",
}).handler(() => getUpdateStatus());
