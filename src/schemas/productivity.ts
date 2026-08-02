import { Schema } from "effect";

import {
  MAX_DISPLAY_TASKS,
  MAX_NOTE_LENGTH,
  MAX_TASK_LENGTH,
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

const taskSchema = Schema.Struct({
  completed: Schema.Boolean,
  id: Schema.NonEmptyString,
  title: Schema.NonEmptyString.check(Schema.isMaxLength(MAX_TASK_LENGTH)),
});

export const productivityStateSchema = Schema.Struct({
  note: Schema.String.check(Schema.isMaxLength(MAX_NOTE_LENGTH)),
  stopwatch: stopwatchSchema,
  tasks: Schema.Array(taskSchema).check(Schema.isMaxLength(MAX_DISPLAY_TASKS)),
  timer: timerSchema,
});

export const decodeProductivityState = Schema.decodeUnknownOption(
  productivityStateSchema,
);
