import "@tanstack/react-start/server-only";

import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

import { Clock, Effect, Option, Schema } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import { OAUTH_API_TIMEOUT } from "@/constants/effect";
import {
  SPOTIFY_ACCOUNTS_URL,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_SCOPE,
} from "@/constants/spotify";
import { decodeSpotifyClientEnvironment } from "@/schemas/environment";
import { oauthTokenResponseSchema } from "@/schemas/external-api";
import {
  ConfigurationError,
  ExternalServiceError,
} from "@/schemas/service-error";
import { serverRuntime } from "@/runtime/server-runtime";
import { persistEnvironmentValue } from "@/utils/persist-environment-value.server";
import { requestExternalJson } from "@/utils/request-external-api.server";
import { setSpotifyRefreshToken } from "@/utils/spotify-access-token.server";

const pendingStates = new Map<string, number>();
const STATE_LIFETIME_MS = 10 * 60_000;

function getClientEnvironment() {
  return decodeSpotifyClientEnvironment({
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  });
}

export function createSpotifyAuthorizationUrl() {
  const environment = getClientEnvironment();

  if (Option.isNone(environment)) return null;

  const now = Date.now();
  for (const [state, expiresAt] of pendingStates) {
    if (expiresAt <= now) pendingStates.delete(state);
  }

  const state = randomBytes(24).toString("hex");
  pendingStates.set(state, now + STATE_LIFETIME_MS);
  const url = new URL(`${SPOTIFY_ACCOUNTS_URL}/authorize`);
  url.searchParams.set("client_id", environment.value.SPOTIFY_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", SPOTIFY_REDIRECT_URI);
  url.searchParams.set("scope", SPOTIFY_SCOPE);
  url.searchParams.set("state", state);

  return url;
}

const completeSpotifyAuthorizationEffect = Effect.fn(
  "Spotify.completeAuthorization",
)(function*(code: string, state: string) {
  const expiresAt = pendingStates.get(state);
  pendingStates.delete(state);

  if (!expiresAt || expiresAt <= (yield* Clock.currentTimeMillis)) {
    return yield* new ConfigurationError({
      integration: "Spotify",
      message: "The Spotify connection request expired. Try again.",
    });
  }

  const environment = getClientEnvironment();
  if (Option.isNone(environment)) {
    return yield* new ConfigurationError({
      integration: "Spotify",
      message: "Spotify client credentials are not configured.",
    });
  }

  const credentials = Buffer.from(
    `${environment.value.SPOTIFY_CLIENT_ID}:${environment.value.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");
  const request = HttpClientRequest.post(
    `${SPOTIFY_ACCOUNTS_URL}/api/token`,
  ).pipe(
    HttpClientRequest.bodyUrlParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
    HttpClientRequest.setHeader("authorization", `Basic ${credentials}`),
  );
  const payload = yield* requestExternalJson(
    "Spotify",
    "complete authorization",
    request,
    OAUTH_API_TIMEOUT,
  ).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(oauthTokenResponseSchema)),
    Effect.mapError((cause) =>
      cause instanceof ExternalServiceError
        ? cause
        : new ExternalServiceError({
            cause,
            message: "Spotify returned an invalid authorization response",
            operation: "decode authorization response",
            service: "Spotify",
          }),
    ),
  );

  const refreshToken = payload.refresh_token;

  if (!refreshToken || /[\r\n]/.test(refreshToken)) {
    return yield* new ExternalServiceError({
      cause: new Error("Missing or invalid refresh_token"),
      message: "Spotify did not return a usable refresh token.",
      operation: "complete authorization",
      service: "Spotify",
    });
  }

  const environmentFile =
    process.env.SPOTIFY_ENV_FILE ?? resolve(process.cwd(), ".env");
  yield* persistEnvironmentValue(
    environmentFile,
    "SPOTIFY_REFRESH_TOKEN",
    refreshToken,
    "spotify",
  );
  yield* Effect.sync(() => setSpotifyRefreshToken(refreshToken));
});

export function completeSpotifyAuthorization(code: string, state: string) {
  return serverRuntime.runPromise(completeSpotifyAuthorizationEffect(code, state));
}
