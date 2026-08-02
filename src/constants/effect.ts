import { Schedule } from "effect";

export const EXTERNAL_API_RETRY_SCHEDULE = Schedule.exponential(
  "200 millis",
).pipe(Schedule.jittered);

export const EXTERNAL_API_RETRY_COUNT = 2;
export const EXTERNAL_API_TIMEOUT = "8 seconds";
export const OAUTH_API_TIMEOUT = "10 seconds";
