import { Schema } from "effect";

export class ConfigurationError extends Schema.TaggedErrorClass<ConfigurationError>()(
  "ConfigurationError",
  {
    integration: Schema.String,
    message: Schema.String,
  },
) {}

export class ExternalServiceError extends Schema.TaggedErrorClass<ExternalServiceError>()(
  "ExternalServiceError",
  {
    cause: Schema.Defect(),
    message: Schema.String,
    operation: Schema.String,
    service: Schema.String,
  },
) {}

export class PersistenceError extends Schema.TaggedErrorClass<PersistenceError>()(
  "PersistenceError",
  {
    cause: Schema.Defect(),
    message: Schema.String,
    path: Schema.String,
  },
) {}

export class StripeServiceError extends Schema.TaggedErrorClass<StripeServiceError>()(
  "StripeServiceError",
  {
    cause: Schema.Defect(),
    message: Schema.String,
  },
) {}
