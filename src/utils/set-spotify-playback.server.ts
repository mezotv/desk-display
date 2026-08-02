import "@tanstack/react-start/server-only";

import { Effect, Option } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import { SPOTIFY_API_URL } from "@/constants/spotify";
import { decodeSpotifyEnvironment } from "@/schemas/environment";
import { ConfigurationError } from "@/schemas/service-error";
import { serverRuntime } from "@/runtime/server-runtime";
import { executeExternalRequest } from "@/utils/request-external-api.server";
import {
  getRuntimeSpotifyRefreshToken,
  getSpotifyAccessToken,
} from "@/utils/spotify-access-token.server";

const setSpotifyPlayingEffect = Effect.fn("Spotify.setPlaying")(
  function*(shouldPlay: boolean) {
    const environment = decodeSpotifyEnvironment({
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REFRESH_TOKEN:
        getRuntimeSpotifyRefreshToken() ?? process.env.SPOTIFY_REFRESH_TOKEN,
    });

    if (Option.isNone(environment)) {
      return yield* new ConfigurationError({
        integration: "Spotify",
        message: "Spotify credentials are not configured",
      });
    }

    const accessToken = yield* getSpotifyAccessToken(
      environment.value.SPOTIFY_CLIENT_ID,
      environment.value.SPOTIFY_CLIENT_SECRET,
      environment.value.SPOTIFY_REFRESH_TOKEN,
    );
    const action = shouldPlay ? "play" : "pause";
    const request = HttpClientRequest.put(
      `${SPOTIFY_API_URL}/me/player/${action}`,
    ).pipe(
      HttpClientRequest.setHeader("authorization", `Bearer ${accessToken}`),
    );

    yield* executeExternalRequest(
      "Spotify",
      `${action} playback`,
      request,
    );

    return { isPlaying: shouldPlay };
  },
);

export function setSpotifyPlaying(shouldPlay: boolean) {
  return serverRuntime.runPromise(setSpotifyPlayingEffect(shouldPlay));
}
