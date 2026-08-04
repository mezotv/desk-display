import { PIXELIZER_MAX_DIMENSION } from "@/constants/pixelizer";
import type { PixelizerSettings } from "@/types/pixelizer";

function quantize(channel: number, levels: number) {
  const steps = Math.max(1, levels - 1);
  return Math.round((channel / 255) * steps) * (255 / steps);
}

export function renderPixelatedImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  settings: PixelizerSettings,
  maxDimension = PIXELIZER_MAX_DIMENSION,
) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.min(
    1,
    maxDimension / Math.max(sourceWidth, sourceHeight),
  );
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const columns = Math.ceil(width / settings.pixelSize);
  const rows = Math.ceil(height / settings.pixelSize);
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = columns;
  sampleCanvas.height = rows;
  const sampleContext = sampleCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  const context = canvas.getContext("2d");

  if (!sampleContext || !context) return;

  sampleContext.imageSmoothingEnabled = true;
  sampleContext.drawImage(image, 0, 0, columns, rows);
  const pixels = sampleContext.getImageData(0, 0, columns, rows).data;

  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  if (!settings.transparent) {
    context.fillStyle = settings.background;
    context.fillRect(0, 0, width, height);
  }

  const tileSize = Math.max(1, settings.pixelSize - settings.gap);
  const inset = settings.gap / 2;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.hypot(centerX, centerY) || 1;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const pixelIndex = (row * columns + column) * 4;
      const alpha = pixels[pixelIndex + 3] / 255;
      if (alpha <= 0.01) continue;

      const cellCenterX = column * settings.pixelSize + settings.pixelSize / 2;
      const cellCenterY = row * settings.pixelSize + settings.pixelSize / 2;
      const distance = Math.hypot(cellCenterX - centerX, cellCenterY - centerY);
      const pullAmount = settings.pull * (distance / maxDistance);
      const directionX = (centerX - cellCenterX) / (distance || 1);
      const directionY = (centerY - cellCenterY) / (distance || 1);
      const x = column * settings.pixelSize + inset + directionX * pullAmount;
      const y = row * settings.pixelSize + inset + directionY * pullAmount;
      const red = quantize(pixels[pixelIndex], settings.colorLevels);
      const green = quantize(pixels[pixelIndex + 1], settings.colorLevels);
      const blue = quantize(pixels[pixelIndex + 2], settings.colorLevels);

      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      context.fillRect(Math.round(x), Math.round(y), tileSize, tileSize);
    }
  }
}
