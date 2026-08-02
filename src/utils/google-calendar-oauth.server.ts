import "@tanstack/react-start/server-only";

import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

import { Clock, Effect, Option, Schema } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import {
  GOOGLE_AUTHORIZATION_URL,
  GOOGLE_CALENDAR_REDIRECT_URI,
  GOOGLE_CALENDAR_SCOPE,
  GOOGLE_TOKEN_URL,
} from "@/constants/calendar";
import { OAUTH_API_TIMEOUT } from "@/constants/effect";
import { decodeGoogleCalendarClientEnvironment } from "@/schemas/environment";
import { oauthTokenResponseSchema } from "@/schemas/external-api";
import {
  ConfigurationError,
  ExternalServiceError,
} from "@/schemas/service-error";
import { serverRuntime } from "@/runtime/server-runtime";
import { setGoogleCalendarRefreshToken } from "@/utils/google-calendar-access-token.server";
import { persistEnvironmentValue } from "@/utils/persist-environment-value.server";
import { requestExternalJson } from "@/utils/request-external-api.server";

const pendingStates = new Map<string, number>();
const STATE_LIFETIME_MS = 10 * 60_000;

function getClientEnvironment() {
  return decodeGoogleCalendarClientEnvironment({
    GOOGLE_CALENDAR_CLIENT_ID: process.env.GOOGLE_CALENDAR_CLIENT_ID,
    GOOGLE_CALENDAR_CLIENT_SECRET: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  });
}

export function createGoogleCalendarAuthorizationUrl() {
  const environment = getClientEnvironment();
  if (Option.isNone(environment)) return null;

  const now = Date.now();
  for (const [state, expiresAt] of pendingStates) {
    if (expiresAt <= now) pendingStates.delete(state);
  }

  const state = randomBytes(24).toString("hex");
  pendingStates.set(state, now + STATE_LIFETIME_MS);
  const url = new URL(GOOGLE_AUTHORIZATION_URL);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set(
    "client_id",
    environment.value.GOOGLE_CALENDAR_CLIENT_ID,
  );
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("redirect_uri", GOOGLE_CALENDAR_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_CALENDAR_SCOPE);
  url.searchParams.set("state", state);

  return url;
}

const completeGoogleCalendarAuthorizationEffect = Effect.fn(
  "GoogleCalendar.completeAuthorization",
)(function*(code: string, state: string) {
  const expiresAt = pendingStates.get(state);
  pendingStates.delete(state);

  if (!expiresAt || expiresAt <= (yield* Clock.currentTimeMillis)) {
    return yield* new ConfigurationError({
      integration: "Google Calendar",
      message: "The Google Calendar connection request expired.",
    });
  }

  const environment = getClientEnvironment();
  if (Option.isNone(environment)) {
    return yield* new ConfigurationError({
      integration: "Google Calendar",
      message: "Google Calendar client credentials are not configured.",
    });
  }

  const request = HttpClientRequest.post(GOOGLE_TOKEN_URL).pipe(
    HttpClientRequest.bodyUrlParams({
      client_id: environment.value.GOOGLE_CALENDAR_CLIENT_ID,
      client_secret: environment.value.GOOGLE_CALENDAR_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: GOOGLE_CALENDAR_REDIRECT_URI,
    }),
  );
  const payload = yield* requestExternalJson(
    "Google Calendar",
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
            message: "Google returned an invalid authorization response",
            operation: "decode authorization response",
            service: "Google Calendar",
          }),
    ),
  );

  const refreshToken = payload.refresh_token;

  if (!refreshToken || /[\r\n]/.test(refreshToken)) {
    return yield* new ExternalServiceError({
      cause: new Error("Missing or invalid refresh_token"),
      message: "Google did not return a usable refresh token.",
      operation: "complete authorization",
      service: "Google Calendar",
    });
  }

  const environmentFile =
    process.env.GOOGLE_CALENDAR_ENV_FILE ?? resolve(process.cwd(), ".env");
  yield* persistEnvironmentValue(
    environmentFile,
    "GOOGLE_CALENDAR_REFRESH_TOKEN",
    refreshToken,
    "google-calendar",
  );
  yield* Effect.sync(() =>
    setGoogleCalendarRefreshToken(refreshToken),
  );
});

export function completeGoogleCalendarAuthorization(
  code: string,
  state: string,
) {
  return serverRuntime.runPromise(
    completeGoogleCalendarAuthorizationEffect(code, state),
  );
}
