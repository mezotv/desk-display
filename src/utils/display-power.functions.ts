import { createServerFn } from "@tanstack/react-start";

import { decodeDisplayPowerCommand } from "@/schemas/display-power";
import { setDisplayPower } from "@/utils/set-display-power.server";

export const controlDisplayPower = createServerFn({ method: "POST" })
  .validator(decodeDisplayPowerCommand)
  .handler(({ data }) =>
    setDisplayPower(data.enabled, data.preferredMethod),
  );
