import "@tanstack/react-start/server-only";

import { DateTime, Effect, Option, Schema } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import { SPOTIFY_API_URL } from "@/constants/spotify";
import {
  decodeSpotifyClientEnvironment,
  decodeSpotifyEnvironment,
} from "@/schemas/environment";
import { spotifyCurrentlyPlayingSchema } from "@/schemas/external-api";
import { ExternalServiceError } from "@/schemas/service-error";
import { serverRuntime } from "@/runtime/server-runtime";
import type { SpotifySnapshot } from "@/types/spotify";
import { executeExternalRequest } from "@/utils/request-external-api.server";
import {
  getRuntimeSpotifyRefreshToken,
  getSpotifyAccessToken,
} from "@/utils/spotify-access-token.server";

function emptySnapshot(
  configured: boolean,
  error: string | null = null,
  clientConfigured = configured,
): SpotifySnapshot {
  return {
    albumArtUrl: null,
    artist: null,
    clientConfigured,
    configured,
    durationMs: null,
    error,
    isPlaying: false,
    progressMs: null,
    track: null,
    updatedAt: new Date().toISOString(),
  };
}

const getSpotifyNowPlayingEffect = Effect.fn("Spotify.getNowPlaying")(
  function*() {
    const rawEnvironment = {
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REFRESH_TOKEN:
        getRuntimeSpotifyRefreshToken() ?? process.env.SPOTIFY_REFRESH_TOKEN,
    };
    const clientEnvironment = decodeSpotifyClientEnvironment(rawEnvironment);
    const environment = decodeSpotifyEnvironment(rawEnvironment);

    if (Option.isNone(environment)) {
      return emptySnapshot(false, null, Option.isSome(clientEnvironment));
    }

    const accessToken = yield* getSpotifyAccessToken(
      environment.value.SPOTIFY_CLIENT_ID,
      environment.value.SPOTIFY_CLIENT_SECRET,
      environment.value.SPOTIFY_REFRESH_TOKEN,
    );
    const request = HttpClientRequest.get(
      `${SPOTIFY_API_URL}/me/player/currently-playing`,
    ).pipe(
      HttpClientRequest.setHeader("authorization", `Bearer ${accessToken}`),
      HttpClientRequest.acceptJson,
    );
    const response = yield* executeExternalRequest(
      "Spotify",
      "currently playing",
      request,
    );

    if (response.status === 204) {
      return emptySnapshot(true);
    }

    const payload = yield* response.json.pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(spotifyCurrentlyPlayingSchema)),
      Effect.mapError(
        (cause) =>
          new ExternalServiceError({
            cause,
            message: "Spotify returned invalid playback data",
            operation: "decode currently playing",
            service: "Spotify",
          }),
      ),
    );
    const item = payload.item ?? undefined;

    return {
      albumArtUrl: item?.album?.images?.[0]?.url ?? null,
      artist: item?.artists?.map(({ name }) => name).join(", ") ?? null,
      clientConfigured: true,
      configured: true,
      durationMs: item?.duration_ms ?? null,
      error: null,
      isPlaying: payload.is_playing ?? false,
      progressMs: payload.progress_ms ?? null,
      track: item?.name ?? null,
      updatedAt: DateTime.formatIso(yield* DateTime.now),
    } satisfies SpotifySnapshot;
  },
);

export function getSpotifyNowPlaying(): Promise<SpotifySnapshot> {
  return serverRuntime.runPromise(
    getSpotifyNowPlayingEffect().pipe(
      Effect.tapError(Effect.logError),
      Effect.catch(() =>
        Effect.succeed(emptySnapshot(true, "Unable to update Spotify")),
      ),
    ),
  );
}
