import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { PixelatedImage } from "@/components/pixelated-image";
import {
  DEFAULT_PIXELIZER_SETTINGS,
  PIXELIZER_PRESETS,
} from "@/constants/pixelizer";
import type {
  LoadedPixelizerImage,
  PixelizerPreset,
  PixelizerSettings,
} from "@/types/pixelizer";
import { renderPixelatedImage } from "@/utils/render-pixelated-image";

export const Route = createFileRoute("/pixelizer")({
  component: Pixelizer,
  head: () => ({ meta: [{ title: "Pixelizer Lab" }] }),
});

function Pixelizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loadedImage, setLoadedImage] = useState<LoadedPixelizerImage | null>(
    null,
  );
  const [settings, setSettings] = useState<PixelizerSettings>(
    DEFAULT_PIXELIZER_SETTINGS,
  );

  const loadImage = useCallback((src: string, fileName: string) => {
    const image = new Image();
    image.onload = () => setLoadedImage({ fileName, image });
    image.src = src;
  }, []);

  const loadPreset = useCallback(
    (preset: PixelizerPreset) => loadImage(preset.src, preset.label),
    [loadImage],
  );

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      loadImage(objectUrl, file.name.replace(/\.[^.]+$/, ""));
    },
    [loadImage],
  );

  useEffect(() => {
    loadPreset(PIXELIZER_PRESETS[0]);
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [loadPreset]);

  useEffect(() => {
    if (!canvasRef.current || !loadedImage) return;
    renderPixelatedImage(canvasRef.current, loadedImage.image, settings);
  }, [loadedImage, settings]);

  const updateSetting = <Key extends keyof PixelizerSettings>(
    key: Key,
    value: PixelizerSettings[Key],
  ) => setSettings((current) => ({ ...current, [key]: value }));

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    const link = document.createElement("a");
    link.download = `${loadedImage.fileName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-pixelated.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="grid h-dvh w-full grid-cols-[340px_minmax(0,1fr)] overflow-hidden bg-display-bg text-display-text [@media(min-width:1100px)_and_(min-height:650px)]:grid-cols-[420px_minmax(0,1fr)] [@media(max-width:760px)_and_(orientation:landscape)]:grid-cols-[290px_minmax(0,1fr)] [@media(max-width:700px)_and_(orientation:portrait)]:h-dvh [@media(max-width:700px)_and_(orientation:portrait)]:grid-cols-1 [@media(max-width:700px)_and_(orientation:portrait)]:grid-rows-[auto_minmax(420px,1fr)] [@media(max-width:700px)_and_(orientation:portrait)]:overflow-x-hidden [@media(max-width:700px)_and_(orientation:portrait)]:overflow-y-auto">
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-[#24242d] bg-[#0d0d11] px-6 py-[26px] [@media(min-width:1100px)_and_(min-height:650px)]:px-[30px] [@media(min-width:1100px)_and_(min-height:650px)]:py-[34px] max-[760px]:px-[17px] max-[760px]:py-5 [@media(max-width:700px)_and_(orientation:portrait)]:min-h-[760px] [@media(max-width:700px)_and_(orientation:portrait)]:overflow-visible [@media(max-width:700px)_and_(orientation:portrait)]:border-r-0 [@media(max-width:700px)_and_(orientation:portrait)]:border-b">
        <header className="flex flex-col">
          <span className="text-[13px] font-bold tracking-[0.11em] text-[#6f6f7b]">
            DESK DISPLAY TOOL
          </span>
          <h1 className="mt-[3px] mb-0 text-[38px] font-extrabold tracking-[0.045em] text-brand-purple">
            PIXELIZER
          </h1>
        </header>

        <label className="mt-5 grid h-12 cursor-pointer place-items-center rounded-[9px] border border-brand-purple bg-[#17121f] hover:brightness-110">
          <input
            accept="image/*"
            className="absolute size-px opacity-0"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) loadFile(file);
            }}
            type="file"
          />
          <span className="text-[17px] font-bold tracking-[0.06em]">
            UPLOAD IMAGE
          </span>
        </label>

        <section className="mt-6">
          <span className="text-[13px] font-bold tracking-[0.11em] text-[#6f6f7b]">
            PRELOADS
          </span>
          <div className="mt-2.5 grid grid-cols-4 gap-[7px] max-[760px]:grid-cols-3">
            {PIXELIZER_PRESETS.map((preset) => (
              <button
                className="flex h-16 min-w-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-[#292932] bg-[#141419] px-1 pt-[7px] pb-[5px] text-[#92929e] hover:border-[#575763] hover:text-display-text"
                key={preset.src}
                onClick={() => loadPreset(preset)}
                type="button"
              >
                <PixelatedImage
                  alt=""
                  className="size-[30px] object-contain"
                  src={preset.src}
                />
                <span className="mt-1 w-full overflow-hidden text-[11px] font-semibold text-ellipsis whitespace-nowrap">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-[17px]">
          <label className="flex flex-col">
            <span className="flex justify-between text-sm font-bold tracking-[0.045em] text-[#bcbcc7]">
              PIXEL SIZE
              <output className="text-brand-purple">
                {settings.pixelSize}px
              </output>
            </span>
            <input
              className="mt-[7px] w-full accent-brand-purple"
              max="48"
              min="2"
              onChange={(event) =>
                updateSetting("pixelSize", Number(event.target.value))
              }
              type="range"
              value={settings.pixelSize}
            />
          </label>
          <label className="flex flex-col">
            <span className="flex justify-between text-sm font-bold tracking-[0.045em] text-[#bcbcc7]">
              GRID GAP
              <output className="text-brand-purple">{settings.gap}px</output>
            </span>
            <input
              className="mt-[7px] w-full accent-brand-purple"
              max={Math.max(0, settings.pixelSize - 1)}
              min="0"
              onChange={(event) =>
                updateSetting("gap", Number(event.target.value))
              }
              type="range"
              value={Math.min(settings.gap, settings.pixelSize - 1)}
            />
          </label>
          <label className="flex flex-col">
            <span className="flex justify-between text-sm font-bold tracking-[0.045em] text-[#bcbcc7]">
              PULL TO CENTER
              <output className="text-brand-purple">{settings.pull}px</output>
            </span>
            <input
              className="mt-[7px] w-full accent-brand-purple"
              max="24"
              min="0"
              onChange={(event) =>
                updateSetting("pull", Number(event.target.value))
              }
              type="range"
              value={settings.pull}
            />
          </label>
          <label className="flex flex-col">
            <span className="flex justify-between text-sm font-bold tracking-[0.045em] text-[#bcbcc7]">
              COLOR LEVELS
              <output className="text-brand-purple">
                {settings.colorLevels}
              </output>
            </span>
            <input
              className="mt-[7px] w-full accent-brand-purple"
              max="32"
              min="2"
              onChange={(event) =>
                updateSetting("colorLevels", Number(event.target.value))
              }
              type="range"
              value={settings.colorLevels}
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <label className="flex items-center gap-[9px] text-sm font-bold tracking-[0.05em] text-[#bcbcc7]">
            <input
              checked={settings.transparent}
              className="size-[18px] accent-brand-purple"
              onChange={(event) =>
                updateSetting("transparent", event.target.checked)
              }
              type="checkbox"
            />
            TRANSPARENT
          </label>
          <input
            aria-label="Background color"
            className="h-[30px] w-[42px] rounded-md border border-[#34343e] bg-[#16161b] p-0.5"
            disabled={settings.transparent}
            onChange={(event) =>
              updateSetting("background", event.target.value)
            }
            type="color"
            value={settings.background}
          />
        </div>

        <button
          className="mt-6 h-[50px] cursor-pointer rounded-[9px] border-0 bg-brand-purple text-[17px] font-bold tracking-[0.06em] text-display-bg hover:brightness-110"
          onClick={download}
          type="button"
        >
          DOWNLOAD PNG
        </button>
      </aside>

      <section
        className="relative grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_24px] gap-3 overflow-hidden p-7 [@media(max-width:700px)_and_(orientation:portrait)]:min-h-[420px]"
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setDragging(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) loadFile(file);
        }}
      >
        {dragging && (
          <div className="pointer-events-none absolute inset-5 z-[2] grid place-items-center rounded-[14px] border-2 border-dashed border-brand-purple bg-display-bg/90 text-[28px] font-extrabold tracking-[0.08em] text-display-text">
            DROP IMAGE
          </div>
        )}
        <div className="grid min-h-0 min-w-0 place-items-center overflow-auto bg-[#111116] [background-image:linear-gradient(45deg,#1a1a21_25%,transparent_25%),linear-gradient(-45deg,#1a1a21_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1a1a21_75%),linear-gradient(-45deg,transparent_75%,#1a1a21_75%)] [background-position:0_0,0_8px,8px_-8px,-8px_0] [background-size:16px_16px]">
          <canvas
            aria-label="Pixelated image preview"
            className="block max-h-[calc(100%_-_36px)] max-w-[calc(100%_-_36px)] shadow-[0_12px_48px_rgba(0,0,0,0.45)] [image-rendering:pixelated]"
            ref={canvasRef}
            role="img"
          />
        </div>
        <footer className="flex items-center justify-between text-sm font-semibold tracking-[0.04em] text-[#70707c]">
          <span>{loadedImage?.fileName ?? "NO IMAGE"}</span>
          <span>
            {canvasRef.current
              ? `${canvasRef.current.width} × ${canvasRef.current.height}`
              : ""}
          </span>
        </footer>
      </section>
    </main>
  );
}
