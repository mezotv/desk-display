import { createServerFn } from "@tanstack/react-start";

import { decodeSpotifyPlaybackCommand } from "@/schemas/spotify";
import { getSpotifyNowPlaying } from "@/utils/get-spotify-now-playing.server";
import { setSpotifyPlaying } from "@/utils/set-spotify-playback.server";

export const getSpotify = createServerFn({ method: "GET" }).handler(() =>
  getSpotifyNowPlaying(),
);

export const setSpotifyPlayback = createServerFn({ method: "POST" })
  .validator(decodeSpotifyPlaybackCommand)
  .handler(({ data }) => setSpotifyPlaying(data.shouldPlay));
