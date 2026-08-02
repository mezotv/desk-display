import "@tanstack/react-start/server-only";

import { Effect, Schema } from "effect";
import { HttpClientRequest } from "effect/unstable/http";

import {
  DESK_DISPLAY_UPDATE_MANIFEST_URL,
  UPDATE_MANIFEST_TIMEOUT,
} from "@/constants/update";
import {
  DeskDisplayReleaseManifest,
  DeskDisplayUpdateError,
} from "@/schemas/update";
import { requestExternalJson } from "@/utils/request-external-api.server";

export const getReleaseManifestEffect = Effect.fn(
  "DeskDisplayUpdate.getReleaseManifest",
)(function*() {
  const request = HttpClientRequest.get(
    DESK_DISPLAY_UPDATE_MANIFEST_URL,
  ).pipe(HttpClientRequest.acceptJson);
  const payload = yield* requestExternalJson(
    "GitHub Releases",
    "load latest Desk Display release",
    request,
    UPDATE_MANIFEST_TIMEOUT,
  ).pipe(
    Effect.mapError(
      (cause) =>
        DeskDisplayUpdateError.make({
          cause,
          message: "Unable to check the latest Desk Display release",
          operation: "fetch release manifest",
        }),
    ),
  );

  return yield* Schema.decodeUnknownEffect(DeskDisplayReleaseManifest)(
    payload,
  ).pipe(
    Effect.mapError(
      (cause) =>
        DeskDisplayUpdateError.make({
          cause,
          message: "The latest Desk Display release manifest is invalid",
          operation: "validate release manifest",
        }),
    ),
  );
});
