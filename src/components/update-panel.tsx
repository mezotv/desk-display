import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";

import { UPDATE_COPY } from "@/constants/update";
import type {
  UpdatePanelProps,
  UpdatePhase,
  UpdateStatus,
} from "@/types/update";
import { reloadAfterUpdate } from "@/utils/reload-after-update";
import { requestDeskDisplayUpdate } from "@/utils/request-desk-display-update";
import { checkForDeskDisplayUpdate } from "@/utils/update.functions";

export function UpdatePanel({ language }: UpdatePanelProps) {
  const copy = UPDATE_COPY[language];
  const checkForUpdate = useServerFn(checkForDeskDisplayUpdate);
  const [phase, setPhase] = useState<UpdatePhase>("checking");
  const [status, setStatus] = useState<UpdateStatus | null>(null);

  const refreshStatus = useCallback(async () => {
    setPhase("checking");

    try {
      setStatus(await checkForUpdate());
    } catch {
      setStatus({
        checkedAt: new Date().toISOString(),
        currentVersion: __DESK_DISPLAY_VERSION__,
        error: copy.failed,
        installSupported: false,
        latestVersion: null,
        updateAvailable: false,
      });
    } finally {
      setPhase("idle");
    }
  }, [checkForUpdate, copy.failed]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const runUpdate = useCallback(async () => {
    if (!status?.updateAvailable || !status.installSupported) return;
    setPhase("installing");

    try {
      const result = await requestDeskDisplayUpdate();

      if (result.status === "installed") {
        setPhase("restarting");
        void reloadAfterUpdate(result.currentVersion);
        return;
      }

      setStatus((current) =>
        current
          ? {
              ...current,
              currentVersion: result.currentVersion,
              error: result.error,
              latestVersion: result.latestVersion,
              updateAvailable: false,
            }
          : current,
      );
    } catch {
      setStatus((current) =>
        current ? { ...current, error: copy.failed } : current,
      );
    } finally {
      setPhase((current) => (current === "restarting" ? current : "idle"));
    }
  }, [copy.failed, status]);

  const busy = phase !== "idle";
  const installSupported = status?.installSupported ?? true;
  const buttonLabel =
    phase === "checking"
      ? copy.checking
      : phase === "installing"
        ? `${copy.install}…`
        : phase === "restarting"
          ? copy.restarting
          : !installSupported
            ? copy.unavailable
            : status?.updateAvailable
              ? `${copy.install} ${status.latestVersion}`
              : status?.error
                ? copy.check
                : copy.upToDate;

  return (
    <section className="grid min-h-[150px] grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] content-center items-stretch gap-[clamp(7px,1.2vh,11px)] rounded-[14px] bg-display-panel px-[clamp(14px,2vw,26px)] py-[clamp(11px,1.8vh,18px)] [@media(max-width:620px)_and_(orientation:portrait)]:p-3">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[clamp(22px,min(2.7vw,4.5vh),33px)] font-bold leading-none tracking-[0.07em] text-[#7f7f8b] max-[620px]:text-[clamp(17px,5.5vw,22px)]">
          {copy.title}
          <small className="mt-1 block text-[10px] font-bold tracking-[0.05em] text-[#4f4f59]">
            {status?.error ?? copy.automatic}
          </small>
        </span>
        <small className="shrink-0 text-[clamp(12px,1.5vw,17px)] font-bold text-brand-purple">
          v{status?.currentVersion ?? __DESK_DISPLAY_VERSION__}
        </small>
      </div>

      <div className="grid grid-cols-2 items-center gap-2 rounded-[9px] bg-[#17171d] px-3 py-2">
        <span className="min-w-0 text-[clamp(11px,1.35vw,15px)] font-bold tracking-[0.06em] text-[#666672]">
          {copy.current}
          <strong className="mt-0.5 block overflow-hidden text-ellipsis text-[clamp(18px,2.2vw,27px)] text-display-text">
            v{status?.currentVersion ?? __DESK_DISPLAY_VERSION__}
          </strong>
        </span>
        <span className="min-w-0 text-right text-[clamp(11px,1.35vw,15px)] font-bold tracking-[0.06em] text-[#666672]">
          {copy.latest}
          <strong className="mt-0.5 block overflow-hidden text-ellipsis text-[clamp(18px,2.2vw,27px)] text-brand-purple">
            {status?.latestVersion ? `v${status.latestVersion}` : "—"}
          </strong>
        </span>
      </div>

      <button
        className={`min-h-[48px] touch-manipulation rounded-[9px] border-0 px-3 text-[clamp(15px,min(1.8vw,3vh),21px)] font-extrabold tracking-[0.04em] outline-none active:scale-[0.98] ${
          status?.updateAvailable && installSupported
            ? "bg-brand-purple text-display-bg"
            : "bg-[#202028] text-[#858591]"
        }`}
        disabled={busy || !installSupported}
        onClick={() => {
          if (status?.updateAvailable) {
            void runUpdate();
          } else {
            void refreshStatus();
          }
        }}
        type="button"
      >
        {buttonLabel}
      </button>
    </section>
  );
}
