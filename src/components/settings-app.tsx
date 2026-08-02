import { useState } from "react";

import { TouchKeyboard } from "@/components/touch-keyboard";
import { NightTimeControl } from "@/components/night-time-control";
import { PixelatedImage } from "@/components/pixelated-image";
import { UpdatePanel } from "@/components/update-panel";
import { LOCALIZED_COPY } from "@/constants/settings";
import type { SettingsAppProps } from "@/types/settings";
import { useHorizontalDragScroll } from "@/utils/use-horizontal-drag-scroll";

export function SettingsApp({ onChange, onHome, settings }: SettingsAppProps) {
  const [editingName, setEditingName] = useState(false);
  const copy = LOCALIZED_COPY[settings.language];
  const horizontalDragScroll = useHorizontalDragScroll("section");

  if (editingName) {
    return (
      <TouchKeyboard
        language={settings.language}
        onCancel={() => setEditingName(false)}
        onSave={(name) => {
          onChange({ ...settings, name });
          setEditingName(false);
        }}
        value={settings.name}
      />
    );
  }

  return (
    <main className="relative grid h-dvh min-h-0 w-full grid-rows-[58px_minmax(0,1fr)] gap-2.5 overflow-hidden bg-display-bg px-[clamp(26px,4.25vw,68px)] pt-[clamp(12px,2.5vh,24px)] pb-[clamp(16px,3vh,30px)] [@media(min-width:1100px)_and_(min-height:650px)]:mx-auto [@media(min-width:1100px)_and_(min-height:650px)]:w-[min(100%,1500px)] [@media(min-width:1100px)_and_(min-height:650px)]:grid-rows-[68px_minmax(0,1fr)] [@media(max-width:620px)_and_(orientation:portrait)]:grid-rows-[54px_minmax(0,1fr)] max-[620px]:gap-[7px] max-[620px]:px-2.5 max-[620px]:pt-2 max-[620px]:pb-2.5">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center">
        <button
          className="min-h-[50px] justify-self-start touch-manipulation rounded-[10px] border-0 bg-[#17171d] px-4 text-xl font-bold text-[#9a9aa6] outline-none active:scale-[0.97] active:bg-[#282833] [@media(min-width:1100px)_and_(min-height:650px)]:min-h-[60px] [@media(min-width:1100px)_and_(min-height:650px)]:text-2xl max-[620px]:min-h-11 max-[620px]:px-2.5 max-[620px]:text-[17px]"
          onClick={onHome}
          type="button"
        >
          ← {copy.back}
        </button>
        <h1 className="m-0 text-[28px] font-extrabold tracking-[0.05em] text-amber-500 [@media(min-width:1100px)_and_(min-height:650px)]:text-4xl max-[620px]:text-[clamp(20px,6.5vw,27px)]">
          {copy.settings}
        </h1>
        <button
          className="min-h-[50px] justify-self-end touch-manipulation rounded-[10px] border-0 bg-[#17171d] px-4 text-xl font-bold text-amber-500 outline-none active:scale-[0.97] active:bg-[#282833] [@media(min-width:1100px)_and_(min-height:650px)]:min-h-[60px] [@media(min-width:1100px)_and_(min-height:650px)]:text-2xl max-[620px]:min-h-11 max-[620px]:px-2.5 max-[620px]:text-[17px]"
          onClick={onHome}
          type="button"
        >
          {copy.done}
        </button>
      </header>

      <div
        className="no-scrollbar grid min-h-0 min-w-0 touch-none cursor-grab grid-flow-col grid-rows-2 gap-[clamp(10px,1.6vw,18px)] overflow-x-auto overflow-y-hidden scroll-smooth pb-0.5 [grid-auto-columns:clamp(320px,42vw,440px)] [overscroll-behavior-x:contain] [-webkit-overflow-scrolling:touch] data-[dragging=true]:cursor-grabbing data-[dragging=true]:scroll-auto max-[620px]:[grid-auto-columns:88vw]"
        {...horizontalDragScroll}
      >
        <UpdatePanel language={settings.language} />

        <section className="grid min-h-0 grid-cols-1 grid-rows-[auto_auto] content-center items-stretch gap-[clamp(8px,1.5vh,13px)] rounded-[14px] bg-display-panel px-[clamp(14px,2vw,26px)] py-[clamp(12px,2vh,22px)] [@media(max-width:620px)_and_(orientation:portrait)]:gap-2 [@media(max-width:620px)_and_(orientation:portrait)]:p-3">
          <span className="self-center text-[clamp(24px,min(3vw,5vh),36px)] font-bold leading-none tracking-[0.07em] text-[#7f7f8b] max-[620px]:text-[clamp(17px,5.5vw,22px)]">
            {copy.name}
          </span>
          <button
            className="h-[clamp(74px,11vh,102px)] touch-manipulation overflow-hidden rounded-[10px] border-0 bg-[#17171d] text-[clamp(32px,min(4vw,6.7vh),48px)] font-bold text-display-text text-ellipsis whitespace-nowrap outline-none active:scale-[0.97] active:bg-[#282833] max-[620px]:h-[58px] max-[620px]:text-[clamp(21px,6.5vw,28px)]"
            onClick={() => setEditingName(true)}
            type="button"
          >
            {settings.name || "—"}
          </button>
        </section>

        <section className="grid min-h-0 grid-cols-1 grid-rows-[auto_auto] content-center items-stretch gap-[clamp(8px,1.5vh,13px)] rounded-[14px] bg-display-panel px-[clamp(14px,2vw,26px)] py-[clamp(12px,2vh,22px)] [@media(max-width:620px)_and_(orientation:portrait)]:gap-2 [@media(max-width:620px)_and_(orientation:portrait)]:p-3">
          <span className="self-center text-[clamp(24px,min(3vw,5vh),36px)] font-bold leading-none tracking-[0.07em] text-[#7f7f8b] max-[620px]:text-[clamp(17px,5.5vw,22px)]">
            {copy.language}
          </span>
          <div className="grid h-[clamp(76px,15vh,110px)] grid-cols-2 gap-1.5">
            <button
              className={`flex min-w-0 touch-manipulation items-center justify-center gap-1.5 overflow-hidden rounded-[10px] border-0 px-1.5 text-[clamp(15px,min(2.1vw,3.5vh),24px)] font-bold outline-none active:scale-[0.97] ${
                settings.language === "de"
                  ? "bg-amber-500 text-display-bg"
                  : "bg-[#17171d] text-[#777784] active:bg-[#282833]"
              }`}
              onClick={() => onChange({ ...settings, language: "de" })}
              type="button"
            >
              <PixelatedImage
                className="h-[clamp(20px,2.75vw,28px)] w-[clamp(30px,4.25vw,44px)] shrink-0 rounded-sm border-2 border-[#35353f] object-cover"
                src="/flags/germany-pixel.svg"
                alt=""
              />
              <span>DEUTSCH</span>
            </button>
            <button
              className={`flex min-w-0 touch-manipulation items-center justify-center gap-1.5 overflow-hidden rounded-[10px] border-0 px-1.5 text-[clamp(15px,min(2.1vw,3.5vh),24px)] font-bold outline-none active:scale-[0.97] ${
                settings.language === "en"
                  ? "bg-amber-500 text-display-bg"
                  : "bg-[#17171d] text-[#777784] active:bg-[#282833]"
              }`}
              onClick={() => onChange({ ...settings, language: "en" })}
              type="button"
            >
              <PixelatedImage
                className="h-[clamp(20px,2.75vw,28px)] w-[clamp(30px,4.25vw,44px)] shrink-0 rounded-sm border-2 border-[#35353f] object-cover"
                src="/flags/usa-pixel.svg"
                alt=""
              />
              <span>ENGLISH</span>
            </button>
          </div>
        </section>

        <section className="grid min-h-0 grid-cols-1 grid-rows-[auto_auto] content-center items-stretch gap-[clamp(8px,1.5vh,13px)] rounded-[14px] bg-display-panel px-[clamp(14px,2vw,26px)] py-[clamp(12px,2vh,22px)] [@media(max-width:620px)_and_(orientation:portrait)]:gap-2 [@media(max-width:620px)_and_(orientation:portrait)]:p-3">
          <span className="self-center text-[clamp(24px,min(3vw,5vh),36px)] font-bold leading-none tracking-[0.07em] text-[#7f7f8b] max-[620px]:text-[clamp(17px,5.5vw,22px)]">
            {copy.oledProtection}
            <small className="mt-[5px] block text-[13px] font-semibold tracking-[0.04em] text-[#52525d] [@media(max-width:620px)_and_(orientation:portrait)]:mt-1 [@media(max-width:620px)_and_(orientation:portrait)]:text-[clamp(11px,3vw,13px)]">
              {copy.oledProtectionHint}
            </small>
          </span>
          <button
            aria-pressed={settings.oledProtection}
            className={`h-[clamp(64px,10vh,94px)] touch-manipulation rounded-[10px] border-0 text-[clamp(24px,min(3vw,5vh),36px)] font-extrabold outline-none max-[620px]:h-[54px] max-[620px]:text-[clamp(18px,5.5vw,23px)] ${
              settings.oledProtection
                ? "bg-amber-500 text-display-bg"
                : "bg-[#17171d] text-[#777784]"
            }`}
            onClick={() =>
              onChange({
                ...settings,
                oledProtection: !settings.oledProtection,
              })
            }
            type="button"
          >
            {settings.oledProtection ? copy.on : copy.off}
          </button>
        </section>

        <section
          className="grid min-h-0 grid-cols-1 grid-rows-[auto_auto] content-center items-stretch gap-[clamp(8px,1.5vh,13px)] rounded-[14px] bg-display-panel px-[clamp(14px,2vw,26px)] py-[clamp(12px,2vh,22px)] [@media(max-width:620px)_and_(orientation:portrait)]:gap-2 [@media(max-width:620px)_and_(orientation:portrait)]:p-3"
          data-night-panel
        >
          <span className="self-center text-[clamp(24px,min(3vw,5vh),36px)] font-bold leading-none tracking-[0.07em] text-[#7f7f8b] max-[620px]:text-[clamp(17px,5.5vw,22px)]">
            {copy.nightMode}
            <small className="mt-[5px] block text-[13px] font-semibold tracking-[0.04em] text-[#52525d] [@media(max-width:620px)_and_(orientation:portrait)]:mt-1 [@media(max-width:620px)_and_(orientation:portrait)]:text-[clamp(11px,3vw,13px)]">
              {copy.nightModeHint}
            </small>
          </span>
          <div className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] items-stretch gap-1.5 [@media(min-width:1100px)_and_(min-height:650px)]:grid-cols-[76px_minmax(0,1fr)] [@media(min-width:1100px)_and_(min-height:650px)]:gap-2.5 [@media(max-width:620px)_and_(orientation:portrait)]:grid-cols-[64px_minmax(0,1fr)] max-[370px]:grid-cols-[52px_minmax(0,1fr)] max-[370px]:gap-1.5">
            <button
              aria-pressed={settings.nightModeEnabled}
              className={`h-full min-h-[58px] w-full touch-manipulation rounded-[10px] border-0 text-[clamp(18px,min(2.5vw,4.2vh),28px)] font-extrabold outline-none ${
                settings.nightModeEnabled
                  ? "bg-amber-500 text-display-bg"
                  : "bg-[#17171d] text-[#777784]"
              }`}
              onClick={() =>
                onChange({
                  ...settings,
                  nightModeEnabled: !settings.nightModeEnabled,
                })
              }
              type="button"
            >
              {settings.nightModeEnabled ? copy.on : copy.off}
            </button>
            <div className="grid min-w-0 grid-cols-2 gap-1 [@media(min-width:1100px)_and_(min-height:650px)]:gap-2">
              <NightTimeControl
                label={copy.nightModeFrom}
                onChange={(nightModeStart) =>
                  onChange({ ...settings, nightModeStart })
                }
                value={settings.nightModeStart}
              />
              <NightTimeControl
                label={copy.nightModeTo}
                onChange={(nightModeEnd) =>
                  onChange({ ...settings, nightModeEnd })
                }
                value={settings.nightModeEnd}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
