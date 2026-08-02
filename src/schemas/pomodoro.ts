import { Schema } from "effect";

import {
  MAX_POMODORO_PLAN_MS,
  MIN_POMODORO_PLAN_MS,
  POMODORO_MODE_IDS,
} from "@/constants/pomodoro";

const elapsedMillisecondsSchema = Schema.Number.check(
  Schema.isFinite(),
).check(Schema.isGreaterThanOrEqualTo(0));

const planMillisecondsSchema = Schema.Number.check(Schema.isFinite())
  .check(Schema.isGreaterThanOrEqualTo(MIN_POMODORO_PLAN_MS))
  .check(Schema.isLessThanOrEqualTo(MAX_POMODORO_PLAN_MS));

const timestampSchema = Schema.NullOr(
  Schema.String.check(
    Schema.isPattern(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
    ),
  ),
);

export const pomodoroStateSchema = Schema.Struct({
  elapsedMs: elapsedMillisecondsSchema,
  mode: Schema.Literals(POMODORO_MODE_IDS),
  planDurationMs: planMillisecondsSchema,
  running: Schema.Boolean,
  startedAt: timestampSchema,
});

export const decodePomodoroState = Schema.decodeUnknownOption(
  pomodoroStateSchema,
);
