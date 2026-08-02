import type { DisplayLanguage } from "@/types/settings";
import type { SpotifyCopy } from "@/types/spotify";

export const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
export const SPOTIFY_API_URL = "https://api.spotify.com/v1";
export const SPOTIFY_REDIRECT_URI =
  "http://127.0.0.1:3000/api/spotify/callback";
export const SPOTIFY_SCOPE =
  "user-read-currently-playing user-modify-playback-state";

export const SPOTIFY_COPY = {
  de: {
    addKeys: "SPOTIFY-KEYS HINZUFÜGEN",
    albumArtwork: "Albumcover",
    authorize: "SPOTIFY AUTORISIEREN",
    connect: "VERBINDEN",
    notPlaying: "NICHTS LÄUFT",
    nowPlaying: "LÄUFT GERADE",
    paused: "PAUSIERT",
    playSomething: "STARTE EINEN SONG",
    tapToConnect: "ZUM VERBINDEN TIPPEN",
  },
  en: {
    addKeys: "ADD SPOTIFY KEYS",
    albumArtwork: "Album artwork",
    authorize: "AUTHORIZE SPOTIFY",
    connect: "CONNECT",
    notPlaying: "NOT PLAYING",
    nowPlaying: "NOW PLAYING",
    paused: "PAUSED",
    playSomething: "PLAY SOMETHING",
    tapToConnect: "TAP TO CONNECT",
  },
} satisfies Record<DisplayLanguage, SpotifyCopy>;
