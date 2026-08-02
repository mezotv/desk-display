import { Schema } from "effect";

import {
  MAX_TIMER_DURATION_MS,
} from "@/constants/productivity";

const millisecondsSchema = Schema.Number.check(Schema.isFinite()).check(
  Schema.isGreaterThanOrEqualTo(0),
).check(Schema.isLessThanOrEqualTo(MAX_TIMER_DURATION_MS));

const timestampSchema = Schema.NullOr(
  Schema.String.check(
    Schema.isPattern(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
    ),
  ),
);

const timerSchema = Schema.Struct({
  durationMs: millisecondsSchema,
  endsAt: timestampSchema,
  remainingMs: millisecondsSchema,
  running: Schema.Boolean,
});

const stopwatchSchema = Schema.Struct({
  elapsedMs: Schema.Number.check(Schema.isFinite()).check(
    Schema.isGreaterThanOrEqualTo(0),
  ),
  running: Schema.Boolean,
  startedAt: timestampSchema,
});

export const productivityStateSchema = Schema.Struct({
  stopwatch: stopwatchSchema,
  timer: timerSchema,
});

export const decodeProductivityState = Schema.decodeUnknownOption(
  productivityStateSchema,
);
