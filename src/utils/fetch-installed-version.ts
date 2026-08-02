import { Option, Schema } from "effect";

import { updateVersionResponseSchema } from "@/schemas/update";

const decodeUpdateVersionResponse = Schema.decodeUnknownOption(
  updateVersionResponseSchema,
);

export async function fetchInstalledVersion() {
  const response = await fetch("/api/update/version", { cache: "no-store" });
  if (!response.ok) return null;

  const decoded = decodeUpdateVersionResponse(await response.json());
  return Option.isSome(decoded) ? decoded.value.version : null;
}
