import { createFileRoute } from "@tanstack/react-router";

import { completeGoogleCalendarAuthorization } from "@/utils/google-calendar-oauth.server";

function resultPage(title: string, message: string, returnHome = false) {
  return new Response(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${
      returnHome ? '<meta http-equiv="refresh" content="3;url=/">' : ""
    }<style>body{margin:0;display:grid;place-items:center;height:100vh;background:#08080b;color:#fff;font:700 34px monospace;text-align:center}small{display:block;color:#8b8b98;font-size:18px;margin-top:16px}</style><title>${title}</title></head><body><main>${title}<small>${message}</small></main></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/google-calendar/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!code || !state) {
          return resultPage(
            "CALENDAR FAILED",
            "Missing authorization response",
          );
        }

        try {
          await completeGoogleCalendarAuthorization(code, state);
          return resultPage(
            "CALENDAR CONNECTED",
            "Returning to the display…",
            true,
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown Google error";
          return resultPage("CALENDAR FAILED", message);
        }
      },
    },
  },
});
