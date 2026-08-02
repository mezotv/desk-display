import { Schema } from "effect";

export const spotifyPlaybackCommandSchema = Schema.Struct({
  shouldPlay: Schema.Boolean,
});

export const decodeSpotifyPlaybackCommand = Schema.decodeUnknownSync(
  spotifyPlaybackCommandSchema,
);
