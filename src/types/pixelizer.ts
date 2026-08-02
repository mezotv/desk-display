export type PixelizerPreset = {
  label: string;
  src: string;
};

export type PixelizerSettings = {
  background: string;
  colorLevels: number;
  gap: number;
  pixelSize: number;
  pull: number;
  transparent: boolean;
};

export type LoadedPixelizerImage = {
  fileName: string;
  image: HTMLImageElement;
};
