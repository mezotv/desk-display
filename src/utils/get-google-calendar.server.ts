import "@tanstack/react-start/server-only";

import { DateTime, Effect, Option, Schema } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import { GOOGLE_CALENDAR_API_URL } from "@/constants/calendar";
import {
  decodeGoogleCalendarClientEnvironment,
  decodeGoogleCalendarEnvironment,
} from "@/schemas/environment";
import { googleCalendarResponseSchema } from "@/schemas/external-api";
import { ExternalServiceError } from "@/schemas/service-error";
import { serverRuntime } from "@/runtime/server-runtime";
import type { CalendarEvent, CalendarSnapshot } from "@/types/calendar";
import {
  getGoogleCalendarAccessToken,
  getRuntimeGoogleCalendarRefreshToken,
} from "@/utils/google-calendar-access-token.server";
import { requestExternalJson } from "@/utils/request-external-api.server";

function emptyCalendarSnapshot(
  configured: boolean,
  error: string | null = null,
  clientConfigured = configured,
): CalendarSnapshot {
  return {
    clientConfigured,
    configured,
    error,
    events: [],
    updatedAt: new Date().toISOString(),
  };
}

const getGoogleCalendarEffect = Effect.fn("GoogleCalendar.getEvents")(
  function*() {
    const rawEnvironment = {
      GOOGLE_CALENDAR_CLIENT_ID: process.env.GOOGLE_CALENDAR_CLIENT_ID,
      GOOGLE_CALENDAR_CLIENT_SECRET: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      GOOGLE_CALENDAR_REFRESH_TOKEN:
        getRuntimeGoogleCalendarRefreshToken() ??
        process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    };
    const clientEnvironment =
      decodeGoogleCalendarClientEnvironment(rawEnvironment);
    const environment = decodeGoogleCalendarEnvironment(rawEnvironment);

    if (Option.isNone(environment)) {
      return emptyCalendarSnapshot(
        false,
        null,
        Option.isSome(clientEnvironment),
      );
    }

    const accessToken = yield* getGoogleCalendarAccessToken(
      environment.value.GOOGLE_CALENDAR_CLIENT_ID,
      environment.value.GOOGLE_CALENDAR_CLIENT_SECRET,
      environment.value.GOOGLE_CALENDAR_REFRESH_TOKEN,
    );
    const url = new URL(`${GOOGLE_CALENDAR_API_URL}/calendars/primary/events`);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("timeMin", DateTime.formatIso(yield* DateTime.now));
    const request = HttpClientRequest.get(url).pipe(
      HttpClientRequest.setHeader("authorization", `Bearer ${accessToken}`),
      HttpClientRequest.acceptJson,
    );
    const payload = yield* requestExternalJson(
      "Google Calendar",
      "list upcoming events",
      request,
    ).pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(googleCalendarResponseSchema)),
      Effect.mapError((cause) =>
        cause instanceof ExternalServiceError
          ? cause
          : new ExternalServiceError({
              cause,
              message: "Google Calendar returned invalid event data",
              operation: "decode upcoming events",
              service: "Google Calendar",
            }),
      ),
    );
    const events = (payload.items ?? [])
      .filter(
        (event) =>
          event.status !== "cancelled" &&
          !event.attendees?.some(
            (attendee) =>
              attendee.self && attendee.responseStatus === "declined",
          ),
      )
      .map((event): CalendarEvent | null => {
        const allDay = Boolean(event.start?.date && event.end?.date);
        const start =
          event.start?.dateTime ??
          (event.start?.date ? `${event.start.date}T00:00:00` : null);
        const end =
          event.end?.dateTime ??
          (event.end?.date ? `${event.end.date}T00:00:00` : null);

        if (!start || !end) return null;

        return {
          allDay,
          end,
          hasVideoMeeting: Boolean(event.hangoutLink),
          id: event.id ?? `${start}-${event.summary ?? "event"}`,
          location: event.location ?? null,
          start,
          title: event.summary ?? null,
        };
      })
      .filter((event): event is CalendarEvent => event !== null)
      .slice(0, 4);

    return {
      clientConfigured: true,
      configured: true,
      error: null,
      events,
      updatedAt: DateTime.formatIso(yield* DateTime.now),
    } satisfies CalendarSnapshot;
  },
);

export function getGoogleCalendar(): Promise<CalendarSnapshot> {
  return serverRuntime.runPromise(
    getGoogleCalendarEffect().pipe(
      Effect.tapError(Effect.logError),
      Effect.catch(() =>
        Effect.succeed(
          emptyCalendarSnapshot(true, "Unable to update Google Calendar"),
        ),
      ),
    ),
  );
}
