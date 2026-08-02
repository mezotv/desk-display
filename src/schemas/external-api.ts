import { Schema } from "effect";

const spotifyImageSchema = Schema.Struct({ url: Schema.String });
const spotifyArtistSchema = Schema.Struct({ name: Schema.String });

export const openMeteoResponseSchema = Schema.Struct({
  current: Schema.optionalKey(
    Schema.Struct({
      is_day: Schema.optionalKey(Schema.Number),
      temperature_2m: Schema.optionalKey(Schema.Number),
      weather_code: Schema.optionalKey(Schema.Number),
    }),
  ),
});

export const spotifyCurrentlyPlayingSchema = Schema.Struct({
  is_playing: Schema.optionalKey(Schema.Boolean),
  progress_ms: Schema.optionalKey(Schema.Number),
  item: Schema.optionalKey(
    Schema.NullOr(
      Schema.Struct({
        album: Schema.optionalKey(
          Schema.Struct({
            images: Schema.optionalKey(Schema.Array(spotifyImageSchema)),
          }),
        ),
        artists: Schema.optionalKey(Schema.Array(spotifyArtistSchema)),
        duration_ms: Schema.optionalKey(Schema.Number),
        name: Schema.optionalKey(Schema.String),
      }),
    ),
  ),
});

export const oauthTokenResponseSchema = Schema.Struct({
  access_token: Schema.optionalKey(Schema.String),
  expires_in: Schema.optionalKey(Schema.Number),
  refresh_token: Schema.optionalKey(Schema.String),
});

const calendarEventSchema = Schema.Struct({
  attendees: Schema.optionalKey(
    Schema.Array(
      Schema.Struct({
        responseStatus: Schema.optionalKey(Schema.String),
        self: Schema.optionalKey(Schema.Boolean),
      }),
    ),
  ),
  end: Schema.optionalKey(
    Schema.Struct({
      date: Schema.optionalKey(Schema.String),
      dateTime: Schema.optionalKey(Schema.String),
    }),
  ),
  hangoutLink: Schema.optionalKey(Schema.String),
  id: Schema.optionalKey(Schema.String),
  location: Schema.optionalKey(Schema.String),
  start: Schema.optionalKey(
    Schema.Struct({
      date: Schema.optionalKey(Schema.String),
      dateTime: Schema.optionalKey(Schema.String),
    }),
  ),
  status: Schema.optionalKey(Schema.String),
  summary: Schema.optionalKey(Schema.String),
});

export const googleCalendarResponseSchema = Schema.Struct({
  items: Schema.optionalKey(Schema.Array(calendarEventSchema)),
});
