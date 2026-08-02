import "@tanstack/react-start/server-only";

import { Effect } from "effect";
import {
  HttpClient,
  type HttpClientRequest,
  type HttpClientResponse,
} from "effect/unstable/http";

import {
  EXTERNAL_API_RETRY_COUNT,
  EXTERNAL_API_RETRY_SCHEDULE,
  EXTERNAL_API_TIMEOUT,
} from "@/constants/effect";
import { ExternalServiceError } from "@/schemas/service-error";

export const executeExternalRequest = Effect.fn(
  "DeskDisplay.executeExternalRequest",
)(function*(
  service: string,
  operation: string,
  request: HttpClientRequest.HttpClientRequest,
  timeout = EXTERNAL_API_TIMEOUT,
): Effect.fn.Return<
  HttpClientResponse.HttpClientResponse,
  ExternalServiceError,
  HttpClient.HttpClient
> {
  const client = (yield* HttpClient.HttpClient).pipe(
    HttpClient.filterStatusOk,
    HttpClient.retryTransient({
      schedule: EXTERNAL_API_RETRY_SCHEDULE,
      times: EXTERNAL_API_RETRY_COUNT,
    }),
  );

  return yield* client.execute(request).pipe(
    Effect.timeout(timeout),
    Effect.mapError(
      (cause) =>
        new ExternalServiceError({
          cause,
          message: `${service} ${operation} failed`,
          operation,
          service,
        }),
    ),
  );
});

export const requestExternalJson = Effect.fn("DeskDisplay.requestExternalJson")(
  function*(
    service: string,
    operation: string,
    request: HttpClientRequest.HttpClientRequest,
    timeout = EXTERNAL_API_TIMEOUT,
  ): Effect.fn.Return<unknown, ExternalServiceError, HttpClient.HttpClient> {
    const response = yield* executeExternalRequest(
      service,
      operation,
      request,
      timeout,
    );

    return yield* response.json.pipe(
      Effect.mapError(
        (cause) =>
          new ExternalServiceError({
            cause,
            message: `${service} ${operation} returned invalid JSON`,
            operation,
            service,
          }),
      ),
    );
  },
);
