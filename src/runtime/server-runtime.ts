import "@tanstack/react-start/server-only";

import { ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/unstable/http";

export const serverRuntime = ManagedRuntime.make(FetchHttpClient.layer);

const disposeServerRuntime = () => {
  void serverRuntime.dispose();
};

process.once("SIGINT", disposeServerRuntime);
process.once("SIGTERM", disposeServerRuntime);
