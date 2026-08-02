import type { PixelizerPreset, PixelizerSettings } from "@/types/pixelizer";

export const DEFAULT_PIXELIZER_SETTINGS: PixelizerSettings = {
  background: "#08080b",
  colorLevels: 7,
  gap: 0,
  pixelSize: 6,
  pull: 0,
  transparent: true,
};

export const PIXELIZER_MAX_DIMENSION = 1_200;

export const PIXELIZER_PRESETS: PixelizerPreset[] = [
  { label: "Calendar", src: "/logos/google-calendar.svg" },
  { label: "Stripe", src: "/logos/stripe-official.svg" },
  { label: "Spotify", src: "/logos/spotify.svg" },
  { label: "Twitter", src: "/logos/twitter.svg" },
  { label: "Weather", src: "/logos/weather-pixel.png" },
  { label: "Germany", src: "/flags/germany-pixel.svg" },
  { label: "USA", src: "/flags/usa-pixel.svg" },
];
