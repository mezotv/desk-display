import { createServerFn } from "@tanstack/react-start";

import { getGoogleCalendar } from "@/utils/get-google-calendar.server";

export const getCalendar = createServerFn({ method: "GET" }).handler(() =>
  getGoogleCalendar(),
);
