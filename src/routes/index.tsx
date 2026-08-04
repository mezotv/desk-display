import { createFileRoute } from "@tanstack/react-router";

import { BootLoader } from "@/components/boot-loader";
import { DeskDisplay } from "@/components/desk-display";
import { getCalendar } from "@/utils/google-calendar.functions";
import { getMrr } from "@/utils/mrr.functions";
import { getDisplaySettings } from "@/utils/settings.functions";
import { getSpotify } from "@/utils/spotify.functions";
import { getSystem } from "@/utils/system.functions";
import { getTwitter } from "@/utils/twitter.functions";
import { getWeather } from "@/utils/weather.functions";

export const Route = createFileRoute("/")({
  ssr: "data-only",
  component: Home,
  loader: async () => {
    const [
      initialCalendar,
      initialMrr,
      initialSettings,
      initialSpotify,
      initialSystem,
      initialTwitter,
      initialWeather,
    ] = await Promise.all([
      getCalendar(),
      getMrr(),
      getDisplaySettings(),
      getSpotify(),
      getSystem(),
      getTwitter(),
      getWeather(),
    ]);

    return {
      initialCalendar,
      initialMrr,
      initialSettings,
      initialSpotify,
      initialSystem,
      initialTwitter,
      initialWeather,
    };
  },
  pendingComponent: BootLoader,
  pendingMs: 0,
  pendingMinMs: 0,
});

function Home() {
  return <DeskDisplay {...Route.useLoaderData()} />;
}
