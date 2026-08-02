export type SpotifyCopy = {
  addKeys: string;
  albumArtwork: string;
  authorize: string;
  connect: string;
  notPlaying: string;
  nowPlaying: string;
  paused: string;
  playSomething: string;
  tapToConnect: string;
};

export type SpotifySnapshot = {
  albumArtUrl: string | null;
  artist: string | null;
  clientConfigured: boolean;
  configured: boolean;
  durationMs: number | null;
  error: string | null;
  isPlaying: boolean;
  progressMs: number | null;
  track: string | null;
  updatedAt: string;
};
