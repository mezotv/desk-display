import { Schema } from "effect";

import { MAX_ALARMS } from "@/constants/alarm";

export const alarmSchema = Schema.Struct({
  enabled: Schema.Boolean,
  id: Schema.NonEmptyString,
  scheduledAt: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/),
  ),
});

export const alarmsSchema = Schema.Array(alarmSchema).check(
  Schema.isMaxLength(MAX_ALARMS),
);

export const decodeAlarms = Schema.decodeUnknownOption(alarmsSchema);
