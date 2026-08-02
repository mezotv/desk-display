import "@tanstack/react-start/server-only";

import { Clock, Effect, Schema } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import { GOOGLE_TOKEN_URL } from "@/constants/calendar";
import { oauthTokenResponseSchema } from "@/schemas/external-api";
import { ExternalServiceError } from "@/schemas/service-error";
import { requestExternalJson } from "@/utils/request-external-api.server";

let cachedAccessToken: string | null = null;
let accessTokenExpiresAt = 0;
let runtimeRefreshToken: string | null = null;

export function getRuntimeGoogleCalendarRefreshToken() {
  return runtimeRefreshToken;
}

export function setGoogleCalendarRefreshToken(refreshToken: string) {
  runtimeRefreshToken = refreshToken;
  cachedAccessToken = null;
  accessTokenExpiresAt = 0;
}

export const getGoogleCalendarAccessToken = Effect.fn(
  "GoogleCalendar.getAccessToken",
)(function*(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
) {
  const now = yield* Clock.currentTimeMillis;

  if (cachedAccessToken && now < accessTokenExpiresAt) {
    return cachedAccessToken;
  }

  const request = HttpClientRequest.post(GOOGLE_TOKEN_URL).pipe(
    HttpClientRequest.bodyUrlParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );
  const payload = yield* requestExternalJson(
    "Google Calendar",
    "refresh access token",
    request,
  ).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(oauthTokenResponseSchema)),
    Effect.mapError((cause) =>
      cause instanceof ExternalServiceError
        ? cause
        : new ExternalServiceError({
            cause,
            message: "Google returned an invalid access token response",
            operation: "decode access token",
            service: "Google Calendar",
          }),
    ),
  );

  if (!payload.access_token) {
    return yield* new ExternalServiceError({
      cause: new Error("Missing access_token"),
      message: "Google authorization returned no access token",
      operation: "refresh access token",
      service: "Google Calendar",
    });
  }

  cachedAccessToken = payload.access_token;
  accessTokenExpiresAt =
    now + Math.max(30, (payload.expires_in ?? 3600) - 60) * 1_000;
  return payload.access_token;
});
