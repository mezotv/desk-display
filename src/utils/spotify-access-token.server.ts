import "@tanstack/react-start/server-only";

import { Clock, Effect, Schema } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import { SPOTIFY_ACCOUNTS_URL } from "@/constants/spotify";
import { oauthTokenResponseSchema } from "@/schemas/external-api";
import { ExternalServiceError } from "@/schemas/service-error";
import { requestExternalJson } from "@/utils/request-external-api.server";

let cachedAccessToken: string | null = null;
let accessTokenExpiresAt = 0;
let runtimeRefreshToken: string | null = null;

export function getRuntimeSpotifyRefreshToken() {
  return runtimeRefreshToken;
}

export function setSpotifyRefreshToken(refreshToken: string) {
  runtimeRefreshToken = refreshToken;
  cachedAccessToken = null;
  accessTokenExpiresAt = 0;
}

export const getSpotifyAccessToken = Effect.fn("Spotify.getAccessToken")(
  function*(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
) {
  const now = yield* Clock.currentTimeMillis;

  if (cachedAccessToken && now < accessTokenExpiresAt) {
    return cachedAccessToken;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );
  const request = HttpClientRequest.post(
    `${SPOTIFY_ACCOUNTS_URL}/api/token`,
  ).pipe(
    HttpClientRequest.bodyUrlParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    HttpClientRequest.setHeader("authorization", `Basic ${credentials}`),
  );
  const payload = yield* requestExternalJson(
    "Spotify",
    "refresh access token",
    request,
  ).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(oauthTokenResponseSchema)),
    Effect.mapError((cause) =>
      cause instanceof ExternalServiceError
        ? cause
        : new ExternalServiceError({
            cause,
            message: "Spotify returned an invalid access token response",
            operation: "decode access token",
            service: "Spotify",
          }),
    ),
  );

  if (!payload.access_token) {
    return yield* new ExternalServiceError({
      cause: new Error("Missing access_token"),
      message: "Spotify authorization returned no access token",
      operation: "refresh access token",
      service: "Spotify",
    });
  }

  cachedAccessToken = payload.access_token;
  accessTokenExpiresAt =
    now + Math.max(30, (payload.expires_in ?? 3600) - 60) * 1_000;
  return payload.access_token;
},
);
