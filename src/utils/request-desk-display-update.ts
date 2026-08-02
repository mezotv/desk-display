import { Schema } from "effect";

import { updateInstallResultSchema } from "@/schemas/update";

const decodeUpdateInstallResult = Schema.decodeUnknownPromise(
  updateInstallResultSchema,
);

export async function requestDeskDisplayUpdate() {
  const response = await fetch("/api/update/install", {
    method: "POST",
  });
  const result = await decodeUpdateInstallResult(await response.json());

  if (!response.ok && result.status !== "failed") {
    throw new Error("Desk Display update request failed");
  }

  return result;
}
