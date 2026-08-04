import { Schema } from "effect";

const optionalNonEmptyString = Schema.optional(Schema.NonEmptyString);

export const stripeEnvironmentSchema = Schema.Struct({
  DISPLAY_CURRENCY: Schema.optional(
    Schema.String.check(Schema.isMinLength(3), Schema.isMaxLength(3)),
  ),
  STRIPE_SECRET_KEY: Schema.NonEmptyString,
});

export const displayEnvironmentSchema = Schema.Struct({
  DISPLAY_LANGUAGE: Schema.optional(Schema.Literals(["de", "en"])),
  DISPLAY_NAME: Schema.optional(
    Schema.String.check(Schema.isMaxLength(18)),
  ),
});

export const weatherEnvironmentSchema = Schema.Struct({
  WEATHER_LATITUDE: Schema.optional(
    Schema.NumberFromString.check(
      Schema.isGreaterThanOrEqualTo(-90),
      Schema.isLessThanOrEqualTo(90),
    ),
  ),
  WEATHER_LOCATION_LABEL: optionalNonEmptyString,
  WEATHER_LONGITUDE: Schema.optional(
    Schema.NumberFromString.check(
      Schema.isGreaterThanOrEqualTo(-180),
      Schema.isLessThanOrEqualTo(180),
    ),
  ),
});

export const spotifyClientEnvironmentSchema = Schema.Struct({
  SPOTIFY_CLIENT_ID: Schema.NonEmptyString,
  SPOTIFY_CLIENT_SECRET: Schema.NonEmptyString,
});

export const spotifyEnvironmentSchema = Schema.Struct({
  ...spotifyClientEnvironmentSchema.fields,
  SPOTIFY_REFRESH_TOKEN: Schema.NonEmptyString,
});

export const googleCalendarClientEnvironmentSchema = Schema.Struct({
  GOOGLE_CALENDAR_CLIENT_ID: Schema.NonEmptyString,
  GOOGLE_CALENDAR_CLIENT_SECRET: Schema.NonEmptyString,
});

export const googleCalendarEnvironmentSchema = Schema.Struct({
  ...googleCalendarClientEnvironmentSchema.fields,
  GOOGLE_CALENDAR_REFRESH_TOKEN: Schema.NonEmptyString,
});

export const twitterEnvironmentSchema = Schema.Struct({
  X_BEARER_TOKEN: Schema.NonEmptyString,
  X_USERNAME: Schema.String.check(
    Schema.isPattern(/^[A-Za-z0-9_]{1,15}$/),
  ),
});

export const agentUsageEnvironmentSchema = Schema.Struct({
  AGENT_USAGE_BRIDGE_TOKEN: Schema.NonEmptyString,
  AGENT_USAGE_BRIDGE_URL: Schema.NonEmptyString,
});

export const agentUsageBridgeEnvironmentSchema = Schema.Struct({
  DESK_DISPLAY_BRIDGE_HOST: Schema.optional(Schema.NonEmptyString),
  DESK_DISPLAY_BRIDGE_PORT: Schema.optional(
    Schema.NumberFromString.check(
      Schema.isGreaterThanOrEqualTo(1),
      Schema.isLessThanOrEqualTo(65_535),
    ),
  ),
  DESK_DISPLAY_BRIDGE_TOKEN: Schema.optional(Schema.NonEmptyString),
  DESK_DISPLAY_BRIDGE_TOKEN_FILE: Schema.optional(Schema.NonEmptyString),
});

export const decodeDisplayEnvironment = Schema.decodeUnknownOption(
  displayEnvironmentSchema,
);
export const decodeAgentUsageBridgeEnvironment = Schema.decodeUnknownOption(
  agentUsageBridgeEnvironmentSchema,
);
export const decodeAgentUsageEnvironment = Schema.decodeUnknownOption(
  agentUsageEnvironmentSchema,
);
export const decodeGoogleCalendarClientEnvironment = Schema.decodeUnknownOption(
  googleCalendarClientEnvironmentSchema,
);
export const decodeGoogleCalendarEnvironment = Schema.decodeUnknownOption(
  googleCalendarEnvironmentSchema,
);
export const decodeSpotifyClientEnvironment = Schema.decodeUnknownOption(
  spotifyClientEnvironmentSchema,
);
export const decodeSpotifyEnvironment = Schema.decodeUnknownOption(
  spotifyEnvironmentSchema,
);
export const decodeStripeEnvironment = Schema.decodeUnknownOption(
  stripeEnvironmentSchema,
);
export const decodeTwitterEnvironment = Schema.decodeUnknownOption(
  twitterEnvironmentSchema,
);
export const decodeWeatherEnvironment = Schema.decodeUnknownOption(
  weatherEnvironmentSchema,
);
