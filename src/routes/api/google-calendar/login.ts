import { createFileRoute } from "@tanstack/react-router";

import { createGoogleCalendarAuthorizationUrl } from "@/utils/google-calendar-oauth.server";

export const Route = createFileRoute("/api/google-calendar/login")({
  server: {
    handlers: {
      GET: async () => {
        const authorizationUrl = createGoogleCalendarAuthorizationUrl();

        if (!authorizationUrl) {
          return new Response(
            "Add the Google Calendar client ID and secret first.",
            { status: 503 },
          );
        }

        return Response.redirect(authorizationUrl, 302);
      },
    },
  },
});
