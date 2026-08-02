import { Schema } from "effect";

import { DISPLAY_POWER_METHODS } from "@/constants/display-power";

export class DisplayPowerCommand extends Schema.Class<DisplayPowerCommand>(
  "DisplayPowerCommand",
)({
  enabled: Schema.Boolean,
  preferredMethod: Schema.NullOr(Schema.Literals(DISPLAY_POWER_METHODS)),
}) {}

export class DisplayPowerError extends Schema.TaggedErrorClass<DisplayPowerError>()(
  "DisplayPowerError",
  {
    cause: Schema.Defect(),
    message: Schema.String,
    operation: Schema.String,
  },
) {}

export const decodeDisplayPowerCommand = Schema.decodeUnknownSync(
  DisplayPowerCommand,
);

export const displaySleepStateSchema = Schema.Struct({
  method: Schema.NullOr(Schema.Literals(DISPLAY_POWER_METHODS)),
  sleeping: Schema.Boolean,
});

export const decodeDisplaySleepState = Schema.decodeUnknownOption(
  displaySleepStateSchema,
);
