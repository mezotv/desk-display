import { Schema } from "effect";

import {
  SEMANTIC_VERSION_PATTERN,
  SHA_256_PATTERN,
} from "@/constants/update";

export const semanticVersionSchema = Schema.String.check(
  Schema.isPattern(SEMANTIC_VERSION_PATTERN),
);

export class DeskDisplayReleaseManifest extends Schema.Class<DeskDisplayReleaseManifest>(
  "DeskDisplayReleaseManifest",
)({
  sha256: Schema.String.check(Schema.isPattern(SHA_256_PATTERN)),
  version: semanticVersionSchema,
}) {}

export class DeskDisplayUpdateError extends Schema.TaggedErrorClass<DeskDisplayUpdateError>()(
  "DeskDisplayUpdateError",
  {
    cause: Schema.Defect(),
    message: Schema.String,
    operation: Schema.String,
  },
) {}

export const deskDisplayPackageSchema = Schema.Struct({
  name: Schema.Literals(["desk-display"]),
});

export const updateVersionResponseSchema = Schema.Struct({
  version: semanticVersionSchema,
});

export const updateInstallResultSchema = Schema.Struct({
  currentVersion: semanticVersionSchema,
  error: Schema.NullOr(Schema.String),
  latestVersion: Schema.NullOr(semanticVersionSchema),
  restartRequired: Schema.Boolean,
  status: Schema.Literals(["failed", "installed", "up-to-date"]),
});
