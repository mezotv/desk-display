import { createFileRoute } from "@tanstack/react-router";

import { UPDATE_LOOPBACK_HOSTS } from "@/constants/update";
import { installLatestUpdate } from "@/utils/install-update.server";
import { restartAfterUpdate } from "@/utils/restart-after-update.server";

function isTrustedLocalRequest(request: Request) {
  const requestUrl = new URL(request.url);
  if (!UPDATE_LOOPBACK_HOSTS.includes(requestUrl.hostname)) return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return UPDATE_LOOPBACK_HOSTS.includes(new URL(origin).hostname);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/update/install")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isTrustedLocalRequest(request)) {
          return Response.json(
            { error: "Desk Display updates accept local requests only" },
            { status: 403 },
          );
        }

        const result = await installLatestUpdate();
        const status = result.status === "failed" ? 500 : 200;
        if (result.restartRequired) restartAfterUpdate();

        return Response.json(result, {
          headers: { "Cache-Control": "no-store" },
          status,
        });
      },
    },
  },
});
