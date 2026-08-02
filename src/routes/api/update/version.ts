import { createFileRoute } from "@tanstack/react-router";

import { readInstalledVersion } from "@/utils/read-installed-version.server";

export const Route = createFileRoute("/api/update/version")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          { version: await readInstalledVersion() },
          { headers: { "Cache-Control": "no-store" } },
        ),
    },
  },
});
